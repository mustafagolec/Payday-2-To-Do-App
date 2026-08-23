import { useMemo } from 'react'
import { WORLD_W, WORLD_H } from '../store'

/** Sabit tohumlu PRNG: harita her acilista birebir ayni cizilsin. */
function mulberry32 (seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Dunya 2560x1440; her iki olcuyu de tam bolen kare hucre.
const CELL = 160          // ana izgara: 16 x 9 kare
const SUB = CELL / 4      // ara izgara: 40px

const DISTRICTS = [
  { name: 'GEORGETOWN', x: 320, y: 400 },
  { name: 'WEST END', x: 880, y: 640 },
  { name: 'FOGGY BOTTOM', x: 800, y: 1040 },
  { name: 'SHAW', x: 1840, y: 400 },
  { name: 'DOWNTOWN', x: 1920, y: 1040 },
  { name: 'NORTH BAY', x: 1360, y: 160 }
]

function buildCity () {
  const rnd = mulberry32(20131113)

  const cols = WORLD_W / CELL
  const rows = WORLD_H / CELL

  // Her kare hucrenin icine, ara izgaraya hizali birkac yapi blogu koy.
  // Izgara duzeni bozulmasin diye bloklar hep SUB katlarinda.
  const blocks = []
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const ox = cx * CELL
      const oy = cy * CELL
      const count = 3 + Math.floor(rnd() * 4)
      for (let k = 0; k < count; k++) {
        const w = (1 + Math.floor(rnd() * 2)) * SUB
        const h = (1 + Math.floor(rnd() * 2)) * SUB
        const gx = Math.floor(rnd() * (CELL / SUB - w / SUB + 1))
        const gy = Math.floor(rnd() * (CELL / SUB - h / SUB + 1))
        blocks.push({
          x: ox + gx * SUB + 3,
          y: oy + gy * SUB + 3,
          w: w - 6,
          h: h - 6,
          o: 0.04 + rnd() * 0.1
        })
      }
    }
  }

  return { cols, rows, blocks }
}

export default function CityMap () {
  const city = useMemo(buildCity, [])

  return (
    <svg
      className="city-map"
      width={WORLD_W}
      height={WORLD_H}
      viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="cm-glow" cx="50%" cy="45%" r="72%">
          <stop offset="0%" stopColor="#0d2437" stopOpacity="1" />
          <stop offset="55%" stopColor="#071523" stopOpacity="1" />
          <stop offset="100%" stopColor="#030a11" stopOpacity="1" />
        </radialGradient>

        <pattern id="cm-sub" width={SUB} height={SUB} patternUnits="userSpaceOnUse">
          <path
            d={`M ${SUB} 0 L 0 0 0 ${SUB}`}
            fill="none" stroke="#4aa8d8" strokeWidth="0.5" strokeOpacity="0.1"
          />
        </pattern>

        <pattern id="cm-main" width={CELL} height={CELL} patternUnits="userSpaceOnUse">
          <path
            d={`M ${CELL} 0 L 0 0 0 ${CELL}`}
            fill="none" stroke="#5cbde8" strokeWidth="1.4" strokeOpacity="0.32"
          />
        </pattern>
      </defs>

      <rect width={WORLD_W} height={WORLD_H} fill="url(#cm-glow)" />
      <rect width={WORLD_W} height={WORLD_H} fill="url(#cm-sub)" />

      <g className="cm-blocks">
        {city.blocks.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#8fd8ff" opacity={b.o} />
        ))}
      </g>

      <rect width={WORLD_W} height={WORLD_H} fill="url(#cm-main)" />

      <g className="cm-districts">
        {DISTRICTS.map((d) => (
          <text key={d.name} x={d.x} y={d.y} textAnchor="middle">{d.name}</text>
        ))}
      </g>

      {/* Dunya siniri: kenara gelindigi belli olsun */}
      <rect
        x="1" y="1"
        width={WORLD_W - 2} height={WORLD_H - 2}
        fill="none" stroke="#5fc4f0" strokeOpacity="0.35" strokeWidth="2"
      />
    </svg>
  )
}
