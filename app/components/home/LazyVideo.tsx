'use client';

import { type RefObject, useEffect, useRef } from 'react';

type LazyVideoProps = {
  src: string;
  poster: string;
  className?: string;
  // 'loop' autoplays while on screen; 'scrub' maps the scroll position of
  // `scrubRef` (a section) onto the clip's timeline.
  mode?: 'loop' | 'scrub';
  scrubRef?: RefObject<HTMLElement | null>;
};

// Below-the-fold clips are only fetched when they are about to enter the
// viewport, and they stop playing (or stop listening to scroll) when they leave.
export default function LazyVideo({ src, poster, className, mode = 'loop', scrubRef }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let loaded = false;
    let frame = 0;
    const load = () => {
      if (loaded) return;
      loaded = true;
      video.preload = 'auto';
      video.src = src;
      video.load();
    };

    const scrub = () => {
      frame = 0;
      const section = scrubRef?.current;
      if (!section || !(video.duration > 0) || video.seeking) return;
      const rect = section.getBoundingClientRect();
      const raw = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      video.currentTime = video.duration * Math.max(0, Math.min(1, raw));
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(scrub);
    };

    const target = mode === 'scrub' && scrubRef?.current ? scrubRef.current : video;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          load();
          if (mode === 'loop') {
            void video.play().catch(() => undefined);
          } else {
            video.pause();
            window.addEventListener('scroll', onScroll, { passive: true });
            video.addEventListener('loadedmetadata', scrub, { once: true });
            scrub();
          }
        } else if (mode === 'loop') {
          video.pause();
        } else {
          window.removeEventListener('scroll', onScroll);
        }
      },
      { rootMargin: '320px 0px' },
    );
    observer.observe(target);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
      video.pause();
    };
  }, [src, mode, scrubRef]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      preload="none"
      muted
      playsInline
      loop={mode === 'loop'}
      className={className}
    />
  );
}
