/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useEffect, useMemo, useState } from "react";

/**
 * The empty stretch of the navbar between the brand mark and the nav links,
 * used as a small patch of sky. Every cycle a scatter of meteors falls, and
 * once they have passed the stars twinkle in turn.
 *
 * The meteors are redrawn at the start of every cycle, so no two showers are
 * alike; the stars keep their fixed places. Every element's animation runs
 * exactly once and the elements are keyed by cycle: remounting is what starts
 * them again, which keeps the CSS free of any dependency on when the cycle
 * began.
 */

const CYCLE_MS = 20000;

const METEOR_COUNT = 8;

/** Latest a meteor may start, in seconds. The last streak must finish before
 *  the stars begin. */
const METEOR_WINDOW = 4;

/** Horizontal band the shower starts in, as a percentage of the gap. It sits
 *  left of centre because every streak drifts right as it falls. */
const METEOR_BAND: [number, number] = [5, 56];

/** The stars are fixed: evenly spaced, lighting up in order once the shower
 *  has passed. Only the meteors are redrawn each cycle. */
const STARS = [
  { left: "17%", top: "8px", size: 9, delay: "6s" },
  { left: "28%", top: "22px", size: 6, delay: "6.3s" },
  { left: "38%", top: "5px", size: 11, delay: "6.15s" },
  { left: "47%", top: "19px", size: 7, delay: "6.55s" },
  { left: "56%", top: "10px", size: 8, delay: "6.4s" },
  { left: "65%", top: "23px", size: 5, delay: "6.7s" },
  { left: "74%", top: "12px", size: 8, delay: "6.85s" },
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Fisher-Yates, used to decouple an element's place in the sky from its place
 *  in the running order. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Four-pointed sparkle: straight tips pulled in by concave curves. */
const SPARKLE =
  "M12 0 Q13.2 10.8 24 12 Q13.2 13.2 12 24 Q10.8 13.2 0 12 Q10.8 10.8 12 0 Z";

/** One slot per element in both space and time, jittered inside the slot, so
 *  neighbours never land on top of each other; the two orderings are shuffled
 *  independently. */
function layout(count: number, [start, end]: [number, number]) {
  const slot = (end - start) / count;
  const order = shuffle([...Array(count).keys()]);
  return Array.from({ length: count }, (_, i) => ({
    left: `${(start + (i + rand(0.2, 0.8)) * slot).toFixed(1)}%`,
    turn: order[i],
  }));
}

export default function NavSky() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const meteors = useMemo(
    () =>
      layout(METEOR_COUNT, METEOR_BAND).map(({ left, turn }) => ({
        left,
        top: `${-rand(8, 16).toFixed(1)}px`,
        delay: `${(
          (turn + rand(0.15, 0.85)) *
          (METEOR_WINDOW / METEOR_COUNT)
        ).toFixed(2)}s`,
        scale: rand(0.4, 0.72),
        // travel keeps the sprite's own 2:1 slope, so only speed varies
        travel: `${Math.round(rand(44, 74))}px`,
      })),
    [cycle]
  );

  return (
    <div
      className="hidden sm:block relative flex-1 h-9 mx-6 overflow-hidden text-brand-primary"
      aria-hidden="true"
    >
      {meteors.map(({ left, top, delay, scale, travel }, i) => (
        <svg
          key={`${cycle}-m${i}`}
          className="nav-sky-meteor absolute"
          style={
            {
              left,
              top,
              animationDelay: delay,
              "--nav-sky-travel": travel,
            } as React.CSSProperties
          }
          width={40 * scale}
          height={20 * scale}
          viewBox="0 0 40 20"
          fill="none"
        >
          <defs>
            {/* the tail fades out behind the head rather than ending abruptly */}
            <linearGradient id={`nav-meteor-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
              <stop offset="55%" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
            </linearGradient>
          </defs>
          <line
            x1="1"
            y1="0.5"
            x2="36"
            y2="18"
            stroke={`url(#nav-meteor-${i})`}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="36.6" cy="18.3" r="1.6" fill="currentColor" />
        </svg>
      ))}

      {STARS.map(({ left, top, size, delay }, i) => (
        <svg
          key={`${cycle}-s${i}`}
          className="nav-sky-star absolute"
          style={{ left, top, animationDelay: delay }}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d={SPARKLE} />
        </svg>
      ))}
    </div>
  );
}
