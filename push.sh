#!/bin/sh
# 把 /sdcard/dsh/soma 推到 GitHub（Tlr18348452080-hub/soma）
# 用法: ./push.sh "提交说明"
# 为什么这么绕：/sdcard 是 FUSE，git 连对象库都写不进去（No such file or directory），
# 所以每次都在 /tmp 里克隆一份干净的仓库，灌入工作区文件，提交、推送。
set -e
SRC=/sdcard/dsh/soma
WORK=/tmp/soma-push-work
TOKEN="${GH_TOKEN:-$(cat /root/.dsh/gh-token)}"
MSG="${1:-update}"
REPO=https://github.com/Tlr18348452080-hub/soma.git
export TOKEN
HELPER='credential.helper=!f() { echo username=x-access-token; echo "password=$TOKEN"; }; f'

cd /tmp && rm -rf "$WORK"
git -c "$HELPER" clone -q "$REPO" "$WORK"
cd "$SRC" && tar -cf - --exclude=.git --exclude='*.png' . | (cd "$WORK" && tar -xf -)
cd "$WORK"
git add -A
if git diff --cached --quiet; then
  echo "没有变化，远端已经是这个状态"; exit 0
fi
git -c user.name="Tlr18348452080-hub" -c user.email="Tlr18348452080@qq.com" commit -q -m "$MSG"
git -c "$HELPER" push -q origin main
echo "已推送: $(git log --oneline -1)"
