import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, ShoppingBag, ArrowUpRight, Menu, X, Sparkles, Heart, ChevronRight, ShieldCheck, Smartphone, Zap, Grid2X2, UserRound, Bell, Camera } from 'lucide-react';
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

const API_BASE = 'https://vyntra-affiliate-store.onrender.com';

function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem('vyntraAdminToken') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const emptyForm = { title:'', category:'Fashion', store:'Amazon', price:'', oldPrice:'', tag:'', image:'', link:'', description:'' };
  const [form, setForm] = useState(emptyForm);
  const stores = ['Amazon','Flipkart','Myntra','Meesho','AJIO'];
  const cats = ['Fashion','Footwear','Electronics','Beauty','Home & Living','Accessories'];
  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}), ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  }
  async function loadProducts(currentToken = token) {
    try {
      const response = await fetch(`${API_BASE}/api/admin/products`, { headers: { Authorization:`Bearer ${currentToken}` } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not load products.');
      setProducts(data);
    } catch (err) { setError(err.message); if (err.message.toLowerCase().includes('session')) signOut(); }
  }
  useEffect(() => { if (token) loadProducts(token); }, []);
  function signOut() { localStorage.removeItem('vyntraAdminToken'); setToken(''); setProducts([]); setEditingId(null); setForm(emptyForm); }
  async function login(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Admin login failed.');
      localStorage.setItem('vyntraAdminToken', data.token); setToken(data.token); setPassword(''); await loadProducts(data.token);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function saveProduct(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const data = await api(editingId ? `/api/admin/products/${encodeURIComponent(editingId)}` : '/api/admin/products', { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(form) });
      if (editingId) setProducts(prev => prev.map(p => String(p.id) === String(editingId) ? data : p)); else setProducts(prev => [data, ...prev]);
      setForm(emptyForm); setEditingId(null);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  function startEdit(product) { setEditingId(product.id); setForm({ title:product.title || '', category:product.category || 'Fashion', store:product.store || 'Amazon', price:product.price || '', oldPrice:product.oldPrice || '', tag:product.tag || '', image:product.image || '', link:product.link || '', description:product.description || '' }); window.scrollTo({ top:0, behavior:'smooth' }); }
  async function deleteProduct(product) {
    if (!window.confirm(`Delete “${product.title}”?`)) return;
    setError('');
    try { await api(`/api/admin/products/${encodeURIComponent(product.id)}`, { method:'DELETE' }); setProducts(prev => prev.filter(p => String(p.id) !== String(product.id))); if (String(editingId) === String(product.id)) { setEditingId(null); setForm(emptyForm); } }
    catch (err) { setError(err.message); }
  }
  return <div className="admin-shell"><header className="admin-header"><div className="admin-brand"><span className="admin-mark">V</span><div><b>VYNTRA</b><small>PRODUCT ADMIN</small></div></div>{token && <button className="admin-secondary" onClick={signOut}>Sign out</button>}</header>
    {!token ? <main className="admin-login-wrap"><form className="admin-login-card" onSubmit={login}><p className="admin-eyebrow">PRIVATE WORKSPACE</p><h1>Admin access</h1><p>Sign in to manage products and affiliate links on VYNTRA.</p><label>Admin email<input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com" /></label><label>Admin password<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your admin password" /></label>{error && <div className="admin-error">{error}</div>}<button className="admin-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in to admin'}</button><small className="admin-hint">Admin credentials must be configured in Render environment variables. Customer accounts cannot access this page.</small></form></main> : <main className="admin-content"><div className="admin-page-title"><div><p className="admin-eyebrow">CATALOG MANAGEMENT</p><h1>{editingId ? 'Edit product' : 'Add a product'}</h1><p>Add product details and your approved affiliate URL. New items appear in the VYNTRA store after saving.</p></div><div className="admin-count"><b>{products.length}</b><span>Products</span></div></div>
      <form className="admin-product-form" onSubmit={saveProduct}><div className="admin-form-grid"><label>Product title *<input required maxLength="140" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Wireless headphones" /></label><label>Category *<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{cats.map(c=><option key={c}>{c}</option>)}</select></label><label>Store *<select value={form.store} onChange={e=>setForm({...form,store:e.target.value})}>{stores.map(c=><option key={c}>{c}</option>)}</select></label><label>Selling price *<input required value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="₹1,499" /></label><label>Original price<input value={form.oldPrice} onChange={e=>setForm({...form,oldPrice:e.target.value})} placeholder="₹2,499" /></label><label>Badge / tag<input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} placeholder="Trending, 30% off…" /></label><label className="admin-wide">Product image URL *<input required type="url" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="https://example.com/product-image.jpg" /></label><label className="admin-wide">Affiliate product URL *<input required type="url" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://retailer.com/product?affiliate-id=..." /></label><label className="admin-wide">Description<textarea maxLength="500" rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Short product description" /></label></div>{error && <div className="admin-error">{error}</div>}<div className="admin-form-actions"><button type="submit" className="admin-primary" disabled={busy}>{busy ? 'Saving…' : editingId ? 'Save changes' : 'Publish product'}</button>{editingId && <button type="button" className="admin-secondary" onClick={()=>{setEditingId(null);setForm(emptyForm);setError('')}}>Cancel edit</button>}</div></form>
      <section className="admin-products"><div className="admin-list-heading"><h2>Published products</h2><button className="admin-secondary" onClick={()=>loadProducts()}>Refresh list</button></div>{products.length === 0 ? <p className="admin-empty">No products found.</p> : products.map(p=><article className="admin-product-row" key={p.id}><img src={p.image} alt="" onError={e=>{e.currentTarget.style.visibility='hidden'}}/><div className="admin-product-details"><b>{p.title}</b><span>{p.store} · {p.category} · {p.price}</span><a href={p.link} target="_blank" rel="noreferrer">Open affiliate link ↗</a></div><div className="admin-row-actions"><button className="admin-secondary" onClick={()=>startEdit(p)}>Edit</button><button className="admin-danger" onClick={()=>deleteProduct(p)}>Delete</button></div></article>)}</section>
      <p className="admin-storage-note">Storage note: this version writes products to server/products.json. Render's local filesystem can reset on redeploy/restart; configure persistent storage or a database before relying on it for permanent catalog data.</p>
    </main>}
  </div>;
}

function App() {
  const [products, setProducts] = useState(seedProducts);
  const [activePage, setActivePage] = useState('home');
  const [activePartner, setActivePartner] = useState('All stores');
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem('vyntraWishlist') || '[]'); } catch { return []; } });
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
  useEffect(() => { localStorage.setItem('vyntraWishlist', JSON.stringify(saved)); }, [saved]);
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
    <header className="header vyntra-header">
      <a className="brand" href="#" aria-label="VYNTRA home"><img src="/VYNTRA Gradient Cart Logo.png" alt="VYNTRA logo"/><span className="brand-fallback">VYNTRA<span>.</span></span></a>
      <nav className={mobileOpen ? 'nav nav-open' : 'nav'}>
        <a href="#discover" onClick={() => setMobileOpen(false)}>Discover</a><a href="#stores" onClick={() => setMobileOpen(false)}>Stores</a>
      </nav>
      <div className="header-actions">
        <label className="searchbox"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products, brands and more" aria-label="Search products"/></label>
        <button className="vyntra-search-icon" aria-label="Search" onClick={()=>document.querySelector('.searchbox input')?.focus()}><Search size={21}/></button>
        <button className="auth-open-btn" onClick={() => { setAuthMode('login'); setOtpSent(false); setAuthOtp(''); setAuthPassword(''); setAuthError(''); setAuthOpen(false); setActivePage('account'); window.scrollTo({top:0,behavior:'smooth'}); }}>{authUser ? `Hi, ${authUser.name || 'Shopper'}` : 'Login / Sign up'}</button>
        <button className="icon-btn menu-btn" aria-label="Toggle menu" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X/> : <Menu/>}</button>
      </div>
    </header>
    {activePage === 'home' && <main className="vyntra-mobile-home">
      <section className="vyntra-hero">
        <div className="vyntra-hero-copy">
          <div className="eyebrow"><span className="eyebrow-line"></span> THE SMARTER WAY TO SHOP</div>
          <h1>Every store.<br/><span>One destination.</span></h1>
          <p>All your favourite shopping platforms in one place. Discover products across Amazon, Flipkart, Myntra, Meesho and AJIO — all through VYNTRA.</p>
          <button className="primary-btn" onClick={goToProducts}>Explore the edit <ArrowUpRight size={18}/></button>
          <a href="#stores" className="text-link">Browse stores <ChevronRight size={16}/></a>
          <div className="vyntra-proof"><span className="proof-bubble">A</span><span className="proof-bubble">F</span><span className="proof-bubble">M</span><strong>50K+</strong><small>Trusted by smart shoppers</small></div>
        </div>
        <div className="vyntra-hero-art">
          <div className="vyntra-art-ring"></div>
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=90" alt="Fashion shoppers" />
          <div className="vyntra-fresh-card"><span><Zap size={20}/></span><div><b>Fresh finds</b><small>Handpicked for you</small></div></div>
          <div className="vyntra-good-edit">THE<br/><b>GOOD<br/>EDIT ✳</b></div>
        </div>
      </section>

      <section className="vyntra-stores" id="stores">
        <div className="vyntra-section-title"><h2>Top Stores</h2><button onClick={()=>{setActivePartner('All stores');goToProducts()}}>See All <ChevronRight size={17}/></button></div>
        <div className="vyntra-store-row">
          {[['Amazon','a','amz','Up to 70% Off'],['Flipkart','f','flip','Up to 80% Off'],['Myntra','M','myn','Up to 80% Off'],['Meesho','m','mee','Up to 70% Off'],['AJIO','A','aj','Up to 70% Off']].map(s=><button className="vyntra-store-card" key={s[0]} onClick={()=>{setActivePartner(s[0]);goToProducts()}}><span className={`vyntra-store-logo ${s[2]}`}>{s[1]}</span><b>{s[0]}</b><small>{s[3]}</small></button>)}
        </div>
      </section>

      <section className="vyntra-electronics-banner" onClick={()=>{setActiveCategory('Electronics');goToProducts()}}>
        <div><h2>Electronics<br/>Best Deals</h2><p>Headphones · Smart Watches · Speakers & More</p><button>Shop Now <ArrowUpRight size={16}/></button></div>
        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85" alt="Headphones and electronics"/>
      </section>

      <section className="vyntra-deals discover-section" id="discover">
        <div className="vyntra-section-title"><h2>Top Deals For You</h2><button onClick={()=>{setActiveCategory('All');setActivePartner('All stores')}}>See All <ChevronRight size={17}/></button></div>
        <div className="filter-row"><div className="category-pills">{categories.map(c=><button key={c} className={activeCategory===c?'pill active':'pill'} onClick={()=>setActiveCategory(c)}>{c}</button>)}</div><select className="partner-select" value={activePartner} onChange={e=>setActivePartner(e.target.value)} aria-label="Filter by store">{partners.map(p=><option key={p}>{p}</option>)}</select></div>
        <div className="product-grid">{filtered.map(p=><article className="product-card" key={p.id || p.title}><div className="product-image"><img src={p.image} alt={p.title} loading="lazy"/><span className="product-tag">{p.tag || 'VYNTRA pick'}</span><button className={`save-btn ${saved.includes(p.id) ? 'saved' : ''}`} aria-label="Save product" onClick={()=>setSaved(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id])}><Heart size={17} fill={saved.includes(p.id)?'currentColor':'none'}/></button><button className="quick-view" onClick={()=>openProduct(p)}>View at {p.store} <ArrowUpRight size={15}/></button></div><div className="product-info"><div className="product-meta"><span>{p.category}</span><span className="meta-dot">·</span><span>{p.store}</span></div><h3>{p.title}</h3><p>{p.description}</p><div className="price-row"><div><strong>{p.price}</strong>{p.oldPrice && <del>{p.oldPrice}</del>}</div><button className="round-arrow" aria-label={`Shop ${p.title}`} onClick={()=>openProduct(p)}><ArrowUpRight size={18}/></button></div></div></article>)}</div>
        {filtered.length===0 && <div className="empty-state"><Search size={30}/><h3>No finds just yet</h3><p>Try another search or switch your filters.</p><button className="primary-btn" onClick={()=>{setQuery('');setActiveCategory('All');setActivePartner('All stores')}}>Clear filters</button></div>}
        <div className="affiliate-note">Prices and availability can change at the retailer. Always check final details on the store’s website.</div>
      </section>
    </main>}
    {activePage !== 'home' && <main className="vyntra-inner-page">
      {activePage === 'categories' && <section className="inner-page-section"><div className="inner-page-heading"><p>EXPLORE VYNTRA</p><h1>Shop by <span>Category</span></h1><small>Find something good for every part of your day.</small></div><div className="category-page-grid">{categories.filter(c=>c!=='All').map((c,i)=><button className="category-page-card" key={c} onClick={()=>{setActiveCategory(c);setActivePage('home');setTimeout(()=>document.getElementById('discover')?.scrollIntoView({behavior:'smooth'}),80)}}><span>{['👗','👟','🎧','✨','🛋️','👜'][i] || '✦'}</span><b>{c}</b><small>Explore {c.toLowerCase()}</small></button>)}</div><div className="inner-page-heading compact"><h2>Popular picks</h2></div><div className="product-grid inner-product-grid">{filtered.map(p=><article className="product-card" key={p.id || p.title}><div className="product-image"><img src={p.image} alt={p.title} loading="lazy"/><button className={`save-btn ${saved.includes(p.id) ? 'saved' : ''}`} aria-label="Save product" onClick={()=>setSaved(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id])}><Heart size={17} fill={saved.includes(p.id)?'currentColor':'none'}/></button></div><div className="product-info"><div className="product-meta">{p.category} · {p.store}</div><h3>{p.title}</h3><div className="price-row"><strong>{p.price}</strong><button className="round-arrow" onClick={()=>openProduct(p)}><ArrowUpRight size={18}/></button></div></div></article>)}</div></section>}
      {activePage === 'stores' && <section className="inner-page-section"><div className="inner-page-heading"><p>YOUR FAVOURITES, TOGETHER</p><h1>Top <span>Stores</span></h1><small>Choose a retailer to explore its picks.</small></div><div className="stores-page-grid">{[['Amazon','a','amz'],['Flipkart','f','flip'],['Myntra','M','myn'],['Meesho','m','mee'],['AJIO','A','aj']].map(s=><button className="vyntra-store-card" key={s[0]} onClick={()=>setActivePartner(s[0])}><span className={`vyntra-store-logo ${s[2]}`}>{s[1]}</span><b>{s[0]}</b><small>{activePartner===s[0]?'Selected store':'Browse deals'}</small></button>)}</div><div className="inner-page-heading compact"><h2>{activePartner==='All stores'?'Featured products':`${activePartner} products`}</h2><button className="reset-filter" onClick={()=>setActivePartner('All stores')}>All stores</button></div><div className="product-grid inner-product-grid">{filtered.map(p=><article className="product-card" key={p.id || p.title}><div className="product-image"><img src={p.image} alt={p.title} loading="lazy"/><button className={`save-btn ${saved.includes(p.id) ? 'saved' : ''}`} onClick={()=>setSaved(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id])}><Heart size={17} fill={saved.includes(p.id)?'currentColor':'none'}/></button></div><div className="product-info"><div className="product-meta">{p.category} · {p.store}</div><h3>{p.title}</h3><div className="price-row"><strong>{p.price}</strong><button className="round-arrow" onClick={()=>openProduct(p)}><ArrowUpRight size={18}/></button></div></div></article>)}</div></section>}
      {activePage === 'wishlist' && <section className="inner-page-section"><div className="inner-page-heading"><p>YOUR PERSONAL EDIT</p><h1>My <span>Wishlist</span></h1><small>Keep your favourite finds close.</small></div>{saved.length ? <div className="product-grid inner-product-grid">{products.filter(p=>saved.includes(p.id)).map(p=><article className="product-card" key={p.id}><div className="product-image"><img src={p.image} alt={p.title} loading="lazy"/><button className="save-btn saved" aria-label="Remove from wishlist" onClick={()=>setSaved(prev=>prev.filter(x=>x!==p.id))}><Heart size={17} fill="currentColor"/></button></div><div className="product-info"><div className="product-meta">{p.category} · {p.store}</div><h3>{p.title}</h3><div className="price-row"><strong>{p.price}</strong><button className="round-arrow" onClick={()=>openProduct(p)}><ArrowUpRight size={18}/></button></div></div></article>)}</div> : <div className="wishlist-empty"><Heart size={42}/><h2>Your wishlist is waiting</h2><p>Tap the heart on any product to save it here.</p><button className="primary-btn" onClick={()=>setActivePage('home')}>Explore products <ArrowUpRight size={17}/></button></div>}</section>}
      {activePage === 'account' && <section className="inner-page-section account-page-section"><div className="inner-page-heading"><p>YOUR VYNTRA PROFILE</p><h1>My <span>Account</span></h1><small>Sign in or create an account to keep your shopping preferences in one place.</small></div></section>}
    </main>}
    <footer className="footer"><div className="footer-top"><a className="footer-brand" href="#"><img src="/VYNTRA Gradient Cart Logo.png" alt="VYNTRA"/><span>VYNTRA</span></a><p>Your next great find starts here.</p><div className="footer-links"><a href="#discover">Discover</a><a href="#stores">Stores</a><a href="#about">About</a><a href="/privacy.html">Privacy</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} VYNTRA. All rights reserved.</span><span>Affiliate disclosure: We may earn from qualifying purchases.</span></div></footer>
    {(authOpen || activePage === 'account') && <div className={activePage === 'account' ? 'auth-page-wrap' : 'auth-overlay'} onMouseDown={e => { if (e.target === e.currentTarget && activePage !== 'account') setAuthOpen(false); }}>
      <section className="auth-card" role="dialog" aria-modal="true" aria-label="VYNTRA login and signup">
        {activePage !== 'account' && <button className="auth-close" onClick={() => setAuthOpen(false)} aria-label="Close">×</button>}
        <div className="auth-logo"><img src="/assets/vyntra-logo.png" alt="VYNTRA"/><span>VYNTRA</span></div>
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
    <nav className="vyntra-bottom-nav" aria-label="Main navigation">
      <button className={activePage==='home'?'active':''} onClick={()=>{setActivePage('home');setAuthOpen(false);window.scrollTo({top:0,behavior:'smooth'})}}><span>⌂</span>Home</button>
      <button className={activePage==='categories'?'active':''} onClick={()=>{setActivePage('categories');setAuthOpen(false);window.scrollTo({top:0,behavior:'smooth'})}}><Grid2X2 size={22}/>Categories</button>
      <button className={activePage==='stores'?'active':''} onClick={()=>{setActivePage('stores');setAuthOpen(false);window.scrollTo({top:0,behavior:'smooth'})}}><ShoppingBag size={22}/>Stores</button>
      <button className={activePage==='wishlist'?'active':''} onClick={()=>{setActivePage('wishlist');setAuthOpen(false);window.scrollTo({top:0,behavior:'smooth'})}}><Heart size={22}/>Wishlist</button>
      <button className={activePage==='account'?'active':''} onClick={()=>{setActivePage('account');setAuthOpen(false);setAuthMode('login');window.scrollTo({top:0,behavior:'smooth'})}}><UserRound size={22}/>Account</button>
    </nav>
    {toast && <div className="toast">{toast}</div>}
  </div>;
}
const RootComponent = window.location.pathname.replace(/\/+$/, '') === '/admin' ? AdminPanel : App;
createRoot(document.getElementById('root')).render(<RootComponent/>);
