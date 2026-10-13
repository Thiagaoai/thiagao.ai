# Modelo — demo de tela real (30–45 s)

Use em todo vídeo longo. É o beat que prova o "eu testei" do `voice.md`: a ferramenta rodando
de verdade na sua máquina, sem mockup e sem texto gerado por IA.

## 1. Antes de gravar (5 min)

- [ ] **Alvo autorizado.** Software seu ou que você tem permissão de examinar. Escreva qual:
      `______________________`
- [ ] **Uma pergunta só**, do jeito que o dono de negócio falaria. Escreva o prompt exato:
      `______________________`
- [ ] **Ensaio sem gravar.** Rode o prompt uma vez. Anote o que o agente realmente encontrou.
      A fala do beat é escrita DEPOIS disso, a partir da saída real — nunca antes.
- [ ] **Tela limpa.** Feche abas, notificações e qualquer coisa com e-mail, chave de API,
      token ou dado de cliente. Confira o histórico do terminal (`clear`).
- [ ] **Leitura em vídeo.** Terminal com fonte grande (18–22 pt), tema escuro, janela em
      1920×1080 (16:9). No celular a fonte pequena vira borrão.

## 2. Gravando

```bash
youtube/scripts/gravar-tela.sh demo-<video>.mp4      # Ctrl+C para parar
```

- Grave a sessão inteira, de uma vez: colar o prompt → o agente trabalhando → a resposta.
- Não fale durante a gravação. A narração entra depois, na edição.
- Se aparecer algo sensível, pare, limpe e grave de novo. Não confie em borrar depois.

## 3. Editando

```bash
youtube/scripts/acelerar.sh demo-<video>.mp4 3       # trechos de espera em 3x
```

- Espera do agente: acelere 2–4x e coloque o selo **"acelerado 3x"** no overlay. Esconder que
  foi acelerado é fantasia.
- A resposta final do agente: velocidade normal, com zoom no trecho da evidência.
- Overlay só com texto nativo da edição (regra do `voice.md`).

## 4. A fala do beat (escreva depois do ensaio)

```
[M:SS — TELA REAL] Demo
[ON SCREEN: gravação real — <o que aparece, na ordem>; selo "acelerado Nx" na espera]
FALA: Olha só, na prática. <O que é o alvo, em 1 frase.> Eu peço pro agente: <prompt em
português simples>. <O que ele fez — só o que aparece na tela.> <O que ele provou e o que
ficou sem resposta.> <Lembrete curto: é software meu / autorizado.>
```

Regras da fala:
- Só descreva o que está na gravação. Se a tela não mostra, a fala não diz.
- Inclua o que ficou **sem resposta**. É o que separa demonstração de propaganda.
- Frases curtas, sem "...", jargão traduzido na hora.

## 5. Conferência final

- [ ] A fala bate com a gravação, frase por frase
- [ ] Nada sensível na tela (pausar quadro a quadro nos trechos com texto)
- [ ] Selo de aceleração onde acelerou
- [ ] Prompt exato copiado para a descrição e para o comentário fixado
