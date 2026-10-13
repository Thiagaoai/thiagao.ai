# Roteiro — "Essa IA Grátis Desmonta Apps e Mostra Como Funcionam" (5:00)

Voz: ElevenLabs "Thiago - solocodando (PT-BR)" (`G3QTCMBYzDWQg0Gfe3h0`), modelo `eleven_v3`, tag
`[excited]` (S09 sem tag, tom mais calmo). Confirmada por ele em 13/10/2026.
Avatar: HeyGen "THIAGO CARMO v2", camisa social preta, com o áudio do ElevenLabs (lip-sync).
Formato: 16:9, 1920×1080, 30 fps. Áudio final em -14 LUFS.

| Trecho | Tempo | Na tela | Fala |
|---|---|---|---|
| **A1 — avatar tela cheia** | 0:00–0:15 | Seu avatar | Você vê uma função num aplicativo e pensa: como é que eles fizeram isso? Eu pedi pra uma inteligência artificial descobrir no meu próprio site. Ela abriu por dentro e achou a linha exata. Sem código-fonte. E a ferramenta é grátis. |
| S01 — O problema | 0:15–0:42 | Celular com app; "?"; robô | Pensa num aplicativo que você admira. Você vê o botão, vê a tela, vê o resultado. Mas o que faz aquilo funcionar fica escondido, por dentro. E aí você chuta. Passa semanas tentando adivinhar como o outro fez. Engenharia reversa é o contrário disso: é abrir a caixa e entender a lógica, peça por peça. Só que isso sempre foi trabalho de especialista, com ferramenta cara e difícil. |
| S02 — O que é o REA | 0:42–1:11 | "REA"; diagrama agente ⟷ REA ⟷ ferramentas | O Réa muda isso. O nome vem do inglês, Reverse Engineer Anything: engenharia reversa de qualquer coisa. Ele é uma ponte, o que o pessoal chama de eme cê pê, que liga o seu agente de inteligência artificial às ferramentas profissionais de análise. Você pergunta em português simples. O agente investiga. E volta com as evidências, e com o que ele não conseguiu provar. A análise roda na sua máquina. E é gratuito, de código aberto. |
| S03 — O que examina | 1:11–1:46 | 5 cartões + "Pra começar" | Olha o que ele consegue examinar. Aplicativos de computador feitos em JavaScript e Electron, que é como muito app famoso é feito hoje. Sites. Programas em ponto NET. Aplicativos Android. E os binários nativos, que é o programa já traduzido pra linguagem da máquina. Pra esse último nível, ele usa ferramentas como Hopper, Ghidra ou IDA. Mas pra começar, você não precisa de nada disso. Pra site, basta o navegador Chrome. E app em JavaScript funciona direto. |
| S04 — Caso Notion | 1:46–2:08 | Fluxo tela → por dentro → programa | E funciona mesmo? O próprio projeto publicou casos completos. No Notion, o agente achou a função de copiar e colar na tela, seguiu o caminho dela por dentro do aplicativo, até a parte principal do programa. E mostrou o formato que o Notion usa pra copiar texto com formatação. |
| S05 — Caso DX-Ball | 2:08–2:30 | Blocos retrô; contadores 3.205 e 63/63 | E num jogo antigo de quebrar blocos, o DX-Ball, ele seguiu um som até a conta que decide se o som sai na esquerda ou na direita. A reconstrução passou em três mil, duzentos e cinco testes contra o original. E reproduziu os sessenta e três bytes da função. Um por um. |
| **A2 — avatar** | 2:30–2:40 | Seu avatar | Lembra do meu site, lá do começo? Agora eu te mostro exatamente o que a inteligência artificial achou lá dentro. Olha só. |
| S06 — Demo real | 2:40–3:12 | `rea-video/demo/demo-rea.mp4` + último quadro | Esse é o meu site, numa cópia rodando na máquina. Eu pedi pro agente: entenda como funciona o formulário da newsletter, e mostre as evidências. Ele abriu a página, examinou os dezoito arquivos que rodam no navegador, e achou a linha exata que manda o e-mail pro servidor. Voltou com quatro coisas provadas, cada uma com a linha do código. E disse o que não conseguiu ver: o que o servidor faz com o e-mail. Isso é o que eu gosto nessa ferramenta. Ela não inventa. |
| S07 — Instalação | 3:12–3:39 | `npx rea-agents setup`; agentes; Node | Pra instalar, é um comando só. Está na tela e no comentário fixado. Você roda, ele mostra o que vai mudar, e você aprova. Funciona com Claude Code, Codex, Cursor, Gemini e outros agentes. Precisa do Node, que é o programa que roda esse comando, numa versão atual. A versão certa está na descrição. Depois, é só reiniciar o agente. |
| S08 — O pedido | 3:39–3:59 | Prompt digitado; ✗ / ✔ | E o pedido é simples assim: entenda como funciona esta função neste aplicativo, me mostre as evidências, e construa uma parecida no meu projeto. Repara: você não copia a tela. Você entende a lógica, e constrói a sua. |
| S09 — Limites | 3:59–4:26 | 3 cartões de limite | Agora, os limites. Pra ir no nível mais profundo, você precisa das ferramentas separadas, e algumas são pagas. O seu agente usa um modelo de inteligência artificial, e esse serviço tem a política de dados dele. E o mais importante: use em software seu, ou que você tem autorização pra examinar. É a regra do próprio projeto. E é a minha também. |
| S10 — Resumo | 4:26–4:40 | Checklist + comando | Resumindo: você viu uma função, pediu pro agente, entendeu como funciona, e construiu a sua. O comando e o prompt estão na descrição. |
| **A3 — avatar CTA** | 4:40–5:00 | Seu avatar | Me conta aqui nos comentários: qual aplicativo de código aberto você quer que eu destrinche na parte dois? O mais pedido, eu faço. Se inscreve no canal pra não perder, e deixa o seu like. E me segue no Instagram: arroba solocodando e arroba thiagaoai. Até o próximo! |

## Fact-check (fonte primária, 13/10/2026)

| Afirmação | Fonte |
|---|---|
| Ponte MCP, análise local, evidências e limites | README do repo (seções iniciais e FAQ "Does REA upload my app?") |
| JavaScript/Electron, sites, .NET, Android, binários nativos; Hopper/Ghidra/IDA | README, tabela "What you can analyze" |
| Site só precisa de navegador Chrome; JS sem motor nativo | README: "A Chrome-family browser"; "Static JavaScript analysis needs no native analysis engine" |
| Grátis, código aberto | Licença MIT (README, LICENSE) |
| Notion: tela → preload/IPC → processo principal; formato do clipboard rico | README, Showcases → Notion |
| DX-Ball: 3.205 casos, 63 bytes | README, Showcases → DX-Ball |
| `npx rea-agents setup`; Claude Code, Codex, Cursor, Gemini CLI e outros | README, Quick start |
| Node.js 22.19+ / 24.11+ / 26+ | README, "What you can analyze" |
| Uso só em software próprio/autorizado | README, Disclaimer; DISCLAIMER.md |
| Abertura e demo no site thiagao.ai ("achou a linha exata") | Sessão real com REA 6.4.0 — `../rea-video/demo-de-tela.md` |

## Versões

- v2 (13/10): nova abertura (dor do empreendedor + prova no próprio site), ponte dos 2:30 sem repetir a abertura, CTA com pergunta nos comentários. Áudios da v1 em `audio/v1/`.
