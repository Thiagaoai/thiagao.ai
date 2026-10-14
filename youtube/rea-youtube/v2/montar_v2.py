#!/usr/bin/env python3
"""Edição v2 do vídeo do REA: b-roll de vídeo por IA no lugar dos slides.

Cada cena gráfica vira uma sequência de tomadas (clipes em broll/clipes/) cortadas na palavra
certa da narração, com texto de tela limpo por cima. As cenas saem em ../build/<id>.mp4 e o
montar.py junta tudo (avatares, demo, voz, loudness).

Uso: python3 v2/montar_v2.py --pw <dir do playwright-core>
"""
import argparse, json, os, re, subprocess, sys

V2 = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(V2)
sys.path.insert(0, RAIZ)
import montar  # noqa: E402

CLIPES = os.path.join(RAIZ, 'broll', 'clipes')
STILLS = {'HOPPER': os.path.join(V2, 'rea-hopper-analysis.png'),
          # O clipe do jogo retrô perdeu os tijolos na animação; a imagem original fica com movimento de câmera.
          'S05a_img': os.path.join(RAIZ, 'broll', 'S05a.png')}
FONTE_CASO = 'Caso publicado pelo projeto · rea.tools'

# Por cena: tomadas [(tomada, palavra-âncora da fala onde ela entra, deslocamento no clipe)] e
# textos [(estilo, texto, subtítulo, palavra-âncora, duração)]. Âncora None = começo da cena.
EDL = {
    'S01': {
        'tomadas': [('S01a', None, 0), ('S01b', 'Você vê o botão', 0), ('S01c', 'E aí você chuta', 0),
                    ('S01d', 'Engenharia reversa', 0)],
        'textos': [('big', 'Engenharia reversa', 'abrir a caixa e entender a lógica', 'Engenharia reversa', 5.5)],
    },
    'S02': {
        'tomadas': [('S02a', None, 0), ('S02b', 'Você pergunta', 0), ('S02c', 'E volta com as evidências', 0),
                    ('S02d', 'A análise roda', 0), ('S02e', 'E é gratuito', 0)],
        'textos': [('big', 'REA', 'Reverse Engineer Anything', None, 5.0),
                   ('tag', 'Ponte (MCP): seu agente ⟷ ferramentas de análise', None, 'Ele é uma ponte', 5.0),
                   ('tag', 'Roda na sua máquina', None, 'A análise roda', 3.0),
                   ('tag', 'Grátis · código aberto (MIT)', None, 'E é gratuito', 3.2)],
    },
    'S03': {
        'tomadas': [('S03a', None, 0), ('S03b', 'Sites', 0), ('S03a', 'Programas em ponto NET', 3.0),
                    ('S03c', 'Aplicativos Android', 0), ('S03d', 'E os binários', 0), ('HOPPER', 'Pra esse último', 0),
                    ('S03e', 'Mas pra começar', 0), ('S02b', 'E app em JavaScript', 2.0)],
        'textos': [('tag', 'Apps JavaScript / Electron', None, 'Aplicativos de computador', 4.0),
                   ('tag', 'Sites', None, 'Sites', 1.6),
                   ('tag', 'Programas .NET', None, 'Programas em ponto NET', 1.6),
                   ('tag', 'Apps Android', None, 'Aplicativos Android', 1.6),
                   ('tag', 'Binários nativos', None, 'E os binários', 4.0),
                   ('tag', 'Nível profundo: Hopper · Ghidra · IDA', None, 'Pra esse último', 4.4),
                   ('src', 'REA analisando um binário no Hopper · imagem do projeto', None, 'Pra esse último', 4.4),
                   ('tag', 'Site: só o navegador Chrome', None, 'Pra site', 3.0),
                   ('tag', 'App JavaScript: funciona direto', None, 'E app em JavaScript', 3.0)],
    },
    'S04': {
        'tomadas': [('S04c', None, 0), ('S04b', 'seguiu o caminho', 0), ('S04a', 'E mostrou', 0)],
        'textos': [('tag', 'Caso real: Notion', None, 'No Notion', 4.0),
                   ('tag', 'Copiar e colar com formatação', None, 'E mostrou', 4.0),
                   ('src', FONTE_CASO, None, None, 21.0)],
    },
    'S05': {
        'tomadas': [('S05a_img', None, 0), ('S05b', 'ele seguiu um som', 0), ('S05c', 'A reconstrução', 0)],
        'textos': [('tag', 'Caso real: DX-Ball', None, 'o DX-Ball', 3.5),
                   ('big', '3.205 testes', 'contra o jogo original', 'três mil', 4.0),
                   ('big', '63 de 63 bytes', 'reproduzidos, um por um', 'sessenta e três', 4.2),
                   ('src', FONTE_CASO, None, None, 21.0)],
    },
    'S07': {
        'tomadas': [('S07a', None, 0), ('S07b', 'e você aprova', 0), ('S07c', 'Funciona com', 0),
                    ('S07d', 'Depois, é só', 0)],
        'textos': [('cmd', 'npx rea-agents setup', 'também no comentário fixado', None, 6.5),
                   ('tag', 'Claude Code · Codex · Cursor · Gemini CLI', None, 'Funciona com', 4.5),
                   ('tag', 'Node.js 22.19+ · 24.11+ · 26+', None, 'Precisa do Node', 4.5)],
    },
    'S08': {
        'tomadas': [('S08a', None, 0), ('S08b', 'e construa', 0), ('S08c', 'Repara', 0)],
        'textos': [('prompt', '“Entenda como funciona esta função neste aplicativo, me mostre as evidências, '
                              'e construa uma parecida no meu projeto.”', None, 'entenda', 8.0)],
    },
    'S09': {
        'tomadas': [('S09a', None, 0), ('S09c', 'O seu agente', 0), ('S09b', 'E o mais importante', 0)],
        'textos': [('tag', '1 · Nível profundo: ferramentas separadas, algumas pagas', None, 'Pra ir no nível', 5.5),
                   ('tag', '2 · O provedor de IA tem a política de dados dele', None, 'O seu agente', 5.5),
                   ('tag', '3 · Só em software seu ou autorizado', None, 'E o mais importante', 7.0)],
    },
    'S10': {
        'tomadas': [('S01d', None, 2.0), ('S02c', 'pediu pro agente', 2.0), ('S08b', 'e construiu', 2.0),
                    ('S08c', 'O comando', 0)],
        'textos': [('cmd', 'npx rea-agents setup', 'comando e prompt na descrição', 'O comando', 5.0)],
    },
}


def falas():
    out = {}
    for linha in open(os.path.join(RAIZ, 'roteiro.md'), encoding='utf-8'):
        m = re.match(r'\| \**([AS]\d+)\b[^|]*\|[^|]*\|[^|]*\| (.+) \|\s*$', linha)
        if m: out[m.group(1)] = m.group(2)
    return out


def ancora(fala, palavra, audio):
    """Tempo (s, desde o início da cena) em que a palavra é dita — proporcional ao texto."""
    if palavra is None: return 0.0
    i = fala.find(palavra)
    if i < 0: raise SystemExit(f'âncora não encontrada: {palavra!r}')
    return 0.8 + audio * i / len(fala)


def run(cmd):
    subprocess.run(cmd, check=True)


def tomada(src, desloc, d, out):
    grade = 'eq=contrast=1.06:saturation=1.06:brightness=-0.01,vignette=PI/5'
    if src in STILLS:
        n = int(round(d * 30))
        vf = (f'scale=3840:2160:force_original_aspect_ratio=increase,crop=3840:2160,'
              f"zoompan=z='1.0+0.10*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps=30,{grade}")
        run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-loop', '1', '-i', STILLS[src], '-vf', vf,
             '-t', f'{d:.3f}', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out])
        return
    clip = os.path.join(CLIPES, f'{src}.mp4')
    disp = montar.dur(clip) - desloc
    fator = max(1.0, d / disp)  # só desacelera quando a tomada é mais longa que o clipe
    vf = (f'trim=start={desloc}:duration={min(disp, d):.3f},setpts=(PTS-STARTPTS)*{fator:.4f},fps=30,'
          f'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,{grade}')
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', clip, '-vf', vf, '-an', '-t', f'{d:.3f}',
         '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pw', required=True)
    args = ap.parse_args()
    F = falas()
    tl = {s: d for s, _, d in montar.linha_do_tempo()}
    tmp = os.path.join(V2, 'build'); os.makedirs(tmp, exist_ok=True)
    destino = os.path.join(RAIZ, 'build'); os.makedirs(destino, exist_ok=True)

    # 1) Textos de tela em PNG.
    itens = []
    for sid, e in EDL.items():
        for k, (estilo, texto, sub, _, _) in enumerate(e['textos']):
            itens.append({'id': f'{sid}_{k}', 'style': estilo, 'text': texto, 'sub': sub})
    lista = os.path.join(tmp, 'textos.json'); json.dump(itens, open(lista, 'w'), ensure_ascii=False)
    run(['node', os.path.join(V2, 'overlays.mjs'), args.pw, os.path.join(V2, 'overlay.html'), lista, tmp])

    for sid, e in EDL.items():
        d_cena = tl[sid]
        audio = montar.dur(os.path.join(RAIZ, 'audio', f'{sid}.mp3'))
        fala = F[sid]
        # 2) Tomadas cortadas nas âncoras.
        inicios = [ancora(fala, a, audio) for _, a, _ in e['tomadas']]
        inicios[0] = 0.0
        partes = []
        for k, (src, _, desloc) in enumerate(e['tomadas']):
            fim = inicios[k + 1] if k + 1 < len(inicios) else d_cena
            p = os.path.join(tmp, f'{sid}_t{k}.mp4'); tomada(src, desloc, fim - inicios[k], p); partes.append(p)
        lst = os.path.join(tmp, f'{sid}.txt')
        with open(lst, 'w') as f:
            for p in partes: f.write(f"file '{p}'\n")
        base = os.path.join(tmp, f'{sid}_base.mp4')
        run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst,
             '-c', 'copy', base])
        # 3) Textos por cima, com entrada e saída suaves.
        entradas, filtros, ultimo = ['-i', base], [], '[0:v]'
        for k, (_, _, _, a, dur_txt) in enumerate(e['textos']):
            t0 = ancora(fala, a, audio) if a else 0.6
            dur_txt = min(dur_txt, d_cena - t0 - 0.1)
            entradas += ['-loop', '1', '-t', f'{dur_txt:.3f}', '-i', os.path.join(tmp, f'{sid}_{k}.png')]
            filtros.append(f'[{k+1}:v]format=rgba,fade=t=in:st=0:d=0.3:alpha=1,'
                           f'fade=t=out:st={dur_txt-0.35:.3f}:d=0.35:alpha=1,setpts=PTS+{t0:.3f}/TB[o{k}]')
            filtros.append(f'{ultimo}[o{k}]overlay=0:0:eof_action=pass[v{k}]')
            ultimo = f'[v{k}]'
        out = os.path.join(destino, f'{sid}.mp4')
        # Mesmo número de quadros do resto da montagem (round), senão a voz desliza cena a cena.
        filtros.append(f'{ultimo}fps=30,tpad=stop_mode=clone:stop_duration=2[fim]')
        cmd = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *entradas,
               '-filter_complex', ';'.join(filtros), '-map', '[fim]', '-frames:v', str(round(d_cena * 30)),
               '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out]
        run(cmd)
        print(sid, f'{montar.dur(out):.2f}s', f'{len(partes)} tomadas')


if __name__ == '__main__':
    main()
