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
