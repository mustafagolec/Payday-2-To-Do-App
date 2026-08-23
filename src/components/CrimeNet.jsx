import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import CityMap from './CityMap'
import ContractMarker from './ContractMarker'
import { WORLD_W, WORLD_H, clamp, money, progressOf, DIFFICULTIES, uid } from '../store'

const MAX_ZOOM = 1.6
const FRICTION = 0.92          // her 16ms'de hizin korunan orani
const MIN_VELOCITY = 0.02      // px/ms — bunun altinda kayma durur
const RIPPLE_EVERY = 2600      // ms

/** Kamerayi dunya sinirlarina hapseder; zoom asla haritayi ekrandan kucuk yapmaz. */
function clampCam (cam, vw, vh) {
  const minZoom = Math.max(vw / WORLD_W, vh / WORLD_H)
  const zoom = clamp(cam.zoom, minZoom, MAX_ZOOM)
  const w = WORLD_W * zoom
  const h = WORLD_H * zoom
  return {
    zoom,
    x: clamp(cam.x, vw - w, 0),
    y: clamp(cam.y, vh - h, 0)
  }
}

export default function CrimeNet ({
  t,
  lang,
  ripple,
  contracts,
  allContracts,
  crews,
  filters,
  setFilters,
  onOpen,
  onMoveContract,
  onQuickAction,
  onCreateAt,
  panels,
  togglePanel
}) {
  const viewportRef = useRef(null)
  const [size, setSize] = useState({ w: 1280, h: 720 })
  const [cam, setCam] = useState({ x: -320, y: -180, zoom: 1 })
  const camRef = useRef(cam)
  camRef.current = cam

  const [panning, setPanning] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [menu, setMenu] = useState(null)
  const [ripples, setRipples] = useState([])

  // Isaretciye cift tiklandiginda ilk tik job ekranini acar ve isaretci DOM'dan kalkar;
  // ardindan gelen dblclick bos zemine dusup yanlislikla yeni sozlesme yaratmasin.
  const markerTouchedAt = useRef(0)
  const glideRef = useRef(0)

  const stopGlide = () => {
    cancelAnimationFrame(glideRef.current)
    glideRef.current = 0
  }

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: width, h: height })
      setCam((c) => clampCam(c, width, height))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => stopGlide, [])

  // Wheel'i native olarak bagliyoruz: React'in pasif dinleyicisi preventDefault'a izin vermiyor.
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      stopGlide()
      const rect = el.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      setCam((c) => {
        const target = clamp(c.zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.01, MAX_ZOOM)
        const k = target / c.zoom
        return clampCam(
          { zoom: target, x: px - (px - c.x) * k, y: py - (py - c.y) * k },
          rect.width,
          rect.height
        )
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Sozlesmelerden ara ara su damlasi dalgasi yay.
  useEffect(() => {
    if (!ripple || contracts.length === 0) return
    const id = window.setInterval(() => {
      const pick = contracts[Math.floor(Math.random() * contracts.length)]
      if (!pick) return
      const drop = { key: uid(), x: pick.x, y: pick.y, pro: pick.pro }
      setRipples((list) => [...list, drop])
      window.setTimeout(() => {
        setRipples((list) => list.filter((r) => r.key !== drop.key))
      }, 2000)
    }, RIPPLE_EVERY)
    return () => window.clearInterval(id)
  }, [ripple, contracts])

  const startPan = useCallback((e) => {
    if (e.button !== 0 && e.button !== 1) return
    const el = viewportRef.current
    setMenu(null)
    setPanning(true)
    stopGlide()
    el.setPointerCapture(e.pointerId)

    const start = { sx: e.clientX, sy: e.clientY, cx: camRef.current.x, cy: camRef.current.y }
    // Son birkac hareketten hiz turetiyoruz; tek kare gurultulu olabiliyor.
    let last = { x: e.clientX, y: e.clientY, t: performance.now() }
    let vx = 0
    let vy = 0

    const move = (ev) => {
      const now = performance.now()
      const dt = Math.max(1, now - last.t)
      const nvx = (ev.clientX - last.x) / dt
      const nvy = (ev.clientY - last.y) / dt
      vx = vx * 0.7 + nvx * 0.3
      vy = vy * 0.7 + nvy * 0.3
      last = { x: ev.clientX, y: ev.clientY, t: now }

      const rect = el.getBoundingClientRect()
      setCam((c) =>
        clampCam(
          { zoom: c.zoom, x: start.cx + (ev.clientX - start.sx), y: start.cy + (ev.clientY - start.sy) },
          rect.width,
          rect.height
        )
      )
    }

    const end = () => {
      setPanning(false)
      el.releasePointerCapture?.(e.pointerId)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', end)
      el.removeEventListener('pointercancel', end)

      // Parmagi/fareyi birakinca hemen durma: kalan hizla sürtünerek kay.
      if (performance.now() - last.t > 90) return
      if (Math.hypot(vx, vy) < MIN_VELOCITY) return

      let prev = performance.now()
      const step = (now) => {
        const dt = Math.min(48, now - prev)
        prev = now
        const decay = FRICTION ** (dt / 16)
        vx *= decay
        vy *= decay

        const rect = el.getBoundingClientRect()
        let stopped = false
        setCam((c) => {
          const next = clampCam(
            { zoom: c.zoom, x: c.x + vx * dt, y: c.y + vy * dt },
            rect.width,
            rect.height
          )
          // Kenara yaslandiysa o eksende kaymayi kes.
          if (next.x === c.x && Math.abs(vx) > 0) vx = 0
          if (next.y === c.y && Math.abs(vy) > 0) vy = 0
          if (Math.hypot(vx, vy) < MIN_VELOCITY) stopped = true
          return next
        })

        glideRef.current = stopped ? 0 : requestAnimationFrame(step)
      }
      glideRef.current = requestAnimationFrame(step)
    }

    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointercancel', end)
  }, [])

  const handleMarkerDown = useCallback((e, contract) => {
    if (e.button === 2) return
    e.stopPropagation()
    setMenu(null)
    stopGlide()
    markerTouchedAt.current = Date.now()
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const start = { sx: e.clientX, sy: e.clientY, cx: contract.x, cy: contract.y }
    let moved = false

    const move = (ev) => {
      if (!moved && Math.hypot(ev.clientX - start.sx, ev.clientY - start.sy) > 4) {
        moved = true
        setDragId(contract.id)
      }
      if (!moved) return
      const z = camRef.current.zoom
      onMoveContract(
        contract.id,
        Math.round(clamp(start.cx + (ev.clientX - start.sx) / z, 40, WORLD_W - 40)),
        Math.round(clamp(start.cy + (ev.clientY - start.sy) / z, 40, WORLD_H - 40))
      )
    }
    const end = () => {
      el.releasePointerCapture?.(e.pointerId)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', end)
      el.removeEventListener('pointercancel', end)
      setDragId(null)
      markerTouchedAt.current = Date.now()
      if (!moved) onOpen(contract.id)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', end)
    el.addEventListener('pointercancel', end)
  }, [onMoveContract, onOpen])

  const openMenu = useCallback((e, contract) => {
    e.preventDefault()
    e.stopPropagation()
    setMenu({ x: e.clientX, y: e.clientY, contract })
  }, [])

  const handleDoubleClick = (e) => {
    if (e.target.closest('.marker')) return
    if (Date.now() - markerTouchedAt.current < 600) return
    const rect = viewportRef.current.getBoundingClientRect()
    const wx = (e.clientX - rect.left - cam.x) / cam.zoom
    const wy = (e.clientY - rect.top - cam.y) / cam.zoom
    onCreateAt(Math.round(clamp(wx, 40, WORLD_W - 40)), Math.round(clamp(wy, 40, WORLD_H - 40)))
  }

  const focusOn = (contract) => {
    stopGlide()
    const rect = viewportRef.current.getBoundingClientRect()
    setCam((c) =>
      clampCam(
        { zoom: c.zoom, x: rect.width / 2 - contract.x * c.zoom, y: rect.height / 2 - contract.y * c.zoom },
        rect.width,
        rect.height
      )
    )
  }

  const jumpFromMinimap = (e) => {
    stopGlide()
    const rect = e.currentTarget.getBoundingClientRect()
    const wx = ((e.clientX - rect.left) / rect.width) * WORLD_W
    const wy = ((e.clientY - rect.top) / rect.height) * WORLD_H
    const vp = viewportRef.current.getBoundingClientRect()
    setCam((c) =>
      clampCam(
        { zoom: c.zoom, x: vp.width / 2 - wx * c.zoom, y: vp.height / 2 - wy * c.zoom },
        vp.width,
        vp.height
      )
    )
  }

  const stats = allContracts.reduce(
    (acc, c) => {
      acc.total += 1
      acc[c.status] += 1
      if (c.status !== 'done') acc.payout += Number(c.payout) || 0
      const p = progressOf(c)
      acc.items += p.total
      acc.itemsDone += p.done
      return acc
    },
    { total: 0, available: 0, active: 0, done: 0, payout: 0, items: 0, itemsDone: 0 }
  )

  const filtersActive =
    Boolean(filters.query) ||
    filters.status !== 'all' ||
    filters.crew !== 'all' ||
    filters.minDiff > 0 ||
    filters.proOnly

  const viewW = (size.w / cam.zoom / WORLD_W) * 100
  const viewH = (size.h / cam.zoom / WORLD_H) * 100
  const viewX = (-cam.x / cam.zoom / WORLD_W) * 100
  const viewY = (-cam.y / cam.zoom / WORLD_H) * 100

  return (
    <div className="crimenet">
      <div
        ref={viewportRef}
        className={`viewport ${panning ? 'is-panning' : ''}`}
        onPointerDown={startPan}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className="world"
          style={{
            width: WORLD_W,
            height: WORLD_H,
            transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.zoom})`
          }}
        >
          <CityMap />

          <div className="markers">
            {ripples.map((r) => (
              <span
                key={r.key}
                className={`ripple ${r.pro ? 'is-pro' : ''}`}
                style={{ left: r.x, top: r.y }}
              />
            ))}
            {contracts.map((c) => (
              <ContractMarker
                key={c.id}
                t={t}
                contract={c}
                dragging={dragId === c.id}
                onPointerDown={handleMarkerDown}
                onContextMenu={openMenu}
              />
            ))}
          </div>
        </div>

        <div className="scanlines" />
        <div className="vignette" />
      </div>

      {/* --- HUD --- */}
      <div className="hud hud-topleft">
        <div className="hud-line">
          {t('map.contracts')}: <b>{stats.total}</b> &nbsp;/&nbsp; {t('map.active')}: <b>{stats.active}</b>
        </div>
        <button className="hud-key" onClick={() => togglePanel('legend')}>
          {panels.legend ? t('map.legendHide') : t('map.legendShow')}
        </button>
      </div>

      <div className="hud hud-topright">
        <button className="hud-key" onClick={() => togglePanel('filters')}>
          {t('map.filters')}{filtersActive ? ' •' : ''}
        </button>
      </div>

      <div className="hud hud-bottomleft">
        <div className="hud-stat"><span className="hud-ico">$</span>{money(stats.payout)}</div>
        <div className="hud-stat"><span className="hud-ico">✔</span>{stats.done}</div>
        <div className="hud-stat"><span className="hud-ico">▤</span>{stats.itemsDone}/{stats.items}</div>
      </div>

      <div className="hud hud-bottomright">
        <button className="big-key" onClick={() => onCreateAt()}>{t('map.newContract')}</button>
      </div>

      {/* --- Arama --- */}
      <div className="hud hud-search">
        <input
          className="search-input"
          value={filters.query}
          placeholder={t('map.search')}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        />
        {filters.query && (
          <button className="search-clear" onClick={() => setFilters({ ...filters, query: '' })}>×</button>
        )}
      </div>

      {/* --- Minimap --- */}
      <div className="minimap" onPointerDown={jumpFromMinimap}>
        <div className="minimap-title">CRIME.NET</div>
        {allContracts.map((c) => (
          <i
            key={c.id}
            className={`mm-dot is-${c.status} ${c.pro ? 'is-pro' : ''}`}
            style={{ left: `${(c.x / WORLD_W) * 100}%`, top: `${(c.y / WORLD_H) * 100}%` }}
          />
        ))}
        <div
          className="mm-view"
          style={{
            left: `${clamp(viewX, 0, 100)}%`,
            top: `${clamp(viewY, 0, 100)}%`,
            width: `${clamp(viewW, 2, 100)}%`,
            height: `${clamp(viewH, 2, 100)}%`
          }}
        />
      </div>

      {/* --- Legend --- */}
      {panels.legend && (
        <div className="panel panel-legend">
          <h3>{t('legend.title')}</h3>
          <div className="legend-row"><i className="lg lg-available" /> {t('legend.available')}</div>
          <div className="legend-row"><i className="lg lg-active" /> {t('legend.active')}</div>
          <div className="legend-row"><i className="lg lg-done" /> {t('legend.done')}</div>
          <div className="legend-row"><i className="lg lg-pro" /> {t('legend.pro')}</div>
          <div className="legend-row"><i className="lg lg-late" /> {t('legend.late')}</div>
          <hr />
          <div className="legend-help">
            <b>{t('legend.key.drag')}</b> {t('legend.help.pan')}<br />
            <b>{t('legend.key.wheel')}</b> {t('legend.help.zoom')}<br />
            <b>{t('legend.key.click')}</b> {t('legend.help.open')}<br />
            <b>{t('legend.key.markerDrag')}</b> {t('legend.help.move')}<br />
            <b>{t('legend.key.dblclick')}</b> {t('legend.help.create')}<br />
            <b>{t('legend.key.rightclick')}</b> {t('legend.help.menu')}
          </div>
        </div>
      )}

      {/* --- Filtreler --- */}
      {panels.filters && (
        <div className="panel panel-filters">
          <h3>{t('filters.title')}</h3>

          <label className="fl-label">{t('filters.status')}</label>
          <div className="chip-row">
            {[
              ['all', t('filters.all')],
              ['available', t('status.availableShort')],
              ['active', t('status.activeShort')],
              ['done', t('status.doneShort')]
            ].map(([id, label]) => (
              <button
                key={id}
                className={`chip ${filters.status === id ? 'is-on' : ''}`}
                onClick={() => setFilters({ ...filters, status: id })}
              >{label}</button>
            ))}
          </div>

          <label className="fl-label">{t('filters.crew')}</label>
          <div className="chip-row">
            <button
              className={`chip ${filters.crew === 'all' ? 'is-on' : ''}`}
              onClick={() => setFilters({ ...filters, crew: 'all' })}
            >{t('filters.all')}</button>
            {crews.map((c) => (
              <button
                key={c}
                className={`chip ${filters.crew === c ? 'is-on' : ''}`}
                onClick={() => setFilters({ ...filters, crew: c })}
              >{c.toUpperCase()}</button>
            ))}
          </div>

          <label className="fl-label">{t('filters.minRisk')}</label>
          <div className="chip-row">
            {[0, ...DIFFICULTIES.map((d) => d.id)].map((id) => (
              <button
                key={id}
                className={`chip ${filters.minDiff === id ? 'is-on' : ''}`}
                onClick={() => setFilters({ ...filters, minDiff: id })}
              >{id === 0 ? t('filters.all') : id}</button>
            ))}
          </div>

          <label className="fl-toggle">
            <input
              type="checkbox"
              checked={filters.proOnly}
              onChange={(e) => setFilters({ ...filters, proOnly: e.target.checked })}
            />
            <span>{t('filters.proOnly')}</span>
          </label>

          <button
            className="ghost-btn"
            onClick={() => setFilters({ query: '', status: 'all', crew: 'all', minDiff: 0, proOnly: false })}
          >{t('filters.reset')}</button>

          <hr />
          <label className="fl-label">{t('filters.jump')}</label>
          <div className="jump-list">
            {allContracts.slice(0, 40).map((c) => (
              <button key={c.id} className="jump-item" onClick={() => focusOn(c)}>
                <i className={`lg lg-${c.status}`} />{c.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- Sag tik menusu --- */}
      {menu && (
        <>
          <div
            className="menu-scrim"
            onPointerDown={() => setMenu(null)}
            onContextMenu={(e) => { e.preventDefault(); setMenu(null) }}
          />
          <div className="ctx-menu" style={{ left: menu.x, top: menu.y }}>
            <div className="ctx-head">{menu.contract.title}</div>
            <button onClick={() => { onOpen(menu.contract.id); setMenu(null) }}>{t('ctx.open')}</button>
            <button onClick={() => { onQuickAction('status', menu.contract.id); setMenu(null) }}>
              {menu.contract.status === 'done'
                ? t('ctx.reopen')
                : menu.contract.status === 'active' ? t('ctx.complete') : t('ctx.start')}
            </button>
            <button onClick={() => { onQuickAction('pro', menu.contract.id); setMenu(null) }}>
              {menu.contract.pro ? t('ctx.proOff') : t('ctx.proOn')}
            </button>
            <button onClick={() => { onQuickAction('duplicate', menu.contract.id); setMenu(null) }}>
              {t('ctx.duplicate')}
            </button>
            <button className="is-danger" onClick={() => { onQuickAction('delete', menu.contract.id); setMenu(null) }}>
              {t('ctx.delete')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
