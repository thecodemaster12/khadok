import { useEffect, useRef, useState } from 'react'
import map from './districts.json'
import foods, { BN_DISTRICT, BN_DIVISION } from './foods.js'
import PixelMan from './PixelMan.jsx'

const TOTAL = Object.values(foods).reduce((n, f) => n + f.length, 0)
const BADGES = [
  [0, ['Khudarto', 'ক্ষুধার্ত'], ['Still hungry. Start eating!', 'এখনো ক্ষুধার্ত। খাওয়া শুরু করুন!']],
  [10, ['Khadok', 'খাদক'], ['You know your way around a plate.', 'থালা চেনেন আপনি।']],
  [30, ['Khadok Pro', 'খাদক প্রো'], ['Districts fear your appetite.', 'জেলাগুলো আপনার খিদেকে ভয় পায়।']],
  [60, ['Khadok Pro Max', 'খাদক প্রো ম্যাক্স'], ['A walking food map of Bangladesh.', 'চলন্ত বাংলাদেশের খাবারের মানচিত্র।']],
  [90, ['Khadok Ultra Legend', 'খাদক আল্ট্রা লিজেন্ড'], ['You have eaten Bangladesh.', 'আপনি পুরো বাংলাদেশ খেয়ে ফেলেছেন।']],
]
const T = {
  en: {
    tagline: "How much of Bangladesh have you eaten? Pick a district, tick what you've tried.",
    search: 'Search district or food', pick: 'Pick a district on the map or from the list.', none: 'No match', all: 'Select all', clear: 'Clear all',
    badge: 'Your badge', foods: 'foods', districts: 'districts tasted', next: (b, p) => `Next: ${b} at ${p}%`,
    division: d => `${d} Division`, eaten: 'eaten', saved: 'Progress is saved in this browser.',
    reset: 'Reset', confirm: 'Reset all progress?', theme: { dark: 'Light mode', light: 'Dark mode' },
  },
  bn: {
    tagline: 'বাংলাদেশের কতটুকু খেয়েছেন? একটি জেলা বেছে নিন, যা খেয়েছেন টিক দিন।',
    search: 'জেলা বা খাবার খুঁজুন', pick: 'মানচিত্র বা তালিকা থেকে একটি জেলা বেছে নিন।', none: 'কিছু পাওয়া যায়নি', all: 'সব নির্বাচন', clear: 'সব মুছুন',
    badge: 'আপনার ব্যাজ', foods: 'খাবার', districts: 'জেলার স্বাদ নেওয়া হয়েছে', next: (b, p) => `পরবর্তী: ${b}, ${p}%-এ`,
    division: d => `${d} বিভাগ`, eaten: 'খাওয়া হয়েছে', saved: 'অগ্রগতি এই ব্রাউজারে সংরক্ষিত থাকে।',
    reset: 'রিসেট', confirm: 'সব অগ্রগতি মুছে ফেলবেন?', theme: { dark: 'লাইট মোড', light: 'ডার্ক মোড' },
  },
}
const key = (d, f) => `${d}|${f}`
const get = (k, fallback) => { try { return localStorage.getItem(k) ?? fallback } catch { return fallback } }
const set = (k, v) => { try { localStorage.setItem(k, v) } catch {} }

export default function App() {
  const [eaten, setEaten] = useState(() => { try { return new Set(JSON.parse(get('khadok', '[]'))) } catch { return new Set() } })
  const [lang, setLang] = useState(() => get('khadok-lang', 'en'))
  const [theme, setTheme] = useState(() => get('khadok-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  const [hover, setHover] = useState(null) // {name, x, y}
  const [open, setOpen] = useState(null) // selected district object
  const [q, setQ] = useState('')
  const foodsRef = useRef(null)

  useEffect(() => set('khadok', JSON.stringify([...eaten])), [eaten])
  useEffect(() => { set('khadok-lang', lang); document.documentElement.lang = lang }, [lang])
  useEffect(() => { set('khadok-theme', theme); document.documentElement.dataset.theme = theme }, [theme])


  const t = T[lang], bn = lang === 'bn'
  const num = n => n.toLocaleString(bn ? 'bn-BD' : 'en-US')
  const dName = d => bn ? BN_DISTRICT[d.id] : d.name
  const toggle = k => setEaten(s => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n })
  const setAll = (id, on) => setEaten(s => { const n = new Set(s); foods[id].forEach(([f]) => on ? n.add(key(id, f)) : n.delete(key(id, f))); return n })
  const countIn = id => foods[id].filter(([f]) => eaten.has(key(id, f))).length
  const pct = Math.round((eaten.size / TOTAL) * 100)
  const badge = BADGES.findLast(([min]) => pct >= min)
  const next = BADGES.find(([min]) => min > pct)
  const visited = map.districts.filter(d => countIn(d.id) > 0).length
  const L = +bn // index into [en, bn] pairs
  const query = q.trim().toLowerCase()
  const matches = d => !query || [d.name, BN_DISTRICT[d.id], ...foods[d.id].flat()].some(s => s.toLowerCase().includes(query))
  const shown = map.districts.filter(matches)
  const select = d => {
    setOpen(d)
    // ponytail: on stacked (phone) layout the food panel is below the map, so bring it into view
    if (matchMedia('(max-width: 900px)').matches) setTimeout(() => foodsRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  return (
    <main>
      <nav>
        <button onClick={() => setLang(bn ? 'en' : 'bn')} aria-label="Switch language">{bn ? 'English' : 'বাংলা'}</button>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀' : '☾'} {t.theme[theme]}
        </button>
      </nav>

      <header>
        <h1>{bn ? <>খাদক <span>Khadok</span></> : <>Khadok <span>খাদক</span></>}</h1>
        <p>{t.tagline}</p>
      </header>

      <section className="stats">
        <div className="badge">
          <PixelMan level={BADGES.indexOf(badge)} />
          <div>
            <small>{t.badge}</small>
            <strong>{badge[1][L]}</strong>
            <em>{badge[2][L]}</em>
          </div>
        </div>
        <div className="progress">
          <div className="row"><span>{num(eaten.size)} / {num(TOTAL)} {t.foods}</span><b>{num(pct)}%</b></div>
          <div className="bar"><i style={{ width: pct + '%' }} /></div>
          <div className="row muted">
            <span>{num(visited)} / {num(64)} {t.districts}</span>
            {next && <span>{t.next(next[1][L], num(next[0]))}</span>}
          </div>
        </div>
      </section>

      <div className="layout">
        <aside className="list">
          <div className="search">
            <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t.search} aria-label={t.search} />
          </div>
          <ul>
            {shown.map((d, i) => (
              <li key={d.id}>
                {(i === 0 || shown[i - 1].division !== d.division) && (
                  <h3>{t.division(bn ? BN_DIVISION[d.division] : d.division)}</h3>
                )}
                <button className={open?.id === d.id ? 'on' : ''} onClick={() => select(d)} aria-pressed={open?.id === d.id}>
                  <span>{dName(d)}</span>
                  <small className={countIn(d.id) === foods[d.id].length ? 'done' : ''}>
                    {num(countIn(d.id))}/{num(foods[d.id].length)}
                  </small>
                </button>
              </li>
            ))}
            {!shown.length && <li className="muted empty">{t.none}</li>}
          </ul>
        </aside>

        <div className="map" onMouseLeave={() => setHover(null)}>
          <svg viewBox={map.viewBox} role="img" aria-label="Map of Bangladesh's 64 districts">
            {map.districts.map(d => {
              const r = countIn(d.id) / foods[d.id].length
              return (
                <path
                  key={d.id} d={d.d} tabIndex={0} role="button" aria-label={dName(d)}
                  style={{ '--r': r * 100 + '%' }}
                  className={[r ? (r === 1 ? 'full' : 'some') : '', query && !matches(d) ? 'dim' : ''].join(' ')}
                  onMouseMove={e => setHover({ d, x: e.clientX, y: e.clientY })}
                  onClick={() => select(d)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), select(d))}
                />
              )
            })}
            {open && <path className="sel" d={open.d} />}
          </svg>
          {hover && <div className="tip" style={{ left: hover.x, top: hover.y }}>{dName(hover.d)}</div>}
        </div>

        <aside className="foods" ref={foodsRef} aria-live="polite">
          {open ? (
            <>
              <small>{t.division(bn ? BN_DIVISION[open.division] : open.division)}</small>
              <h2>{dName(open)}</h2>
              <div className="row muted">
                <span>{num(countIn(open.id))} / {num(foods[open.id].length)} {t.eaten}</span>
                {countIn(open.id) === foods[open.id].length
                  ? <button className="link" onClick={() => setAll(open.id, false)}>{t.clear}</button>
                  : <button className="link" onClick={() => setAll(open.id, true)}>{t.all}</button>}
              </div>
              <ul>
                {foods[open.id].map(f => (
                  <li key={f[0]}>
                    <label>
                      <input type="checkbox" checked={eaten.has(key(open.id, f[0]))} onChange={() => toggle(key(open.id, f[0]))} />
                      <span>{f[L]}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </>
          ) : <p className="muted empty">{t.pick}</p>}
        </aside>
      </div>

      <footer>
        {t.saved}{' '}
        {eaten.size > 0 && <button className="link" onClick={() => confirm(t.confirm) && setEaten(new Set())}>{t.reset}</button>}
      </footer>
    </main>
  )
}
