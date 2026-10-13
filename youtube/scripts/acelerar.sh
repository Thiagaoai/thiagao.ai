#!/usr/bin/env bash
# Acelera um vídeo inteiro (sem áudio) N vezes, para os trechos de espera do agente.
# Uso: acelerar.sh entrada.mp4 3   -> entrada_3x.mp4
# Corte o trecho de espera antes, se só ele deve ser acelerado.
set -euo pipefail

in="${1:?uso: acelerar.sh entrada.mp4 N}"
n="${2:?informe o fator, ex.: 3}"
out="${in%.*}_${n}x.mp4"

ffmpeg -hide_banner -loglevel warning -i "$in" \
  -filter:v "setpts=PTS/${n}" -an -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p "$out"
echo "$out"
