import { useEffect, useRef, useState } from 'react'
import { Skull, ChevronLeft, ChevronRight } from './icons'
import {
  DIFFICULTIES, difficultyOf, progressOf, money, formatDate, dueLabel, newItem
} from '../store'

export default function JobScreen ({ t, lang, contract, crews, onPatch, onDelete, onBack, onAddCrew }) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { setDraft('') }, [contract.id])

  const prog = progressOf(contract)
  const diff = difficultyOf(contract.difficulty)
  const due = dueLabel(contract, t)
  const pct = Math.round(prog.ratio * 100)
  const ready = contract.status === 'done'
  const crewIndex = Math.max(0, crews.indexOf(contract.crew))

  const addItem = () => {
    const title = draft.trim()
    if (!title) return
    onPatch({ items: [...contract.items, newItem(title)] })
    setDraft('')
    inputRef.current?.focus()
  }

  const patchItem = (id, patch) => {
    onPatch({ items: contract.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  }

  const removeItem = (id) => {
    onPatch({ items: contract.items.filter((i) => i.id !== id) })
  }

  const cycleCrew = (dir) => {
    if (!crews.length) return
    onPatch({ crew: crews[(crewIndex + dir + crews.length) % crews.length] })
  }

  return (
    <div className={`jobscreen ${ready ? 'is-ready' : ''}`}>
      <div className="job-bg" />
      <div className="job-bg-word">WANTED</div>
      <div className="scanlines" />
      <div className="vignette" />

      <header className="job-head">
        <div className="job-title-wrap">
          <span className="job-title-tag">BAIN:</span>
          <input
            className="job-title-input"
            value={contract.title}
            onChange={(e) => onPatch({ title: e.target.value })}
            spellCheck="false"
          />
        </div>

        <div className="job-risk">
          {contract.pro && <span className="job-pro">{t('job.pro')}</span>}
          <span className="job-risk-label">{t('job.risk')}</span>
          <span className="skulls">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                className={`skull-btn ${contract.difficulty >= d.id ? 'is-on' : ''}`}
                style={{ '--sk': diff.color }}
                title={d.name}
                onClick={() => onPatch({ difficulty: d.id })}
              >
                <Skull />
              </button>
            ))}
          </span>
          <span className="job-diff-name" style={{ color: diff.color }}>{diff.name}</span>
        </div>
      </header>

      <div className="job-overview">{t('job.overview')}</div>

      <main className="job-body">
        <section className="todo">
          <div className="todo-head">
            <h2>{t('job.checklist')}</h2>
            <span className="todo-count">{prog.done} / {prog.total}</span>
          </div>

          <div className="todo-bar">
            <div className="todo-bar-fill" style={{ width: `${pct}%` }} />
            <span className="todo-bar-pct">{pct}%</span>
          </div>

          <div className="todo-add">
            <input
              ref={inputRef}
              value={draft}
              placeholder={t('job.addItem')}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addItem() }}
            />
            <button className="ghost-btn" onClick={addItem}>{t('job.add')}</button>
          </div>

          <ul className="todo-list">
            {contract.items.length === 0 && <li className="todo-empty">{t('job.empty')}</li>}
            {contract.items.map((item) => (
              <li key={item.id} className={`todo-item ${item.done ? 'is-done' : ''}`}>
                <button
                  className="todo-check"
                  onClick={() => patchItem(item.id, { done: !item.done })}
                  aria-label={item.title}
                >{item.done ? '✔' : ''}</button>
                <input
                  className="todo-text"
                  value={item.title}
                  onChange={(e) => patchItem(item.id, { title: e.target.value })}
                />
                <button className="todo-del" onClick={() => removeItem(item.id)}>×</button>
              </li>
            ))}
          </ul>
        </section>

        <aside className="job-side">
          <div className="progress-ring">
            <div className="ring-bar" style={{ '--p': `${pct}%` }} />
            <span>{pct}%</span>
          </div>

          <label className="field">
            <span>{t('job.dueDate')}</span>
            <input
              type="date"
              value={contract.dueDate || ''}
              onChange={(e) => onPatch({ dueDate: e.target.value })}
            />
          </label>

          {due
            ? <div className={`due-note ${due.late ? 'is-late' : ''}`}>{due.text}</div>
            : contract.dueDate
              ? <div className="due-note">{formatDate(contract.dueDate, lang)}</div>
              : null}

          <div className="side-pair">
            <label className="field">
              <span>{t('job.status')}</span>
              <select value={contract.status} onChange={(e) => onPatch({ status: e.target.value })}>
                <option value="available">{t('status.available')}</option>
                <option value="active">{t('status.active')}</option>
                <option value="done">{t('status.done')}</option>
              </select>
            </label>

            <label className="field">
              <span>{t('job.payout')}</span>
              <input
                type="number" min="0"
                value={contract.payout}
                onChange={(e) => onPatch({ payout: Number(e.target.value) || 0 })}
              />
            </label>
          </div>

          <label className="field">
            <span>{t('job.tags')}</span>
            <input
              value={contract.tags.join(', ')}
              onChange={(e) => onPatch({
                tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
              })}
            />
          </label>

          <label className="field field-check">
            <input
              type="checkbox"
              checked={contract.pro}
              onChange={(e) => onPatch({ pro: e.target.checked })}
            />
            <span>{t('job.proToggle')}</span>
          </label>

          <label className="field">
            <span>{t('job.notes')}</span>
            <textarea
              className="notes"
              value={contract.plan}
              placeholder={t('job.notesPlaceholder')}
              onChange={(e) => onPatch({ plan: e.target.value })}
            />
          </label>

          <CrewField
            t={t}
            crew={contract.crew}
            onCycle={cycleCrew}
            onAdd={onAddCrew}
          />

          <button className="danger-btn" onClick={onDelete}>{t('job.delete')}</button>
        </aside>
      </main>

      <footer className="job-foot">
        <div className="foot-hud">
          <span className="hud-stat"><span className="hud-ico">$</span>{money(contract.payout)}</span>
          <span className="hud-stat"><span className="hud-ico">▤</span>{prog.done}/{prog.total}</span>
        </div>

        <button
          className={`ready-btn ${ready ? 'is-ready' : ''}`}
          onClick={() => onPatch({ status: ready ? 'active' : 'done' })}
        >
          {ready ? t('job.undo') : t('job.ready')} <i className="ready-box">{ready ? '✔' : ''}</i>
        </button>
      </footer>

      <button className="back-btn" onClick={onBack}>{t('job.back')}</button>
    </div>
  )
}

function CrewField ({ t, crew, onCycle, onAdd }) {
  const [value, setValue] = useState('')
  const submit = () => {
    const v = value.trim().toLowerCase()
    if (!v) return
    onAdd(v)
    setValue('')
  }
  return (
    <div className="field">
      <span>{t('job.crew')}</span>
      <div className="crew-select">
        <button onClick={() => onCycle(-1)}><ChevronLeft /></button>
        <span className="crew-name">{crew}</span>
        <button onClick={() => onCycle(1)}><ChevronRight /></button>
      </div>
      <div className="coord-row">
        <input
          value={value}
          placeholder={t('job.newCrew')}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
        />
        <button className="ghost-btn" onClick={submit}>+</button>
      </div>
    </div>
  )
}
