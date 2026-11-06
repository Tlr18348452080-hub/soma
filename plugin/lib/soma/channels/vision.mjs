/**
 * channels/vision.mjs —— 真的用一只眼睛看一张图
 *
 * 视网膜不是一块传感器。中央那一小块（中央凹）几乎没有会聚，
 * 一个感光细胞对一条神经纤维；往外走，十几个、几十个细胞并到
 * 一根纤维上，图像就被压掉了。所以「周边看不清」不是感受器的
 * 缺陷，是它在省带宽。
 *
 * 这个文件干的就是这件事：把一张图按偏心度的不同，逐圈降采样，
 * 拼成「它眼睛看到的那一版」。
 */

import { execFileSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

/** CRC32（PNG 每个块都要） */
const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return (buf) => {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
})();

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(body));
  return Buffer.concat([len, body, crc]);
}

/** 写一张 RGB 的 PNG，不依赖任何库 */
export function writePng(path, w, h, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    rgb.copy(raw, y * (w * 3 + 1) + 1, y * w * 3, (y + 1) * w * 3);
  }
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
  return png.length;
}

/** 用 ffmpeg 把任意图片解成 rgb24 的原始像素 */
function decode(file, w, h) {
  return execFileSync('ffmpeg', [
    '-v', 'error', '-i', file,
    '-vf', `scale=${w}:${h}:force_original_aspect_ratio=decrease`,
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-',
  ], { maxBuffer: 128 * 1024 * 1024 });
}

/** 2×2 平均，降一级 */
function half(src, w, h) {
  const nw = Math.max(1, w >> 1), nh = Math.max(1, h >> 1);
  const out = Buffer.alloc(nw * nh * 3);
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      for (let c = 0; c < 3; c++) {
        let s = 0, n = 0;
        for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
          const sx = Math.min(w - 1, x * 2 + dx), sy = Math.min(h - 1, y * 2 + dy);
          s += src[(sy * w + sx) * 3 + c]; n++;
        }
        out[(y * nw + x) * 3 + c] = Math.round(s / n);
      }
    }
  }
  return { buf: out, w: nw, h: nh };
}

/** 从某一级金字塔上按双线性取一点 */
function sample(lvl, x, y, W, H) {
  const fx = clamp(x * lvl.w / W, 0, lvl.w - 1);
  const fy = clamp(y * lvl.h / H, 0, lvl.h - 1);
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const x1 = Math.min(lvl.w - 1, x0 + 1), y1 = Math.min(lvl.h - 1, y0 + 1);
  const tx = fx - x0, ty = fy - y0;
  const o = (yy, xx) => (yy * lvl.w + xx) * 3;
  const a = o(y0, x0), b = o(y0, x1), c = o(y1, x0), d = o(y1, x1);
  const out = [0, 0, 0];
  for (let k = 0; k < 3; k++) {
    const top = lvl.buf[a + k] * (1 - tx) + lvl.buf[b + k] * tx;
    const bot = lvl.buf[c + k] * (1 - tx) + lvl.buf[d + k] * tx;
    out[k] = Math.round(top * (1 - ty) + bot * ty);
  }
  return out;
}

/**
 * 看一张图。
 * @param {string} file 图片路径
 * @param {object} opts { width=240, fovea=0.12, drop=0.55, out }
 */
export function look(file, opts = {}) {
  const W = opts.width ?? 240;
  const fovea = opts.fovea ?? 0.12;     // 中央清晰区占半宽的比例，约双眼中心 2–5°
  const drop = opts.drop ?? 0.55;       // 每圈最多降到几级

  let header;
  try {
    header = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]).toString().trim();
  } catch (e) {
    throw new Error('打不开这张图: ' + (e.message || e));
  }
  const [sw, sh] = header.split(',').map(Number);
  const H = Math.max(1, Math.round(W * sh / sw));

  const raw = decode(file, W, H);
  const levels = [{ buf: raw, w: W, h: H }];
  for (let i = 1; i <= 4; i++) levels.push(half(levels[i - 1].buf, levels[i - 1].w, levels[i - 1].h));

  const out = Buffer.alloc(W * H * 3);
  const cx = W / 2, cy = H / 2;
  const maxR = Math.hypot(cx, cy);

  let sharp = 0, lum = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const r = Math.hypot(x - cx, y - cy) / maxR;          // 0 中心，1 边缘
      // 偏心度越大，并进来的感光细胞越多，采样级越粗 [S] 方向 / [A] 参数
      const ecc = Math.max(0, (r - fovea) / Math.max(1e-6, 1 - fovea));
      const lvl = clamp(Math.round(ecc * 4 * drop / 0.55), 0, 4);
      const px = sample(levels[lvl], x, y, W, H);
      const i = (y * W + x) * 3;
      out[i] = px[0]; out[i + 1] = px[1]; out[i + 2] = px[2];
      lum += (0.2126 * px[0] + 0.7152 * px[1] + 0.0722 * px[2]) / 255;
      if (r < fovea) sharp++;
    }
  }

  const dest = opts.out ?? '/tmp/soma-seen.png';
  const bytes = writePng(dest, W, H, out);

  return {
    path: dest,
    width: W, height: H, bytes,
    source: `${sw}x${sh}`,
    meanLum: Number((lum / (W * H)).toFixed(3)),
    sharpShare: Number((sharp / (W * H)).toFixed(3)),
    levels: levels.length,
  };
}
