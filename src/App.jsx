import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CrimeNet from './components/CrimeNet'
import JobScreen from './components/JobScreen'
import SettingsScreen from './components/SettingsScreen'
import TitleBar from './components/TitleBar'
import { makeT } from './i18n'
import {
  loadState, persistState, defaultState, normalize,
  newContract, WORLD_W, WORLD_H, uid
} from './store'

const EMPTY_FILTERS = { query: '', status: 'all', crew: 'all', minDiff: 0, proOnly: false }

export default function App () {
  const [state, setState] = useState(null)
  const [savePath, setSavePath] = useState('')
  const [openId, setOpenId] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [panels, setPanels] = useState({ legend: false, filters: false })
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState('idle')

  const saveTimer = useRef(null)
  const dirty = useRef(false)

  const lang = state?.settings?.lang || 'tr'
  const t = useMemo(() => makeT(lang), [lang])

  useEffect(() => {
    loadState().then(({ state: s, path, fresh }) => {
      setState(s)
      setSavePath(path)
      if (fresh) flashKey(s.settings.lang, 'toast.freshSave')
    })
  }, [])

  const flashKey = (langId, key, vars) => {
    const msg = makeT(langId)(key, vars)
    setToast({ id: uid(), msg })
    window.setTimeout(() => setToast((cur) => (cur && cur.msg === msg ? null : cur)), 2600)
  }
  const flash = (key, vars) => flashKey(lang, key, vars)

  // Her degisiklikten 400ms sonra diske yaz; hizli yazarken her tusa kaydetmeyelim.
  useEffect(() => {
    if (!state || !dirty.current) return
    setSaving('pending')
    clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(async () => {
      const res = await persistState(state)
      setSaving(res?.ok === false ? 'error' : 'saved')
      if (res?.path) setSavePath(res.path)
      window.setTimeout(() => setSaving((s) => (s === 'saved' ? 'idle' : s)), 1200)
    }, 400)
    return () => clearTimeout(saveTimer.current)
  }, [state])

  const update = useCallback((fn) => {
    dirty.current = true
    setState((s) => (s ? fn(s) : s))
  }, [])

  const patchSettings = useCallback((patch) => {
    update((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [update])

  const patchContract = useCallback((id, patch) => {
    update((s) => ({
      ...s,
      contracts: s.contracts.map((c) => {
        if (c.id !== id) return c
        const next = { ...c, ...patch, updatedAt: Date.now() }
        if (patch.status && patch.status !== c.status) {
          next.completedAt = patch.status === 'done' ? Date.now() : null
        }
        return next
      })
    }))
  }, [update])

  const moveContract = useCallback((id, x, y) => {
    update((s) => ({
      ...s,
      contracts: s.contracts.map((c) => (c.id === id ? { ...c, x, y } : c))
    }))
  }, [update])

  const createContract = useCallback((x, y) => {
    const c = newContract({
      x: x ?? Math.round(WORLD_W / 2 + (Math.random() - 0.5) * 700),
      y: y ?? Math.round(WORLD_H / 2 + (Math.random() - 0.5) * 500),
      crew: filters.crew !== 'all' ? filters.crew : (state?.crews[0] || 'bain')
    })
    update((s) => ({ ...s, contracts: [...s.contracts, c] }))
    setOpenId(c.id)
  }, [filters.crew, state, update])

  const deleteContract = useCallback((id) => {
    const c = state?.contracts.find((x) => x.id === id)
    if (!c) return
    if (!window.confirm(t('confirm.delete', { title: c.title }))) return
    update((s) => ({ ...s, contracts: s.contracts.filter((x) => x.id !== id) }))
    setOpenId((cur) => (cur === id ? null : cur))
    flash('toast.deleted')
  }, [state, update, t])

  const quickAction = useCallback((action, id) => {
    const c = state?.contracts.find((x) => x.id === id)
    if (!c) return
    if (action === 'status') {
      const next = c.status === 'done' ? 'available' : c.status === 'active' ? 'done' : 'active'
      patchContract(id, { status: next })
    } else if (action === 'pro') {
      patchContract(id, { pro: !c.pro })
    } else if (action === 'duplicate') {
      const copy = {
        ...structuredClone(c),
        id: uid(),
        title: `${c.title} (2)`,
        x: Math.min(WORLD_W - 60, c.x + 70),
        y: Math.min(WORLD_H - 60, c.y + 60),
        status: 'available',
        completedAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: c.items.map((i) => ({ ...i, id: uid(), done: false }))
      }
      update((s) => ({ ...s, contracts: [...s.contracts, copy] }))
      flash('toast.duplicated')
    } else if (action === 'delete') {
      deleteContract(id)
    }
  }, [state, patchContract, update, deleteContract])

  const addCrew = useCallback((name) => {
    update((s) => (s.crews.includes(name) ? s : { ...s, crews: [...s.crews, name] }))
  }, [update])

  const togglePanel = useCallback((key) => {
    setPanels((p) => ({ legend: false, filters: false, [key]: !p[key] }))
  }, [])

  const exportData = async () => {
    if (!window.pd2?.isDesktop) {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'crimenet.json'
      a.click()
      URL.revokeObjectURL(a.href)
      return
    }
    const res = await window.pd2.exportData(state)
    if (res.ok) flash('toast.exported', { path: res.path })
  }

  const importData = async () => {
    if (!window.pd2?.isDesktop) return
    const res = await window.pd2.importData()
    if (!res.ok) {
      if (res.error) flash('toast.readError', { error: res.error })
      return
    }
    const norm = normalize(res.data)
    if (!norm) return flash('toast.invalidFile')
    if (!window.confirm(t('confirm.import'))) return
    dirty.current = true
    setState(norm)
    setOpenId(null)
    flash('toast.imported')
  }

  const resetData = () => {
    if (!window.confirm(t('confirm.reset'))) return
    dirty.current = true
    setState({ ...defaultState(), settings: state.settings })
    setOpenId(null)
    flash('toast.reset')
  }

  const openContract = state?.contracts.find((c) => c.id === openId) || null

  const visible = useMemo(() => {
    if (!state) return []
    const q = filters.query.trim().toLowerCase()
    return state.contracts.filter((c) => {
      if (filters.status !== 'all' && c.status !== filters.status) return false
      if (filters.crew !== 'all' && c.crew !== filters.crew) return false
      if (filters.minDiff && c.difficulty < filters.minDiff) return false
      if (filters.proOnly && !c.pro) return false
      if (q) {
        const hay = [c.title, c.crew, c.plan, ...c.tags, ...c.items.map((i) => i.title)]
          .join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [state, filters])

  // Kisayollar: bir metin alanindayken devre disi.
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false)
        else if (openId) setOpenId(null)
        else setPanels({ legend: false, filters: false })
        document.activeElement?.blur?.()
        return
      }
      if (typing || e.ctrlKey || e.altKey || e.metaKey) return
      if (openId || showSettings) return
      const k = e.key.toLowerCase()
      if (k === 'n') { e.preventDefault(); createContract() }
      else if (k === 'f') { e.preventDefault(); togglePanel('filters') }
      else if (k === 'l') { e.preventDefault(); togglePanel('legend') }
      else if (k === '/') {
        e.preventDefault()
        document.querySelector('.search-input')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, showSettings, createContract, togglePanel])

  if (!state) {
    return (
      <div className="boot">
        <div className="boot-text">CRIME.NET</div>
      </div>
    )
  }

  return (
    <div className="app">
      <TitleBar
        t={t}
        saving={saving}
        savePath={savePath}
        onExport={exportData}
        onImport={importData}
        onReset={resetData}
        onReveal={() => window.pd2?.revealData()}
        onSettings={() => setShowSettings(true)}
      />

      <div className="screen">
        {showSettings
          ? (
            <SettingsScreen
              t={t}
              settings={state.settings}
              savePath={savePath}
              onPatch={patchSettings}
              onClose={() => setShowSettings(false)}
            />
            )
          : openContract
            ? (
              <JobScreen
                t={t}
                lang={lang}
                contract={openContract}
                crews={state.crews}
                onPatch={(patch) => patchContract(openContract.id, patch)}
                onDelete={() => deleteContract(openContract.id)}
                onBack={() => setOpenId(null)}
                onAddCrew={addCrew}
              />
              )
            : (
              <CrimeNet
                t={t}
                lang={lang}
                ripple={state.settings.ripple}
                contracts={visible}
                allContracts={state.contracts}
                crews={state.crews}
                filters={filters}
                setFilters={setFilters}
                onOpen={setOpenId}
                onMoveContract={moveContract}
                onQuickAction={quickAction}
                onCreateAt={createContract}
                panels={panels}
                togglePanel={togglePanel}
              />
              )}
      </div>

      {toast && <div className="toast" key={toast.id}>{toast.msg}</div>}
    </div>
  )
}
