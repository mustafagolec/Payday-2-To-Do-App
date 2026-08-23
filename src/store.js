export const WORLD_W = 2560
export const WORLD_H = 1440

export const SCHEMA_VERSION = 3
const LS_KEY = 'crimenet-todo-state'

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

export const STATUSES = ['available', 'active', 'done']

/** Zorluk = oncelik. Payday'deki risk kafataslarinin karsiligi. */
export const DIFFICULTIES = [
  { id: 1, name: 'NORMAL', color: '#7fd4a0' },
  { id: 2, name: 'HARD', color: '#c9d97f' },
  { id: 3, name: 'VERY HARD', color: '#e8b34a' },
  { id: 4, name: 'OVERKILL', color: '#e2793a' },
  { id: 5, name: 'MAYHEM', color: '#d94a3d' },
  { id: 6, name: 'DEATH SENTENCE', color: '#b13cc9' }
]

export const difficultyOf = (n) =>
  DIFFICULTIES.find((d) => d.id === n) || DIFFICULTIES[0]

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

export function newItem (title = '') {
  return { id: uid(), title, done: false }
}

export function newContract (patch = {}) {
  const now = Date.now()
  return {
    id: uid(),
    title: 'NEW CONTRACT',
    crew: 'default',
    x: Math.round(WORLD_W / 2),
    y: Math.round(WORLD_H / 2),
    difficulty: 2,
    status: 'available',
    pro: false,
    payout: 0,
    plan: '',
    dueDate: '',
    tags: [],
    items: [],
    // DONE'a basmadan onceki durum; UNDO bunu geri yukler.
    undo: null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    ...patch
  }
}

export function progressOf (contract) {
  const items = contract.items || []
  const done = items.filter((i) => i.done).length
  return { done, total: items.length, ratio: items.length ? done / items.length : 0 }
}

/**
 * Isletim sisteminin dili. Electron'da Chromium locale'i Windows'un
 * kullanici dilinden gelir; tarayicida navigator.language yeterli.
 * Turkce disindaki her dil Ingilizceye duser.
 */
export function detectLang () {
  const raw = String(
    (typeof window !== 'undefined' && (window.pd2?.locale || window.navigator?.language)) || ''
  ).toLowerCase()
  return raw.startsWith('tr') ? 'tr' : 'en'
}

/** langPinned: kullanici ayarlardan dili elle sectiyse sistem dili artik ezmez. */
export function defaultSettings () {
  return { lang: detectLang(), langPinned: false, ripple: true }
}

/** Kaydedilmis dosya eski/eksik alanlar icerse bile calisir hale getirir. */
export function normalize (raw) {
  if (!raw || typeof raw !== 'object') return null
  const contracts = Array.isArray(raw.contracts) ? raw.contracts : []
  const settings = { ...defaultSettings(), ...(raw.settings || {}) }

  // Eski kayitlardaki hazir listeleri bir kez yeni adlarina cevir; kullanicinin
  // sonradan ekledigi listeler ayni isimde bile olsa v3 sonrasi el degmeden kalir.
  const legacy = (Number(raw.version) || 1) < 3
  const mapCrew = (name) => (legacy && LEGACY_CREWS[name]) || name

  const crews = Array.isArray(raw.crews) && raw.crews.length
    ? [...new Set(raw.crews.map(mapCrew))]
    : defaultCrews()

  return {
    version: SCHEMA_VERSION,
    settings: {
      lang: settings.langPinned && settings.lang === 'en' ? 'en'
        : settings.langPinned ? 'tr'
          : detectLang(),
      langPinned: settings.langPinned === true,
      ripple: settings.ripple !== false
    },
    crews,
    contracts: contracts.map((c) => {
      const base = newContract()
      return {
        ...base,
        ...c,
        id: c.id || uid(),
        crew: mapCrew(c.crew) || crews[0],
        x: clamp(Number(c.x) || 0, 40, WORLD_W - 40),
        y: clamp(Number(c.y) || 0, 40, WORLD_H - 40),
        difficulty: clamp(Number(c.difficulty) || 1, 1, 6),
        status: STATUSES.includes(c.status) ? c.status : 'available',
        undo: c.undo && typeof c.undo === 'object' ? c.undo : null,
        tags: Array.isArray(c.tags) ? c.tags : [],
        items: readItems(c),
        // v1'deki gun listesi artik yok
        days: undefined
      }
    })
  }
}

/** v1 kayitlarindaki `days[].assets` listesini duz madde listesine indirger. */
function readItems (contract) {
  if (Array.isArray(contract.items)) {
    return contract.items.map((i) => ({
      id: i.id || uid(),
      title: String(i.title ?? ''),
      done: Boolean(i.done)
    }))
  }
  if (Array.isArray(contract.days)) {
    return contract.days.flatMap((d) =>
      (Array.isArray(d.assets) ? d.assets : []).map((a) => ({
        id: a.id || uid(),
        title: String(a.title ?? ''),
        done: Boolean(a.done)
      }))
    )
  }
  return []
}

export function defaultCrews () {
  return ['default', 'study', 'work']
}

/** v2'ye kadar hazir gelen listeler. v3'te yerlerini default/study/work aliyor. */
const LEGACY_CREWS = {
  bain: 'default',
  ev: 'default',
  kisisel: 'default',
  is: 'work',
  ogrenim: 'study'
}

/**
 * Bugunden n gun sonrasi, <input type="date"> bicimiyle.
 * toISOString UTC'ye cevirdigi icin +03 saat diliminde gece yarisindan once
 * bir gun geri kayiyordu; yerel alanlardan kuruyoruz.
 */
function inDays (n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  const pad = (v) => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Ornek veri iki dilde de ayni okunsun diye metinler notr tutuldu. */
export function defaultState () {
  const mk = (patch) => newContract(patch)
  const items = (n, doneCount = 0) =>
    Array.from({ length: n }, (_, i) => ({
      id: uid(),
      title: `Item ${i + 1}`,
      done: i < doneCount
    }))

  return {
    version: SCHEMA_VERSION,
    settings: defaultSettings(),
    crews: defaultCrews(),
    contracts: [
      mk({
        title: 'TASK 1',
        crew: 'work',
        x: 620, y: 430,
        difficulty: 4,
        pro: true,
        status: 'active',
        payout: 45000,
        dueDate: inDays(2),
        items: items(3, 1)
      }),
      mk({
        title: 'TASK 2',
        crew: 'default',
        x: 1520, y: 760,
        difficulty: 2,
        status: 'available',
        payout: 8000,
        dueDate: inDays(9),
        items: items(3)
      }),
      mk({
        title: 'TASK 3',
        crew: 'default',
        x: 2020, y: 380,
        difficulty: 3,
        status: 'available',
        payout: 12500,
        dueDate: inDays(5),
        items: items(3, 1)
      }),
      mk({
        title: 'TASK 4',
        crew: 'study',
        x: 980, y: 1010,
        difficulty: 3,
        status: 'active',
        payout: 20000,
        items: items(2, 1)
      }),
      mk({
        title: 'TASK 5',
        crew: 'default',
        x: 1780, y: 1120,
        difficulty: 1,
        status: 'done',
        payout: 3000,
        completedAt: Date.now() - 86400000,
        items: items(1, 1)
      })
    ]
  }
}

export async function loadState () {
  if (window.pd2?.isDesktop) {
    // Okuma patlarsa uygulama acilis ekraninda asili kalmasin; bos kayitla acilsin.
    try {
      const res = await window.pd2.load()
      const norm = normalize(res?.data)
      return { state: norm || defaultState(), path: res?.path || '', fresh: !norm }
    } catch (err) {
      console.error('[crimenet] kayit okunamadi:', err)
      return { state: defaultState(), path: '', fresh: true }
    }
  }
  try {
    const norm = normalize(JSON.parse(localStorage.getItem(LS_KEY) || 'null'))
    return { state: norm || defaultState(), path: 'localStorage', fresh: !norm }
  } catch {
    return { state: defaultState(), path: 'localStorage', fresh: true }
  }
}

export async function persistState (state) {
  try {
    if (window.pd2?.isDesktop) return await window.pd2.save(state)
    localStorage.setItem(LS_KEY, JSON.stringify(state))
    return { ok: true, path: 'localStorage' }
  } catch (err) {
    console.error('[crimenet] kayit yazilamadi:', err)
    return { ok: false, error: String(err?.message || err) }
  }
}

export const money = (n) => (Number(n) || 0).toLocaleString('en-US')

export function formatDate (value, lang = 'tr') {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

/** Bitis tarihine kalan tam gun: 0 = bugun, negatif = gecikmis. */
export function daysLeft (dueDate) {
  if (!dueDate) return null
  const due = new Date(`${dueDate}T00:00:00`)
  if (Number.isNaN(due.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

/** Isaretci ve yan panelde gosterilecek kalan sure metni. */
export function dueLabel (contract, t) {
  const left = daysLeft(contract.dueDate)
  if (left === null) return null
  if (contract.status === 'done') return null
  if (left < 0) {
    const n = Math.abs(left)
    return { text: n === 1 ? t('due.lateOne') : t('due.late', { n }), late: true }
  }
  if (left === 0) return { text: t('due.today'), late: true }
  return {
    text: left === 1 ? t('due.leftOne') : t('due.left', { n: left }),
    late: left <= 2
  }
}
