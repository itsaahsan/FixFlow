import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { Wrench } from 'lucide-react'

export default function Login(){
  const {login}=useAuth()
  const nav=useNavigate()
  const [email,setEmail]=useState('manager@fixflow.demo')
  const [password]=useState('demo123')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)
  const [demo,setDemo]=useState<any[]>([])

  const loadDemo=async()=>{
    try{ const r=await api.get('/api/auth/demo-accounts'); setDemo(r.data)}catch{}
  }
  // load on mount via immediate call
  if(demo.length===0) loadDemo()

  const submit=async(e:any)=>{
    e.preventDefault(); setErr(''); setLoading(true)
    try{ await login(email,password)
      const me=await api.get('/api/auth/me')
      const role=me.data.role
      if(role==='manager') nav('/dashboard')
      else if(role==='tenant') nav('/tenant')
      else nav('/technician')
    }catch(e:any){ setErr(e?.response?.data?.detail||'Login failed')}
    setLoading(false)
  }
  return <div className="min-h-[80vh] flex items-center justify-center px-4">
    <div className="w-full max-w-[1080px] grid lg:grid-cols-2 gap-8 items-center">
      <div className="hidden lg:block">
        <div className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-xs"><Wrench className="w-3 h-3"/> Demo Mode</div>
        <h1 className="text-4xl font-semibold tracking-tight mt-4">Welcome back.<br/>Pick a demo account to explore.</h1>
        <p className="text-zinc-600 mt-3">No signup needed. Password for all demos is <b>demo123</b>.</p>
        <div className="grid gap-2 mt-6">
          {demo.slice(0,6).map((d:any)=>
            <button key={d.email} onClick={()=>setEmail(d.email)} className={`text-left border rounded-xl p-3 flex items-center justify-between ${email===d.email?'border-zinc-900 bg-zinc-900 text-white':'bg-white hover:bg-zinc-50'}`}>
              <div><div className="text-sm font-medium">{d.name}</div><div className="text-xs opacity-70">{d.email} — {d.role}</div></div>
              <span className="text-xs border rounded-full px-2 py-1">{d.role}</span>
            </button>
          )}
        </div>
      </div>
      <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6"><div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center"><Wrench className="w-4 h-4 text-white"/></div><span className="font-semibold">FixFlow</span></div>
        <h2 className="text-xl font-semibold">Sign in</h2>
        <p className="text-sm text-zinc-600 mt-1">Use demo accounts to experience each role.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="text-sm font-medium">Email</label><input value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900" placeholder="manager@fixflow.demo"/></div>
          <div><label className="text-sm font-medium">Password</label><input type="password" value={password} readOnly className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm bg-zinc-50"/></div>
          {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</div>}
          <button disabled={loading} className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium disabled:opacity-50">{loading?'Signing in...':'Sign in'}</button>
        </form>
        <div className="mt-6 text-sm text-zinc-600">
          Quick fill:
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              {label:"Manager",email:"manager@fixflow.demo"},
              {label:"Tenant Alex",email:"alex@demo.com"},
              {label:"Tech Carlos",email:"carlos@fixflow.demo"},
            ].map(b=> <button key={b.email} onClick={()=>setEmail(b.email)} className="border rounded-full px-3 py-1 text-xs hover:bg-zinc-50">{b.label}</button>)}
          </div>
        </div>
        <div className="text-xs text-zinc-500 mt-6 text-center"><Link to="/" className="underline">Back to landing</Link> • Demo password: demo123</div>
      </div>
    </div>
  </div>
}
