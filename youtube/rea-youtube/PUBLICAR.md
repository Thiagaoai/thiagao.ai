# Publicar no YouTube — vídeo do REA

Arquivos desta pasta:

| Arquivo | Pra quê |
|---|---|
| `REA_youtube_final.mp4` | O vídeo (5:00). Na prévia, os 3 trechos de avatar são espaços reservados |
| `heygen/A1_para_heygen.mp3` · `A2` · `A3` | Áudio com a sua voz, no tempo exato de cada aparição (15 s, 10 s, 20 s) |
| `thumbnail/thumbnail.jpg` | Thumbnail 1280×720 |
| `legendas.srt` | Legendas em português |
| `roteiro.md` | Roteiro completo + fact-check com as fontes |

---

## Passo 1 — Gerar os 3 avatares no HeyGen (~10 min)

Faça isso 3 vezes, uma para cada áudio (`A1`, `A2`, `A3`):

1. No HeyGen: **Create video** → formato **16:9 (landscape)**.
2. Escolha o avatar **THIAGO CARMO v2**, look **camisa social preta**.
3. No lugar do texto, use **Upload audio** e envie `heygen/A1_para_heygen.mp3`.
   (Assim a boca do avatar sincroniza com a sua voz do ElevenLabs — mesma voz do vídeo todo.)
4. Fundo: escuro/neutro. Avatar centralizado, enquadramento do peito pra cima.
5. **Submit** → exporte em **1080p MP4**.
6. Salve como `A1.mp4`, `A2.mp4`, `A3.mp4`.

Custo esperado pela sua taxa medida (~US$0,037/s): 45 s ≈ **US$1,70**. Confira a wallet antes e depois.

## Passo 2 — Me mandar os clipes

Coloque os 3 arquivos em `youtube/rea-youtube/avatar/` no branch `claude/youtube-agent-skills`
(pelo GitHub: **Add file → Upload files**), ou anexe aqui na conversa. Eu rodo:

```bash
python3 montar.py --pw <playwright-core>            # sem trilha
python3 montar.py --pw <playwright-core> --musica trilha.mp3   # com a trilha do Suno (ducking automático)
```

e te devolvo o `REA_youtube_final.mp4` com você no vídeo. A trilha de 60 s do Suno está na sua
máquina (`~/workspace/suno/2026-10-12/`); se quiser música, mande o arquivo junto.

## Passo 3 — Assistir uma vez inteiro antes de subir

- [ ] Avatar entra em 0:00, 2:30 e 4:40, e a boca bate com a voz
- [ ] Nenhuma palavra pronunciada errado (REA = "réa", MCP = "eme-cê-pê")
- [ ] Volume confortável no celular e no fone

## Passo 4 — Subir no YouTube Studio

1. https://studio.youtube.com → **Criar → Enviar vídeos** → `REA_youtube_final.mp4`.
2. **Título** (copie):
   ```
   Essa IA Grátis Desmonta Apps e Mostra Como Funcionam
   ```
   Alternativas, se o "Testar e comparar" do Studio aceitar título na sua conta:
   - `Seu Agente de IA Agora Abre Apps e Mostra Como Funcionam`
   - `REA: a IA Grátis que Mostra Como um App Funciona por Dentro`
3. **Descrição:** cole o bloco da seção "Descrição" abaixo.
4. **Thumbnail:** envie `thumbnail/thumbnail.jpg`. Se o "Testar e comparar" de thumbnail estiver
   disponível, teste uma segunda versão com o seu rosto à esquerda.
5. **Público:** "Não, não é conteúdo para crianças".
6. **Mostrar mais:**
   - **Conteúdo alterado → SIM.** A voz é um clone por IA e o avatar é gerado pelo HeyGen. O
     YouTube exige essa marcação para conteúdo sintético realista; não marcar pode derrubar o vídeo
     ou atrapalhar a monetização depois. Marcar não diminui o alcance.
   - **Tags:** cole a lista da seção "Tags".
   - **Idioma do vídeo:** Português (Brasil).
   - **Legendas:** Enviar arquivo → `legendas.srt` → "Com sincronização".
   - **Categoria:** Ciência e tecnologia.
   - **Capítulos automáticos:** pode deixar ligado; os capítulos da descrição têm prioridade.
7. **Elementos do vídeo:**
   - **Tela final** (últimos 20 s, durante o seu CTA): botão de **inscrever** + **vídeo mais recente**.
   - **Cards:** um card em 3:12 (instalação) apontando para o seu vídeo mais relacionado, se houver.
8. **Visibilidade:** Programar para **terça 20/10/2026** (dia da âncora no calendário). Horário: o
   que o Studio mostrar em "Quando seus espectadores estão no YouTube"; sem esse dado, 18h–19h.

## Passo 5 — Primeira hora depois de publicar

1. Fixe o **comentário** da seção "Comentário fixado".
2. Responda os primeiros comentários (curto, em até 30 palavras — `/yt-comment` ajuda).
3. Poste nos Stories do @solocodando e @thiagaoai com o link (o vídeo precisa de cliques nas
   primeiras horas).
4. Corte o trecho da demo (2:40–3:12) em Short com `/yt-shorts` para quinta 22/10.

---

## Descrição

```
O REA é uma ferramenta grátis, de código aberto, que liga o seu agente de IA às ferramentas de engenharia reversa: você pergunta como uma função de um app funciona, e ele investiga e volta com as evidências.

👇 Comando e prompt pra copiar

1) Instalação (precisa do Node.js 22.19+, 24.11+ ou 26+):
npx rea-agents setup

Funciona com Claude Code, Codex, Cursor, Gemini CLI e outros agentes que aceitam MCP. Depois do setup, reinicie o agente.

2) O pedido:
Entenda como funciona esta função neste aplicativo, me mostre as evidências, e construa uma parecida no meu projeto.

⏱️ Capítulos
00:00 Um app aberto por dentro
00:15 O problema: você só vê a tela
00:42 O que é o REA
01:11 O que ele consegue examinar
01:46 Caso real: Notion
02:08 Caso real: DX-Ball (3.205 testes)
02:30 Testei no meu próprio site
03:12 Como instalar (1 comando)
03:39 O prompt pra copiar
03:59 Os limites
04:26 Resumo

🔗 Links
Repositório oficial: https://github.com/morluto/rea
Site e casos completos: https://rea.tools

⚠️ Use o REA só em software seu ou que você tem autorização pra examinar (pesquisa, aprendizado, interoperabilidade). É a regra do próprio projeto. Análise profunda de binários usa ferramentas separadas (Hopper, Ghidra ou IDA), e algumas são pagas.

📲 Instagram: @solocodando · @thiagaoai

Narração com voz clonada por IA e avatar gerado por IA (HeyGen), a partir do meu próprio roteiro.

#inteligenciaartificial #agentesdeia #engenhariareversa
```

## Tags

```
REA, engenharia reversa, engenharia reversa com IA, reverse engineering, agente de IA, agentes de IA, Claude Code, MCP, Codex, Cursor, Gemini CLI, inteligência artificial, IA grátis, ferramenta de IA, como funciona um app, código aberto, solocodando
```

## Comentário fixado

```
O comando e o prompt do vídeo, pra copiar 👇

1) npx rea-agents setup
(precisa do Node.js 22.19+, 24.11+ ou 26+)

2) Entenda como funciona esta função neste aplicativo, me mostre as evidências, e construa uma parecida no meu projeto.

Use só em software seu ou que você tem autorização pra examinar.
Qual app você quer que eu destrinche na parte dois?
```

---

## Sobre viralizar e monetizar — a conta honesta

- **Ninguém garante viral**, nem eu. O que dá pra controlar está feito: gancho com número
  conferido nos primeiros 15 s, demo real, entrega copiável, título e thumbnail que não se repetem,
  capítulos, legendas.
- **Monetização (YouTube Partner Program):** 1.000 inscritos + 4.000 horas de exibição pública em
  vídeos longos nos últimos 12 meses (ou 10 milhões de views de Shorts em 90 dias). Um vídeo só
  não chega lá; é o calendário de 4 semanas + a rota de 12 meses (`../calendario_4_semanas.md`).
- **O que mais pesa:** retenção. Depois de 48 h, exporte a retenção no Studio e rode
  `/yt-retention` — se a queda for nos primeiros 30 s, o próximo gancho muda.
