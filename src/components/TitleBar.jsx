import { useEffect, useState } from 'react'

export default function TitleBar ({ t, saving, savePath, onExport, onImport, onReset, onReveal, onSettings }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const desktop = Boolean(window.pd2?.isDesktop)

  useEffect(() => {
    if (!desktop) return
    return window.pd2.window.onState((s) => setMaximized(s.maximized))
  }, [desktop])

  const saveLabel = {
    idle: '',
    pending: t('tb.saving'),
    saved: t('tb.saved'),
    error: t('tb.saveError')
  }[saving]

  return (
    <div className="titlebar">
      <div className="tb-left">
        <span className="tb-brand">CRIME<span className="tb-dot">.</span>NET</span>
        <span className="tb-sub">{t('tb.sub')}</span>
      </div>

      <div className="tb-drag" />

      <div className="tb-right">
        {saveLabel && <span className={`tb-save is-${saving}`}>{saveLabel}</span>}

        <button className="tb-btn" onClick={onSettings}>{t('tb.settings')}</button>
        <button className="tb-btn" onClick={() => setMenuOpen((v) => !v)}>{t('tb.file')}</button>

        {desktop && (
          <div className="tb-wincontrols">
            <button className="tb-win" onClick={() => window.pd2.window.fullscreen()} title={t('tb.fullscreen')}>⛶</button>
            <button className="tb-win" onClick={() => window.pd2.window.minimize()} title={t('tb.minimize')}>─</button>
            <button className="tb-win" onClick={() => window.pd2.window.maximize()} title={maximized ? t('tb.restore') : t('tb.maximize')}>
              {maximized ? '❐' : '☐'}
            </button>
            <button className="tb-win is-close" onClick={() => window.pd2.window.close()} title={t('tb.close')}>✕</button>
          </div>
        )}
      </div>

      {menuOpen && (
        <>
          <div className="menu-scrim" onPointerDown={() => setMenuOpen(false)} />
          <div className="tb-menu">
            <div className="tb-menu-head">{t('tb.saveFile')}</div>
            <div className="tb-menu-path" title={savePath}>{savePath || '—'}</div>
            <button onClick={() => { onExport(); setMenuOpen(false) }}>{t('tb.export')}</button>
            {desktop && <button onClick={() => { onImport(); setMenuOpen(false) }}>{t('tb.import')}</button>}
            {desktop && <button onClick={() => { onReveal(); setMenuOpen(false) }}>{t('tb.reveal')}</button>}
            <button className="is-danger" onClick={() => { onReset(); setMenuOpen(false) }}>{t('tb.reset')}</button>
          </div>
        </>
      )}
    </div>
  )
}
