'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Film, Product, MachineLocation } from '@/types'

type Content = Record<string, Record<string, string>>

interface Props {
  films: Film[]
  products: Product[]
  machines: MachineLocation[]
  content?: Content
}

function g(content: Content | undefined, section: string, field: string, fallback: string): string {
  return content?.[section]?.[field] || fallback
}

export default function HomeClient({ films, products, machines, content }: Props) {
  return (
    <>
      <Loader />
      <div className="grain" />
      <HeroSection content={content} />
      <ManifestoSection content={content} />
      <EpisodiosSection films={films} content={content} />
      <IndumentariaSection products={products} content={content} />
      <MaquinasSection machines={machines} content={content} />
      <SubscribeSection content={content} />
    </>
  )
}

/* ============================================================
   LOADER
   ============================================================ */
function Loader() {
  return (
    <div className="loader sunburst" id="loader">
      <div className="loader-sun sunburst" />
      <div className="bar" />
      <div className="loader-text">Archivo Vivo</div>
    </div>
  )
}

/* ============================================================
   HERO
   ============================================================ */
function HeroSection({ content }: { content?: Content }) {
  return (
    <header className="hero" id="top">
      <div className="hero-sun sunburst" />
      <div className="hero-top" data-cms-s="hero" data-cms-f="top_bar">
        {g(content, 'hero', 'top_bar', 'Archivo Vivo · Est. MMXXVI · San Juan, PR')}
      </div>
      <div className="hero-content">
        <div className="hero-rule" />
        <div className="hero-logo-wrap">
          <span className="hero-logo-text wordmark" data-cms-s="hero" data-cms-f="title">Archivo Vivo</span>
        </div>
        <div className="hero-tagline">
          Ideas <i /> Visión <i /> Legado
        </div>
      </div>
      <div className="hero-foot">
        <span className="side">© MMXXVI</span>
        <span className="center">San Juan · PR</span>
        <span className="side">Vol. 01</span>
      </div>
    </header>
  )
}

/* ============================================================
   MANIFESTO
   ============================================================ */
function ManifestoSection({ content }: { content?: Content }) {
  return (
    <section className="manifesto" id="manifiesto">
      <div className="wrap">
        <div className="label label-bar reveal">— Prólogo · 00 / Manifiesto</div>
        <div className="manifesto-grid" style={{ marginTop: 40 }}>
          <h1 className="reveal d1" data-cms-s="manifesto" data-cms-f="heading">
            {g(content, 'manifesto', 'heading', 'Donde el\nartista se\nvuelve\nmemoria.').split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h1>
          <div className="manifesto-body reveal d2">
            <p className="lede" data-cms-s="manifesto" data-cms-f="lede">
              {g(content, 'manifesto', 'lede', 'Archivo Vivo no es un museo. Es un archivo que respira, hecho de cintas, telas y máquinas.')}
            </p>
            <p>
              {g(content, 'manifesto', 'body1', 'Documentamos en imagen a quienes han moldeado la cultura de la isla, vestimos a quien quiera llevar un retazo de esa memoria en el pecho, y colocamos el archivo en los lugares donde la gente realmente vive — el mall, el lobby, la terminal.')}
            </p>
            <p>
              {g(content, 'manifesto', 'body2', 'Tres capítulos. Una misma idea: lo que se archiva no muere — sigue vivo en el cuerpo de quien lo lleva.')}
            </p>
            <div className="manifesto-sig">
              <span className="ink">Archivo Vivo</span>
              <span className="role">El equipo · San Juan, PR</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   EPISODIOS
   ============================================================ */
const EPISODES = [
  { num: '02', title: 'Como quien\nborda un nombre', artist: 'Sujeto · Bordado',   date: 'Jun · 2026', runtime: '9\'10"' },
  { num: '03', title: 'El que nunca\ncalló',            artist: 'Sujeto · Música',   date: 'Ago · 2026', runtime: '7\'44"' },
  { num: '04', title: 'La mano que\nno tiembla',        artist: 'Sujeto · Artes',    date: 'Oct · 2026', runtime: '8\'20"' },
  { num: '05', title: 'Raíz y ruido',                   artist: 'Sujeto · Poesía',   date: 'Dic · 2026', runtime: '10\'00"' },
  { num: '06', title: 'El último\nensayo',               artist: 'Sujeto · Teatro',   date: 'Feb · 2027', runtime: '9\'30"' },
]

function EpisodiosSection({ films, content }: { films: Film[]; content?: Content }) {
  return (
    <section className="episodios" id="episodios">
      <div className="wrap">
        <div className="chapter reveal" style={{ borderColor: 'rgba(242,231,223,0.18)' }}>
          <div className="chapter-left">
            <span className="label label-bar" style={{ color: 'var(--av-taupe)' }}>— Capítulo 01</span>
            <h2>El Archivo</h2>
          </div>
          <div className="chapter-num" style={{ color: 'var(--av-cream)' }}>01</div>
          <div className="chapter-right">
            <span className="label" style={{ color: 'var(--av-taupe)' }}>Episodios de 7 a 10 min</span>
            <p className="body" style={{ color: 'var(--av-taupe)' }}>
              {g(content, 'episodios', 'chapter_body', 'Retratos en imagen y voz. Cada estación, un artista grande de la isla cuenta su historia — la versión completa vive aquí, la versión corta vive en redes.')}
            </p>
          </div>
        </div>

        {/* Featured */}
        <div className="featured">
          <div className="player reveal">
            <div className="player-still" />
            <span className="player-sig">archivo&nbsp;vivo</span>
            <div className="player-corners" />
            <div className="player-play">
              <button className="play-btn" aria-label="Reproducir" />
            </div>
            <div className="player-meta">
              <span className="rec">REC · 4K · 23.976</span>
              <span>Vol.01 / Ep.01</span>
            </div>
          </div>
          <div className="featured-text reveal d1">
            <span className="label label-bar" style={{ color: 'var(--av-taupe)' }}>— Episodio en curso</span>
            <h3>
              {g(content, 'episodios', 'featured_title', 'Lo que la palma nunca olvidó.').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h3>
            <p className="desc">
              {g(content, 'episodios', 'featured_desc', 'Un retrato íntimo del narrador que tatuó el español caribeño en la memoria de tres generaciones. Caminamos su barrio, escuchamos su silencio, y descubrimos por qué su voz no le pertenece solamente a él.')}
            </p>
            <dl className="stats">
              <div><dt>Duración</dt><dd>8&apos;42&quot;</dd></div>
              <div><dt>Formato</dt><dd>16mm · 4K</dd></div>
              <div><dt>Estreno</dt><dd>Otoño &apos;26</dd></div>
            </dl>
            <div style={{ marginTop: 18 }}>
              <button className="btn btn-fill-cream">
                <span className="dot" /><span>Ver trailer · 38s</span>
              </button>
            </div>
          </div>
        </div>

        {/* Episode list */}
        <div className="reveal" style={{ marginTop: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 26, gap: 20, flexWrap: 'wrap' }}>
            <span className="label label-bar" style={{ color: 'var(--av-taupe)' }}>— Próximos episodios</span>
            <span className="label" style={{ color: 'var(--av-gray)' }}>Vol. 01 · 06 piezas</span>
          </div>
          <div className="ep-list">
            {EPISODES.map((ep) => (
              <div key={ep.num} className="ep-row">
                <div className="num">{ep.num}</div>
                <div className="title" style={{ whiteSpace: 'pre-line' }}>{ep.title}</div>
                <div className="artist">{ep.artist}</div>
                <div className="date">{ep.date}</div>
                <div className="runtime">{ep.runtime}</div>
                <div className="arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   INDUMENTARIA
   ============================================================ */
const VOL01_CAMISAS = [
  { name: 'Camisa\nLino AV', sub: 'Tela AV · Vol.01', price: '$145' },
  { name: 'Camisa\nOxford AV', sub: 'Tela AV · Vol.01', price: '$135' },
  { name: 'Camisa\nCuadro AV', sub: 'Tela AV · Vol.01', price: '$150' },
  { name: 'Camisa\nStripe AV', sub: 'Tela AV · Vol.01', price: '$140' },
]

const VOL01_TEES = [
  { name: 'Tee\nAV Archive', sub: 'Cotton · Vol.01', price: '$65' },
  { name: 'Tee\nAV Memoria', sub: 'Cotton · Vol.01', price: '$65' },
  { name: 'Tee\nAV Isla', sub: 'Cotton · Vol.01', price: '$70' },
  { name: 'Tee\nAV Legado', sub: 'Cotton · Vol.01', price: '$70' },
]

function VolCarousel({ title, meta, items, slotPrefix, slotIds, allProducts }: {
  title: string
  meta: string
  items: { name: string; sub: string; price: string }[]
  slotPrefix?: string
  slotIds?: (string | null)[]
  allProducts?: Product[]
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: -1 | 1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.vol-card') as HTMLElement
    const w = (card?.offsetWidth ?? 280) + 20
    track.scrollBy({ left: dir * w * 2, behavior: 'smooth' })
  }

  const displayItems = items.map((item, i) => {
    if (slotPrefix && slotIds && allProducts) {
      const pid = slotIds[i] ?? null
      if (pid) {
        const p = allProducts.find(pr => pr.id === pid)
        if (p) return {
          id: p.id, slug: p.slug,
          name: p.name, sub: `${p.category === 'shirt' ? 'Camisa' : p.category === 'tshirt' ? 'Tee' : 'Pieza'} · Vol.01`,
          price: `$${p.price.toFixed(0)}`, image: p.images?.[0] ?? null,
        }
      }
    }
    return { id: null as string | null, slug: null as string | null, name: item.name, sub: item.sub, price: item.price, image: null as string | null }
  })

  return (
    <div className="vol-block reveal">
      <div className="vol-head">
        <div>
          <div className="vol-id wordmark" style={{ fontSize: 'clamp(28px,3vw,40px)' }}>{title}</div>
          <div className="vol-meta">{meta}</div>
        </div>
        <div className="vol-controls">
          <button className="vol-arrow" onClick={() => scroll(-1)} aria-label="Anterior">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="vol-arrow" onClick={() => scroll(1)} aria-label="Siguiente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="vol-track" ref={trackRef}>
        {displayItems.map((item, i) => (
          <Link
            href={item.slug ? `/merch/${item.slug}` : '/merch'}
            key={i}
            className="vol-card"
            {...(slotPrefix ? { 'data-cms-s': 'indumentaria', 'data-cms-f': 'product_slot', 'data-cms-slot': `${slotPrefix}_${i}` } : {})}
          >
            <div className="vol-card-img">
              {item.image
                ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', background: `linear-gradient(${135 + i * 20}deg, #2a221a ${i * 10}%, #3d2e1f 100%)` }} />
              }
            </div>
            <div className="vol-card-body">
              <div className="vol-card-name" style={{ whiteSpace: 'pre-line' }}>{item.name}</div>
              <div className="vol-card-sub">{item.sub}</div>
              <div className="vol-card-price">{item.price}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function IndumentariaSection({ products, content }: { products: Product[]; content?: Content & { indumentaria?: Record<string, unknown> } }) {
  const slots = ((content?.indumentaria?.product_slots ?? {}) as Record<string, string | null>)
  const camisasSlots = [0, 1, 2, 3].map(i => slots[`camisas_${i}`] ?? null)
  const teesSlots    = [0, 1, 2, 3].map(i => slots[`tees_${i}`]    ?? null)
  return (
    <section className="indumentaria" id="indumentaria">
      <div className="wrap">
        <div className="chapter reveal">
          <div className="chapter-left">
            <span className="label label-bar">— Capítulo 02</span>
            <h2>Indumentaria</h2>
          </div>
          <div className="chapter-num">02</div>
          <div className="chapter-right">
            <span className="label">Vol. 01 · Cinco piezas</span>
            <p className="body">
              {g(content, 'indumentaria', 'chapter_body', 'Camisas, T-shirts de vestir y piezas pensadas para reuniones, citas y la vida diaria de quien se viste con intención. Cada pieza lleva el bolsillo en tela AV.')}
            </p>
          </div>
        </div>

        <div className="indum-layout">
          <div className="fabric-feature reveal">
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(160deg,#181410 0%,#2a221a 40%,#4a3728 100%)',
            }} />
            <div className="cap">
              <span className="sig">indumentaria</span>
              <span className="smalltext">Tela AV · Vol. 01 · Edición limitada</span>
            </div>
          </div>
          <div className="fabric-stmt reveal d1">
            <span className="label label-bar">— La tela del archivo</span>
            <h3>
              {g(content, 'indumentaria', 'statement_title', 'Ropa que carga memoria.').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h3>
            <p className="lede">
              {g(content, 'indumentaria', 'statement_lede', 'Cada pieza documenta. Cada costura es un argumento.')}
            </p>
            <p>
              {g(content, 'indumentaria', 'statement_body', 'Diseñamos para quienes se visten con intención. Camisas de vestir, T-shirts de autor y piezas de temporada — todas con el bolsillo de identificación AV bordado en tela propia.')}
            </p>
            <div style={{ marginTop: 22 }}>
              <Link href="/merch" className="btn btn-fill">
                <span className="dot" /><span>Ver colección</span>
              </Link>
            </div>
          </div>
        </div>

        <VolCarousel title="Vol. 01 — Camisas" meta="Lino · Oxford · Cuadro" items={VOL01_CAMISAS} slotPrefix="camisas" slotIds={camisasSlots} allProducts={products} />
        <VolCarousel title="Vol. 01 — Tees"    meta="Cotton · Peso medio"    items={VOL01_TEES}    slotPrefix="tees"    slotIds={teesSlots}    allProducts={products} />

        <div className="vol-block reveal">
          <div className="vol-head">
            <div>
              <div className="vol-id wordmark" style={{ fontSize: 'clamp(28px,3vw,40px)', color: 'var(--av-gray)' }}>
                Vol. 02 — <em>Próximamente</em>
              </div>
              <div className="vol-meta">Otoño · Invierno 2026</div>
            </div>
          </div>
          <div style={{
            border: '1px solid rgba(52,49,51,0.18)',
            padding: 'clamp(48px,7vw,100px) clamp(28px,4vw,60px)',
            textAlign: 'center',
          }}>
            <span className="label" style={{ display: 'block', marginBottom: 24 }}>
              — Notifícame cuando salga
            </span>
            <h3 className="wordmark" style={{ fontSize: 'clamp(40px,6vw,80px)', lineHeight: 0.88 }}>
              En construcción.
            </h3>
          </div>
        </div>

        <div className="atelier reveal">
          {[
            { title: 'Tela AV', desc: 'Cada prenda lleva el bolsillo identificatorio bordado en tela de la casa.' },
            { title: 'Edición limitada', desc: 'Cantidades controladas por temporada. Sin restock.' },
            { title: 'Made in PR', desc: 'Producción local. Talleres de confianza. Empleo digno.' },
            { title: 'Sin ruido', desc: 'Un drop por estación. La frecuencia del archivo.' },
          ].map((c) => (
            <div key={c.title} className="cell">
              <h5>{c.title}</h5>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   MÁQUINAS
   ============================================================ */
const DEFAULT_LOCATIONS = [
  { id: '1', mall_name: 'Plaza Las Américas', city: 'San Juan',  active: true,  address: null, photo_url: null, hours: null, created_at: '' },
  { id: '2', mall_name: 'The Mall of San Juan', city: 'San Juan', active: true,  address: null, photo_url: null, hours: null, created_at: '' },
  { id: '3', mall_name: 'Plaza del Caribe',   city: 'Ponce',     active: false, address: null, photo_url: null, hours: null, created_at: '' },
  { id: '4', mall_name: 'Mayagüez Mall',      city: 'Mayagüez',  active: false, address: null, photo_url: null, hours: null, created_at: '' },
  { id: '5', mall_name: 'SJU Terminal A',     city: 'Carolina',  active: false, address: null, photo_url: null, hours: null, created_at: '' },
] as MachineLocation[]

function MaquinasSection({ machines, content }: { machines: MachineLocation[]; content?: Content }) {
  const locs = machines.length ? machines : DEFAULT_LOCATIONS

  return (
    <section className="maquinas" id="maquinas">
      <div className="maquinas-sun sunburst-cream" />
      <div className="wrap">
        <div className="chapter reveal" style={{ borderColor: 'rgba(242,231,223,0.18)' }}>
          <div className="chapter-left">
            <span className="label label-bar" style={{ color: 'var(--av-taupe)' }}>— Capítulo 03</span>
            <h2>Máquinas</h2>
          </div>
          <div className="chapter-num" style={{ color: 'var(--av-cream)' }}>03</div>
          <div className="chapter-right">
            <span className="label" style={{ color: 'var(--av-taupe)' }}>Red de cinco unidades</span>
            <p className="body" style={{ color: 'var(--av-taupe)' }}>
              {g(content, 'maquinas', 'chapter_body', 'Una red de vending culturales en los puntos donde la isla circula — malls, lobbies, terminales. Snack, agua, refresco. Y el archivo viviendo en silencio al lado.')}
            </p>
          </div>
        </div>

        <div className="maq-grid">
          <div className="machine-stage reveal">
            <span className="tag tl">XJT · Modelo A1 · 220V</span>
            <span className="crosshair" />
            <span className="tag br">Prototipo Vol.01 · 1 de 5</span>
            <div style={{
              width: '55%', aspectRatio: '2/5',
              background: 'linear-gradient(180deg,#2a2624 0%,#1a1512 100%)',
              border: '1px solid rgba(242,231,223,0.12)',
              borderRadius: 4,
              position: 'relative', zIndex: 2,
              boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
            }}>
              <div style={{
                position: 'absolute', top: '12%', left: '10%', right: '10%', height: '45%',
                background: 'rgba(242,231,223,0.04)',
                border: '1px solid rgba(242,231,223,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--av-taupe)', opacity: 0.6 }}>Archivo Vivo</span>
              </div>
            </div>
          </div>

          <div className="maq-copy reveal d1">
            <span className="label label-bar" style={{ color: 'var(--av-taupe)' }}>— Mientras esperas el agua</span>
            <h3 data-cms-s="maquinas" data-cms-f="copy_title">
              {g(content, 'maquinas', 'copy_title', 'El archivo también vive en el mall.').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h3>
            <p data-cms-s="maquinas" data-cms-f="copy_body">
              {g(content, 'maquinas', 'copy_body', 'La pantalla integrada reproduce los episodios del archivo en bucle, junto al inventario habitual de una vending. La idea: que mientras esperas tu agua, conozcas a alguien que cambió la cultura de la isla.')}
            </p>
            <div className="locations">
              {locs.slice(0, 5).map((loc, i) => (
                <div key={loc.id} className="location">
                  <span>0{i + 1}</span>
                  <span className="city">{loc.mall_name}</span>
                  <span>{loc.city}</span>
                  <span className={`status${loc.active ? '' : ' soon'}`}>
                    {loc.active ? 'Activa' : i === 4 ? "Otoño '26" : 'Próximamente'}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 40 }}>
              <button className="btn btn-fill-cream">
                <span className="dot" /><span>Proponer una ubicación</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   SUBSCRIBE
   ============================================================ */
function SubscribeSection({ content }: { content?: Content }) {
  return (
    <section className="subscribe" id="suscripcion">
      <div className="subscribe-sun sunburst" />
      <div className="wrap">
        <span className="label reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <i style={{ display: 'block', width: 24, height: 2, background: 'currentColor' }} />
          Boletín del archivo
        </span>
        <h2 className="reveal d1" data-cms-s="subscribe" data-cms-f="heading" style={{ marginTop: 28 }}>
          {g(content, 'subscribe', 'heading', 'Mantente cerca del archivo.').split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </h2>
        <p className="reveal d2" data-cms-s="subscribe" data-cms-f="body">
          {g(content, 'subscribe', 'body', 'Un correo cada estación: el próximo episodio, drops nuevos de indumentaria, y dónde encontrar la siguiente máquina. Sin ruido — la frecuencia del archivo.')}
        </p>
        <SubscribeForm />
        <div className="social-row reveal d4">
          {['Instagram', 'TikTok', 'YouTube'].map((s) => (
            <a key={s} href="#">{s}</a>
          ))}
        </div>
      </div>
    </section>
  )
}

function SubscribeForm() {
  const [done, setDone] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setDone(true)
    setEmail('')
  }

  return (
    <form className="sub-form reveal d3" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="tu@correo.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">{done ? '✓ Suscrito' : 'Suscribirme →'}</button>
    </form>
  )
}
