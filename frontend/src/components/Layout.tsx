import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wrench, LayoutDashboard, Building2, ClipboardList, Users, BarChart3, LogOut, Bell, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../lib/api'

export function TopNav(){
  const {user,logout}=useAuth()
  const loc=useLocation()
  const nav=useNavigate()
  const [mobile,setMobile]=useState(false)
  const [notifs,setNotifs]=useState<any[]>([])
  useEffect(()=>{ if(user) api.get('/api/analytics/notifications').then(r=>setNotifs(r.data)).catch(()=>{})},[user])
  const unread=notifs.filter(n=>!n.read).length
  const isActive=(p:string)=> loc.pathname===p || loc.pathname.startsWith(p+'/')
  const links=[
    {to:'/dashboard',label:'Dashboard',icon:LayoutDashboard,roles:['manager']},
    {to:'/tenant',label:'Home',icon:LayoutDashboard,roles:['tenant']},
    {to:'/technician',label:'Jobs',icon:LayoutDashboard,roles:['technician']},
    {to:'/properties',label:'Properties',icon:Building2,roles:['manager']},
    {to:'/maintenance',label:'Maintenance',icon:ClipboardList,roles:['manager','tenant','technician']},
    {to:'/technicians',label:'Technicians',icon:Users,roles:['manager']},
    {to:'/analytics',label:'Analytics',icon:BarChart3,roles:['manager']},
  ].filter(l=> !user || l.roles.includes(user.role))

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-zinc-200">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to={user? (user.role==='manager'?'/dashboard': user.role==='tenant'?'/tenant':'/technician') : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center"><Wrench className="w-4 h-4 text-white"/></div>
            <span className="font-semibold text-[17px] tracking-tight">FixFlow</span>
            <span className="hidden sm:inline text-xs text-zinc-500 ml-1 border border-zinc-200 rounded-full px-2 py-0.5">BETA</span>
          </Link>
          {user && <nav className="hidden lg:flex items-center gap-1">
            {links.map(l=> <Link key={l.to} to={l.to} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isActive(l.to)?'bg-zinc-900 text-white':'text-zinc-600 hover:bg-zinc-100'}`}><l.icon className="w-4 h-4"/>{l.label}</Link>)}
          </nav>}
        </div>
        <div className="flex items-center gap-2">
          {user ? <>
            <button className="relative p-2 hover:bg-zinc-100 rounded-lg">
              <Bell className="w-5 h-5 text-zinc-600"/><span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-medium">{unread||0}</span>
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l">
              <div className="text-right leading-tight">
                <div className="text-sm font-medium">{user.full_name}</div>
                <div className="text-xs text-zinc-500 capitalize">{user.role}</div>
              </div>
              <img src={`https://i.pravatar.cc/100?u=${user.email}`} className="w-8 h-8 rounded-full object-cover"/>
            </div>
            <button onClick={()=>{logout(); nav('/login')}} className="hidden sm:flex p-2 hover:bg-zinc-100 rounded-lg"><LogOut className="w-4 h-4"/></button>
          </> : <>
            <Link to="/login" className="text-sm font-medium px-4 py-2 hover:bg-zinc-100 rounded-lg">Sign in</Link>
            <Link to="/login" className="bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-lg">Get Started</Link>
          </>}
          {user && <button onClick={()=>setMobile(!mobile)} className="lg:hidden p-2">{mobile?<X/>:<Menu/>}</button>}
        </div>
      </div>
      {mobile && user && (
        <div className="lg:hidden border-t bg-white px-4 py-3 space-y-1">
          {links.map(l=> <Link key={l.to} to={l.to} onClick={()=>setMobile(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-zinc-50"><l.icon className="w-4 h-4"/>{l.label}</Link>)}
          <button onClick={()=>{logout(); nav('/login')}} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm">Log out</button>
        </div>
      )}
    </header>
  )
}
export function PageWrap({children}:{children:any}){
  return <div className="min-h-[calc(100vh-64px)] bg-[#fafafa]"><div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6 sm:py-8">{children}</div></div>
}
