#!/usr/bin/env python3
"""Gera legendas.srt a partir do roteiro e da linha do tempo (tempo proporcional por frase)."""
import os, re
import montar

FALAS = {}
for linha in open(os.path.join(montar.AQUI, 'roteiro.md'), encoding='utf-8'):
    m = re.match(r'\| \**([AS]\d+)\b[^|]*\|[^|]*\|[^|]*\| (.+) \|\s*$', linha)
    if m: FALAS[m.group(1)] = m.group(2)

# A fala foi escrita para a voz (pronúncia); a legenda usa a grafia normal.
GRAFIA = [('Réa', 'REA'), ('eme cê pê', 'MCP'), ('ponto NET', '.NET'), ('cento e oitenta mil', '180 mil'),
          ('três mil, duzentos e cinco', '3.205'), ('sessenta e três', '63'),
          ('arroba solocodando', '@solocodando'), ('arroba thiagaoai', '@thiagaoai')]
for k in FALAS:
    for a, b in GRAFIA: FALAS[k] = FALAS[k].replace(a, b)

def ts(t):
    ms = int(round(t * 1000)); s, ms = divmod(ms, 1000); m, s = divmod(s, 60); h, m = divmod(m, 60)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'

def pedacos(texto, max_chars=84):
    frases = re.split(r'(?<=[.!?:])\s+', texto)
    out = []
    for f in frases:
        while len(f) > max_chars:
            corte = f.rfind(',', 0, max_chars)
            corte = corte + 1 if corte > 20 else f.rfind(' ', 0, max_chars)
            out.append(f[:corte].strip()); f = f[corte:].strip()
        if f: out.append(f)
    return out

srt, n, inicio = [], 1, 0.0
for sid, tipo, d in montar.linha_do_tempo():
    fala_ini = inicio + (0 if tipo == 'av' else 0.8)
    fala_dur = montar.dur(os.path.join(montar.AQUI, 'audio', f'{sid}.mp3'))
    ps = pedacos(FALAS[sid]); total = sum(len(p) for p in ps); t = fala_ini
    for p in ps:
        dt = fala_dur * len(p) / total
        srt.append(f'{n}\n{ts(t)} --> {ts(t + dt)}\n{p}\n'); n += 1; t += dt
    inicio += d
open(os.path.join(montar.AQUI, 'legendas.srt'), 'w', encoding='utf-8').write('\n'.join(srt))
print(n - 1, 'legendas')
