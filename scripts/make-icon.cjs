'use strict'

/**
 * build/icon.ico uretir (256x256, PNG gomulu ICO).
 * Dis bagimlilik yok: PNG'yi zlib ile elle kodluyoruz.
 */

const fs = require('node:fs')
const path = require('node:path')
const zlib = require('node:zlib')

const SIZE = 256

// --- CRC32 ---
const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32 (buf) {
  let c = -1
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk (type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePng (rgba, width, height) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// --- Cizim ---
const px = Buffer.alloc(SIZE * SIZE * 4)

const set = (x, y, [r, g, b, a]) => {
  const i = (y * SIZE + x) * 4
  const src = a / 255
  const dstA = px[i + 3] / 255
  const outA = src + dstA * (1 - src)
  if (outA === 0) return
  px[i] = Math.round((r * src + px[i] * dstA * (1 - src)) / outA)
  px[i + 1] = Math.round((g * src + px[i + 1] * dstA * (1 - src)) / outA)
  px[i + 2] = Math.round((b * src + px[i + 2] * dstA * (1 - src)) / outA)
  px[i + 3] = Math.round(outA * 255)
}

const inRoundRect = (x, y, r) => {
  const min = 8
  const max = SIZE - 8
  if (x < min || y < min || x > max || y > max) return false
  const cx = Math.min(Math.max(x, min + r), max - r)
  const cy = Math.min(Math.max(y, min + r), max - r)
  return Math.hypot(x - cx, y - cy) <= r
}

const BG = [8, 20, 32, 255]
const CYAN = [88, 200, 245, 255]
const RED = [224, 65, 58, 255]
const WHITE = [234, 246, 255, 255]

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    if (!inRoundRect(x, y, 34)) continue
    // Merkeze dogru hafif aydinlanan zemin
    const d = Math.hypot(x - 128, y - 118) / 180
    const k = Math.max(0, 1 - d)
    set(x, y, [BG[0] + k * 18, BG[1] + k * 30, BG[2] + k * 42, 255])
  }
}

// Isaretci govdesi: PD2 haritasindaki etiket + asagi sivri uc
const pin = { x0: 66, y0: 52, x1: 190, y1: 158 }
const tip = [[86, 158], [124, 158], [104, 200]]

const inTriangle = (px_, py_, [a, b, c]) => {
  const sign = (p, q, r) => (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1])
  const p = [px_, py_]
  const d1 = sign(p, a, b)
  const d2 = sign(p, b, c)
  const d3 = sign(p, c, a)
  const neg = d1 < 0 || d2 < 0 || d3 < 0
  const pos = d1 > 0 || d2 > 0 || d3 > 0
  return !(neg && pos)
}

const T = 8 // cerceve kalinligi
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const inBox = x >= pin.x0 && x <= pin.x1 && y >= pin.y0 && y <= pin.y1
    const inTip = inTriangle(x, y, tip)
    if (!inBox && !inTip) continue

    const onBoxEdge = inBox && (
      x < pin.x0 + T || x > pin.x1 - T || y < pin.y0 + T || y > pin.y1 - T
    )
    const onTipEdge = inTip && !inTriangle(x, y, [[94, 158], [116, 158], [104, 186]])

    if (onBoxEdge || onTipEdge) set(x, y, WHITE)
    else set(x, y, [6, 15, 24, 255])
  }
}

// Ekip ikonu: uc silüet
for (const cx of [92, 128, 164]) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const head = Math.hypot(x - cx, y - 84) <= 13
      const bodyTop = 102
      const bodyBottom = 138
      const halfW = 6 + ((y - bodyTop) / (bodyBottom - bodyTop)) * 11
      const body = y >= bodyTop && y <= bodyBottom && Math.abs(x - cx) <= halfW
      if (head || body) set(x, y, CYAN)
    }
  }
}

// Sol ust kosede kirmizi "PRO" serit vurgusu
for (let y = 20; y < 30; y++) {
  for (let x = 30; x < 226; x++) {
    if (inRoundRect(x, y, 34)) set(x, y, RED)
  }
}

// --- ICO paketle ---
const png = encodePng(px, SIZE, SIZE)
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2) // tip: ikon
header.writeUInt16LE(1, 4) // resim sayisi

const dir = Buffer.alloc(16)
dir[0] = 0 // genislik 256 -> 0
dir[1] = 0 // yukseklik 256 -> 0
dir[2] = 0
dir[3] = 0
dir.writeUInt16LE(1, 4)  // renk duzlemi
dir.writeUInt16LE(32, 6) // bit derinligi
dir.writeUInt32LE(png.length, 8)
dir.writeUInt32LE(22, 12)

const out = path.join(__dirname, '..', 'build', 'icon.ico')
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, Buffer.concat([header, dir, png]))
console.log(`icon.ico yazildi (${png.length} bayt PNG) -> ${out}`)
