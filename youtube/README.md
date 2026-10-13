# YouTube — @solocodando

| Arquivo | O que é |
|---|---|
| `voice.md` | Perfil de voz do canal (as skills `yt-*` leem em `~/.claude/youtube/voice.md`) |
| `calendario_4_semanas.md` | Calendário 19/10–15/11/2026 + rota de 12 meses |
| `rea-video/roteiro.md` | Roteiro do vídeo do REA (com pendências no topo) |
| `rea-video/demo-de-tela.md` | Plano da demo de tela real do vídeo do REA |
| `modelos/demo-de-tela.md` | Modelo reutilizável do beat de tela real |
| `scripts/gravar-tela.sh` | Grava a tela em 1920×1080 com ffmpeg (X11) ou wf-recorder (Wayland) |
| `scripts/acelerar.sh` | Acelera um trecho de espera N vezes |

Na sua máquina, para as skills enxergarem o perfil de voz:

```bash
mkdir -p ~/.claude/youtube && cp youtube/voice.md ~/.claude/youtube/voice.md
```
