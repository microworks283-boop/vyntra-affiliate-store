import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, ShoppingBag, ArrowUpRight, Menu, X, Sparkles, Heart, ChevronRight, ShieldCheck, Smartphone, Zap } from 'lucide-react';
import './styles.css';

const partners = ['All stores', 'Amazon', 'Flipkart', 'Myntra', 'Meesho', 'AJIO'];
const categories = ['All', 'Fashion', 'Footwear', 'Electronics', 'Beauty', 'Home & Living', 'Accessories'];
const seedProducts = [
  { id: 1, title: 'Everyday Essential Sneakers', category: 'Footwear', store: 'Myntra', price: '₹1,499', oldPrice: '₹2,499', tag: 'Trending', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85', link: 'https://www.myntra.com/', description: 'A versatile everyday pair for your off-duty look.' },
  { id: 2, title: 'Minimal Analog Watch', category: 'Accessories', store: 'Amazon', price: '₹899', oldPrice: '₹1,799', tag: 'Popular pick', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85', link: 'https://www.amazon.in/', description: 'A clean, timeless accessory for every day.' },
  { id: 3, title: 'Wireless Headphones', category: 'Electronics', store: 'Flipkart', price: '₹1,999', oldPrice: '₹3,499', tag: 'Worth a look', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85', link: 'https://www.flipkart.com/', description: 'Bring your playlists along with comfortable wireless listening.' },
  { id: 4, title: 'Daily Skincare Set', category: 'Beauty', store: 'Meesho', price: '₹599', oldPrice: '₹999', tag: 'Budget find', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85', link: 'https://www.meesho.com/', description: 'A simple set to refresh your everyday routine.' },
  { id: 5, title: 'Relaxed Fit Everyday Shirt', category: 'Fashion', store: 'AJIO', price: '₹799', oldPrice: '₹1,499', tag: 'Editor’s pick', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85', link: 'https://www.ajio.com/', description: 'An easy-to-style staple for your weekly rotation.' },
  { id: 6, title: 'Modern Table Lamp', category: 'Home & Living', store: 'Amazon', price: '₹1,199', oldPrice: '₹1,999', tag: 'Home upgrade', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85', link: 'https://www.amazon.in/', description: 'Soft lighting to make your corner feel more considered.' },
  { id: 7, title: 'Classic Crossbody Bag', category: 'Accessories', store: 'Myntra', price: '₹1,099', oldPrice: '₹1,899', tag: 'Trending', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85', link: 'https://www.myntra.com/', description: 'A practical, polished bag for plans on the go.' },
  { id: 8, title: 'Compact Bluetooth Speaker', category: 'Electronics', store: 'Flipkart', price: '₹1,299', oldPrice: '₹2,199', tag: 'Smart buy', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85', link: 'https://www.flipkart.com/', description: 'Big energy in a compact everyday speaker.' }
];

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function App() {
  const [products, setProducts] = useState(seedProducts);
  const [activePartner, setActivePartner] = useState('All stores');
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [saved, setSaved] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [toast, setToast] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authUser, setAuthUser] = useState(() => { try { return JSON.parse(localStorage.getItem('vyntraUser') || 'null'); } catch { return null; } });
  useEffect(() => {
    fetch(`${API_BASE}/api/products`).then(r => r.ok ? r.json() : null).then(data => { if (Array.isArray(data) && data.length) setProducts(data); }).catch(() => {});
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const handler = e => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const filtered = useMemo(() => products.filter(p =>
    (activePartner === 'All stores' || p.store?.toLowerCase() === activePartner.toLowerCase()) &&
    (activeCategory === 'All' || p.category?.toLowerCase() === activeCategory.toLowerCase()) &&
    `${p.title} ${p.category} ${p.store} ${p.description || ''}`.toLowerCase().includes(query.toLowerCase())
  ), [products, activePartner, activeCategory, query]);
  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 2600); };
  const goToProducts = () => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
  const openProduct = p => {
    const url = p.link || '#';
    if (!/^https?:\/\//i.test(url) || url.endsWith('.com/') || url.endsWith('.in/')) {
      notify('Demo partner link. Add your approved affiliate URL in the product data before publishing.');
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  return <div className="app-shell">
    <div className="announcement"><Sparkles size={14}/> Your next great find is closer than you think <span className="announce-dot">✦</span> Curated across stores</div>
    <header className="header">
      <a className="brand" href="#" aria-label="VYNTRA home">
  <img
    src="/VYNTRA%20Gradient%20Cart%20Logo.png"
    alt="VYNTRA logo"
    onError={e => { e.currentTarget.style.display = 'none'; }}
  />
  <span className="brand-fallback">VYNTRA<span>.</span></span>
</a>
            <nav className={mobileOpen ? 'nav nav-open' : 'nav'}>
        <a href="#discover" onClick={() => setMobileOpen(false)}>Discover</a><a href="#stores" onClick={() => setMobileOpen(false)}>Stores</a><a href="#about" onClick={() => setMobileOpen(false)}>Why VYNTRA</a>
      </nav>
      <div className="header-actions"><label className="searchbox"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find your next favourite..." aria-label="Search products"/></label>
        <button className="auth-open-btn" onClick={() => { setAuthMode('login'); setOtpSent(false); setAuthOtp(''); setAuthPassword(''); setAuthError(''); setAuthOpen(true); }}>{authUser ? `Hi, ${authUser.name || 'Shopper'}` : 'Login / Sign up'}</button>
        {installPrompt && <button className="install-btn" onClick={async()=>{await installPrompt.prompt();setInstallPrompt(null)}}><Smartphone size={16}/> Install</button>}
        <button className="icon-btn menu-btn" aria-label="Toggle menu" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X/> : <Menu/>}</button>
      </div>
    </header>
    <main>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line"></span> THE SMARTER WAY TO SHOP</div>
          <h1>Every store.<br/><span>One destination.</span></h1>
          <p>All your favourite shopping platforms in one place. Discover products across Amazon, Flipkart, Myntra, Meesho and AJIO — all through VYNTRA.</p>
          <div className="hero-ctas"><button className="primary-btn" onClick={goToProducts}>Explore the edit <ArrowUpRight size={18}/></button><a href="#stores" className="text-link">Browse stores <ChevronRight size={16}/></a></div>
          <div className="hero-proof"><div className="proof-avatars"><span>A</span><span>F</span><span>M</span><span>+</span></div><div><strong>One destination, many favourites</strong><small>Amazon · Flipkart · Myntra · Meesho · AJIO</small></div></div>
        </div>
        <div className="hero-visual"><div className="hero-orb orb-one"></div><div className="hero-orb orb-two"></div><div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=90" alt="Friends browsing fashion together"/></div><div className="floating-card float-top"><span className="float-icon"><Zap size={17}/></span><div><strong>Fresh finds</strong><small>Handpicked for you</small></div></div><div className="floating-card float-bottom"><div className="mini-swatch"></div><div><strong>Shop your way</strong><small>Compare across stores</small></div><ArrowUpRight size={18}/></div><div className="hero-sticker">THE<br/>GOOD<br/><b>EDIT ✳</b></div></div>
      </section>
      <section className="trust-strip"><div><ShieldCheck/><span><strong>Trusted stores</strong><small>Shop via partner sites</small></span></div><div><Sparkles/><span><strong>Curated discoveries</strong><small>Less scrolling, more finding</small></span></div><div><ShoppingBag/><span><strong>Easy shopping</strong><small>Checkout with the retailer</small></span></div></section>
      <section className="stores-section" id="stores"><div className="section-heading"><div><div className="eyebrow">YOUR FAVOURITES, TOGETHER</div><h2>Stores you <span>love.</span></h2></div><p>Find something good from your go-to destinations.</p></div><div className="store-grid">
        {[['Amazon','amazon','amz','Explore picks'],['Flipkart','flipkart','flip','Discover deals'],['Myntra','myntra','myn','Style your way'],['Meesho','meesho','mee','Budget finds'],['AJIO','ajio','aj','Fresh fashion']].map(s=><button className={`store-card ${s[2]}`} key={s[0]} onClick={()=>{setActivePartner(s[0]);goToProducts()}}><span className="store-mark">{s[2]==='amz'?'a':s[2]==='flip'?'f':s[2]==='myn'?'M':s[2]==='mee'?'m':'A'}</span><span className="store-name">{s[0]}</span><small>{s[3]}</small><ArrowUpRight className="store-arrow" size={17}/></button>)}
      </div></section>
      <section className="discover-section" id="discover"><div className="section-heading discover-heading"><div><div className="eyebrow">THE VYNTRA EDIT</div><h2>Find your <span>next favourite.</span></h2></div><p>Good-looking picks for your everyday life.</p></div>
        <div className="filter-row"><div className="category-pills">{categories.map(c=><button key={c} className={activeCategory===c?'pill active':'pill'} onClick={()=>setActiveCategory(c)}>{c}</button>)}</div><select className="partner-select" value={activePartner} onChange={e=>setActivePartner(e.target.value)} aria-label="Filter by store">{partners.map(p=><option key={p}>{p}</option>)}</select></div>
        <div className="product-grid">{filtered.map((p,i)=><article className="product-card" key={p.id || p.title}><div className="product-image"><img src={p.image} alt={p.title} loading="lazy"/><span className="product-tag">{p.tag || 'VYNTRA pick'}</span><button className={`save-btn ${saved.includes(p.id) ? 'saved' : ''}`} aria-label="Save product" onClick={()=>setSaved(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id])}><Heart size={17} fill={saved.includes(p.id)?'currentColor':'none'}/></button><button className="quick-view" onClick={()=>openProduct(p)}>View at {p.store} <ArrowUpRight size={15}/></button></div><div className="product-info"><div className="product-meta"><span>{p.category}</span><span className="meta-dot">·</span><span>{p.store}</span></div><h3>{p.title}</h3><p>{p.description}</p><div className="price-row"><div><strong>{p.price}</strong>{p.oldPrice && <del>{p.oldPrice}</del>}</div><button className="round-arrow" aria-label={`Shop ${p.title}`} onClick={()=>openProduct(p)}><ArrowUpRight size={18}/></button></div></div></article>)}</div>
        {filtered.length===0 && <div className="empty-state"><Search size={30}/><h3>No finds just yet</h3><p>Try another search or switch your filters.</p><button className="primary-btn" onClick={()=>{setQuery('');setActiveCategory('All');setActivePartner('All stores')}}>Clear filters</button></div>}
        <div className="affiliate-note">Prices and availability can change at the retailer. Always check the final details on the store’s website.</div>
      </section>
      <section className="banner"><div><div className="eyebrow">YOUR SHORTCUT TO GOOD FINDS</div><h2>Less hunting.<br/><span>More loving it.</span></h2><p>Make VYNTRA your starting point for the things you want to discover.</p><button className="light-btn" onClick={goToProducts}>Explore the edit <ArrowUpRight size={17}/></button></div><div className="banner-art"><div className="banner-ring"></div><div className="banner-bag"><ShoppingBag size={90} strokeWidth={1.2}/><span>V</span></div><span className="sparkle s1">✳</span><span className="sparkle s2">✦</span><span className="sparkle s3">✧</span></div></section>
      <section className="about-section" id="about"><div className="about-icon"><Sparkles size={25}/></div><div><div className="eyebrow">A LITTLE ABOUT US</div><h2>Shopping discovery,<br/><span>made simpler.</span></h2></div><p>VYNTRA helps you discover products across participating retailers. When you follow a product link, you’ll shop and check out directly with that retailer. Some links may be affiliate links, which means VYNTRA may earn a commission at no extra cost to you.</p></section>
    </main>
    <footer className="footer"><div className="footer-top"><a className="footer-brand" href="#"><img src="/VYNTRA%20Gradient%20Cart%20Logo.png" alt="VYNTRA"/><span>VYNTRA</span></a><p>Your next great find starts here.</p><div className="footer-links"><a href="#discover">Discover</a><a href="#stores">Stores</a><a href="#about">About</a><a href="/privacy.html">Privacy</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} VYNTRA. All rights reserved.</span><span>Affiliate disclosure: We may earn from qualifying purchases.</span></div></footer>
    {authOpen && <div className="auth-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setAuthOpen(false); }}>
      <section className="auth-card" role="dialog" aria-modal="true" aria-label="VYNTRA login and signup">
        <button className="auth-close" onClick={() => setAuthOpen(false)} aria-label="Close">×</button>
        <div className="auth-logo"><img src="/VYNTRA%20Gradient%20Cart%20Logo.png" alt="VYNTRA"/><span>VYNTRA</span></div>
        <div className="eyebrow auth-eyebrow">ALL YOUR FAVOURITE STORES, ONE PLACE</div>
        <h2>{authUser ? 'You’re signed in' : otpSent ? 'Check your inbox' : authMode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
        <p className="auth-subtitle">{authUser ? `Signed in as ${authUser.email}` : otpSent ? `Enter the 6-digit verification code sent to ${authEmail}. It expires in 5 minutes.` : authMode === 'signup' ? 'Create a VYNTRA account. We’ll verify your email before your account is activated.' : 'Log in with your email address and password.'}</p>
        {authUser ? <button className="auth-submit" onClick={() => { localStorage.removeItem('vyntraToken'); localStorage.removeItem('vyntraUser'); setAuthUser(null); setAuthOpen(false); notify('You have signed out.'); }}>Sign out</button> : <>
          {!otpSent && authMode === 'login' && <form onSubmit={async e => {
            e.preventDefault(); setAuthBusy(true);
            try {
              const r = await fetch(`${API_BASE}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:authEmail, password:authPassword }) });
              const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Login failed.');
              localStorage.setItem('vyntraToken', d.token); localStorage.setItem('vyntraUser', JSON.stringify(d.user)); setAuthUser(d.user); setAuthOpen(false); notify(`Welcome back, ${d.user.name || 'Shopper'}!`);
            } catch(err) { notify(err.message); } finally { setAuthBusy(false); }
          }}>
            <label className="auth-label">Email address<input required type="email" autoComplete="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="you@example.com"/></label>
            <label className="auth-label">Password<input required type="password" autoComplete="current-password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="Enter your password"/></label>
            <button className="auth-submit" disabled={authBusy}>{authBusy ? 'Logging in…' : 'Log in'}</button>
          </form>}
          {!otpSent && authMode === 'signup' && <form onSubmit={async e => {
            e.preventDefault(); setAuthBusy(true); setAuthError('');
            try {
              const r = await fetch(`${API_BASE}/api/auth/request-otp`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:authEmail, name:authName, password:authPassword }) });
              const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Could not send code.'); setOtpSent(true); notify(d.message);
            } catch(err) { setAuthError(err.message); } finally { setAuthBusy(false); }
          }}>
            <label className="auth-label">Full name<input required maxLength="80" autoComplete="name" value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="Enter your name"/></label>
            <label className="auth-label">Email address<input required type="email" autoComplete="email" value={authEmail} onChange={e=>{setAuthEmail(e.target.value);setAuthError('');}} placeholder="you@example.com"/></label>
            <label className="auth-label">Create password<input required type="password" autoComplete="new-password" minLength="8" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="At least 8 characters"/><small className="auth-help">Use at least 8 characters.</small></label>
            <button className="auth-submit" disabled={authBusy}>{authBusy ? 'Sending verification code…' : 'Verify email & create account'}</button>
            {authError && <div className="auth-error" role="alert">{authError} {authError.toLowerCase().includes('already exists') && <button type="button" onClick={()=>{setAuthMode('login');setAuthError('');setAuthPassword('');}}>Log in instead</button>}</div>}
          </form>}
          {otpSent && <form onSubmit={async e => {
            e.preventDefault(); setAuthBusy(true);
            try {
              const r = await fetch(`${API_BASE}/api/auth/verify-otp`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:authEmail, otp:authOtp }) });
              const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Verification failed.');
              localStorage.setItem('vyntraToken', d.token); localStorage.setItem('vyntraUser', JSON.stringify(d.user)); setAuthUser(d.user); setAuthOpen(false); setOtpSent(false); setAuthOtp(''); notify(`Welcome to VYNTRA, ${d.user.name}!`);
            } catch(err) { notify(err.message); } finally { setAuthBusy(false); }
          }}>
            <label className="auth-label">6-digit email verification code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength="6" autoComplete="one-time-code" value={authOtp} onChange={e=>setAuthOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000"/></label>
            <button className="auth-submit" disabled={authBusy || authOtp.length !== 6}>{authBusy ? 'Verifying…' : 'Verify email & finish signup'}</button>
            <button type="button" className="auth-resend" onClick={()=>{setOtpSent(false);setAuthOtp('');}}>Back to signup</button>
          </form>}
          {!otpSent && <div className="auth-switch">{authMode === 'signup' ? 'Already have an account?' : 'New to VYNTRA?'} <button onClick={()=>{setAuthMode(authMode==='signup'?'login':'signup');setOtpSent(false);setAuthOtp('');setAuthPassword('');setAuthError('');}}>{authMode === 'signup' ? 'Log in' : 'Create account'}</button></div>}
        </>}
        <div className="auth-secure"><ShieldCheck size={15}/>{otpSent ? 'Email verification code expires in 5 minutes' : authMode === 'signup' ? 'Your email must be verified to create an account' : 'Secure email and password login'}</div>
      </section>
    </div>}
    {toast && <div className="toast">{toast}</div>}
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
