'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

// First six seconds of the hands clip from github.com/vikod3/handstouch: apart
// at 0 s, fingertips touching from 5.9 s on. Re-encoded with a keyframe every
// three frames so seeking from the scroll position stays cheap (the original
// had two keyframes in twelve seconds).
const HANDS_VIDEO = '/media/hands/hands-scrub.mp4';
const HANDS_POSTER = '/media/hands/hands-poster.webp';
const CONTACT_AT = 0.97;

// Fixed layer behind the home. A human hand and a robot hand reach for each
// other as the visitor scrolls: the distance between the end of the hero and
// the end of the page is mapped onto the clip, so they touch exactly at the
// bottom. The progress is published as --hands-progress on <html> (the glow
// and the closing line read it) and data-contact flips when they meet. With
// prefers-reduced-motion the hands rest already in contact.
export default function HandsJourney() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [contact, setContact] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cancelled = false;
    let dispose: (() => void) | undefined;
    let frame = 0;
    let primed = false;
    let target = 0; // seconds into the clip that the scroll position asks for
    let pendingSeek = false;

    // Seeks coalesce: while one is in flight the latest target waits for `seeked`.
    const seek = () => {
      if (!(video.duration > 0)) return;
      if (video.seeking) {
        pendingSeek = true;
        return;
      }
      const time = Math.min(target, video.duration - 1 / 48);
      if (Math.abs(video.currentTime - time) < 1 / 60) return;
      video.currentTime = time;
    };
    const onSeeked = () => {
      if (!pendingSeek) return;
      pendingSeek = false;
      seek();
    };

    const progressFor = () => {
      if (reducedMotion.matches) return 1;
      const hero = document.getElementById('top');
      const start = hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
      const end = root.scrollHeight - window.innerHeight;
      const span = Math.max(1, end - start);
      return Math.min(1, Math.max(0, (window.scrollY - start) / span));
    };
    const update = () => {
      frame = 0;
      const progress = progressFor();
      root.style.setProperty('--hands-progress', progress.toFixed(4));
      setContact(progress >= CONTACT_AT);
      target = progress * (Number.isFinite(video.duration) ? video.duration : 0);
      seek();
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    // iOS only decodes once the element has played. A muted inline clip may
    // play without a gesture, so one play/pause primes it before the seeks.
    const prime = () => {
      if (primed) return;
      primed = true;
      const played = video.play();
      if (played) {
        played
          .then(() => {
            video.pause();
            update();
          })
          .catch(update);
      } else {
        update();
      }
    };

    import('./hand-renderer')
      .then(({ createHandRenderer }) => {
        if (cancelled) return;
        try {
          dispose = createHandRenderer(canvas, video, setReady).dispose;
        } catch {
          setReady(false);
        }
      })
      .catch(() => setReady(false));

    video.addEventListener('loadedmetadata', prime);
    video.addEventListener('seeked', onSeeked);
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) prime();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', schedule);
    update();

    return () => {
      cancelled = true;
      dispose?.();
      video.removeEventListener('loadedmetadata', prime);
      video.removeEventListener('seeked', onSeeked);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', schedule);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      root.style.removeProperty('--hands-progress');
    };
  }, []);

  return (
    <div className="hands-journey" aria-hidden="true" data-ready={ready} data-contact={contact}>
      <div className="hands-journey-frame">
        <div className="hands-journey-glow" />
        <Image
          className="hands-journey-poster"
          src={HANDS_POSTER}
          width={1440}
          height={480}
          sizes="100vw"
          alt=""
          draggable={false}
        />
        <canvas ref={canvasRef} className="hands-journey-canvas" />
        <div className="hands-journey-spark" />
      </div>
      <video
        ref={videoRef}
        src={HANDS_VIDEO}
        className="hands-journey-source"
        preload="auto"
        muted
        playsInline
        tabIndex={-1}
        disablePictureInPicture
      />
    </div>
  );
}
