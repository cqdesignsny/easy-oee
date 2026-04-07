/**
 * Animated wireframe gauge for the hero. Mirrors the gauge symbol in the
 * Easy OEE logo. CSS keyframes drive the needle animation (see globals.css
 * `.gauge-needle` and `@keyframes gauge-rev`).
 *
 * SVG canvas: 200x200, centered at (100,100). The arc spans -120° to +120°
 * (240° total), which matches the needle keyframes.
 */

const RADIUS = 84;
const CENTER = 100;

// Tick angles in degrees (from -120 at left to +120 at right). 21 ticks total.
const TICK_COUNT = 21;
const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
  const t = i / (TICK_COUNT - 1);
  return -120 + t * 240;
});

function polar(angleDeg: number, r: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(a), y: CENTER + r * Math.sin(a) };
}

// Build the arc path from -120° to +120°
function arcPath(startDeg: number, endDeg: number, r: number) {
  const start = polar(startDeg, r);
  const end = polar(endDeg, r);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

export function HeroGauge() {
  return (
    <div className="hero-gauge-wrap" aria-hidden="true">
      <div className="hero-gauge gauge-glow">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#03BFB5" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#03BFB5" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#03BFB5" stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#03BFB5" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#03BFB5" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer ring (decorative) */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={94}
            fill="none"
            stroke="rgba(239,245,249,0.08)"
            strokeWidth="1"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={88}
            fill="none"
            stroke="rgba(239,245,249,0.14)"
            strokeWidth="1"
          />

          {/* Background arc track */}
          <path
            d={arcPath(-120, 120, RADIUS)}
            fill="none"
            stroke="rgba(3,191,181,0.18)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Foreground gradient arc */}
          <path
            d={arcPath(-120, 120, RADIUS)}
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {ticks.map((angle, i) => {
            const inner = polar(angle, RADIUS - 10);
            const outer = polar(angle, RADIUS - 2);
            // Major tick every 5
            const major = i % 5 === 0;
            // Last 5 ticks are the "max" zone (light up sequentially)
            const isMaxZone = i >= TICK_COUNT - 5;
            return (
              <line
                key={i}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={isMaxZone ? "#03BFB5" : "rgba(239,245,249,0.4)"}
                strokeWidth={major ? 2 : 1}
                className={isMaxZone ? "gauge-tick active" : "gauge-tick"}
                style={isMaxZone ? { animationDelay: `${(i - (TICK_COUNT - 5)) * 0.04}s` } : undefined}
              />
            );
          })}

          {/* Numeric labels at min, mid, max */}
          <text x="38" y="156" fill="rgba(239,245,249,0.4)" fontSize="9" fontFamily="var(--font-dm-mono)" textAnchor="middle">
            0
          </text>
          <text x="100" y="22" fill="rgba(239,245,249,0.55)" fontSize="9" fontFamily="var(--font-dm-mono)" textAnchor="middle">
            50
          </text>
          <text x="162" y="156" fill="#03BFB5" fontSize="9" fontFamily="var(--font-dm-mono)" textAnchor="middle">
            100
          </text>

          {/* Needle (animated) */}
          <g className="gauge-needle">
            <line
              x1={CENTER}
              y1={CENTER}
              x2={CENTER}
              y2={CENTER - (RADIUS - 8)}
              stroke="#03BFB5"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx={CENTER} cy={CENTER - (RADIUS - 8)} r="3" fill="#03BFB5" />
          </g>

          {/* Center hub */}
          <circle cx={CENTER} cy={CENTER} r={26} fill="url(#centerGlow)" />
          <circle cx={CENTER} cy={CENTER} r={9} fill="#003038" stroke="#03BFB5" strokeWidth="1.5" />
          <circle cx={CENTER} cy={CENTER} r={3} fill="#03BFB5" />

          {/* OEE label below center */}
          <text x="100" y="146" className="gauge-readout">OEE</text>
        </svg>
      </div>
    </div>
  );
}
