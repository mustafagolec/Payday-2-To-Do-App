import { memo } from 'react'
import { CrewIcon, SoloIcon, DoneIcon } from './icons'
import { progressOf, difficultyOf, dueLabel } from '../store'

/**
 * Haritadaki tek bir sozlesme isaretcisi.
 * Surukleme ile bastirma ayrimini parent yapiyor (onPointerDown -> onOpen/onMove).
 */
function ContractMarker ({ t, contract, dragging, onPointerDown, onContextMenu }) {
  const prog = progressOf(contract)
  const diff = difficultyOf(contract.difficulty)
  const due = dueLabel(contract, t)
  const dots = Math.max(prog.total, 5)

  const classes = [
    'marker',
    `is-${contract.status}`,
    contract.pro ? 'is-pro' : '',
    dragging ? 'is-dragging' : '',
    due?.late ? 'is-overdue' : ''
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      style={{ left: contract.x, top: contract.y, '--diff-color': diff.color }}
      onPointerDown={(e) => onPointerDown(e, contract)}
      onContextMenu={(e) => onContextMenu(e, contract)}
      title={`${contract.title} — ${diff.name}`}
    >
      <div className="marker-crew">
        {contract.pro ? <span className="marker-pro">{t('job.pro')}</span> : contract.crew}
      </div>

      <div className="marker-row">
        <span className="marker-pin">
          {contract.status === 'done'
            ? <DoneIcon />
            : contract.status === 'active'
              ? <CrewIcon count={4} />
              : <SoloIcon />}
        </span>
        <span className="marker-title">{contract.title}</span>
      </div>

      <div className="marker-dots">
        {Array.from({ length: dots }).map((_, i) => (
          <i
            key={i}
            className={i < prog.done ? 'dot is-on' : i < prog.total ? 'dot is-pending' : 'dot'}
          />
        ))}
        {prog.total > 0 && (
          <span className="marker-pct">{Math.round(prog.ratio * 100)}%</span>
        )}
      </div>

      {due && (
        <div className={`marker-due ${due.late ? 'is-late' : ''}`}>{due.text}</div>
      )}
    </div>
  )
}

export default memo(ContractMarker)
