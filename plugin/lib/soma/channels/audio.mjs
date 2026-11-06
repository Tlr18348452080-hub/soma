/**
 * channels/audio.mjs —— 真的去听一个文件
 *
 * 耳朵那层算的是「给定一段频谱，听起来多响」。
 * 这个文件负责前半截：把一段真实音频解码成频谱。
 *
 * 流程和耳蜗干的事是同一件：
 *   波形 → 分帧 → 窗 → 傅里叶 → 按 ERB 分组 → 每组能量
 *
 * 没有 ffmpeg 就直接报错，不假装听到了。
 */

import { execFileSync } from 'node:child_process';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const erb = (f) => 24.7 * (4.37 * f / 1000 + 1);

/** 36 个中心频率，100 Hz 到 16 kHz，按 ERB 间距 */
export const CENTERS = (() => {
  const out = [];
  let f = 100;
  while (f < 16000 && out.length < 36) { out.push(f); f += erb(f); }
  return out;
})();

/** 就地基 2 FFT（长度必须是 2 的幂） */
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k], ai = im[i + k];
        const br = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const bi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ar + br; im[i + k] = ai + bi;
        re[i + k + len / 2] = ar - br; im[i + k + len / 2] = ai - bi;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}

/**
 * 把一个音频文件听一遍。
 * @param {string} file  路径（mp3/wav/m4a/flac 都行，靠 ffmpeg）
 * @param {object} opts  { maxSeconds=60, sr=16000, frame=1024, hop=320 }
 */
export function analyze(file, opts = {}) {
  const maxSeconds = opts.maxSeconds ?? 60;
  const sr = opts.sr ?? 16000;
  const N = opts.frame ?? 1024;
  const hop = opts.hop ?? 320;          // 20 ms 一帧
  const dur = Number(opts.duration ?? maxSeconds);

  let raw;
  try {
    raw = execFileSync('ffmpeg', [
      '-v', 'error', '-i', file, '-t', String(dur),
      '-f', 's16le', '-ac', '1', '-ar', String(sr), '-',
    ], { maxBuffer: 256 * 1024 * 1024 });
  } catch (e) {
    throw new Error('ffmpeg 打不开这个文件: ' + (e.message || e));
  }

  const pcm = new Int16Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 2));
  const seconds = pcm.length / sr;

  // 汉宁窗
  const win = new Float32Array(N);
  for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));

  const re = new Float64Array(N), im = new Float64Array(N);
  const nb = CENTERS.length;
  const lo = [], hi = [];
  for (let b = 0; b < nb; b++) {
    const w = erb(CENTERS[b]) / 2;
    lo.push(Math.max(1, Math.round((CENTERS[b] - w) * N / sr)));
    hi.push(Math.min(N / 2 - 1, Math.round((CENTERS[b] + w) * N / sr)));
  }

  const frames = [];
  let prevE = 0;
  const onsets = [];

  for (let start = 0; start + N <= pcm.length; start += hop) {
    let e = 0;
    for (let i = 0; i < N; i++) {
      const v = pcm[start + i] / 32768;
      re[i] = v * win[i]; im[i] = 0; e += v * v;
    }
    fft(re, im);

    const bands = new Array(nb);
    for (let b = 0; b < nb; b++) {
      let s = 0;
      for (let k = lo[b]; k <= hi[b]; k++) s += re[k] * re[k] + im[k] * im[k];
      bands[b] = Math.sqrt(s / Math.max(1, hi[b] - lo[b] + 1));
    }
    const rms = Math.sqrt(e / N);
    frames.push({ t: start / sr, rms, bands });
    if (rms - prevE > 0.02) onsets.push(start / sr);
    prevE = rms * 0.7 + prevE * 0.3;
  }

  // 等响修正：低频在小音量下吃亏
  const eq = (f) => {
    const x = Math.log10(f);
    const g = (c, w) => Math.exp(-(((x - c) / w) ** 2));
    return -30 * g(2.0, 0.85) + 3 * g(3.5, 0.6) - 12 * g(4.2, 0.35);
  };

  // 汇总：每 0.1 秒一个点，别把几百帧原样吐出去
  const step = Math.max(1, Math.round(sr / hop / 10));
  const timeline = [];
  for (let i = 0; i < frames.length; i += step) {
    const f = frames[i];
    const db = 20 * Math.log10(Math.max(1e-6, f.rms)) + 94;   // 相对满量程，粗略 SPL
    let best = 0;
    for (let b = 0; b < nb; b++) if (f.bands[b] > f.bands[best]) best = b;
    // 等响修正加在最响的那条带上，不跨带相加（相加会随带数膨胀）
    const spl = db + eq(CENTERS[best]);
    const loud = clamp((spl - 20) / 70, 0, 1);      // 20 dB 听不见，90 dB 顶满 [A]
    timeline.push({
      t: Number(f.t.toFixed(2)),
      db: Math.round(db),
      spl: Math.round(spl),
      loud: Number(loud.toFixed(3)),
      hz: Math.round(CENTERS[best]),
    });
  }

  // 平均谱
  const avg = new Array(nb).fill(0);
  for (const f of frames) for (let b = 0; b < nb; b++) avg[b] += f.bands[b];
  for (let b = 0; b < nb; b++) avg[b] /= Math.max(1, frames.length);

  const peakDb = timeline.reduce((m, x) => Math.max(m, x.db), -120);
  const meanLoud = timeline.reduce((s, x) => s + x.loud, 0) / Math.max(1, timeline.length);
  const onsetRate = onsets.length / Math.max(1, seconds);

  // 节奏：onset 间隔的规律性（0 = 乱，1 = 很整齐）
  let regularity = 0;
  if (onsets.length > 3) {
    const gaps = onsets.slice(1).map((t, i) => t - onsets[i]).filter((g) => g > 0.05);
    if (gaps.length > 2) {
      const m = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const v = Math.sqrt(gaps.reduce((a, b) => a + (b - m) ** 2, 0) / gaps.length) / m;
      regularity = clamp(1 - v, 0, 1);
    }
  }

  // 人声频段（100–4000 Hz）占比，只当线索不当结论
  let hiE = 0;
  for (let b = 0; b < nb; b++) if (CENTERS[b] > 4000) hiE += avg[b];
  const total = avg.reduce((a, b) => a + b, 0) || 1;

  return {
    seconds: Number(seconds.toFixed(1)),
    peakDb: Math.round(peakDb),
    loud: Number(meanLoud.toFixed(2)),
    onsetsPerSec: Number(onsetRate.toFixed(1)),
    regularity: Number(regularity.toFixed(2)),
    hiBand: Number((hiE / total).toFixed(2)),
    timeline,
    spectrum: CENTERS.map((f, i) => [Math.round(f), Number(avg[i].toFixed(4))]),
  };
}
