#!/usr/bin/env python3
"""Monta o vídeo do REA (5:00, 1920x1080, 30 fps).

Uso:
  python3 montar.py --pw <dir do playwright-core>            # prévia com espaços de avatar
  python3 montar.py --pw <dir> --musica trilha.mp3            # com trilha (ducking sob a voz)

Se existirem avatar/A1.mp4, avatar/A2.mp4 e avatar/A3.mp4 (clipes do HeyGen), eles entram no
lugar dos espaços reservados. O áudio do avatar vem do clipe; sem clipe, vem de audio/A*.mp3.
As cenas já renderizadas em build/ são reaproveitadas (apague build/ para renderizar de novo).
"""
import argparse, json, os, subprocess

AQUI = os.path.dirname(os.path.abspath(__file__))
FPS = 30

def dur(p):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                   '-of', 'csv=p=0', p], text=True)
    return float(out.strip())

def run(cmd):
    subprocess.run(cmd, check=True)

# (id, tipo, duração do trecho em s) — tipo: av = avatar, cena = gráfico, demo = gravação real
def linha_do_tempo():
    a = lambda n: dur(os.path.join(AQUI, 'audio', f'{n}.mp3'))
    g1 = ['S01', 'S02', 'S03', 'S04', 'S05']
    folga1 = (135 - sum(a(s) for s in g1)) / len(g1)
    resto = ['S07', 'S08', 'S09', 'S10']
    folga2 = (120 - 32 - sum(a(s) for s in resto)) / len(resto)
    t = [('A1', 'av', 15.0)]
    t += [(s, 'cena', a(s) + folga1) for s in g1]
    t += [('A2', 'av', 10.0), ('S06', 'demo', 32.0)]
    t += [(s, 'cena', a(s) + folga2) for s in resto]
    t += [('A3', 'av', 20.0)]
    return t

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pw', required=True, help='diretório do pacote playwright-core')
    ap.add_argument('--musica', help='trilha instrumental (opcional)')
    ap.add_argument('--saida', default=os.path.join(AQUI, 'REA_youtube_final.mp4'))
    args = ap.parse_args()

    build = os.path.join(AQUI, 'build'); os.makedirs(build, exist_ok=True)
    html = os.path.join(AQUI, 'cenas', 'cenas.html')
    render = os.path.join(AQUI, 'cenas', 'render.mjs')
    tl = linha_do_tempo()

    clipes, inicio, marcas = [], 0.0, []
    for sid, tipo, d in tl:
        out = os.path.join(build, f'{sid}.mp4')
        heygen = os.path.join(AQUI, 'avatar', f'{sid}.mp4')
        if tipo == 'av' and os.path.exists(heygen):
            # Clipe do HeyGen: ajusta para 1920x1080/30fps e para a duração exata do trecho.
            out = os.path.join(build, f'{sid}_heygen.mp4')
            run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', heygen, '-vf',
                 f'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps={FPS},tpad=stop_mode=clone:stop_duration=30',
                 '-t', f'{d:.3f}', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out])
        elif not os.path.exists(out):
            if tipo == 'demo':
                demo = os.path.join(AQUI, '..', 'rea-video', 'demo', 'demo-rea.mp4')
                run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', demo, '-vf',
                     f'fps={FPS},tpad=stop_mode=clone:stop_duration=30', '-t', f'{d:.3f}', '-an',
                     '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out])
            else:
                extra = None
                if tipo == 'av':
                    fim = inicio + d
                    extra = json.dumps({'avlabel': f'Avatar {sid}',
                                        'avtime': f'{int(inicio//60)}:{int(inicio%60):02d} – {int(fim//60)}:{int(fim%60):02d}'})
                cena = 'AV' if tipo == 'av' else sid
                cmd = ['node', render, args.pw, html, 'video', out, cena, f'{d:.3f}', str(FPS)]
                if extra: cmd.append(extra)
                run(cmd)
        clipes.append(out); marcas.append((sid, tipo, inicio, d)); inicio += d

    # Vídeo: concatena os trechos.
    lista = os.path.join(build, 'lista.txt')
    with open(lista, 'w') as f:
        for c in clipes: f.write(f"file '{c}'\n")
    video = os.path.join(build, 'video.mp4')
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista,
         '-c', 'copy', video])

    # Voz: cada trecho entra no início do seu bloco (+0,8 s nas cenas, 0 nos avatares).
    entradas, filtros, rotulos = [], [], []
    for i, (sid, tipo, ini, d) in enumerate(marcas):
        heygen = os.path.join(AQUI, 'avatar', f'{sid}.mp4')
        src = heygen if (tipo == 'av' and os.path.exists(heygen)) else os.path.join(AQUI, 'audio', f'{sid}.mp3')
        entradas += ['-i', src]
        atraso = int(round((ini + (0 if tipo == 'av' else 0.8)) * 1000))
        filtros.append(f'[{i}:a]aresample=48000,atrim=0:{d:.3f},adelay={atraso}|{atraso}[v{i}]')
        rotulos.append(f'[v{i}]')
    total = sum(m[3] for m in marcas)
    filtros.append(''.join(rotulos) + f'amix=inputs={len(rotulos)}:normalize=0,'
                   'highpass=f=60,acompressor=threshold=-18dB:ratio=3:attack=10:release=150,'
                   f'apad,atrim=0:{total:.3f}[voz]')
    saida_audio = '[voz]'
    if args.musica:
        n = len(marcas)
        entradas += ['-stream_loop', '-1', '-i', args.musica]
        filtros.append(f'[voz]asplit=2[voz1][sc]')
        filtros.append(f'[{n}:a]aresample=48000,volume=0.32,atrim=0:{total:.3f},afade=t=out:st={total-3:.3f}:d=3[mus]')
        filtros.append('[mus][sc]sidechaincompress=threshold=0.03:ratio=10:attack=20:release=400[musd]')
        filtros.append('[voz1][musd]amix=inputs=2:normalize=0[mix]')
        saida_audio = '[mix]'
    filtros.append(f'{saida_audio}loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[final]')
    audio = os.path.join(build, 'audio.m4a')
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *entradas, '-filter_complex', ';'.join(filtros),
         '-map', '[final]', '-c:a', 'aac', '-b:a', '320k', audio])

    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', video, '-i', audio, '-map', '0:v', '-map', '1:a',
         '-c:v', 'copy', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', args.saida])

    with open(os.path.join(AQUI, 'linha_do_tempo.json'), 'w', encoding='utf-8') as f:
        json.dump([{'id': s, 'tipo': t, 'inicio': round(i, 2), 'duracao': round(d, 2)} for s, t, i, d in marcas],
                  f, ensure_ascii=False, indent=1)
    print(args.saida, f'{dur(args.saida):.2f}s')

if __name__ == '__main__':
    main()
