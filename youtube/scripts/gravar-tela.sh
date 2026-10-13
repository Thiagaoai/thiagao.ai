#!/usr/bin/env bash
# Grava a tela em 1920x1080 (16:9), 30 fps, sem áudio. Ctrl+C para parar.
# Uso: gravar-tela.sh saida.mp4 [largura x altura] [deslocamento x,y]
#   gravar-tela.sh demo-rea.mp4
#   gravar-tela.sh demo-rea.mp4 1920x1080 0,0
set -euo pipefail

out="${1:?uso: gravar-tela.sh saida.mp4 [WxH] [x,y]}"
size="${2:-1920x1080}"
offset="${3:-0,0}"

command -v ffmpeg >/dev/null || { echo "Instale o ffmpeg primeiro." >&2; exit 1; }

if [[ "${XDG_SESSION_TYPE:-}" == "wayland" ]]; then
  # x11grab não enxerga a tela no Wayland.
  if command -v wf-recorder >/dev/null; then
    echo "Wayland: gravando com wf-recorder. Selecione a área com o mouse."
    exec wf-recorder -g "$(slurp)" -f "$out"
  fi
  echo "Wayland sem wf-recorder: use OBS (Captura de tela -> PipeWire), 1920x1080, 30 fps." >&2
  exit 1
fi

echo "Gravando ${size} a partir de ${offset} em ${out}. Ctrl+C para parar."
exec ffmpeg -hide_banner -loglevel warning \
  -video_size "$size" -framerate 30 -f x11grab -i "${DISPLAY:-:0}+${offset}" \
  -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p "$out"
