export function CrewIcon ({ count = 4 }) {
  const people = Array.from({ length: count })
  return (
    <svg viewBox="0 0 34 22" className="ic-crew" aria-hidden="true">
      {people.map((_, i) => {
        const x = 4.5 + i * 7
        return (
          <g key={i} fill="currentColor">
            <circle cx={x} cy="6.5" r="2.9" />
            <path d={`M ${x - 4.4} 20 c 0 -5.2 2 -8.4 4.4 -8.4 s 4.4 3.2 4.4 8.4 z`} />
          </g>
        )
      })}
    </svg>
  )
}

export function SoloIcon () {
  return (
    <svg viewBox="0 0 34 22" className="ic-crew" aria-hidden="true">
      <circle cx="17" cy="11" r="7.4" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  )
}

export function DoneIcon () {
  return (
    <svg viewBox="0 0 34 22" className="ic-crew" aria-hidden="true">
      <path
        d="M 9 11.5 L 15 17 L 26 5"
        fill="none" stroke="currentColor" strokeWidth="3.2"
        strokeLinecap="square" strokeLinejoin="miter"
      />
    </svg>
  )
}

export function Skull ({ filled = true }) {
  return (
    <svg viewBox="0 0 24 24" className={`ic-skull ${filled ? 'is-filled' : ''}`} aria-hidden="true">
      <path
        d="M12 2c-4.4 0-7.6 3-7.6 7.1 0 2.4 1 4 2.3 5.2.5.5.8 1 .8 1.7V18c0 .9.7 1.6 1.6 1.6h1V22h1.8v-2.4h2.2V22h1.8v-2.4h1c.9 0 1.6-.7 1.6-1.6v-2c0-.7.3-1.2.8-1.7 1.3-1.2 2.3-2.8 2.3-5.2C19.6 5 16.4 2 12 2z"
        fill="currentColor"
      />
      <circle cx="8.6" cy="9.6" r="2.2" fill="#0a141d" />
      <circle cx="15.4" cy="9.6" r="2.2" fill="#0a141d" />
      <path d="M10.9 13.6h2.2l-1.1 2.2z" fill="#0a141d" />
    </svg>
  )
}

export function ChevronLeft () {
  return (
    <svg viewBox="0 0 24 24" className="ic-chev" aria-hidden="true">
      <path d="M15 4 L 7 12 L 15 20" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  )
}

export function ChevronRight () {
  return (
    <svg viewBox="0 0 24 24" className="ic-chev" aria-hidden="true">
      <path d="M9 4 L 17 12 L 9 20" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  )
}
