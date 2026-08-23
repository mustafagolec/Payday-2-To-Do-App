export const WORLD_W = 2560
export const WORLD_H = 1440

export const SCHEMA_VERSION = 2
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
    title: 'YENI SOZLESME',
    crew: 'bain',
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

export function defaultSettings () {
  return { lang: 'tr', ripple: true }
}

/** Kaydedilmis dosya eski/eksik alanlar icerse bile calisir hale getirir. */
export function normalize (raw) {
  if (!raw || typeof raw !== 'object') return null
  const contracts = Array.isArray(raw.contracts) ? raw.contracts : []
  const settings = { ...defaultSettings(), ...(raw.settings || {}) }

  return {
    version: SCHEMA_VERSION,
    settings: {
      lang: settings.lang === 'en' ? 'en' : 'tr',
      ripple: settings.ripple !== false
    },
    crews: Array.isArray(raw.crews) && raw.crews.length ? raw.crews : defaultCrews(),
    contracts: contracts.map((c) => {
      const base = newContract()
      return {
        ...base,
        ...c,
        id: c.id || uid(),
        x: clamp(Number(c.x) || 0, 40, WORLD_W - 40),
        y: clamp(Number(c.y) || 0, 40, WORLD_H - 40),
        difficulty: clamp(Number(c.difficulty) || 1, 1, 6),
        status: STATUSES.includes(c.status) ? c.status : 'available',
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

function defaultCrews () {
  return ['bain', 'is', 'ev', 'ogrenim', 'kisisel']
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

export function defaultState () {
  const mk = (patch) => newContract(patch)
  return {
    version: SCHEMA_VERSION,
    settings: defaultSettings(),
    crews: defaultCrews(),
    contracts: [
      mk({
        title: 'PROJE SUNUMU',
        crew: 'is',
        x: 620, y: 430,
        difficulty: 4,
        pro: true,
        status: 'active',
        payout: 45000,
        dueDate: inDays(2),
        plan: 'Cuma gunku sunum icin slaytlar ve demo hazir olmali.\nBain: "Kimse panige kapilmasin, plana sadik kalin."',
        items: [
          { id: uid(), title: 'Slaytlari hazirla', done: true },
          { id: uid(), title: 'Demo videosu cek', done: false },
          { id: uid(), title: 'Prova yap', done: false }
        ]
      }),
      mk({
        title: 'SPOR SALONU',
        crew: 'kisisel',
        x: 1520, y: 760,
        difficulty: 2,
        status: 'available',
        payout: 8000,
        dueDate: inDays(9),
        plan: 'Haftada 3 gun. Kacamak yok.',
        items: [
          { id: uid(), title: 'Pazartesi antrenmani', done: false },
          { id: uid(), title: 'Carsamba antrenmani', done: false },
          { id: uid(), title: 'Cuma antrenmani', done: false }
        ]
      }),
      mk({
        title: 'FATURA ODEMELERI',
        crew: 'ev',
        x: 2020, y: 380,
        difficulty: 3,
        status: 'available',
        payout: 12500,
        dueDate: inDays(5),
        plan: 'Ayin 15ine kadar tamami.',
        items: [
          { id: uid(), title: 'Elektrik', done: false },
          { id: uid(), title: 'Internet', done: true },
          { id: uid(), title: 'Su', done: false }
        ]
      }),
      mk({
        title: 'REACT DERSLERI',
        crew: 'ogrenim',
        x: 980, y: 1010,
        difficulty: 3,
        status: 'active',
        payout: 20000,
        plan: 'Hooks ve context konularini bitir.',
        items: [
          { id: uid(), title: 'useReducer bolumu', done: true },
          { id: uid(), title: 'Context bolumu', done: false }
        ]
      }),
      mk({
        title: 'ARSIV TEMIZLIGI',
        crew: 'ev',
        x: 1780, y: 1120,
        difficulty: 1,
        status: 'done',
        payout: 3000,
        completedAt: Date.now() - 86400000,
        plan: 'Eski dosyalari at.',
        items: [{ id: uid(), title: 'Kutulari ayikla', done: true }]
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
