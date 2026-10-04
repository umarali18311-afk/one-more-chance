import {useState,useEffect} from 'react';
import {Link,NavLink,useLocation,useNavigate} from 'react-router-dom';
import {bestFile,fmtDur,favorites,collections} from './lib/api.js';

export const CATEGORIES=[['nature','Nature','Landscapes, wildlife and the quiet outdoors.'],['travel','Travel','Destinations and moments from around the world.'],
['technology','Technology','Devices, code and the tools shaping work.'],['business','Business','Workspaces, teams and everyday craft.'],
['people','People','Portraits and candid, unposed moments.'],['architecture','Architecture','Structure, form and light in built spaces.'],
['cars','Cars','Design, speed and the open road.'],['fashion','Fashion','Style, texture and editorial looks.'],
['food','Food','Ingredients and tables worth gathering around.'],['animals','Animals','Wildlife and companions, up close.'],
['sports','Sports','Movement, effort and the energy of play.'],['lifestyle','Lifestyle','Slow mornings, home and everyday living.']].map(([slug,title,desc])=>({slug,title,desc}));

export function usePageMeta(title,desc,image){useEffect(()=>{
  document.title=title?`${title} — Pixtre`:'Pixtre — Discover visuals that bring ideas to life';
  const set=(k,n,v)=>{if(!v)return;let el=document.head.querySelector(`meta[${k}="${n}"]`);if(!el){el=document.createElement('meta');el.setAttribute(k,n);document.head.appendChild(el)}el.setAttribute('content',v)};
  const d=desc||'Discover high-quality photos and videos on Pixtre.';
  set('name','description',d);set('property','og:title',document.title);set('property','og:description',d);set('property','og:image',image);
},[title,desc,image])}

export function useAsync(fn,deps){
  const [st,set]=useState({loading:true});const [n,setN]=useState(0);
  useEffect(()=>{let live=true;set({loading:true});fn().then(data=>live&&set({data})).catch(error=>live&&set({error}));return()=>{live=false}},[...deps,n]);
  return {...st,retry:()=>setN(x=>x+1)};
}
export const Async=({s,skel,children})=>s.loading?skel:s.error?<ErrorState message={s.error.message} onRetry={s.retry}/>:children(s.data);

export const Logo=()=><Link to="/" className="logo" aria-label="Pixtre home">Pixtre<i aria-hidden="true"/></Link>;
const LINKS=[['/explore','Explore'],['/photos','Photos'],['/videos','Videos'],['/categories','Categories']];
const SavedIcon=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>;
export function Navbar(){
  const [open,setOpen]=useState(false);const {pathname}=useLocation();
  const [saved,setSaved]=useState(0);
  useEffect(()=>setOpen(false),[pathname]);
  useEffect(()=>{const n=favorites.list().length+collections.list().reduce((s,c)=>s+c.items.length,0);setSaved(n)},[pathname]);
  useEffect(()=>{const k=e=>e.key==='Escape'&&setOpen(false);window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[]);
  return <header className="nav"><div className="wrap nav-in"><Logo/>
    <nav className="nav-links" aria-label="Main">{LINKS.map(([to,l])=><NavLink key={to} to={to}>{l}</NavLink>)}</nav>
    <div className="nav-actions"><Link className="icon-btn" to="/collections" aria-label={`Saved${saved?`, ${saved} item${saved===1?'':'s'}`:''}`}><SavedIcon/>{saved>0&&<i className="dot" aria-hidden="true"/>}</Link>
      <Link className="btn quiet" to="/login">Log in</Link><Link className="btn" to="/signup">Sign up</Link></div>
    <button className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" aria-label={open?'Close menu':'Open menu'} onClick={()=>setOpen(!open)}><span/><span/></button></div>
    <div id="mobile-menu" className={'mobile'+(open?' open':'')}><div><div className="wrap">
      <SearchBar compact/>
      <nav aria-label="Mobile">{LINKS.map(([to,l])=><NavLink key={to} to={to}>{l}</NavLink>)}<NavLink to="/collections">Saved{saved>0?` (${saved})`:''}</NavLink></nav>
      <div className="m-actions"><Link className="btn quiet" to="/login">Log in</Link><Link className="btn" to="/signup">Sign up</Link></div></div></div></div></header>;
}
export function SearchBar({initial='',type='photos',large,compact}){
  const nav=useNavigate();const [q,setQ]=useState(initial);const [t,setT]=useState(type);
  useEffect(()=>{setQ(initial);setT(type)},[initial,type]);
  const go=e=>{e.preventDefault();const s=q.trim();if(s)nav(`/search?q=${encodeURIComponent(s)}&type=${t}`)};
  return <form role="search" className={'sb'+(large?' lg':'')+(compact?' compact':'')} onSubmit={go}>
    <div className="seg" role="group" aria-label="Media type">{['photos','videos'].map(x=><button type="button" key={x} aria-pressed={t===x} onClick={()=>setT(x)}>{x==='photos'?'Photos':'Videos'}</button>)}</div>
    <input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder={`Search ${t}…`} aria-label="Search Pixtre" enterKeyHint="search"/>
    {q&&<button type="button" className="clear" aria-label="Clear search" onClick={()=>setQ('')}>×</button>}
    <button className="btn" type="submit">Search</button></form>;
}
export const SectionHeader=({title,text,to,cta='View all'})=><div className="sec-h"><div><h2>{title}</h2>{text&&<p>{text}</p>}</div>{to&&<Link className="link" to={to}>{cta}</Link>}</div>;

// Filters Pexels' *search* endpoints actually accept: orientation + size for
// both media types, color for photos only. No sort control exists here on
// purpose — the Pexels API has no sort parameter, and this card does not
// pretend otherwise. Applies to /search and /categories/:slug only; curated
// and popular feeds don't take these params, so they don't render this bar.
const ORIENTATIONS=[['','Any orientation'],['landscape','Landscape'],['portrait','Portrait'],['square','Square']];
const SIZES=[['','Any size'],['large','Large'],['medium','Medium'],['small','Small']];
const COLORS=[['red','#c0392b'],['orange','#d9742f'],['yellow','#e0b324'],['green','#4f8a5b'],['turquoise','#2ea6a6'],['blue','#3b6ea5'],['violet','#7b5ea7'],['pink','#c77b9b'],['brown','#8a5a3a'],['black','#1a1a1a'],['gray','#8a8a8a'],['white','#ffffff']];
export function FilterBar({type,orientation='',size='',color='',onChange}){
  const set=patch=>onChange({orientation,size,color,...patch});
  const active=orientation||size||color;
  return <div className="filters" role="group" aria-label="Filters">
    <label className="fselect"><span>Orientation</span><select value={orientation} onChange={e=>set({orientation:e.target.value})}>{ORIENTATIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
    <label className="fselect"><span>Size</span><select value={size} onChange={e=>set({size:e.target.value})}>{SIZES.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
    {type==='photos'&&<div className="fcolor" role="group" aria-label="Color">
      <button type="button" className={'swatch any'+(color===''?' on':'')} aria-label="Any color" aria-pressed={color===''} onClick={()=>set({color:''})}/>
      {COLORS.map(([name,hex])=><button type="button" key={name} className={'swatch'+(color===name?' on':'')} style={{background:hex}} aria-label={name} aria-pressed={color===name} onClick={()=>set({color:name})}/>)}
    </div>}
    {active&&<button type="button" className="link clear-f" onClick={()=>onChange({orientation:'',size:'',color:''})}>Clear filters</button>}
  </div>;
}

export function SaveToggle({kind,id,className='icon-btn'}){
  const [on,setOn]=useState(()=>favorites.has(kind,id));
  return <button type="button" className={className+(on?' on':'')} aria-pressed={on} aria-label={on?'Remove from saved':'Save'} onClick={e=>{e.preventDefault();e.stopPropagation();setOn(favorites.toggle(kind,id))}}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill={on?'currentColor':'none'} aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.2C.3 8 2 4.5 5.5 4A5.6 5.6 0 0 1 12 7a5.6 5.6 0 0 1 6.5-3C22 4.5 23.7 8 22 11.8 19.5 16.4 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg></button>;
}

export function AddToCollection({kind,id}){
  const [list,setList]=useState(collections.list());
  const [name,setName]=useState('');
  const refresh=()=>setList(collections.list());
  const inAny=cId=>collections.get(cId)?.items.some(i=>i.kind===kind&&i.id===id);
  return <details className="add-coll">
    <summary className="btn outline">Add to collection</summary>
    <div className="add-coll-panel">
      {list.length===0&&<p className="muted">No collections yet.</p>}
      <ul>{list.map(c=><li key={c.id}><label><input type="checkbox" checked={!!inAny(c.id)} onChange={e=>{e.target.checked?collections.addItem(c.id,kind,id):collections.removeItem(c.id,kind,id);refresh()}}/> {c.name}</label></li>)}</ul>
      <form className="new-coll" onSubmit={e=>{e.preventDefault();const n=name.trim();if(!n)return;const c=collections.create(n);collections.addItem(c.id,kind,id);setName('');refresh()}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="New collection name" aria-label="New collection name"/>
        <button className="btn outline" type="submit">Create</button>
      </form>
    </div>
  </details>;
}

export function DownloadButton({href,label='Download',className='btn'}){return <a className={className} href={href} target="_blank" rel="noopener noreferrer" download>{label}</a>}
export function ShareButton({title,className='btn outline'}){
  const [done,setDone]=useState(false);
  const share=async()=>{const url=location.href;try{if(navigator.share){await navigator.share({title,url});return}await navigator.clipboard.writeText(url);setDone(true);setTimeout(()=>setDone(false),2000)}catch{}};
  return <button className={className} onClick={share} aria-live="polite">{done?'Link copied':'Share'}</button>;
}
export function MediaCard({item,kind}){
  const p=kind==='photo';const creator=p?item.photographer:item.user.name;
  const dl=p?item.src.original:bestFile(item)?.link;const w350=Math.round(350*item.width/item.height),w650=Math.round(650*item.width/item.height);
  const alt=p?(item.alt||`Photo by ${creator}`):`Video by ${creator}`;
  return <article className="card" style={{aspectRatio:`${item.width}/${item.height}`,background:item.avg_color||'var(--sand)'}}>
    <Link to={`/${kind}/${item.id}`} aria-label={`View ${alt}`}>
      {p?<img loading="lazy" decoding="async" width={item.width} height={item.height} alt={alt} src={item.src.medium} srcSet={`${item.src.medium} ${w350}w, ${item.src.large} ${w650}w`} sizes="(max-width:600px) 50vw,(max-width:1000px) 33vw,25vw"/>
        :<img loading="lazy" decoding="async" width={item.width} height={item.height} alt={alt} src={item.image}/>}</Link>
    {!p&&<span className="badge" aria-label={`Video, ${item.duration} seconds`}>▶ {fmtDur(item.duration)}</span>}
    <SaveToggle kind={kind} id={item.id} className="icon-btn card-save"/>
    <div className="card-bar"><a className="who" href={p?item.photographer_url:item.user.url} target="_blank" rel="noopener noreferrer">{creator}</a>
      {dl&&<a className="chip" href={dl} target="_blank" rel="noopener noreferrer" download aria-label={`Download ${alt}`}>Download</a>}</div></article>;
}
export const MediaGrid=({items,kind})=><div className="masonry">{items.map(i=><MediaCard key={i.id} item={i} kind={kind}/>)}</div>;
export const GridSkeleton=({n=12})=><div className="masonry" aria-busy="true" aria-label="Loading">{Array.from({length:n},(_,i)=><div key={i} className="card sk" style={{aspectRatio:['3/4','4/3','1/1','3/4','4/5'][i%5]}}/>)}</div>;
export const EmptyState=({title,text,action})=><div className="state"><h2>{title}</h2><p>{text}</p>{action}</div>;
export const ErrorState=({message,onRetry})=><div className="state" role="alert"><h2>We couldn't load this</h2><p>{message}</p>{onRetry&&<button className="btn" onClick={onRetry}>Try again</button>}</div>;
export function Footer(){return <footer className="foot"><div className="wrap foot-in"><div><Logo/><p>Photos and videos to start your next idea, sourced from Pexels.</p></div>
  {[['Explore',[['/photos','Photos'],['/videos','Videos'],['/categories','Categories'],['/collections','Saved & collections']]],['Company',[['/about','About'],['/contact','Contact']]],['Legal',[['/privacy','Privacy'],['/terms','Terms']]]].map(([h,l])=><nav key={h} aria-label={h}><h3>{h}</h3>{l.map(([to,t])=><Link key={to} to={to}>{t}</Link>)}</nav>)}</div>
  <div className="wrap copy">© {new Date().getFullYear()} Pixtre. Media provided by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>.</div></footer>}
