'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const HANDS_VIDEO = '/media/hands/hands-rgba.mp4';
const HANDS_POSTER = '/media/hands/hands-poster.webp';

// The hands video packs decontaminated RGB in its top half and a linear alpha
// matte in its bottom half. hand-renderer.ts composites both through a WebGL
// shader onto a transparent canvas; until the first frame lands (or if WebGL is
// unavailable) the transparent poster stands in.
export default function HandsOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    import('./hand-renderer')
      .then(({ createHandRenderer }) => {
        if (cancelled) return;
        try {
          dispose = createHandRenderer(canvas, video, setReady);
        } catch {
          setReady(false);
        }
      })
      .catch(() => setReady(false));

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div className="ht-hands-overlay" aria-hidden="true">
      <div className="ht-hands-frame" data-ready={ready}>
        <Image
          className="ht-hands-poster"
          src={HANDS_POSTER}
          width={1440}
          height={480}
          sizes="100vw"
          alt=""
          priority
          draggable={false}
        />
        <canvas ref={canvasRef} className="ht-hands-canvas" />
      </div>
      <video
        ref={videoRef}
        src={HANDS_VIDEO}
        className="ht-hands-source"
        preload="auto"
        muted
        playsInline
        loop
        tabIndex={-1}
        disablePictureInPicture
      />
    </div>
  );
}
