# Demo de tela — vídeo do REA (beat 4:45)

Preenchido a partir de `youtube/modelos/demo-de-tela.md`.

## Alvo (autorizado: é o site do próprio Thiago)

- Site: https://thiagao.ai/briefing
- Função: o formulário de inscrição da newsletter
- No código (para conferir a resposta do agente depois, NÃO mostrar no vídeo):
  `app/briefing/SubscribeForm.tsx` (a tela) → `app/api/newsletter/subscribe/route.ts` (o servidor)

## Prompt exato (colar no Claude Code com o REA ligado)

```
Entenda como funciona o formulário de inscrição da newsletter em https://thiagao.ai/briefing.
Use as ferramentas do REA. Mostre as evidências do que você provou e diga o que ficou sem resposta.
```

## Passo a passo

1. Ensaio: rodar o prompt uma vez, sem gravar. Salvar a resposta do agente em
   `youtube/rea-video/demo-saida-ensaio.md`.
2. Conferir a resposta contra os dois arquivos acima. Se o agente afirmou algo que o código não
   confirma, isso entra na fala como "ficou sem resposta" ou o beat é regravado.
3. Escrever a fala final do beat (no roteiro, campo `[AJUSTAR À SAÍDA REAL]`).
4. Gravar: `youtube/scripts/gravar-tela.sh demo-rea.mp4`
5. Acelerar a espera: `youtube/scripts/acelerar.sh espera.mp4 3` + selo "acelerado 3x".

## Cuidado com dados

O formulário grava e-mails reais. Na gravação:
- não enviar o formulário com e-mail de ninguém (se precisar enviar, usar um e-mail de teste seu);
- não abrir o painel `/admin/newsletter` nem nada com a lista de inscritos;
- não mostrar `.env`, chaves de API ou logs do servidor.

## Resultado da sessão (13/10/2026) — gravado

Rodado pelo agente (Claude Code na nuvem) com REA 6.4.0, contra uma cópia local do site
(`npm run dev` → http://localhost:3002/briefing), porque a rede do ambiente bloqueia `thiagao.ai`.

1. `rea list-browser-targets http://127.0.0.1:9222` → 1 página: "Thiagao Ai Briefing - AI Operator
   Newsletter".
2. `rea analyze-web-bundle … --observation-ms 3000` → completo: 18 scripts, 0 falhas; Next.js
   (high), React (medium); endpoints via `fetch`: `/api/newsletter/subscribe` (`_1dzphkd._.js:467`),
   `/api/newsletter/track` (`:360`), `/api/chat-thiagao` (`:698`). Limitação declarada pelo REA:
   comportamento do servidor pode ficar desconhecido. Evidência completa:
   `demo/evidencia-analyze-web-bundle.json`.
3. Trecho conferido no mesmo arquivo (sha256 `0dfb6096…`, igual ao analisado), linhas 463–486.

**Provado:** e-mail com `trim()` + minúsculas (463); POST JSON para `/api/newsletter/subscribe`
(467); envia `email`, `source`, `company` (campo escondido "Empresa") e `startedAt` (hora em que a
página abriu, 458); sucesso → `/newsletter/obrigado` (486).
**Inferência (marcada como tal no vídeo):** o campo escondido é armadilha contra robôs.
**Sem resposta:** o que o servidor faz com o e-mail.

Arquivos: `demo/demo-rea.mp4` (vídeo final, 23,7 s) e `demo/replay.html` (a reprodução da sessão
que foi gravada em 1920×1080 com o Chromium). O texto da tela é a saída real, só recortada; as
linhas de código omitidas estão indicadas.

Observação: o bundle é o de desenvolvimento (`next dev`). Em produção o código sai minificado e
os nomes das variáveis mudam; os endpoints e o comportamento são os mesmos.
