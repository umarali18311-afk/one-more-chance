import {useState,useEffect,useRef,useCallback} from 'react';
import {Link,useParams,useSearchParams} from 'react-router-dom';
import {media,bestFile,favorites,collections} from './lib/api.js';
import {CATEGORIES,usePageMeta,useAsync,Async,SearchBar,FilterBar,SaveToggle,AddToCollection,SectionHeader,MediaGrid,GridSkeleton,EmptyState,ErrorState,DownloadButton,ShareButton} from './ui.jsx';

// Editorial picks, not live analytics — Pexels doesn't expose a "trending
// searches" signal, so this list is curated by Pixtre, not measured. Labeled
// "Suggested" (not "Trending") so it's never presented as live data it isn't.
const SUGGESTED=['Minimal interiors','Aerial coast','Street style','Sports cars','Workspace','Wildlife','Mountains','Coffee'];

function CategoryCard({c}){
  const s=useAsync(()=>media.searchPhotos(c.title,1,1),[c.slug]);const p=s.data?.photos?.[0];
  return <Link to={`/categories/${c.slug}`} className="cat" style={{background:p?.avg_color||'var(--sand)'}}>
    {p&&<img loading="lazy" decoding="async" src={p.src.medium} alt="" />}<span><b>{c.title}</b><small>{c.desc}</small></span></Link>;
}
const CatGrid=({list=CATEGORIES})=><div className="cats">{list.map(c=><CategoryCard key={c.slug} c={c}/>)}</div>;

function PagedGrid({fetcher,kind,emptyText='Try a different keyword.'}){
  const [items,setItems]=useState([]);const [page,setPage]=useState(1);const [n,setN]=useState(0);
  const [more,setMore]=useState(false);const [st,setSt]=useState('loading');const [err,setErr]=useState(null);const [total,setTotal]=useState(null);
  useEffect(()=>{let live=true;setSt(page===1?'loading':'more');
    fetcher(page).then(d=>{if(!live)return;const l=d.photos||d.videos||[];setItems(p=>page===1?l:[...p,...l]);setTotal(d.total_results);setMore(!!d.next_page);setSt('idle')})
    .catch(e=>{if(live){setErr(e);setSt('error')}});return()=>{live=false}},[page,n]);
  if(st==='loading')return <GridSkeleton/>;
  if(st==='error'&&!items.length)return <ErrorState message={err.message} onRetry={()=>{setSt('loading');setN(x=>x+1)}}/>;
  if(!items.length)return <EmptyState title="No results" text={emptyText}/>;
  return <><MediaGrid items={items} kind={kind}/>
    <div className="more">{st==='error'&&<p role="alert">{err.message}</p>}{(more||st==='error')&&<button className="btn outline" disabled={st==='more'} onClick={()=>st==='error'?setN(x=>x+1):setPage(p=>p+1)}>{st==='more'?'Loading…':st==='error'?'Try again':'Load more'}</button>}
    {total!=null&&<p className="count">Showing {items.length.toLocaleString()} of {total.toLocaleString()}</p>}</div></>;
}
const Head=({title,text,children})=><div className="page-h"><div className="wrap"><h1>{title}</h1>{text&&<p>{text}</p>}{children}</div></div>;

// Debounces rapid, consecutive filter/URL updates (e.g. "Clear filters"
// resetting three fields at once) into a single navigation/request, without
// adding any delay to a single deliberate change.
function useDebouncedCallback(fn,ms=250){
  const ref=useRef();
  return useCallback((...args)=>{clearTimeout(ref.current);ref.current=setTimeout(()=>fn(...args),ms)},[fn,ms]);
}

export function Home(){
  usePageMeta();
  const ph=useAsync(()=>media.curatedPhotos(1,12),[]);const vd=useAsync(()=>media.popularVideos(1,8),[]);
  return <>
    <section className="hero"><div className="wrap"><h1>Discover visuals that bring ideas to life.</h1>
      <p>Search thousands of high-quality photos and videos, free to download and ready for your next project.</p>
      <SearchBar large/><div className="tags" aria-label="Suggested searches"><span>Suggested</span>{SUGGESTED.slice(0,6).map(t=><Link key={t} to={`/search?q=${encodeURIComponent(t)}`}>{t}</Link>)}</div></div></section>
    <section className="wrap sec"><SectionHeader title="Popular photos" text="Fresh, curated picks from photographers worldwide." to="/photos"/>
      <Async s={ph} skel={<GridSkeleton n={8}/>}>{d=><MediaGrid items={d.photos} kind="photo"/>}</Async></section>
    <section className="wrap sec"><SectionHeader title="Suggested searches" text="A starting point, curated by Pixtre — not live search data."/>
      <div className="pills">{SUGGESTED.map(t=><Link key={t} to={`/search?q=${encodeURIComponent(t)}`}>{t}</Link>)}</div></section>
    <section className="wrap sec"><SectionHeader title="Explore categories" to="/categories" cta="All categories"/><CatGrid list={CATEGORIES.slice(0,8)}/></section>
    <section className="wrap sec"><SectionHeader title="Popular videos" text="Motion clips for edits, sites and stories." to="/videos"/>
      <Async s={vd} skel={<GridSkeleton n={4}/>}>{d=><MediaGrid items={d.videos} kind="video"/>}</Async></section></>;
}
export function Browse({kind}){
  const t={photos:['Photos','Curated photography, updated daily.'],videos:['Videos','Popular clips from creators worldwide.'],explore:['Explore','Start with a category or browse what is curated today.']}[kind];
  usePageMeta(t[0],t[1]);
  // Curated/popular feeds don't accept orientation/size/color — Pexels only
  // supports those on its search endpoints — so no FilterBar renders here.
  return <><Head title={t[0]} text={t[1]}><SearchBar type={kind==='videos'?'videos':'photos'}/></Head>
    <div className="wrap sec">{kind==='explore'&&<><SectionHeader title="Categories"/><CatGrid/><div className="gap"/><SectionHeader title="Curated today"/></>}
    <PagedGrid key={kind} kind={kind==='videos'?'video':'photo'} fetcher={p=>kind==='videos'?media.popularVideos(p):media.curatedPhotos(p)}/></div></>;
}
export function Search(){
  const [sp,setSp]=useSearchParams();
  const q=(sp.get('q')||'').trim();const type=sp.get('type')==='videos'?'videos':'photos';
  const orientation=sp.get('orientation')||'';const size=sp.get('size')||'';const color=sp.get('color')||'';
  const applyFilters=useDebouncedCallback(f=>{const next=new URLSearchParams(sp);Object.entries(f).forEach(([k,v])=>v?next.set(k,v):next.delete(k));setSp(next,{replace:true})});
  usePageMeta(q?`${q} photos and videos`:'Search',q?`Browse ${type} for “${q}” on Pixtre.`:undefined);
  return <><Head title={q?`Results for “${q}”`:'Search Pixtre'}><SearchBar initial={q} type={type}/>
    {q&&<div className="tabs">{['photos','videos'].map(x=><Link key={x} aria-current={type===x?'page':undefined} to={`/search?q=${encodeURIComponent(q)}&type=${x}`}>{x==='photos'?'Photos':'Videos'}</Link>)}</div>}
    {q&&<FilterBar type={type} orientation={orientation} size={size} color={color} onChange={applyFilters}/>}</Head>
    <div className="wrap sec">{q?<PagedGrid key={q+type+orientation+size+color} kind={type==='videos'?'video':'photo'} emptyText={`Nothing matched “${q}” with these filters. Try clearing a filter or a broader keyword.`}
        fetcher={p=>type==='videos'?media.searchVideos(q,p,24,{orientation,size}):media.searchPhotos(q,p,24,{orientation,size,color})}/>
      :<EmptyState title="What are you looking for?" text="Enter a keyword above, or try a suggested search." action={<div className="pills">{SUGGESTED.map(t=><Link key={t} to={`/search?q=${encodeURIComponent(t)}`}>{t}</Link>)}</div>}/>}</div></>;
}
export function Categories(){usePageMeta('Categories','Browse Pixtre by category.');
  return <><Head title="Categories" text="Browse by subject to find where your idea begins."/><div className="wrap sec"><CatGrid/></div></>}
export function Category(){
  const {category}=useParams();const c=CATEGORIES.find(x=>x.slug===category);
  const [sp,setSp]=useSearchParams();const type=sp.get('type')==='videos'?'videos':'photos';
  const orientation=sp.get('orientation')||'';const size=sp.get('size')||'';const color=sp.get('color')||'';
  const applyFilters=useDebouncedCallback(f=>{const next=new URLSearchParams(sp);Object.entries(f).forEach(([k,v])=>v?next.set(k,v):next.delete(k));setSp(next,{replace:true})});
  usePageMeta(c?.title,c?.desc);
  if(!c)return <div className="wrap page"><EmptyState title="Category not found" text="Pick one from the full list." action={<Link className="btn" to="/categories">All categories</Link>}/></div>;
  return <><Head title={c.title} text={c.desc}><SearchBar initial={c.title} type={type}/>
    <div className="tabs">{['photos','videos'].map(x=><button key={x} aria-current={type===x?'page':undefined} onClick={()=>setSp(prev=>{const n=new URLSearchParams(prev);n.set('type',x);return n})}>{x==='photos'?'Photos':'Videos'}</button>)}</div>
    <FilterBar type={type} orientation={orientation} size={size} color={color} onChange={applyFilters}/></Head>
    <div className="wrap sec"><PagedGrid key={c.slug+type+orientation+size+color} kind={type==='videos'?'video':'photo'}
      fetcher={p=>type==='videos'?media.searchVideos(c.title,p,24,{orientation,size}):media.searchPhotos(c.title,p,24,{orientation,size,color})}/>
    <div className="gap"/><SectionHeader title="More categories"/><div className="pills">{CATEGORIES.filter(x=>x.slug!==c.slug).map(x=><Link key={x.slug} to={`/categories/${x.slug}`}>{x.title}</Link>)}</div></div></>;
}

const Skeleton=()=><div className="wrap page"><div className="sk detail-sk"/></div>;
export function PhotoDetail(){
  const {id}=useParams();const s=useAsync(()=>media.photo(id),[id]);const ph=s.data;
  const kw=ph?.alt?.split(/\s+/).filter(w=>w.length>3).slice(0,3).join(' ')||'inspiration';
  const rel=useAsync(()=>ph?media.searchPhotos(kw,1,13):Promise.resolve(null),[ph?.id]);
  usePageMeta(ph?(ph.alt||`Photo by ${ph.photographer}`):'Photo',ph?`Free photo by ${ph.photographer} on Pixtre.`:undefined,ph?.src.large);
  return <Async s={s} skel={<Skeleton/>}>{p=>{
    const ld=JSON.stringify({'@context':'https://schema.org','@type':'ImageObject',contentUrl:p.src.original,thumbnailUrl:p.src.medium,name:p.alt||'Untitled photo',creator:{'@type':'Person',name:p.photographer},license:'https://www.pexels.com/license/',acquireLicensePage:p.url});
    return <div className="wrap page"><script type="application/ld+json">{ld}</script><div className="detail">
    <figure><img src={p.src.large} srcSet={`${p.src.large} 940w, ${p.src.large2x} 1880w`} sizes="(max-width:900px) 100vw,66vw" alt={p.alt||`Photo by ${p.photographer}`} style={{background:p.avg_color,aspectRatio:`${p.width}/${p.height}`}}/></figure>
    <aside><h1>{p.alt||'Untitled photo'}</h1><p className="by">by <a href={p.photographer_url} target="_blank" rel="noopener noreferrer">{p.photographer}</a></p>
      <div className="acts"><DownloadButton href={p.src.original} label="Download original"/><SaveToggle kind="photo" id={p.id} className="btn outline save-btn"/><ShareButton title={p.alt}/></div>
      <AddToCollection kind="photo" id={p.id}/>
      <h2 className="mini">Sizes</h2><ul className="sizes">{[['Large',p.src.large2x],['Medium',p.src.large],['Small',p.src.medium]].map(([l,u])=><li key={l}><span>{l}</span><a href={u} target="_blank" rel="noopener noreferrer" download>Download</a></li>)}</ul>
      <dl className="meta"><dt>Dimensions</dt><dd>{p.width} × {p.height}px</dd><dt>Source</dt><dd><a href={p.url} target="_blank" rel="noopener noreferrer">View on Pexels</a></dd></dl></aside></div>
    <SectionHeader title="Related photos" text="Matched by keyword — Pexels has no dedicated related-photos endpoint."/><Async s={rel} skel={<GridSkeleton n={8}/>}>{d=>{const l=(d?.photos||[]).filter(x=>x.id!==p.id).slice(0,12);return l.length?<MediaGrid items={l} kind="photo"/>:<p className="muted">No related photos found.</p>}}</Async></div>;
  }}</Async>;
}
export function VideoDetail(){
  const {id}=useParams();const s=useAsync(()=>media.video(id),[id]);const vv=s.data;
  const rel=useAsync(()=>media.popularVideos(1,9),[]);
  usePageMeta(vv?`Video by ${vv.user.name}`:'Video',vv?`Free stock video by ${vv.user.name} on Pixtre.`:undefined,vv?.image);
  return <Async s={s} skel={<Skeleton/>}>{v=>{const f=bestFile(v);const files=(v.video_files||[]).filter(x=>x.file_type==='video/mp4'&&x.width).sort((a,b)=>b.width-a.width);
    const ld=JSON.stringify({'@context':'https://schema.org','@type':'VideoObject',name:`Video by ${v.user.name}`,thumbnailUrl:v.image,contentUrl:f?.link,duration:`PT${v.duration}S`,creator:{'@type':'Person',name:v.user.name}});
    return <div className="wrap page"><script type="application/ld+json">{ld}</script><div className="detail">
    <figure><video controls preload="metadata" playsInline poster={v.image} style={{aspectRatio:`${v.width}/${v.height}`}}>{f&&<source src={f.link} type="video/mp4"/>}Your browser can't play this video.</video></figure>
    <aside><h1>Video by {v.user.name}</h1><p className="by"><a href={v.user.url} target="_blank" rel="noopener noreferrer">{v.user.name}</a> · {v.duration}s</p>
      <div className="acts">{f&&<DownloadButton href={f.link} label="Download HD"/>}<SaveToggle kind="video" id={v.id} className="btn outline save-btn"/><ShareButton title={`Video by ${v.user.name}`}/></div>
      <AddToCollection kind="video" id={v.id}/>
      <h2 className="mini">Quality</h2><ul className="sizes">{files.slice(0,5).map(x=><li key={x.id}><span>{x.width} × {x.height}</span><a href={x.link} target="_blank" rel="noopener noreferrer" download>Download</a></li>)}</ul>
      <dl className="meta"><dt>Source</dt><dd><a href={v.url} target="_blank" rel="noopener noreferrer">View on Pexels</a></dd></dl></aside></div>
    <SectionHeader title="More popular videos"/><Async s={rel} skel={<GridSkeleton n={4}/>}>{d=><MediaGrid items={d.videos.filter(x=>x.id!==v.id).slice(0,8)} kind="video"/>}</Async></div>;}}</Async>;
}

// --- Favorites & collections (local-storage foundation; see §6 of the brief) ---
export function Collections(){
  usePageMeta('Saved & collections','Photos and videos you have saved on this device.');
  const [list,setList]=useState(collections.list());
  const [name,setName]=useState('');
  const saved=favorites.list();
  const create=e=>{e.preventDefault();const n=name.trim();if(!n)return;collections.create(n);setName('');setList(collections.list())};
  const remove=id=>{collections.remove(id);setList(collections.list())};
  return <><Head title="Saved & collections" text="Saved locally in this browser — accounts and cross-device syncing arrive in Prompt 3."/>
    <div className="wrap sec">
      <SectionHeader title="Saved"/>
      <Link to="/collections/saved" className="coll-card"><b>All saved items</b><span>{saved.length} item{saved.length===1?'':'s'}</span></Link>
      <div className="gap"/>
      <SectionHeader title="Your collections"/>
      {list.length===0&&<EmptyState title="No collections yet" text="Create one below, or add items from any photo or video page."/>}
      <div className="coll-list">{list.map(c=><div key={c.id} className="coll-card-row"><Link to={`/collections/${c.id}`} className="coll-card"><b>{c.name}</b><span>{c.items.length} item{c.items.length===1?'':'s'}</span></Link><button className="btn outline" onClick={()=>remove(c.id)} aria-label={`Delete ${c.name}`}>Delete</button></div>)}</div>
      <form className="new-coll" onSubmit={create}><input value={name} onChange={e=>setName(e.target.value)} placeholder="New collection name" aria-label="New collection name"/><button className="btn" type="submit">Create collection</button></form>
    </div></>;
}
export function CollectionDetail(){
  const {id}=useParams();const isSaved=id==='saved';
  const coll=isSaved?null:collections.get(id);
  const pairs=isSaved?favorites.list():(coll?.items||[]);
  usePageMeta(isSaved?'All saved items':coll?.name,'Saved locally in this browser.');
  if(!isSaved&&!coll)return <div className="wrap page"><EmptyState title="Collection not found" text="It may have been deleted on this device." action={<Link className="btn" to="/collections">Back to saved</Link>}/></div>;
  return <><Head title={isSaved?'All saved items':coll.name} text={`${pairs.length} item${pairs.length===1?'':'s'} — saved locally in this browser.`}>
      <Link className="link" to="/collections">← Back to saved &amp; collections</Link></Head>
    <div className="wrap sec"><SavedSection pairs={pairs}/></div></>;
}
function SavedSection({pairs}){
  const [items,setItems]=useState(null);
  useEffect(()=>{let live=true;setItems(null);Promise.all(pairs.map(({kind,id})=>(kind==='photo'?media.photo(id):media.video(id)).then(d=>({kind,data:d})).catch(()=>null)))
    .then(r=>live&&setItems(r.filter(Boolean)));return()=>{live=false}},[JSON.stringify(pairs)]);
  if(pairs.length===0)return <EmptyState title="Nothing saved here yet" text="Use the save icon on any photo or video to add it." action={<Link className="btn" to="/explore">Explore media</Link>}/>;
  if(items===null)return <GridSkeleton n={Math.min(pairs.length,8)}/>;
  if(items.length===0)return <EmptyState title="These items are unavailable" text="They may have been removed from Pexels since you saved them."/>;
  return <MediaGrid items={items.map(({data})=>data)} kind={items[0].kind}/>;
}

export function Soon({name}){const t=name[0].toUpperCase()+name.slice(1);usePageMeta(t);
  const later={login:3,signup:3,profile:3,dashboard:3,admin:4}[name];
  return <div className="wrap page"><EmptyState title={t} text={later?`${t} arrives in Prompt ${later} of the Pixtre build.`:`This page is coming soon.`} action={<Link className="btn" to="/">Back to home</Link>}/></div>}
