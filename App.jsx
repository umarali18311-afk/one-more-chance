import React,{useEffect} from 'react';
import {Routes,Route,useLocation,Link} from 'react-router-dom';
import {Navbar,Footer,EmptyState} from './ui.jsx';
import {Home,Browse,Search,Categories,Category,PhotoDetail,VideoDetail,Collections,CollectionDetail,Soon} from './pages.jsx';
class Boundary extends React.Component{state={e:false};static getDerivedStateFromError(){return{e:true}}
 render(){return this.state.e?<main className="wrap page"><EmptyState title="Something went wrong" text="Reload the page to continue." action={<button className="btn" onClick={()=>location.reload()}>Reload</button>}/></main>:this.props.children}}
export default function App(){
  const {pathname}=useLocation();useEffect(()=>{window.scrollTo(0,0)},[pathname]);
  return <Boundary><a className="skip" href="#main">Skip to content</a><Navbar/>
  <main id="main" key={pathname} className="fade"><Routes>
    <Route path="/" element={<Home/>}/><Route path="/explore" element={<Browse kind="explore"/>}/>
    <Route path="/photos" element={<Browse kind="photos"/>}/><Route path="/videos" element={<Browse kind="videos"/>}/>
    <Route path="/search" element={<Search/>}/><Route path="/categories" element={<Categories/>}/>
    <Route path="/categories/:category" element={<Category/>}/><Route path="/photo/:id" element={<PhotoDetail/>}/><Route path="/video/:id" element={<VideoDetail/>}/>
    <Route path="/collections" element={<Collections/>}/><Route path="/collections/:id" element={<CollectionDetail/>}/>
    {['login','signup','profile','dashboard','admin','about','contact','privacy','terms'].map(p=><Route key={p} path={'/'+p} element={<Soon name={p}/>}/>)}
    <Route path="*" element={<div className="wrap page"><EmptyState title="Page not found" text="That address doesn't exist on Pixtre." action={<Link className="btn" to="/">Go home</Link>}/></div>}/>
  </Routes></main><Footer/></Boundary>;
}
