'use client';

import type { PointerEvent, ReactNode } from 'react';
import { MotionConfig, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';

export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Card that tilts in 3D toward the pointer. Children marked with
// [transform:translateZ(..)] float above the card surface.
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 18 });

  function onMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div style={{ perspective: 900 }} className="h-full">
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

const LAYERS = 16;
const LAYER_GAP = 11;
const RADIUS = 92;

// A holiday ornament being 3D-printed layer by layer, spinning on the build plate.
export function PrintedOrnament({ accent }: { accent: string }) {
  const reduce = useReducedMotion();
  const layers = Array.from({ length: LAYERS }, (_, index) => {
    const t = (index + 0.5) / LAYERS;
    return Math.max(18, RADIUS * Math.sin(Math.PI * t));
  });
  const printSeconds = 0.14;

  return (
    <div className="relative mx-auto h-[340px] w-[300px] select-none" style={{ perspective: 1000 }} aria-hidden="true">
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className="absolute left-1/2 top-[250px] h-0 w-0"
          style={{ transformStyle: 'preserve-3d', rotateX: -16 }}
        >
          <motion.div
            style={{ transformStyle: 'preserve-3d' }}
            initial={{ rotateY: 0 }}
            animate={reduce ? { rotateY: 25 } : { rotateY: 360 }}
            transition={reduce ? { duration: 0 } : { duration: 14, repeat: Infinity, ease: 'linear' }}
          >
            {/* Build plate */}
            <div
              className="absolute rounded-2xl border border-white/20"
              style={{
                width: 250,
                height: 250,
                left: -125,
                top: -125,
                transform: 'rotateX(90deg) translateZ(-6px)',
                background:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 25px), repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 25px), rgba(0,0,0,0.35)',
              }}
            />

            {/* Printed layers */}
            {layers.map((radius, index) => (
              <div
                key={index}
                className="absolute"
                style={{
                  width: radius * 2,
                  height: radius * 2,
                  left: -radius,
                  top: -radius,
                  transform: `translateY(${-index * LAYER_GAP - 6}px) rotateX(90deg)`,
                }}
              >
                <motion.div
                  className="h-full w-full rounded-full"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.55), ${accent} 45%, rgba(0,0,0,0.35) 100%)`,
                    boxShadow: `0 0 0 2px rgba(255,255,255,0.18), 0 0 24px ${accent}55`,
                  }}
                  initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * printSeconds, duration: 0.35, ease: 'easeOut' }}
                />
              </div>
            ))}

            {/* Ornament cap and hanging loop */}
            <motion.div
              className="absolute"
              style={{ y: -LAYERS * LAYER_GAP - 14 }}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + LAYERS * printSeconds, duration: 0.4 }}
            >
              <div className="absolute rounded-md" style={{ width: 34, height: 16, left: -17, top: -8, background: '#d9d4c7', boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.2)' }} />
              <div className="absolute rounded-full border-[5px]" style={{ width: 30, height: 30, left: -15, top: -34, borderColor: '#d9d4c7' }} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Print nozzle: climbs with the layers, then parks */}
        <motion.div
          className="absolute left-1/2 top-0 -ml-[60px] w-[120px]"
          initial={reduce ? false : { y: 225 }}
          animate={{ y: 20 }}
          transition={{ delay: 0.3, duration: LAYERS * printSeconds + 0.3, ease: 'linear' }}
        >
          <motion.div
            className="mx-auto flex w-10 flex-col items-center"
            animate={reduce ? undefined : { x: [-34, 34, -34] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="h-7 w-10 rounded-md bg-zinc-300 shadow-lg" />
            <div className="h-0 w-0 border-x-[9px] border-t-[12px] border-x-transparent border-t-zinc-400" />
            <div className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 12px 4px ${accent}` }} />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
