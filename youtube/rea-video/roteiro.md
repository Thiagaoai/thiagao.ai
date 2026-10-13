# Vídeo YouTube — REA: engenharia reversa com agentes de IA

- Canal: YouTube (linha @solocodando.ai — IA aplicada, sem jargão)
- Formato: 16:9 (decidido por ele em 12/10 — ver `voice.md`)
- Duração alvo: 5–8 min. A versão anterior tinha 901 palavras faladas (5:06 a 175 ppm). Esta
  versão acrescenta o beat de demo real — recontar as palavras depois de escrever a fala final.
- Estrutura: bem gráfico/ilustrativo; avatar a cada ~1 min; **1 beat de tela real (4:45)**
- Voz: **clone do HeyGen** (v3 `5d138a7e...` ou v2 `c3ddcdb3...`), também na narração dos
  trechos gráficos. A voz ElevenLabs "Thiago - solocodando" (`G3QTCMBYzDWQg0Gfe3h0`) NÃO é ele —
  não usar.
- Regras aplicadas: `voice.md` (frases curtas e declarativas, zero "...", jargão sempre
  traduzido, nenhum número de fantasia, 1 CTA); texto de tela só via overlay; visual de IA = robô
- Pronúncia: REA = "réa"; MCP = "eme-cê-pê"; GitHub = "guit-hub"

## Pendências antes de gravar

- [x] **Estrelas conferidas em 13/10:** o contador da página marca 189,3 mil (o README ainda diz
      170 mil). Gancho atualizado para "passou de 180 mil" — conservador e verdadeiro.
- [x] **Demo gravada** (beat 4:45): `demo/demo-rea.mp4` (23,7 s, 1920×1080). Fala escrita a partir
      da saída real — ver `demo-de-tela.md`.
- [ ] **Relintar o título** no `title.py` (alternativa abaixo).
- [ ] **Confirmar o funil do CTA:** comentário fixado com comando + prompt + link do guia. Se a
      ideia for "comenta → DM" igual ao Instagram, confirmar antes se o ManyChat funciona com
      comentários do YouTube.

## Título + thumbnail (/yt-package, title.py)

- Título escolhido (98/100): "1 Comando Abre Qualquer App e Explica Como Funciona"
  - Atenção: "Qualquer App" briga com os limites do próprio vídeo (binário nativo exige
    ferramenta paga; só software autorizado). Alternativa a relintar:
    "1 Comando Faz a IA Explicar Como um App Funciona"
- Texto da thumbnail: "SEM CÓDIGO-FONTE"

## Hooks finalistas (hookscore.py — 8 candidatos)

1. Vencedor (41 — The Statistic): "Este repositório passou de 180 mil estrelas no GitHub. Ele faz
   engenharia reversa de qualquer app com um agente de IA." (conferido: 189,3 mil em 13/10)
2. Vice (39 — The Clock): "Nos próximos 4 minutos, você instala a ferramenta que destrincha
   qualquer app e reconstrói a função no seu projeto."

Aviso: a ferramenta foi calibrada em inglês; ADDRESS/CURIOSITY travam baixo em português.

## ROTEIRO

**[0:00 — AVATAR] Hook**
[ON SCREEN: avatar em tela cheia, camisa social preta; overlay "180 mil ⭐" em texto nativo]
FALA: Este repositório passou de 180 mil estrelas no GitHub. Ele faz engenharia reversa de
qualquer app com um agente de IA. Na prática: você vê uma função num app, pede pro agente
destrinchar, e ele te explica como funciona por dentro. Com prova. Sem o código-fonte.

**[0:30 — GRÁFICO] O problema**
[ON SCREEN: empreendedor olhando uma vitrine de app pelo vidro; depois o app "aberto" mostrando
engrenagens; robô ao lado apontando]
FALA: O problema é o seguinte. Todo mundo copia app olhando a tela. Vê o botão, vê a cor, vê o
que aparece. Mas o que faz a função funcionar está por dentro, e por dentro você não enxerga. Aí
você chuta. Passa semanas tentando adivinhar como o outro fez. Engenharia reversa é o contrário
disso. É abrir a caixa e entender a lógica de verdade, peça por peça. Sempre foi trabalho de
especialista, com ferramenta cara e curva de aprendizado brutal. O REA muda isso porque quem
opera a ferramenta é o seu agente de IA. Você pergunta em linguagem simples. Ele investiga.

**[1:05 — AVATAR] O que é o REA**
[ON SCREEN: avatar; cartão "REA — Reverse Engineer Anything" em overlay]
FALA: O nome é REA. Em inglês, Reverse Engineer Anything. Traduzindo: engenharia reversa de
qualquer coisa. Ele é uma ponte, um MCP, que liga o seu agente de IA às ferramentas profissionais
de análise. A análise roda na sua máquina, local. E o agente não volta com achismo. Ele volta com
evidências, e com os limites do que ele conseguiu provar.

**[1:40 — GRÁFICO] O que ele destrincha**
[ON SCREEN: 5 cartões surgindo: Apps de computador (JavaScript/Electron) · Programas .NET ·
Binários nativos · Sites · Apps Android; robô examinando cada cartão com lupa]
FALA: Olha o que ele consegue examinar. Aplicativos feitos em JavaScript e Electron, que são a
maioria dos apps de computador de hoje. Programas em ponto NET. Sites, observando a estrutura e o
que roda por trás. Aplicativos Android. E binários nativos, o nível mais profundo: o programa já
traduzido pra linguagem da máquina, sem o texto original. Tem uma diferença importante aqui. App
em JavaScript e ponto NET, ele examina sem precisar de motor externo. É o caminho mais fácil pra
começar. Binário nativo é outro nível. Aí ele usa ferramentas profissionais como Hopper, Ghidra
ou IDA, que são programas separados. Eu vou ser direto: esse nível é pra quem quer ir fundo. O
começo, pra você, é o app comum. E é aí que estão as funções que você quer entender.

**[2:35 — AVATAR] Prova 1 — o caso do Notion**
[ON SCREEN: avatar; overlay lateral com setas "tela → ponte → processo principal"]
FALA: Prova de que isso funciona de verdade. No site oficial do projeto tem três casos completos,
com o passo a passo. O mais fácil de entender é o do Notion. Eles mandaram o REA rastrear como
funciona o copiar e colar rico do Notion. O agente achou onde a função começa na tela, seguiu o
caminho dela pela ponte interna do app, e chegou no processo principal que faz o trabalho. Cada
passo com evidência. É exatamente o caminho que um especialista faria na mão. Só que quem fez
foi o agente.

**[3:10 — GRÁFICO] Provas 2 e 3 — jogo de quebrar blocos e jogo de naves japonês**
[ON SCREEN: ilustração retrô — jogo de quebrar blocos e jogo de naves antigo; cartões com os
resultados dos showcases]
FALA: Os outros dois casos mostram a profundidade. Num jogo clássico de quebrar blocos, o agente
seguiu um som dentro do programa, reconstruiu a conta que posiciona o som na esquerda ou na
direita, e a reconstrução passou nos testes do projeto, reproduzindo o comportamento original. E
num jogo de naves japonês dos anos noventa, feito pro computador PC-98, ele recuperou a conta que
forma o anel de tiros, direto das instruções originais de dezesseis bits. Repito: são os casos
publicados pelo próprio projeto, com código e teste abertos pra conferir. Não é promessa de
marketing. É demonstração pública.

**[3:55 — AVATAR] Instalação, passo a passo**
[ON SCREEN: avatar pequeno no canto + terminal grande com `npx rea-agents setup` em overlay;
depois a lista de agentes compatíveis]
FALA: Instalação é um comando só. Está na tela e no comentário fixado, pra copiar. Você roda, ele
mostra o que vai mudar, você aprova, e ele registra o REA no seu agente e instala as instruções
de investigação. Funciona com Claude Code, Codex, Cursor, Gemini e outros agentes que aceitam MCP.
Precisa do Node atualizado, a versão exata está na descrição. Depois do setup, reinicia o agente.
Pronto. Aqui em casa o REA já está rodando, ligado nos meus agentes. Foi esse mesmo comando, sem
atalho.

**[4:45 — TELA REAL] Demo — o agente investigando o meu site**
[ON SCREEN: `demo/demo-rea.mp4` — o pedido em português → `rea list-browser-targets` → `rea
analyze-web-bundle` com o endpoint destacado → o trecho do código → a resposta "Provado / Sem
resposta". Segurar o último quadro até o fim da fala; zoom em "Provado" e em "Sem resposta"]
FALA: Olha só, na prática. Esse é o meu site, numa cópia rodando na máquina. Eu peço pro agente:
entenda como funciona o formulário da newsletter, e mostre as evidências. Ele abre a página,
examina os dezoito arquivos que rodam no navegador, e acha o ponto exato: a linha que manda o
e-mail pro servidor. Volta com quatro coisas provadas, cada uma com a linha do código. E fala o
que não conseguiu ver: o que o servidor faz com o e-mail. Repara: é um site meu. É assim que você
usa, no seu, ou onde tem autorização.

**[5:20 — GRÁFICO] Como pedir (o prompt)**
[ON SCREEN: cartão grande com o prompt em overlay, digitado letra a letra; depois o fluxo
"pergunta → investigação → evidência → sua versão"]
FALA: E o prompt é esse que você viu. Entenda como funciona esta função neste app. Mostre as
evidências. E, se quiser, construa uma parecida no meu projeto. Só isso. Percebe a diferença?
Você não está copiando a tela. Você está entendendo a lógica e construindo a sua. Isso serve pra
função de um concorrente que você admira, pra um recurso que você quer no seu produto, e pra
aprender como software de verdade é feito por dentro.

**[5:55 — AVATAR] Os limites, sem fantasia**
[ON SCREEN: avatar; 3 cartões de limite surgindo]
FALA: Agora os limites, porque aqui não tem fantasia. Primeiro: análise profunda de binário
precisa de Hopper, Ghidra ou IDA. São ferramentas separadas, algumas pagas, e o REA não inclui
licença de nenhuma. Segundo: a análise é local, mas o seu agente usa um modelo de IA, e esse
provedor tem a política de dados dele. Terceiro, e o mais importante: isso é pra software seu, ou
que você tem autorização pra examinar. Pesquisa, aprendizado, interoperabilidade. É a posição
oficial do projeto, e é a minha também.

**[6:35 — GRÁFICO] Recap — o payoff**
[ON SCREEN: checklist animada com 3 itens; comando e prompt repetidos em cartão final]
FALA: Recapitulando o que você leva daqui. Um: existe uma ferramenta gratuita, de código aberto,
que liga seu agente de IA às ferramentas de engenharia reversa. Dois: você pede em linguagem
simples e recebe explicação com evidência, não achismo. Três: o comando de instalação e o prompt
exato estão no comentário fixado, pra copiar e usar hoje. Você viu uma função, entendeu a função,
construiu a sua. Esse é o ciclo.

**[7:05 — AVATAR] Fechamento — 1 CTA**
[ON SCREEN: avatar em tela cheia; overlay "Comenta: REA"]
FALA: Se você quer a parte dois, comigo destrinchando um app de verdade aqui na tela, comenta
REA. É isso. Até o próximo vídeo.

## Comentário fixado (funil)

```
O comando e o prompt do vídeo, pra copiar:

1) Instalação: npx rea-agents setup   (precisa do Node.js 22.19+, 24.11+ ou 26+)
2) Prompt: Entenda como funciona esta função neste app. Mostre as evidências. Construa uma
   parecida no meu projeto.

Use só em software seu ou que você tem autorização pra examinar.
<link do guia/diagnóstico>

Quer a parte dois? Comenta REA.
```

## Fontes (fact-check em 2026-10-12, fonte primária)

- Repo oficial: https://github.com/morluto/rea (README + FAQ). Estrelas: 189,3 mil no contador da página
  em 13/10/2026 (o README diz 170 mil).
- Site oficial com os 3 showcases (DX-Ball, Notion, TH04): https://rea.tools
- Instalação: `npx rea-agents setup`; Node.js 22.19+ / 24.11+ / 26+; licença MIT
- Disclaimer de uso autorizado: DISCLAIMER.md do repo

## Áudio

- Música: trilha instrumental Suno/kie (take de 60s, em `~/workspace/suno/2026-10-12/` na máquina
  dele), em loop com crossfade; bed em 0.32 + ducking ratio 10 (demo v2:
  `demo_mix_v2_voz_real.mp3`, pico -1.6 dB).
- Voz: clone HeyGen (ver cabeçalho). Cadeia: highpass 60 Hz → compressor 3:1 → limiter 0.89 →
  loudnorm -14 LUFS, pico verdadeiro -1.5 dB.

## Custo

- HeyGen: ~US$0,037 por segundo gerado (US$0,59 por 15,6 s, medido em `take_hook_v3.mp4`).
- O beat de tela real custa US$0 de HeyGen e substitui ~35 s que seriam narração via take.
- Medir a wallet antes/depois e reportar o custo exato.

## O que mudou nesta versão (13/10)

1. Cabeçalho: voz corrigida para o clone HeyGen; formato 16:9 registrado como decidido.
2. Novo beat 4:45 com demo de tela real no site thiagao.ai, gravada e com a fala final.
6. Gancho: 110 mil → 180 mil estrelas (contador conferido: 189,3 mil).
3. "Compilado" traduzido; TH04 descrito como jogo de PC-98 (não "da época do DOS").
4. CTA aponta para o comentário fixado (funil) + "comenta REA"; tirada a promessa condicional.
5. Pendência: relintar o título.
