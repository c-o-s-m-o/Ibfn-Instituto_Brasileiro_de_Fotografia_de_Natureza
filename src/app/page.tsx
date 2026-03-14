"use client"
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Camera, Instagram, Mail, Menu, X, ArrowRight, Youtube,
  CheckCircle2, ChevronDown, Award, RefreshCw, ExternalLink,
  Quote, Heart, ChevronLeft, ChevronRight, Bell,
  Star, Lock, Zap, MapPin, Users, Calendar,
  Leaf, Mountain, ZoomIn, ZoomOut, Maximize2, Send,
  MessageCircle
} from 'lucide-react';
import rawFotos from './wikiaves_fotos.json';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Foto { url: string; titulo: string; cientifico: string; estrelas: number; }

// ─── DATA ────────────────────────────────────────────────────────────────────
const uniqueFromJson: Foto[] = Array.from(
  new globalThis.Map(rawFotos.map(i => [
    i.imagem, { url: i.imagem, titulo: i.especie, cientifico: i.cientifico, estrelas: 0 }
  ])).values()
);
const allSpecies = Array.from(new Set(uniqueFromJson.map(f => f.titulo))).sort();

const L = {
  youtube:   'https://www.youtube.com/@passarinhadapro',
  instagram: 'https://www.instagram.com/thiago.t.silva',
  igJardim:  'https://www.instagram.com/jardimdosbeijafloresdf/',
  wikiaves:  'https://www.wikiaves.com.br/perfil_thiagotoledo',
  whatsapp:  'https://wa.me/5585999260902',
};
const PRESS = [
  { name:'Correio Braziliense', date:'Out 2025', url:'https://www.correiobraziliense.com.br/cidades-df/2025/10/7262684-birdwatching-como-a-pratica-de-observar-e-fotografar-aves-ocorre-no-df.html', quote:'Quando era criança, queria ser biólogo, só que fui para o ramo da aviação. Mas eu extravasava essa vontade de ficar no mato fotografando aves.', author:'Walkyria Lagaci', img:'https://midias.correiobraziliense.com.br/_midias/jpg/2025/10/03/675x450/1_img-8810-59457056.jpg' },
{ name:'G1 / Terra da Gente', date:'Out 2017', url:'https://g1.globo.com/sp/campinas-regiao/terra-da-gente/vc-no-terra-da-gente/noticia/piloto-viaja-o-brasil-em-busca-de-belas-aves-em-especial-os-beija-flores.ghtml', quote:'Com os cliques podemos mostrar a importância da preservação sem sermos chatos. Esse é o trunfo das aves: chamar atenção para algo sério através da beleza.', author:'Redação G1', img:'https://s2-g1.glbimg.com/0BDI4i5Jt6rwiIXUzyhrE75YdaQ=/0x0:1280x852/1008x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2017/i/z/SnIh18SVSP3yQ5Ak0a3Q/chifre-de-ouro.jpeg' },
];
const TRIPS = [
  { mes:'Jan', dest:'Lajedo e Chapada', s:'cheio' },
{ mes:'Fev', dest:'Lajedo e Chapada', s:'cheio' },
{ mes:'Mar', dest:'—', s:'indis' },
{ mes:'Abr', dest:'Panamá 🇵🇦', s:'ok' },
{ mes:'Mai', dest:'Mata Atlântica', s:'ok' },
{ mes:'Jun', dest:'Mata Atlântica', s:'ok' },
{ mes:'Jul', dest:'Global Birdfair · Inglaterra 🇬🇧', s:'ok' },
{ mes:'Ago', dest:'Panamá 🇵🇦', s:'ok' },
{ mes:'Set', dest:'Ceará · Sertão, Serra e Mar', s:'breve' },
{ mes:'Out', dest:'Amazônia · Galo da Serra', s:'breve' },
{ mes:'Nov', dest:'Mata Atlântica · Beija-flores', s:'ok' },
];
const CURSOS = [
  { t:'Fotografando Aves em Voo', sub:'Método Prático', d:'Transforme frustração em imagens nítidas.', tag:'Técnica', hot:true },
{ t:'Masterclass de Edição',     sub:'Lightroom & Workflow', d:'Color grading profissional para natureza.', tag:'Edição' },
{ t:'Composição no Campo',       sub:'Arte & Olhar', d:'Ângulos únicos com luz natural.', tag:'Arte' },
{ t:'Biologia das Aves',         sub:'Campo & ID', d:'Comporte-se como o pássaro antes do clique.', tag:'Campo' },
];
const INTERESTS = ['Expedições fotográficas', 'Cursos online', 'Área de Membros', 'Tour privativo', 'Birdwatching'];

// ─── WIKIAVES ─────────────────────────────────────────────────────────────────
const PROXY = 'https://api.allorigins.win/raw?url=';
const UID = '10281';

function parsePage(html: string): Foto[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.querySelectorAll('.wa-record')).flatMap(r => {
    const img = r.querySelector<HTMLImageElement>('img'); if (!img) return [];
    const src = img.getAttribute('src') || '';
    const url = src.startsWith('http') ? src : `https://www.wikiaves.com.br${src}`;
    if (!url.includes('amazonaws') && !url.includes('wikiaves')) return [];
    const titulo = r.querySelector('.sp a')?.textContent?.trim() || '';
    const cientifico = r.querySelector('.sp i')?.textContent?.trim() || '';
    const sp = r.querySelector('.fa-star')?.parentElement;
    const estrelas = parseInt((sp?.textContent || '0').replace(/\D/g,''), 10) || 0;
    if (!titulo) return [];
    return [{ url, titulo, cientifico, estrelas }];
  });
}
async function fetchFotos(onP?: (n: number) => void): Promise<Foto[]> {
  const all: Foto[] = [];
  for (let p = 1; p <= 50; p++) {
    const url = `https://www.wikiaves.com.br/getmidias.php?tm=f&t=u&u=${UID}&o=mp&pmax=12&p=${p}`;
    const res = await fetch(`${PROXY}${encodeURIComponent(url)}`, { cache: 'no-store' });
    if (!res.ok) { if (p === 1) throw new Error(''); break; }
    const fotos = parsePage(await res.text());
    if (!fotos.length) break;
    all.push(...fotos); onP?.(all.length);
    if (fotos.length < 12) break;
  }
  if (!all.length) throw new Error('');
  return all.sort((a, b) => b.estrelas - a.estrelas);
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
    <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8FD450"/><stop offset="100%" stopColor="#2D7A3E"/></linearGradient>
    <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#A8E063"/><stop offset="100%" stopColor="#56AB2F"/></linearGradient>
    </defs>
    <ellipse cx="50" cy="72" rx="36" ry="24" fill="url(#lg1)" opacity=".85" style={{animation:'lsway 5s ease-in-out infinite',transformOrigin:'50px 88px'}}/>
    <ellipse cx="50" cy="68" rx="26" ry="17" fill="url(#lg2)" opacity=".55" style={{animation:'lsway 5s ease-in-out infinite .5s',transformOrigin:'50px 88px',transform:'rotate(-18deg)'}}/>
    <ellipse cx="50" cy="46" rx="10" ry="16" fill="url(#lg1)" style={{animation:'bhover 2.4s ease-in-out infinite'}}/>
    <path d="M40 50 Q24 40 20 50 Q30 46 40 52Z" fill="#A8E063" opacity=".85" style={{animation:'wL .9s ease-in-out infinite',transformOrigin:'40px 50px'}}/>
    <path d="M60 50 Q76 40 80 50 Q70 46 60 52Z" fill="#A8E063" opacity=".85" style={{animation:'wR .9s ease-in-out infinite',transformOrigin:'60px 50px'}}/>
    <circle cx="50" cy="30" r="10" fill="#3D8B2F"/>
    <path d="M50 26 L50 15" stroke="#1A5C1F" strokeWidth="2.5" strokeLinecap="round" style={{animation:'bhover 2.4s ease-in-out infinite'}}/>
    <circle cx="54" cy="29" r="2.5" fill="white"/><circle cx="54.5" cy="29" r="1.2" fill="#071510"/>
    <path d="M46 62 Q50 72 54 62" stroke="#2D7A3E" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ─── FULL-SCREEN LIGHTBOX WITH PINCH & ZOOM ────────────────────────────────
function Lightbox({ fotos, idx, onClose, onPrev, onNext }: {
  fotos: Foto[]; idx: number; onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
  const foto = fotos[idx];
  const [scale, setScale]   = useState(1);
  const [pos,   setPos]     = useState({ x: 0, y: 0 });
  const drag  = useRef({ active: false, sx: 0, sy: 0, px: 0, py: 0 });
  const pinch = useRef({ dist: 0, active: false });
  const tapT  = useRef(0);

  useEffect(() => { setScale(1); setPos({ x: 0, y: 0 }); }, [idx]);

  /* ── mouse ── */
  const onMD = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y };
  };
  const onMM = (e: React.MouseEvent) => {
    if (!drag.current.active) return;
    setPos({ x: drag.current.px + e.clientX - drag.current.sx, y: drag.current.py + e.clientY - drag.current.sy });
  };
  const onMU = () => { drag.current.active = false; };

  /* ── wheel zoom ── */
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.min(Math.max(s + (e.deltaY > 0 ? -0.25 : 0.25), 1), 6));
  };

  /* ── touch ── */
  const onTS = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinch.current = { dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), active: true };
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - tapT.current < 280) { // double-tap
        if (scale > 1) { setScale(1); setPos({ x: 0, y: 0 }); }
        else { setScale(2.5); }
      }
      tapT.current = now;
      drag.current = { active: true, sx: e.touches[0].clientX, sy: e.touches[0].clientY, px: pos.x, py: pos.y };
    }
  };
  const onTM = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinch.current.active) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const ratio = d / pinch.current.dist;
      pinch.current.dist = d;
      setScale(s => Math.min(Math.max(s * ratio, 1), 6));
      setPos({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && drag.current.active && scale > 1) {
      setPos({ x: drag.current.px + e.touches[0].clientX - drag.current.sx, y: drag.current.py + e.touches[0].clientY - drag.current.sy });
    }
  };
  const onTE = () => { drag.current.active = false; pinch.current.active = false; };

  const imgStyle: React.CSSProperties = {
    maxWidth:  scale === 1 ? '100vw'  : 'none',
    maxHeight: scale === 1 ? '80svh'  : 'none',
    width:     scale > 1   ? `${scale * 90}vw` : undefined,
    objectFit: 'contain',
    borderRadius: scale === 1 ? 8 : 0,
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    cursor: scale > 1 ? (drag.current.active ? 'grabbing' : 'grab') : 'zoom-in',
    transition: drag.current.active ? 'none' : 'transform .2s ease',
    userSelect: 'none', WebkitUserSelect: 'none',
    touchAction: 'none',
  };

  const ib: React.CSSProperties = { width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.11)', border: '1px solid rgba(255,255,255,.18)', color: 'white', cursor: 'pointer', flexShrink: 0 };
  const nb: React.CSSProperties = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(123,200,67,.13)', border: '1px solid rgba(123,200,67,.28)', color: '#7BC843', cursor: 'pointer', zIndex: 5 };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:999, background:'#010905', display:'flex', flexDirection:'column', touchAction:'none' }}>
    {/* Top bar */}
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'linear-gradient(to bottom,rgba(1,9,5,.96),transparent)', zIndex:5, flexShrink:0 }}>
    <span style={{ color:'rgba(255,255,255,.45)', fontSize:12 }}>{idx + 1} / {fotos.length}</span>
    <div style={{ display:'flex', gap:8 }}>
    <button style={ib} onClick={() => { setScale(s => Math.min(s + .6, 6)); setPos({x:0,y:0}); }}><ZoomIn size={17}/></button>
    <button style={ib} onClick={() => { const ns = Math.max(scale-.6,1); setScale(ns); if(ns<=1)setPos({x:0,y:0}); }}><ZoomOut size={17}/></button>
    <button style={ib} onClick={onClose}><X size={19}/></button>
    </div>
    </div>

    {/* Image */}
    <div style={{ flex:1, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}
    onWheel={onWheel} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
    onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}>
    <img
    src={foto.url.replace('q_','g_')} alt={foto.titulo}
    onError={e => { const t = e.currentTarget; if(t.src.includes('g_')) t.src = t.src.replace('g_','q_'); }}
    style={imgStyle}
    onClick={() => { if(scale===1){setScale(2);setPos({x:0,y:0});} }}
    draggable={false}
    />
    {scale === 1 && (
      <div style={{ position:'absolute', bottom:10, right:10, display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:6, background:'rgba(0,0,0,.65)', color:'rgba(255,255,255,.6)', fontSize:10, pointerEvents:'none' }}>
      <Maximize2 size={11}/> Toque duplo para zoom
      </div>
    )}
    </div>

    {/* Caption */}
    <div style={{ padding:'10px 20px 20px', background:'linear-gradient(to top,rgba(1,9,5,.95),transparent)', textAlign:'center', flexShrink:0 }}>
    <p style={{ fontFamily:"'Lora',serif", color:'white', fontSize:16, textTransform:'capitalize' }}>{foto.titulo}</p>
    {foto.cientifico && <p style={{ color:'rgba(255,255,255,.38)', fontSize:11, fontStyle:'italic', marginTop:2 }}>{foto.cientifico}</p>}
    </div>

    {/* Nav */}
    <button style={{ ...nb, left:10 }} onClick={e=>{e.stopPropagation();onPrev();}}><ChevronLeft size={22}/></button>
    <button style={{ ...nb, right:10 }} onClick={e=>{e.stopPropagation();onNext();}}><ChevronRight size={22}/></button>
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:'1px solid rgba(123,200,67,.1)' }}>
    <button onClick={() => setOpen(!open)} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'17px 0', textAlign:'left', gap:16, background:'none', border:'none', cursor:'pointer', minHeight:44 }}>
    <span style={{ fontFamily:"'Lora',serif", fontSize:15, color:'white', lineHeight:1.4 }}>{q}</span>
    <span style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:18, fontWeight:300, background:open?'var(--lime)':'rgba(123,200,67,.07)', color:open?'var(--forest)':'var(--lime)', border:`1px solid ${open?'var(--lime)':'rgba(123,200,67,.18)'}`, transform:open?'rotate(45deg)':'none', transition:'all .3s' }}>+</span>
    </button>
    <div style={{ overflow:'hidden', maxHeight:open?240:0, opacity:open?1:0, transition:'max-height .42s cubic-bezier(.22,1,.36,1), opacity .25s' }}>
    <p style={{ fontSize:14, color:'rgba(255,255,255,.48)', lineHeight:1.9, paddingBottom:17 }}>{a}</p>
    </div>
    </div>
  );
}

// ─── LEAD FORM ────────────────────────────────────────────────────────────────
function LeadForm() {
  const [f, setF] = useState({ nome:'', email:'', tel:'', interesse:'' });
  const [sent, setSent]     = useState(false);
  const [busy, setBusy]     = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setF(p => ({ ...p, [k]:e.target.value }));
  const inp: React.CSSProperties = { width:'100%', padding:'13px 15px', borderRadius:8, fontSize:15, background:'rgba(255,255,255,.06)', border:'1.5px solid rgba(123,200,67,.18)', color:'white', outline:'none', fontFamily:"'DM Sans',sans-serif", WebkitAppearance:'none', transition:'border-color .2s' };
  const focus = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'var(--lime)';
  const blur  = (e: React.FocusEvent<any>) => e.target.style.borderColor = 'rgba(123,200,67,.18)';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await new Promise(r => setTimeout(r, 800));
    setBusy(false); setSent(true);
  };

  if (sent) return (
    <div style={{ textAlign:'center', padding:'32px 10px' }}>
    <div style={{ width:58, height:58, borderRadius:'50%', background:'rgba(123,200,67,.13)', border:'2px solid var(--lime)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}><CheckCircle2 size={28} color="var(--lime)"/></div>
    <h3 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:26, color:'white', letterSpacing:'.04em', marginBottom:8 }}>CADASTRO REALIZADO!</h3>
    <p style={{ color:'rgba(255,255,255,.45)', fontSize:14, lineHeight:1.7 }}>Obrigado {f.nome ? f.nome.split(' ')[0] : ''}! Entraremos em contato em breve.</p>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
    <div>
    <label style={{ display:'block', fontSize:9, fontWeight:700, color:'var(--lime)', textTransform:'uppercase', letterSpacing:'.22em', marginBottom:6 }}>Nome completo *</label>
    <input value={f.nome} onChange={set('nome')} onFocus={focus} onBlur={blur} placeholder="Seu nome completo" required style={inp}/>
    </div>
    <div>
    <label style={{ display:'block', fontSize:9, fontWeight:700, color:'var(--lime)', textTransform:'uppercase', letterSpacing:'.22em', marginBottom:6 }}>E-mail *</label>
    <input type="email" value={f.email} onChange={set('email')} onFocus={focus} onBlur={blur} placeholder="seu@email.com" required style={inp}/>
    </div>
    <div>
    <label style={{ display:'block', fontSize:9, fontWeight:700, color:'var(--lime)', textTransform:'uppercase', letterSpacing:'.22em', marginBottom:6 }}>WhatsApp / Telefone</label>
    <input type="tel" value={f.tel} onChange={set('tel')} onFocus={focus} onBlur={blur} placeholder="(00) 00000-0000" style={inp}/>
    </div>
    <div>
    <label style={{ display:'block', fontSize:9, fontWeight:700, color:'var(--lime)', textTransform:'uppercase', letterSpacing:'.22em', marginBottom:6 }}>Qual seu interesse?</label>
    <select value={f.interesse} onChange={set('interesse')} onFocus={focus} onBlur={blur}
    style={{ ...inp, backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' fill='%237BC843' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center', paddingRight:38 }}>
    <option value="" style={{ background:'#081a0c' }}>Selecione um interesse…</option>
    {INTERESTS.map(i => <option key={i} value={i} style={{ background:'#081a0c' }}>{i}</option>)}
    </select>
    </div>
    <button type="submit" disabled={busy} style={{ width:'100%', padding:'15px', borderRadius:8, background:'linear-gradient(135deg,var(--lime),var(--leaf))', color:'var(--forest)', fontWeight:800, fontSize:13, letterSpacing:'.16em', textTransform:'uppercase', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:busy?.72:1, transition:'opacity .2s', marginTop:4, minHeight:52 }}>
    {busy ? <><RefreshCw size={15} style={{animation:'spinSlow 1s linear infinite'}}/> Enviando…</> : <><Send size={14}/> Quero me cadastrar</>}
    </button>
    <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,.26)' }}>🔒 Dados seguros. Sem spam.</p>
    </form>
  );
}

// ─── STAT COUNTER ─────────────────────────────────────────────────────────────
function Stat({ v, l }: { v: string; l: string }) {
  const [vis, setVis] = useState(false);
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold:.35 });
    if (r.current) o.observe(r.current); return () => o.disconnect();
  }, []);
    return (
      <div ref={r} style={{ textAlign:'center', padding:'8px 0' }}>
      <div style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(28px,5.5vw,38px)', lineHeight:1, color:'var(--lime)', opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(10px)', transition:'all .65s cubic-bezier(.22,1,.36,1)' }}>{v}</div>
      <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', fontWeight:600, marginTop:4 }}>{l}</div>
      </div>
    );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400;1,600&display=swap');

:root {
  --forest:#020d06; --deep:#0a1e0e; --moss:#1E4A2A; --fern:#2D7A3E;
  --leaf:#56AB2F;   --lime:#7BC843;  --mint:#A8E063;
  --amber:#F4A020;  --gold:#D4881A;
  --paper:#F5F2EA;  --cream:#EDE8DC; --parch:#E0D8C8;
  --mid:#4E6650;    --soft:#7A9A7E;
}

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html { scroll-behavior:smooth; -webkit-text-size-adjust:100%; }
body { font-family:'DM Sans',system-ui,sans-serif; -webkit-font-smoothing:antialiased; background:var(--paper); overscroll-behavior-y:none; }
img  { max-width:100%; height:auto; display:block; }
button, a { -webkit-tap-highlight-color:transparent; }

/* ── Animations (minimal set) ── */
@keyframes lsway   { 0%,100%{transform:rotate(0)}  50%{transform:rotate(3deg)} }
@keyframes bhover  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
@keyframes wL      { 0%,100%{transform:rotate(0) scaleY(1)} 50%{transform:rotate(-14deg) scaleY(.58)} }
@keyframes wR      { 0%,100%{transform:rotate(0) scaleY(1)} 50%{transform:rotate(14deg)  scaleY(.58)} }
@keyframes fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes spinSlow{ to{transform:rotate(360deg)} }
@keyframes ytPulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,0,0,.5)} 70%{box-shadow:0 0 0 10px rgba(255,0,0,0)} }
@keyframes waWave  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
@keyframes skelP   { 0%,100%{opacity:.45} 50%{opacity:.8} }
@keyframes lshim   { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
@keyframes shaft   { 0%,100%{opacity:.04} 50%{opacity:.08} }
@keyframes firefly { 0%,100%{opacity:0;transform:translate(0,0)} 45%{opacity:.9} 75%{opacity:.3;transform:translate(9px,-14px)} }
@keyframes scan    { from{top:-2px} to{top:100%} }
@keyframes birdfly { from{transform:translateX(-80px)} to{transform:translateX(105vw)} }

/* ── Reveal helpers ── */
.au { animation:fadeUp .6s cubic-bezier(.22,1,.36,1) both; }
.ai { animation:fadeIn .7s ease both; }
.d1{animation-delay:.06s} .d2{animation-delay:.12s} .d3{animation-delay:.18s}
.d4{animation-delay:.24s} .d5{animation-delay:.30s} .d6{animation-delay:.36s}

/* ── Shimmer text ── */
.tl { background:linear-gradient(90deg,#7BC843,#A8E063,#7BC843);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:lshim 4s linear infinite; }
.ta { background:linear-gradient(90deg,#F4A020,#FFD060,#F4A020);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:lshim 3.5s linear infinite; }

/* ── Buttons — tall touch targets ── */
.bl  { display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 22px;border-radius:8px;background:linear-gradient(135deg,var(--lime),var(--leaf));color:var(--forest);font-family:inherit;font-weight:800;font-size:12px;letter-spacing:.15em;text-transform:uppercase;text-decoration:none;border:none;cursor:pointer;box-shadow:0 4px 18px rgba(123,200,67,.32);transition:all .3s;min-height:48px; }
.bl:active { transform:scale(.97); }
.bg  { display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 20px;border-radius:8px;border:1.5px solid rgba(123,200,67,.32);color:rgba(255,255,255,.88);font-family:inherit;font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;cursor:pointer;background:transparent;transition:all .3s;min-height:48px; }
.byt { display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 22px;border-radius:8px;background:#FF0000;color:white;font-family:inherit;font-weight:800;font-size:12px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;border:none;cursor:pointer;animation:ytPulse 3s ease-in-out infinite;min-height:48px; }
.byt:active { background:#CC0000; }
.bwa { display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 22px;border-radius:8px;background:#25D366;color:white;font-family:inherit;font-weight:800;font-size:12px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(37,211,102,.3);transition:all .3s;min-height:48px; }
.bwa:active { background:#1DA851; }

/* ── WhatsApp FAB ── */
.wafab { position:fixed;right:18px;bottom:22px;z-index:200;width:58px;height:58px;border-radius:50%;background:#25D366;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 22px rgba(37,211,102,.5),0 0 0 0 rgba(37,211,102,.4);animation:waWave 2.8s ease-in-out infinite;text-decoration:none; }
.wafab:active { transform:scale(.92); }

/* ── Nav ── */
.na  { font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;text-decoration:none;color:rgba(255,255,255,.62);position:relative;transition:color .2s;white-space:nowrap; }
.na::after { content:'';position:absolute;bottom:-4px;left:0;right:0;height:1.5px;background:var(--lime);transform:scaleX(0);transform-origin:left;transition:transform .3s; }
.na:hover::after { transform:scaleX(1); }

/* ── Cards hover ── */
.hov { transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s; }
@media(hover:hover){ .hov:hover { transform:translateY(-5px);box-shadow:0 22px 52px rgba(0,0,0,.2)!important; } }

/* ── Section label ── */
.sl  { display:flex;align-items:center;gap:10px;margin-bottom:12px; }
.sl::before { content:'';width:30px;height:2px;background:linear-gradient(90deg,var(--lime),transparent);flex-shrink:0;border-radius:1px; }

/* ── Masonry ── */
.mason { columns:2;column-gap:8px; }
@media(min-width:580px) { .mason { columns:3; } }
@media(min-width:900px) { .mason { columns:4; } }
.mi  { break-inside:avoid;margin-bottom:8px;border-radius:10px;overflow:hidden;position:relative;cursor:zoom-in;box-shadow:0 2px 8px rgba(0,0,0,.1); }
.mi img { width:100%;height:auto;min-height:80px;background:#c8d8c0;transition:transform .5s; }
@media(hover:hover){ .mi:hover img { transform:scale(1.05); } }
.mi .ov { position:absolute;inset:0;background:linear-gradient(to top,rgba(2,13,6,.88) 0%,transparent 55%);opacity:0;transition:opacity .35s;display:flex;flex-direction:column;justify-content:flex-end;padding:9px; }
@media(hover:hover){ .mi:hover .ov { opacity:1; } }

/* ── Skeleton ── */
.skel { border-radius:8px;break-inside:avoid;margin-bottom:8px;background:linear-gradient(110deg,#d0cabb 30%,#e0d8c8 50%,#d0cabb 70%);background-size:200% 100%;animation:skelP 1.4s ease infinite; }

/* ── Trip row ── */
.tr  { display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:8px;transition:background .2s;border:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.03); }
@media(hover:hover){ .tr:hover { background:rgba(123,200,67,.06);border-color:rgba(123,200,67,.16); } }

/* ── Status chips ── */
.ok    { background:rgba(123,200,67,.13);color:var(--lime);border:1px solid rgba(123,200,67,.28); }
.cheio { background:rgba(244,160,32,.13);color:var(--amber);border:1px solid rgba(244,160,32,.28); }
.indis { background:rgba(255,255,255,.05);color:rgba(255,255,255,.28);border:1px solid rgba(255,255,255,.08); }
.breve { background:rgba(180,150,255,.1);color:#b09ef0;border:1px solid rgba(180,150,255,.22); }

/* ── Responsive layout ── */
.ctr   { max-width:1200px;margin:0 auto;padding:0 18px; }
@media(min-width:640px){ .ctr { padding:0 28px; } }

.g2    { display:grid;grid-template-columns:1fr;gap:36px; }
@media(min-width:860px){ .g2 { grid-template-columns:1fr 1fr;align-items:center; } }

.gcal  { display:grid;grid-template-columns:1fr;gap:24px; }
@media(min-width:860px){ .gcal { grid-template-columns:1fr 1.4fr;align-items:start; } }

.g4    { display:grid;grid-template-columns:1fr;gap:12px; }
@media(min-width:560px){ .g4 { grid-template-columns:1fr 1fr; } }
@media(min-width:900px){ .g4 { grid-template-columns:repeat(4,1fr); } }

.gfoot { display:grid;grid-template-columns:1fr;gap:24px; }
@media(min-width:560px){ .gfoot { grid-template-columns:1fr 1fr; } }
@media(min-width:900px){ .gfoot { grid-template-columns:2fr 1fr 1fr 1fr; } }

/* ── Video ── */
.vc  { position:relative;padding-bottom:56.25%;border-radius:10px;overflow:hidden;box-shadow:0 14px 48px rgba(0,0,0,.5); }
.vc iframe { position:absolute;inset:0;width:100%;height:100%;border:0; }

/* ── Filter pills scroll ── */
.pills { display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch;scrollbar-width:none; }
.pills::-webkit-scrollbar { display:none; }
.pill  { padding:7px 14px;border-radius:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;border:none;white-space:nowrap;flex-shrink:0;min-height:38px;transition:all .2s; }

/* ── CTAs stacked on mobile ── */
.ctarow { display:flex;gap:10px;flex-wrap:wrap; }
@media(max-width:560px){ .ctarow { flex-direction:column; } .ctarow > * { width:100%; } }

/* ── Form card ── */
.formcard { background:rgba(255,255,255,.04);border:1px solid rgba(123,200,67,.13);border-radius:14px;padding:24px 20px; }
@media(min-width:640px){ .formcard { padding:28px 26px; } }

/* ── Scrollbar thin ── */
::-webkit-scrollbar { width:3px; }
::-webkit-scrollbar-track { background:var(--forest); }
::-webkit-scrollbar-thumb { background:var(--fern);border-radius:2px; }

/* ── Footer links ── */
.fl  { color:rgba(255,255,255,.3);text-decoration:none;font-size:13px;transition:color .2s; }
.fl:hover { color:var(--lime); }

/* ── Hero bg section ── */
.hero-scan { position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(123,200,67,.3),transparent);animation:scan 8s linear infinite;pointer-events:none; }
`;

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [menu,    setMenu]    = useState(false);
  const [scrolled,setScrolled]= useState(false);
  const [fotos,   setFotos]   = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [fonte,   setFonte]   = useState<'wikiaves'|'json'>('json');
  const [prog,    setProg]    = useState(0);
  const [lb,      setLb]      = useState<number|null>(null);
  const [esp,     setEsp]     = useState('');

  const openLb  = useCallback((i: number) => { setLb(i); document.body.style.overflow = 'hidden'; }, []);
  const closeLb = useCallback(() => { setLb(null); document.body.style.overflow = ''; }, []);
  const prevLb  = useCallback(() => setLb(i => i !== null ? (i - 1 + fotos.length) % fotos.length : null), [fotos.length]);
  const nextLb  = useCallback(() => setLb(i => i !== null ? (i + 1) % fotos.length : null), [fotos.length]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (lb === null) return;
      if (e.key === 'Escape')      closeLb();
      if (e.key === 'ArrowLeft')   prevLb();
      if (e.key === 'ArrowRight')  nextLb();
    };
      window.addEventListener('keydown', fn);
      return () => window.removeEventListener('keydown', fn);
  }, [lb, closeLb, prevLb, nextLb]);

  useEffect(() => {
    let cancelled = false;
    fetchFotos(n => { if (!cancelled) setProg(n); })
    .then(r  => { if (!cancelled && r.length) { setFotos(r); setFonte('wikiaves'); } })
    .catch(() => { if (!cancelled) setFotos([...uniqueFromJson].sort(() => .5 - Math.random())); })
    .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered  = useMemo(() => esp ? fotos.filter(f => f.titulo === esp) : fotos, [fotos, esp]);
  const destaque  = useMemo(() => {
    if (!fotos.length) return [];
    return [...allSpecies].sort(() => .5 - Math.random()).slice(0, 6)
    .map(e => ({ e, f: fotos.find(x => x.titulo === e) }))
    .filter(x => x.f) as { e: string; f: Foto }[];
  }, [fotos]);

  const nav = [
    { n:'Sobre', h:'#sobre' }, { n:'YouTube', h:'#youtube' },
    { n:'Expedições', h:'#exp' }, { n:'Cursos', h:'#cursos' },
    { n:'Galeria', h:'#galeria' }, { n:'Contato', h:'#contato' },
  ];

  const sec = (bg: string): React.CSSProperties => ({ padding:'68px 0', background: bg, position:'relative', overflow:'hidden' });

  /* ── RENDER ── */
  return (
    <div style={{ background:'var(--paper)', fontFamily:"'DM Sans',system-ui,sans-serif", overflowX:'hidden' }}>
    <style>{CSS}</style>

    {/* ── WhatsApp FAB ──────────────────────────────────────────────────── */}
    <a href={L.whatsapp} target="_blank" rel="noopener noreferrer" className="wafab" aria-label="Falar no WhatsApp">
    <MessageCircle size={26} color="white" fill="white"/>
    </a>

    {/* ── NAV ───────────────────────────────────────────────────────────── */}
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, transition:'all .4s', padding: scrolled ? '10px 0' : '16px 0', background: scrolled ? 'rgba(2,13,6,.97)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(123,200,67,.09)' : 'none' }}>
    <div className="ctr" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>

    {/* Logo */}
    <button onClick={() => window.scrollTo({ top:0, behavior:'smooth' })} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', minWidth:0, padding:0 }}>
    <Logo size={36}/>
    <div style={{ textAlign:'left', minWidth:0 }}>
    <div style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:15, color:'white', lineHeight:1, letterSpacing:'.05em', whiteSpace:'nowrap' }}>
    IBFN · <span className="tl" style={{ fontFamily:'inherit' }}>Thiago Tolêdo</span>
    </div>
    </div>
    </button>

    {/* Desktop links */}
    <div id="deskLinks" style={{ display:'none', alignItems:'center', gap:22 }}>
    {nav.map(l => <a key={l.n} href={l.h} className="na">{l.n}</a>)}
    <a href="#contato" className="bl" style={{ padding:'8px 16px', fontSize:10, borderRadius:6 }}>Reservar Vaga</a>
    </div>
    <style>{`@media(min-width:900px){#deskLinks{display:flex!important} #mobMenuBtn{display:none!important}}`}</style>

    {/* Mobile hamburger */}
    <button id="mobMenuBtn" onClick={() => setMenu(!menu)} aria-label="Menu" style={{ width:42, height:42, display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid rgba(123,200,67,.22)', borderRadius:8, cursor:'pointer', color:'white', flexShrink:0 }}>
    {menu ? <X size={20}/> : <Menu size={20}/>}
    </button>
    </div>

    {/* Mobile menu drawer */}
    {menu && (
      <div style={{ background:'rgba(2,13,6,.99)', borderTop:'1px solid rgba(123,200,67,.1)', padding:'16px 18px 24px' }}>
      {nav.map(l => (
        <a key={l.n} href={l.h} onClick={() => setMenu(false)} style={{ display:'flex', alignItems:'center', padding:'14px 0', fontSize:13, fontWeight:700, color:'rgba(255,255,255,.72)', textDecoration:'none', letterSpacing:'.14em', textTransform:'uppercase', borderBottom:'1px solid rgba(255,255,255,.04)' }}>{l.n}</a>
      ))}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:18 }}>
      <a href="#contato" className="bl" onClick={() => setMenu(false)}>Reservar vaga</a>
      <a href={L.whatsapp} target="_blank" rel="noopener noreferrer" className="bwa" onClick={() => setMenu(false)}><MessageCircle size={15}/> WhatsApp (85) 99926-0902</a>
      </div>
      </div>
    )}
    </nav>

    {/* ── HERO ──────────────────────────────────────────────────────────── */}
    <section style={{ position:'relative', minHeight:'100svh', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
    {/* BG */}
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(158deg,#020d06 0%,#0a1e0e 35%,#061510 65%,#020d06 100%)' }}/>
    {/* 4 light shafts */}
    {[14,31,52,73].map((l, i) => (
      <div key={i} style={{ position:'absolute', top:0, bottom:0, left:`${l}%`, width:'1.5px', background:`linear-gradient(to bottom,rgba(123,200,67,.07) 0%,transparent 65%)`, animation:`shaft ${9+i*2}s ease-in-out ${i*1.3}s infinite` }}/>
    ))}
    {/* Fireflies */}
    {[...Array(14)].map((_,i) => (
      <div key={i} style={{ position:'absolute', left:`${(i*73+11)%94}%`, top:`${(i*47+19)%78}%`, width:3, height:3, borderRadius:'50%', background:i%3===0?'rgba(123,200,67,.9)':'rgba(168,224,99,.55)', boxShadow:`0 0 ${5+(i%4)*3}px rgba(123,200,67,.4)`, animation:`firefly ${3+(i%4)}s ${-(i*.55)%3}s ease-in-out infinite` }}/>
    ))}
    {/* Flying bird silhouette */}
    <div style={{ position:'absolute', top:'20%', opacity:.14, animation:'birdfly 24s linear infinite' }}>
    <svg width="64" height="28" viewBox="0 0 64 28"><path d="M0 14 Q16 3 32 10 Q48 3 64 14 Q48 8 32 11 Q16 8 0 14Z" fill="white"/></svg>
    </div>
    <div className="hero-scan"/>

    <div className="ctr" style={{ position:'relative', zIndex:2, paddingTop:96, paddingBottom:64, textAlign:'center', width:'100%' }}>
    <div className="ai" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 13px', borderRadius:4, marginBottom:22, border:'1px solid rgba(123,200,67,.26)', background:'rgba(123,200,67,.07)', color:'var(--lime)', fontSize:9, fontWeight:700, letterSpacing:'.24em', textTransform:'uppercase' }}>
    <Leaf size={10}/> Instituto Brasileiro de Fotografia de Natureza · Brasília DF
    </div>

    <div className="au d1" style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
    <div style={{ position:'relative', display:'inline-block' }}>
    <Logo size={76}/>
    <div style={{ position:'absolute', inset:-10, borderRadius:'50%', border:'1px solid rgba(123,200,67,.1)', pointerEvents:'none' }}/>
    </div>
    </div>

    <div className="au d2">
    <h1 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(40px,10vw,92px)', lineHeight:.9, color:'white', letterSpacing:'.04em', marginBottom:4 }}>
    IBFN <span className="tl" style={{ fontFamily:'inherit' }}>·</span> THIAGO TOLÊDO
    </h1>
    <div style={{ fontSize:9, color:'rgba(123,200,67,.4)', letterSpacing:'.3em', textTransform:'uppercase', marginBottom:22 }}>
    @passarinhadapro · Brasília, DF · CNPJ 41.666.060/0001-25
    </div>
    </div>

    <div className="au d3">
    <div style={{ width:42, height:2, background:'var(--lime)', margin:'0 auto 14px', borderRadius:1 }}/>
    <p style={{ fontFamily:"'Lora',serif", fontSize:'clamp(17px,3.8vw,32px)', lineHeight:1.38, fontWeight:400, color:'rgba(255,255,255,.92)', marginBottom:7 }}>Piloto de avião por profissão.</p>
    <p style={{ fontFamily:"'Lora',serif", fontSize:'clamp(17px,3.8vw,32px)', lineHeight:1.38, fontWeight:600, fontStyle:'italic', marginBottom:18 }}>
    <span className="ta">Fotógrafo de natureza</span>{' '}
    <span style={{ color:'rgba(255,255,255,.9)' }}>de coração.</span>
    </p>
    <p className="au d4" style={{ fontSize:'clamp(13px,2vw,15px)', color:'rgba(255,255,255,.45)', maxWidth:460, margin:'0 auto 30px', lineHeight:1.9, fontWeight:300 }}>
    Expedições fotográficas pelo Brasil e pelo mundo, cursos avançados e o maior canal de birdwatching para fotógrafos do país.
    </p>
    </div>

    <div className="au d5 ctarow" style={{ justifyContent:'center', marginBottom:42 }}>
    <a href="#exp" className="bl"><MapPin size={15}/> Expedições 2026</a>
    <a href={L.youtube} target="_blank" rel="noopener noreferrer" className="byt"><Youtube size={15}/> Canal YouTube</a>
    </div>

    {/* Stats bar */}
    <div className="au d6" style={{ display:'inline-grid', gridTemplateColumns:'repeat(4,1fr)', borderRadius:8, overflow:'hidden', border:'1px solid rgba(123,200,67,.11)', background:'rgba(255,255,255,.03)', backdropFilter:'blur(10px)', width:'100%', maxWidth:460 }}>
    {[{v:'3,58K',l:'Inscritos'},{v:'155',l:'Vídeos'},{v:'1.004',l:'Fotos'},{v:'487',l:'Espécies'}].map((s,i) => (
      <div key={i} style={{ padding:'11px 8px', textAlign:'center', borderRight:i<3?'1px solid rgba(123,200,67,.09)':'none' }}>
      <div style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(16px,3.5vw,21px)', color:'var(--lime)', lineHeight:1 }}>{s.v}</div>
      <div style={{ fontSize:8, color:'rgba(255,255,255,.28)', textTransform:'uppercase', letterSpacing:'.12em', marginTop:3 }}>{s.l}</div>
      </div>
    ))}
    </div>
    </div>

    <div style={{ position:'absolute', bottom:18, left:'50%', transform:'translateX(-50%)', color:'rgba(123,200,67,.36)' }}>
    <ChevronDown size={24} style={{ animation:'bhover 2.6s ease-in-out infinite' }}/>
    </div>
    </section>

    {/* ── PRESS BAR ─────────────────────────────────────────────────────── */}
    <div style={{ background:'var(--deep)', borderBottom:'1px solid rgba(123,200,67,.07)', padding:'9px 0' }}>
    <div className="ctr" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, flexWrap:'wrap' }}>
    <span style={{ fontSize:9, color:'rgba(255,255,255,.24)', textTransform:'uppercase', letterSpacing:'.2em', fontWeight:700 }}>Destaque em:</span>
    {PRESS.map((p,i) => (
      <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:4, background:'rgba(123,200,67,.07)', border:'1px solid rgba(123,200,67,.18)', fontSize:10, fontWeight:700, color:'var(--lime)', textDecoration:'none' }}>
      <Award size={9}/> {p.name}
      </a>
    ))}
    <a href={L.wikiaves} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:4, background:'rgba(86,171,47,.07)', border:'1px solid rgba(86,171,47,.2)', fontSize:10, fontWeight:700, color:'#80CC60', textDecoration:'none' }}>
    <Camera size={9}/> WikiAves · 1.004 fotos
    </a>
    </div>
    </div>

    {/* ── SOBRE ─────────────────────────────────────────────────────────── */}
    <section id="sobre" style={sec('white')}>
    <div className="ctr">
    <div className="g2">
    {/* Video */}
    <div className="au" style={{ position:'relative' }}>
    <div className="vc" style={{ border:'1px solid rgba(123,200,67,.1)' }}>
    <iframe src="https://www.youtube.com/embed/aT_AdCzoHpM?start=6" title="Thiago Tolêdo IBFN" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
    </div>
    {/* Floating badge */}
    <div style={{ position:'absolute', bottom:-16, right:8, zIndex:2, display:'flex', alignItems:'center', gap:8, padding:'9px 13px', borderRadius:10, boxShadow:'0 10px 32px rgba(2,13,6,.3)', background:'var(--deep)', color:'white', border:'1px solid rgba(123,200,67,.14)' }}>
    <Logo size={26}/>
    <div>
    <div style={{ fontSize:8, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.14em' }}>IBFN fundado</div>
    <div style={{ fontWeight:800, fontSize:12 }}>22/04/2021</div>
    </div>
    </div>
    </div>

    {/* Text */}
    <div className="au d2">
    <div className="sl"><span style={{ fontSize:10, fontWeight:700, color:'var(--fern)', textTransform:'uppercase', letterSpacing:'.26em' }}>Minha história</span></div>
    <h2 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(36px,7vw,52px)', color:'var(--forest)', lineHeight:.95, marginBottom:16, letterSpacing:'.03em' }}>
    DO COCKPIT<br/>
    <span style={{ background:'linear-gradient(90deg,#7BC843,#56AB2F)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>À MATA.</span>
    </h2>
    <p style={{ fontSize:15, lineHeight:1.9, color:'var(--mid)', marginBottom:13 }}>
    Piloto comercial há mais de 15 anos, Thiago Tolêdo é fundador e a cara do <strong style={{ color:'var(--forest)' }}>IBFN</strong>. Do Cerrado do DF ao Pantanal, da Amazônia ao Panamá — sempre com a câmera como copiloto.
    </p>
    <p style={{ fontSize:15, lineHeight:1.9, color:'var(--mid)', marginBottom:20 }}>
    <strong style={{ color:'var(--forest)' }}>1.004 fotos e 487 espécies no WikiAves</strong>. Canon 7D MK II + 300mm F4.
    </p>

    <div style={{ padding:'14px 16px 14px 20px', borderRadius:8, marginBottom:22, background:'linear-gradient(135deg,rgba(123,200,67,.06),rgba(86,171,47,.02))', borderLeft:'3px solid var(--lime)' }}>
    <p style={{ fontSize:14, lineHeight:1.85, fontStyle:'italic', color:'var(--mid)' }}>"Eu sou piloto de avião por profissão e fotógrafo de natureza de coração."</p>
    <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:8 }}>
    <div style={{ height:1, width:18, background:'var(--lime)' }}/>
    <span style={{ fontSize:9, fontWeight:700, color:'var(--soft)', textTransform:'uppercase', letterSpacing:'.16em' }}>Thiago Tolêdo · IBFN</span>
    </div>
    </div>

    <div className="ctarow">
    <a href={L.youtube} target="_blank" rel="noopener noreferrer" className="byt" style={{ fontSize:11, padding:'10px 16px' }}><Youtube size={13}/> YouTube</a>
    <a href={L.instagram} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 16px', borderRadius:8, border:'1.5px solid rgba(193,53,132,.4)', color:'#c13584', fontWeight:700, fontSize:11, letterSpacing:'.14em', textTransform:'uppercase', textDecoration:'none', minHeight:44 }}><Instagram size={13}/> @thiago.t.silva</a>
    </div>
    </div>
    </div>
    </div>
    </section>

    {/* ── STATS ─────────────────────────────────────────────────────────── */}
    <section style={{ padding:'44px 0', background:'linear-gradient(135deg,var(--forest),var(--deep),#071510)', borderTop:'1px solid rgba(123,200,67,.08)' }}>
    <div className="ctr">
    <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }} id="sgrid">
    <style>{`@media(min-width:640px){#sgrid{grid-template-columns:repeat(5,1fr)!important}}`}</style>
    {[{v:'3,58K',l:'Inscritos YouTube'},{v:'261K',l:'Visualizações'},{v:'155',l:'Vídeos'},{v:'1.004',l:'Fotos WikiAves'},{v:'487',l:'Espécies'}].map((s,i) => (
      <Stat key={i} v={s.v} l={s.l}/>
    ))}
    </div>
    </div>
    </section>

    {/* ── YOUTUBE ───────────────────────────────────────────────────────── */}
    <section id="youtube" style={sec('linear-gradient(180deg,var(--forest) 0%,#061008 100%)')}>
    <div style={{ position:'absolute', top:-40, right:-40, width:300, height:300, borderRadius:'50%', background:'rgba(255,0,0,.04)', filter:'blur(70px)', pointerEvents:'none' }}/>
    <div className="ctr" style={{ position:'relative', zIndex:1 }}>
    <div style={{ marginBottom:32 }}>
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
    <div style={{ width:44, height:44, borderRadius:'50%', background:'#FF0000', display:'flex', alignItems:'center', justifyContent:'center', animation:'ytPulse 3s ease-in-out infinite', flexShrink:0 }}>
    <Youtube size={19} color="white"/>
    </div>
    <div>
    <div style={{ fontSize:9, color:'rgba(255,255,255,.26)', textTransform:'uppercase', letterSpacing:'.2em' }}>Canal no YouTube</div>
    <div style={{ fontSize:13, color:'white', fontWeight:700, marginTop:1 }}>PassarinhadaPRO · IBFN · Thiago Tolêdo</div>
    </div>
    </div>
    <h2 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(30px,7vw,58px)', color:'white', lineHeight:.92, marginBottom:8, letterSpacing:'.03em' }}>
    CONTEÚDO GRATUITO<br/><span className="tl" style={{ fontFamily:'inherit' }}>TODA SEMANA.</span>
    </h2>
    <p style={{ fontSize:13, color:'rgba(255,255,255,.4)', maxWidth:420, lineHeight:1.85 }}>Técnica, expedições, reviews e crítica de fotos ao vivo. O carro-chefe da comunidade IBFN.</p>
    </div>
    <div className="g2">
    <div className="vc au" style={{ border:'1px solid rgba(123,200,67,.09)' }}>
    <iframe src="https://www.youtube.com/embed/aT_AdCzoHpM" title="PassarinhadaPRO" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
    </div>
    <div className="au d2" style={{ display:'flex', flexDirection:'column', gap:8 }}>
    {[{t:'Reviews de Equipamento',v:'12',c:'var(--lime)'},{t:'Dicas & Tutoriais',v:'120',c:'var(--amber)'},{t:'Vlogs de Expedição',v:'45',c:'#80CCFF'},{t:'Lives & Crítica de Fotos',v:'18',c:'#e07070'}].map((c,i) => (
      <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 13px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)' }}>
      <div style={{ width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:`${c.c}14`, color:c.c }}><Camera size={14}/></div>
      <div style={{ flex:1, minWidth:0 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:6 }}>
      <span style={{ color:'white', fontWeight:700, fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.t}</span>
      <span style={{ fontWeight:800, fontSize:11, color:c.c, flexShrink:0 }}>{c.v}</span>
      </div>
      </div>
      </div>
    ))}
    <a href={L.youtube} target="_blank" rel="noopener noreferrer" className="byt" style={{ marginTop:4 }}><Bell size={13}/> Inscrever-se</a>
    </div>
    </div>
    </div>
    </section>

    {/* ── EXPEDIÇÕES ────────────────────────────────────────────────────── */}
    <section id="exp" style={sec('linear-gradient(180deg,#071510 0%,var(--deep) 100%)')}>
    <div style={{ position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', background:'rgba(123,200,67,.04)', filter:'blur(110px)', pointerEvents:'none' }}/>
    <div className="ctr" style={{ position:'relative', zIndex:1 }}>
    <div style={{ marginBottom:36 }}>
    <div className="sl"><span style={{ fontSize:10, fontWeight:700, color:'var(--lime)', textTransform:'uppercase', letterSpacing:'.26em' }}>IBFN Trips Fotográficas</span></div>
    <h2 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(34px,8vw,60px)', color:'white', lineHeight:.92, marginBottom:8, letterSpacing:'.03em' }}>
    EXPEDIÇÕES<br/><span className="tl" style={{ fontFamily:'inherit' }}>2026</span>
    </h2>
    <p style={{ fontSize:13, color:'rgba(255,255,255,.4)', fontStyle:'italic', lineHeight:1.75 }}>Menos espécies. Mais tempo. Mais qualidade.</p>
    </div>

    <div className="gcal">
    {/* Calendário */}
    <div style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(123,200,67,.1)', borderRadius:12, padding:'20px 16px' }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
    <Calendar size={16} color="var(--lime)"/>
    <span style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:17, color:'white', letterSpacing:'.05em' }}>CALENDÁRIO 2026</span>
    </div>
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
    {TRIPS.map((t,i) => (
      <div key={i} className="tr">
      <div style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:13, color:'var(--lime)', letterSpacing:'.04em', minWidth:26, flexShrink:0 }}>{t.mes}</div>
      <div style={{ flex:1, fontSize:11, color:t.s==='indis'?'rgba(255,255,255,.26)':'rgba(255,255,255,.8)', fontWeight:t.s==='ok'?600:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0 }}>{t.dest}</div>
      <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', padding:'2px 7px', borderRadius:4, flexShrink:0 }} className={t.s}>
      {t.s==='ok'?'Vagas':t.s==='cheio'?'Lotado':t.s==='breve'?'Em breve':'—'}
      </span>
      </div>
    ))}
    </div>
    <div style={{ marginTop:14, padding:'11px 13px', borderRadius:8, background:'rgba(123,200,67,.05)', border:'1px solid rgba(123,200,67,.09)', fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.65 }}>Tour privativo disponível. Consulte datas e destinos exclusivos.</div>
    <a href={L.whatsapp} target="_blank" rel="noopener noreferrer" className="bwa" style={{ width:'100%', marginTop:12, fontSize:11 }}>
    <MessageCircle size={14}/> (85) 99926-0902
    </a>
    </div>

    {/* Expedition cards */}
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
    {/* Panamá */}
    <div className="hov" style={{ borderRadius:12, overflow:'hidden', background:'rgba(255,255,255,.04)', border:'1px solid rgba(45,122,62,.28)' }}>
    <div style={{ padding:'18px 18px 14px', background:'linear-gradient(135deg,rgba(45,122,62,.2),rgba(45,122,62,.05))' }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, flexWrap:'wrap' }}>
    <div>
    <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.18em', marginBottom:3 }}>IBFN International Trips</div>
    <h3 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(19px,4.5vw,24px)', color:'white', lineHeight:.96, letterSpacing:'.03em' }}>🇵🇦 Expedição Panamá</h3>
    </div>
    <div style={{ textAlign:'right', flexShrink:0 }}>
    <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.12em' }}>Investimento</div>
    <div style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:18, color:'var(--lime)', lineHeight:1 }}>Consultar</div>
    </div>
    </div>
    </div>
    <div style={{ padding:'14px 18px 18px' }}>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
    {[{i:<Calendar size={11}/>,t:'11–19/abr · 9 dias, 8 noites'},{i:<Users size={11}/>,t:'Apenas 8 participantes'},{i:<MapPin size={11}/>,t:'Cidade do Panamá · PTY'},{i:<Mountain size={11}/>,t:'Canal · Montanhas · Caribe'}].map((d,j) => (
      <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:6 }}>
      <div style={{ color:'var(--lime)', flexShrink:0, marginTop:1 }}>{d.i}</div>
      <span style={{ fontSize:11, color:'rgba(255,255,255,.58)', lineHeight:1.45 }}>{d.t}</span>
      </div>
    ))}
    </div>
    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:13 }}>
    {['Voo interno incluso','Transporte','Pensão completa','Guia local'].map(e => (
      <span key={e} style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, color:'rgba(255,255,255,.6)', padding:'3px 8px', borderRadius:4, background:'rgba(45,122,62,.13)', border:'1px solid rgba(45,122,62,.24)' }}>
      <CheckCircle2 size={8} color="#7BC843"/> {e}
      </span>
    ))}
    </div>
    <a href={L.whatsapp} target="_blank" rel="noopener noreferrer" className="bwa" style={{ fontSize:11, padding:'11px 16px' }}><MessageCircle size={13}/> Reservar vaga</a>
    </div>
    </div>

    {/* Mata Atlântica */}
    <div className="hov" style={{ borderRadius:12, overflow:'hidden', background:'rgba(255,255,255,.04)', border:'1px solid rgba(90,138,46,.28)' }}>
    <div style={{ padding:'18px 18px 14px', background:'linear-gradient(135deg,rgba(90,138,46,.2),rgba(90,138,46,.05))' }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, flexWrap:'wrap' }}>
    <div>
    <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.18em', marginBottom:3 }}>IBFN Trips Fotográficas</div>
    <h3 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(19px,4.5vw,24px)', color:'white', lineHeight:.96, letterSpacing:'.03em' }}>🦜 Aves da Mata Atlântica</h3>
    </div>
    <div style={{ textAlign:'right', flexShrink:0 }}>
    <div style={{ fontSize:9, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.12em' }}>A partir de</div>
    <div style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:18, color:'var(--lime)', lineHeight:1 }}>R$ 9.599</div>
    <div style={{ fontSize:9, color:'rgba(255,255,255,.26)' }}>por pessoa</div>
    </div>
    </div>
    </div>
    <div style={{ padding:'14px 18px 18px' }}>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
    {[{i:<Calendar size={11}/>,t:'Mai 23-29 · Jun 8-14 · Jul 18-24'},{i:<Users size={11}/>,t:'Apenas 3 participantes'},{i:<MapPin size={11}/>,t:'São Paulo (GRU)'},{i:<Mountain size={11}/>,t:'Duco · Trilha dos Tucanos · Macuquinho'}].map((d,j) => (
      <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:6 }}>
      <div style={{ color:'var(--lime)', flexShrink:0, marginTop:1 }}>{d.i}</div>
      <span style={{ fontSize:11, color:'rgba(255,255,255,.58)', lineHeight:1.45 }}>{d.t}</span>
      </div>
    ))}
    </div>
    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:13 }}>
    {['SUV incluso','Quarto single','Pensão completa','Lodges exclusivos'].map(e => (
      <span key={e} style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, color:'rgba(255,255,255,.6)', padding:'3px 8px', borderRadius:4, background:'rgba(90,138,46,.13)', border:'1px solid rgba(90,138,46,.24)' }}>
      <CheckCircle2 size={8} color="#7BC843"/> {e}
      </span>
    ))}
    </div>
    <a href={L.whatsapp} target="_blank" rel="noopener noreferrer" className="bwa" style={{ fontSize:11, padding:'11px 16px' }}><MessageCircle size={13}/> Reservar vaga</a>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>

    {/* ── IMPRENSA ──────────────────────────────────────────────────────── */}
    <section style={sec('white')}>
    <div className="ctr">
    <div style={{ textAlign:'center', marginBottom:32 }}>
    <div className="sl" style={{ justifyContent:'center' }}><span style={{ fontSize:10, fontWeight:700, color:'var(--fern)', textTransform:'uppercase', letterSpacing:'.26em' }}>Autoridade</span></div>
    <h2 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(26px,6vw,46px)', color:'var(--forest)', lineHeight:.96, marginTop:7, letterSpacing:'.03em' }}>NA IMPRENSA</h2>
    </div>
    <div className="g2" style={{ gap:16, alignItems:'stretch' }}>
    {PRESS.map((p,i) => (
      <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="hov" style={{ display:'flex', flexDirection:'column', borderRadius:12, overflow:'hidden', textDecoration:'none', background:'var(--paper)', border:'1px solid rgba(123,200,67,.1)', boxShadow:'0 4px 18px rgba(2,13,6,.07)' }}>
      <div style={{ height:165, overflow:'hidden', position:'relative' }}>
      <img src={p.img} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s' }} loading="lazy"/>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(2,13,6,.82) 0%,transparent 50%)' }}/>
      <div style={{ position:'absolute', bottom:10, left:13 }}>
      <span style={{ display:'inline-block', padding:'3px 9px', borderRadius:4, fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'.13em', background:'var(--lime)', color:'var(--forest)' }}>{p.name}</span>
      <div style={{ color:'rgba(255,255,255,.42)', fontSize:9, marginTop:3 }}>{p.date}</div>
      </div>
      </div>
      <div style={{ padding:'16px 18px', flex:1, display:'flex', flexDirection:'column' }}>
      <Quote size={17} style={{ color:'var(--lime)', opacity:.28, marginBottom:8 }}/>
      <p style={{ fontFamily:"'Lora',serif", fontSize:14, lineHeight:1.68, fontStyle:'italic', color:'var(--moss)', flex:1, marginBottom:13 }}>"{p.quote}"</p>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--parch)', paddingTop:11 }}>
      <span style={{ fontSize:9, color:'var(--soft)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.13em' }}>{p.author}</span>
      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, color:'var(--fern)' }}>Ler <ArrowRight size={10}/></span>
      </div>
      </div>
      </a>
    ))}
    </div>
    </div>
    </section>

    {/* ── ESPÉCIES DESTAQUE ─────────────────────────────────────────────── */}
    {!loading && destaque.length > 0 && (
      <section style={{ padding:'52px 0', background:'var(--cream)' }}>
      <div className="ctr">
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:8 }}>
      <div>
      <div className="sl"><span style={{ fontSize:10, fontWeight:700, color:'var(--fern)', textTransform:'uppercase', letterSpacing:'.24em' }}>Portfólio WikiAves</span></div>
      <h2 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(20px,5vw,36px)', color:'var(--forest)', lineHeight:.95, marginTop:4, letterSpacing:'.03em' }}>ESPÉCIES EM DESTAQUE</h2>
      </div>
      <a href="#galeria" style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'var(--fern)', textDecoration:'none' }}>Ver galeria <ArrowRight size={12}/></a>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7 }} id="dg">
      <style>{`@media(min-width:560px){#dg{grid-template-columns:repeat(6,1fr)!important}}`}</style>
      {destaque.map(({ e, f }, i) => (
        <div key={e} style={{ aspectRatio:'1', borderRadius:9, overflow:'hidden', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,.1)', position:'relative' }}
        onClick={() => { const fi = fotos.indexOf(f); openLb(fi >= 0 ? fi : 0); }}>
        <img src={f.url} alt={e} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s' }} loading="lazy"/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(2,13,6,.85) 0%,transparent 55%)', opacity:0, transition:'opacity .35s', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:7 }}
        onMouseEnter={ev => (ev.currentTarget.style.opacity='1')} onMouseLeave={ev => (ev.currentTarget.style.opacity='0')}>
        <p style={{ color:'white', fontSize:10, fontWeight:700, textTransform:'capitalize' }}>{e}</p>
        </div>
        </div>
      ))}
      </div>
      </div>
      </section>
    )}

    {/* ── CURSOS ────────────────────────────────────────────────────────── */}
    <section id="cursos" style={sec('linear-gradient(180deg,var(--forest) 0%,var(--deep) 100%)')}>
    <div className="ctr" style={{ position:'relative', zIndex:1 }}>
    <div style={{ marginBottom:32 }}>
    <div className="sl"><span style={{ fontSize:10, fontWeight:700, color:'var(--lime)', textTransform:'uppercase', letterSpacing:'.26em' }}>Academia IBFN</span></div>
    <h2 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(30px,7vw,54px)', color:'white', lineHeight:.92, marginBottom:8, letterSpacing:'.03em' }}>
    CURSOS<br/><span className="tl" style={{ fontFamily:'inherit' }}>NA HOTMART</span>
    </h2>
    <p style={{ fontSize:13, color:'rgba(255,255,255,.4)', maxWidth:400, lineHeight:1.85 }}>4 cursos com acesso vitalício. Do iniciante ao avançado.</p>
    </div>
    <div className="g4">
    {CURSOS.map((c,i) => (
      <div key={i} className="hov" style={{ padding:'20px 18px', borderRadius:12, background:c.hot?'linear-gradient(135deg,rgba(123,200,67,.1),rgba(86,171,47,.03))':'rgba(255,255,255,.04)', border:c.hot?'1px solid rgba(123,200,67,.28)':'1px solid rgba(255,255,255,.07)' }}>
      {c.hot && <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'2px 8px', borderRadius:4, fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'.12em', marginBottom:10, background:'rgba(123,200,67,.13)', color:'var(--lime)', border:'1px solid rgba(123,200,67,.22)' }}><Star size={9}/> Mais vendido</div>}
      <div style={{ width:38, height:38, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:11, background:c.hot?'rgba(123,200,67,.15)':'rgba(255,255,255,.07)', color:c.hot?'var(--lime)':'rgba(255,255,255,.4)' }}><Camera size={18}/></div>
      <div style={{ display:'inline-block', padding:'2px 7px', borderRadius:4, fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', marginBottom:9, background:c.hot?'rgba(123,200,67,.12)':'rgba(168,224,99,.09)', color:c.hot?'var(--lime)':'#80CC60', border:`1px solid ${c.hot?'rgba(123,200,67,.22)':'rgba(168,224,99,.2)'}`}}>{c.tag}</div>
      <h3 style={{ fontFamily:"'Lora',serif", color:'white', fontSize:14, fontWeight:400, margin:'0 0 2px' }}>{c.t}</h3>
      <p style={{ color:'rgba(255,255,255,.3)', fontSize:10, marginBottom:8, fontStyle:'italic' }}>{c.sub}</p>
      <p style={{ color:'rgba(255,255,255,.42)', fontSize:12, lineHeight:1.7, marginBottom:12 }}>{c.d}</p>
      <div style={{ display:'flex', alignItems:'center', gap:5, color:c.hot?'var(--lime)':'rgba(255,255,255,.35)', fontWeight:700, fontSize:10, letterSpacing:'.12em', textTransform:'uppercase' }}>Quero aprender <ArrowRight size={10}/></div>
      </div>
    ))}
    </div>
    <div style={{ marginTop:22, padding:'14px 16px', borderRadius:8, background:'rgba(123,200,67,.05)', border:'1px solid rgba(123,200,67,.11)', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
    <Zap size={16} color="var(--lime)" style={{ flexShrink:0 }}/>
    <div style={{ flex:1, minWidth:160 }}>
    <p style={{ color:'white', fontWeight:700, fontSize:12, marginBottom:2 }}>Em breve: Área de Membros com todos os cursos + conteúdo exclusivo</p>
    <p style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>Seguidores do YouTube e Instagram terão acesso antecipado.</p>
    </div>
    <a href="#contato" className="bl" style={{ fontSize:10, padding:'8px 14px', whiteSpace:'nowrap' }}>Saiba mais</a>
    </div>
    </div>
    </section>

    {/* ── GALERIA ───────────────────────────────────────────────────────── */}
    <section id="galeria" style={{ padding:'68px 0', background:'var(--paper)' }}>
    <div className="ctr">
    <div style={{ textAlign:'center', marginBottom:24 }}>
    <div className="sl" style={{ justifyContent:'center' }}><span style={{ fontSize:10, fontWeight:700, color:'var(--fern)', textTransform:'uppercase', letterSpacing:'.26em' }}>Portfólio</span></div>
    <h2 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(24px,6vw,44px)', color:'var(--forest)', lineHeight:.96, marginTop:7, marginBottom:7, letterSpacing:'.03em' }}>GALERIA DE CAMPO</h2>
    <p style={{ fontSize:13, color:'var(--mid)', maxWidth:380, margin:'0 auto' }}>Toque para ampliar. Pinça para zoom. Toque duplo para zoom rápido.</p>
    </div>

    <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
    {loading ? (
      <span style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 13px', borderRadius:6, background:'var(--parch)', color:'var(--mid)', fontSize:12, fontWeight:600 }}>
      <RefreshCw size={12} style={{ animation:'spinSlow 1s linear infinite' }}/>
      {prog > 0 ? `Carregando… ${prog} fotos` : 'Conectando ao WikiAves…'}
      </span>
    ) : (
      <a href={L.wikiaves} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 13px', borderRadius:6, fontSize:11, fontWeight:700, textDecoration:'none', background:fonte==='wikiaves'?'rgba(123,200,67,.1)':'var(--parch)', color:fonte==='wikiaves'?'var(--fern)':'var(--mid)', border:`1px solid ${fonte==='wikiaves'?'rgba(123,200,67,.2)':'var(--parch)'}` }}>
      <Camera size={10}/> {fonte==='wikiaves'?`✓ ${fotos.length} fotos do WikiAves`:`${fotos.length} fotos`} <ExternalLink size={10}/>
      </a>
    )}
    </div>

    {/* Filter pills — horizontally scrollable on mobile */}
    {!loading && allSpecies.length > 0 && (
      <div className="pills" style={{ marginBottom:18 }}>
      <button onClick={() => setEsp('')} className="pill" style={{ background:esp===''?'var(--forest)':'var(--parch)', color:esp===''?'white':'var(--mid)' }}>Todas</button>
      {allSpecies.slice(0, 14).map(e => (
        <button key={e} onClick={() => setEsp(e)} className="pill" style={{ background:esp===e?'var(--forest)':'var(--parch)', color:esp===e?'white':'var(--mid)' }}>{e}</button>
      ))}
      </div>
    )}

    <div className="mason">
    {loading
      ? [200,290,175,340,220,285,190,320,245].map((h,i) => <div key={i} className="skel" style={{ height:h }}/>)
      : filtered.map((foto, i) => (
        <div key={`${i}-${foto.titulo}`} className="mi" onClick={() => openLb(fotos.indexOf(foto))}>
        <img src={foto.url} alt={foto.titulo} loading="lazy"/>
        <div className="ov">
        <p style={{ fontFamily:"'Lora',serif", color:'white', fontSize:12, fontWeight:400, textTransform:'capitalize', marginBottom:1 }}>{foto.titulo}</p>
        {foto.cientifico && <p style={{ color:'rgba(255,255,255,.42)', fontSize:9, fontStyle:'italic' }}>{foto.cientifico}</p>}
        </div>
        </div>
      ))
    }
    </div>

    {!loading && (
      <div style={{ textAlign:'center', marginTop:30 }}>
      <a href={L.wikiaves} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'12px 20px', borderRadius:8, background:'var(--forest)', color:'white', fontWeight:700, fontSize:12, letterSpacing:'.13em', textTransform:'uppercase', textDecoration:'none', boxShadow:'0 4px 14px rgba(0,0,0,.22)' }}>
      Ver todas no WikiAves <ExternalLink size={12}/>
      </a>
      </div>
    )}
    </div>
    </section>

    {/* ── FAQ ───────────────────────────────────────────────────────────── */}
    <section id="faq" style={sec('linear-gradient(180deg,var(--forest) 0%,var(--deep) 100%)')}>
    <div className="ctr" style={{ maxWidth:680 }}>
    <div style={{ textAlign:'center', marginBottom:32 }}>
    <div className="sl" style={{ justifyContent:'center' }}><span style={{ fontSize:10, fontWeight:700, color:'var(--lime)', textTransform:'uppercase', letterSpacing:'.26em' }}>Dúvidas</span></div>
    <h2 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(24px,6vw,42px)', color:'white', lineHeight:.96, marginTop:7, letterSpacing:'.03em' }}>PERGUNTAS FREQUENTES</h2>
    </div>
    <FAQ q="O que é o IBFN?" a="Instituto Brasileiro de Fotografia de Natureza — empresa fundada por Thiago Tolêdo em 2021, Brasília-DF. CNPJ 41.666.060/0001-25. Atua em fotografia, cursos e expedições pelo Brasil e pelo mundo."/>
    <FAQ q="As expedições são para qualquer nível?" a="Sim. Grupos pequenos (3 a 8 participantes) garantem atenção individualizada e as melhores oportunidades em cada destino, do iniciante ao avançado."/>
    <FAQ q="Como reservar vaga nas expedições?" a="Via WhatsApp (85) 99926-0902 ou pelo formulário nesta página. Vagas são limitadas — algumas datas 2026 já estão lotadas."/>
    <FAQ q="Os cursos têm certificado e acesso vitalício?" a="Sim. Todos os cursos na Hotmart emitem certificado digital após conclusão e têm acesso vitalício ao conteúdo."/>
    <FAQ q="Qual câmera o Thiago usa?" a="Canon 7D MK II com lente Canon 300mm F4. Os cursos, porém, ensinam a extrair o máximo de qualquer equipamento."/>
    <FAQ q="Como acompanhar o IBFN?" a="YouTube @passarinhadapro, Instagram @thiago.t.silva e @jardimdosbeijafloresdf. Todas as novidades saem por lá primeiro."/>
    </div>
    </section>

    {/* ── FORMULÁRIO CAPTAÇÃO ───────────────────────────────────────────── */}
    <section id="contato" style={{ padding:'68px 0', background:'linear-gradient(135deg,#031008 0%,#081a0c 50%,#031008 100%)', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:450, height:450, borderRadius:'50%', background:'rgba(123,200,67,.05)', filter:'blur(90px)', pointerEvents:'none' }}/>
    {/* Fireflies */}
    {[...Array(7)].map((_,i) => (
      <div key={i} style={{ position:'absolute', width:3, height:3, borderRadius:'50%', background:'rgba(168,224,99,.7)', left:`${9+i*12}%`, top:`${18+(i%3)*28}%`, animation:`firefly ${3+i}s ${i*.5}s ease-in-out infinite` }}/>
    ))}

    <div className="ctr" style={{ position:'relative', zIndex:1 }}>
    <div className="g2" style={{ alignItems:'start', gap:44 }}>
    {/* Left — CTA */}
    <div className="au">
    <Logo size={56}/>
    <h2 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:'clamp(32px,7vw,54px)', color:'white', lineHeight:.9, marginBottom:10, marginTop:13, letterSpacing:'.03em' }}>
    TODO VOO COMEÇA<br/>COM UM OLHAR.
    </h2>
    <p style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontSize:14, color:'rgba(255,255,255,.52)', marginBottom:22, lineHeight:1.85 }}>
    Faça parte da comunidade IBFN. Expedições, cursos e conteúdo gratuito toda semana.
    </p>
    <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:26 }}>
    {['Prioridade nas expedições 2026', 'Seja avisado no lançamento da Área de Membros', 'Conteúdo exclusivo antes de todo mundo'].map((item,i) => (
      <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9, color:'rgba(255,255,255,.62)', fontSize:14, lineHeight:1.5 }}>
      <CheckCircle2 size={14} color="var(--lime)" style={{ flexShrink:0, marginTop:2 }}/> {item}
      </div>
    ))}
    </div>
    <div className="ctarow">
    <a href={L.whatsapp} target="_blank" rel="noopener noreferrer" className="bwa"><MessageCircle size={14}/> WhatsApp</a>
    <a href={L.youtube} target="_blank" rel="noopener noreferrer" className="byt"><Youtube size={13}/> YouTube</a>
    </div>
    </div>

    {/* Right — Form */}
    <div className="au d2 formcard">
    <div style={{ marginBottom:20 }}>
    <div className="sl"><span style={{ fontSize:10, fontWeight:700, color:'var(--lime)', textTransform:'uppercase', letterSpacing:'.22em' }}>Cadastro Gratuito</span></div>
    <h3 style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:22, color:'white', letterSpacing:'.04em' }}>QUERO FAZER PARTE</h3>
    <p style={{ fontSize:12, color:'rgba(255,255,255,.36)', lineHeight:1.7, marginTop:4 }}>Preencha abaixo e entraremos em contato com ofertas exclusivas.</p>
    </div>
    <LeadForm/>
    </div>
    </div>
    </div>
    </section>

    {/* ── FOOTER ────────────────────────────────────────────────────────── */}
    <footer style={{ background:'var(--forest)', padding:'44px 0 18px', borderTop:'1px solid rgba(123,200,67,.07)' }}>
    <div className="ctr">
    <div className="gfoot" style={{ marginBottom:28 }}>
    <div>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}>
    <Logo size={36}/>
    <div>
    <div style={{ fontFamily:"'Bebas Neue',Impact,sans-serif", fontSize:14, color:'white', lineHeight:1, letterSpacing:'.04em' }}>IBFN · <span style={{ color:'var(--lime)' }}>Thiago Tolêdo</span></div>
    <div style={{ fontSize:8, color:'rgba(123,200,67,.38)', letterSpacing:'.17em', textTransform:'uppercase', marginTop:1 }}>Instituto Bras. de Fotografia de Natureza</div>
    </div>
    </div>
    <p style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontSize:11, color:'rgba(255,255,255,.18)', lineHeight:1.75, maxWidth:250, marginBottom:5 }}>"Piloto de avião por profissão.<br/>Fotógrafo de natureza de coração."</p>
    <p style={{ fontSize:9, color:'rgba(255,255,255,.16)', marginBottom:14 }}>CNPJ 41.666.060/0001-25 · Brasília, DF</p>
    <div style={{ display:'flex', gap:7 }}>
    {[{href:L.youtube,i:<Youtube size={12}/>},{href:L.instagram,i:<Instagram size={12}/>},{href:L.igJardim,i:<Leaf size={12}/>},{href:'mailto:contato@ibfn.com.br',i:<Mail size={12}/>}].map((s,i) => (
      <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" style={{ width:30, height:30, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(123,200,67,.07)', color:'rgba(123,200,67,.48)', border:'1px solid rgba(123,200,67,.1)', textDecoration:'none' }}>{s.i}</a>
    ))}
    </div>
    </div>
    <div>
    <h6 style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.2em', color:'var(--lime)', marginBottom:13 }}>Expedições</h6>
    <ul style={{ listStyle:'none' }}>
    {[['Panamá 2026','#exp'],['Mata Atlântica','#exp'],['Calendário 2026','#exp'],['Tour Privativo',L.whatsapp]].map(([l,h]) => (
      <li key={l} style={{ marginBottom:8 }}><a href={h} className="fl">{l}</a></li>
    ))}
    </ul>
    </div>
    <div>
    <h6 style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.2em', color:'var(--lime)', marginBottom:13 }}>Conteúdo</h6>
    <ul style={{ listStyle:'none' }}>
    {[['YouTube','#youtube'],['Cursos Hotmart','#cursos'],['Galeria','#galeria'],['Área de Membros','#contato']].map(([l,h]) => (
      <li key={l} style={{ marginBottom:8 }}><a href={h} className="fl">{l}</a></li>
    ))}
    </ul>
    </div>
    <div>
    <h6 style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'.2em', color:'var(--lime)', marginBottom:13 }}>Contato</h6>
    <ul style={{ listStyle:'none' }}>
    {[['WhatsApp',L.whatsapp],['FAQ','#faq'],['Instagram',L.instagram],['Jardim Beija-flores',L.igJardim]].map(([l,h]) => (
      <li key={l} style={{ marginBottom:8 }}><a href={h} className="fl">{l}</a></li>
    ))}
    </ul>
    </div>
    </div>
    <div style={{ borderTop:'1px solid rgba(255,255,255,.04)', paddingTop:15, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:7 }}>
    <p style={{ fontSize:9, color:'rgba(255,255,255,.13)', textTransform:'uppercase', letterSpacing:'.12em', fontWeight:700 }}>
    © {new Date().getFullYear()} IBFN · Thiago de Toledo e Silva Fotografia
    </p>
    <p style={{ fontSize:9, color:'rgba(255,255,255,.13)', display:'flex', alignItems:'center', gap:4 }}>
    Feito com <Heart size={8} color="#4CAF50"/> para a natureza brasileira
    </p>
    </div>
    </div>
    </footer>

    {/* ── LIGHTBOX ──────────────────────────────────────────────────────── */}
    {lb !== null && (
      <Lightbox fotos={fotos} idx={lb} onClose={closeLb} onPrev={prevLb} onNext={nextLb}/>
    )}
    </div>
  );
}
