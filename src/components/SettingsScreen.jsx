import { LANGS } from '../i18n'

export default function SettingsScreen ({ t, settings, onPatch, onClose, savePath }) {
  return (
    <div className="settings">
      <div className="job-bg" />
      <div className="job-bg-word">SETUP</div>
      <div className="scanlines" />
      <div className="vignette" />

      <header className="job-head">
        <div className="job-title-wrap">
          <span className="job-title-tag">BAIN:</span>
          <span className="job-title-static">{t('settings.title')}</span>
        </div>
      </header>

      <main className="settings-body">
        <section className="set-row">
          <div className="set-label">{t('settings.language')}</div>
          <div className="chip-row">
            {LANGS.map((l) => (
              <button
                key={l.id}
                className={`chip is-big ${settings.lang === l.id ? 'is-on' : ''}`}
                onClick={() => onPatch({ lang: l.id, langPinned: true })}
              >{l.id.toUpperCase()} · {l.label}</button>
            ))}
          </div>
        </section>

        <section className="set-row">
          <div className="set-label">{t('settings.ripple')}</div>
          <div className="chip-row">
            <button
              className={`chip is-big ${settings.ripple ? 'is-on' : ''}`}
              onClick={() => onPatch({ ripple: true })}
            >{t('settings.on')}</button>
            <button
              className={`chip is-big ${!settings.ripple ? 'is-on' : ''}`}
              onClick={() => onPatch({ ripple: false })}
            >{t('settings.off')}</button>
          </div>
          <p className="set-help">{t('settings.rippleHelp')}</p>
          <div className={`ripple-preview ${settings.ripple ? 'is-on' : ''}`}>
            <span className="ripple-demo" />
            <i className="ripple-dot" />
          </div>
        </section>

        <section className="set-row">
          <div className="set-label">{t('settings.data')}</div>
          <p className="set-path">{savePath || '—'}</p>
        </section>
      </main>

      <button className="back-btn is-settings" onClick={onClose}>{t('settings.close')}</button>
    </div>
  )
}
