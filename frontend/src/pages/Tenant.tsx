import { useEffect, useState } from 'react'
import api, { getAI } from '../lib/api'
import { PageWrap } from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Sparkles, Upload, MapPin } from 'lucide-react'

export default function Tenant(){
  const {user}=useAuth()
  const [tickets,setTickets]=useState<any[]>([])
  const [desc,setDesc]=useState('Water is leaking underneath the kitchen sink and the cabinet is getting wet.')
  const [location,setLocation]=useState('Kitchen')
  const [ai,setAi]=useState<any>(null)
  const [loadingAi,setLoadingAi]=useState(false)
  const [submitting,setSubmitting]=useState(false)
  const [prop,setProp]=useState<any>(null)

  const load=()=> api.get('/api/maintenance').then(r=>setTickets(r.data))
  useEffect(()=>{ load(); api.get('/api/properties').then(r=> setProp(r.data[0]))},[])

  const analyze=async()=>{
    if(!desc.trim()) return
    setLoadingAi(true)
    try{ const r=await getAI(desc); setAi(r)}catch{}
    setLoadingAi(false)
  }
  const submit=async()=>{
    if(!desc.trim()) return
    setSubmitting(true)
    await api.post('/api/maintenance',{description:desc, location, title: ai?.issue })
    setDesc(''); setAi(null); load()
    setSubmitting(false)
  }

  return <PageWrap>
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[24px] p-6 sm:p-8 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="text-zinc-400 text-sm">Good morning,</div><h1 className="text-3xl font-semibold tracking-tight">{user?.full_name?.split(' ')[0] || 'Alex'}.</h1>
        <div className="mt-4 inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl p-3">
          <img src={prop?.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200'} className="w-14 h-14 rounded-xl object-cover"/>
          <div><div className="font-medium text-sm">{prop?.name || 'Sunrise Apartments'}</div><div className="text-xs text-white/70">Unit 4B • 1242 Market St, SF</div><div className="text-xs text-emerald-300">Lease active</div></div>
        </div>
        </div>
        <div className="bg-white text-zinc-900 rounded-2xl p-4 min-w-[220px]">
          <div className="text-xs text-zinc-500">Open requests</div><div className="text-2xl font-semibold">{tickets.filter(t=>t.status!=='Completed').length}</div>
          <div className="text-xs text-zinc-500 mt-2">Avg response &lt; 4h</div>
        </div>
      </div>
    </div>

    <div className="grid lg:grid-cols-5 gap-6 mt-6">
      <div className="lg:col-span-3 bg-white border rounded-2xl p-5 sm:p-6">
        <h2 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4"/> Report an Issue</h2>
        <p className="text-sm text-zinc-600 mt-1">Describe the problem — FixFlow will categorize and prioritize it instantly.</p>
        <div className="mt-4 space-y-3">
          <div><label className="text-sm font-medium">Issue description</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={4} placeholder="e.g., Water is leaking underneath the kitchen sink..." className="mt-1 w-full border rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-zinc-900 outline-none"/></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-sm font-medium flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</label><select value={location} onChange={e=>setLocation(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5 text-sm"><option>Kitchen</option><option>Bathroom</option><option>Bedroom</option><option>Living Room</option><option>Other</option></select></div>
            <div><label className="text-sm font-medium flex items-center gap-1"><Upload className="w-3 h-3"/> Photo (optional)</label><div className="mt-1 border border-dashed rounded-xl px-3 py-2.5 text-sm text-zinc-500 bg-zinc-50">Upload or drag — mocked for demo</div></div>
          </div>
          <div className="flex gap-2">
            <button onClick={analyze} disabled={loadingAi} className="border px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-50">{loadingAi?'Analyzing...':'Preview AI analysis'}</button>
            <button onClick={submit} disabled={submitting || !desc.trim()} className="flex-1 bg-zinc-900 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">{submitting?'Submitting...':'Submit request'}</button>
          </div>
          {ai && (
            <div className="border rounded-2xl p-4 bg-gradient-to-br from-violet-50 to-white">
              <div className="text-xs font-medium flex items-center gap-2"> <Sparkles className="w-3 h-3 text-violet-600"/> AI Analysis {ai.is_mock ? <span className="bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded-full">MOCK — deterministic</span> : <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">LIVE AI</span>}</div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                <div className="border rounded-xl p-3 bg-white"><div className="text-xs text-zinc-500">Category</div><div className="font-semibold">{ai.category}</div></div>
                <div className="border rounded-xl p-3 bg-white"><div className="text-xs text-zinc-500">Priority</div><div className={`font-semibold ${ai.priority==='High'?'text-red-600': ai.priority==='Critical'?'text-red-700':'text-amber-600'}`}>{ai.priority}</div></div>
                <div className="border rounded-xl p-3 bg-white"><div className="text-xs text-zinc-500">Issue</div><div className="font-medium text-xs">{ai.issue}</div></div>
              </div>
              <div className="text-xs text-zinc-600 mt-3">→ {ai.action}</div>
              <div className="text-xs bg-white border rounded-xl p-3 mt-2">“{ai.response}”</div>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-medium text-sm">Your requests</h3>
          <div className="mt-3 space-y-3">
            {tickets.length===0? <div className="text-sm text-zinc-500 border border-dashed rounded-xl p-6 text-center">No requests yet — report your first issue.</div> :
              tickets.slice(0,6).map(t=> <Link to={`/maintenance/${t.id}`} key={t.id} className="block border rounded-xl p-3 hover:bg-zinc-50">
                <div className="flex items-center justify-between"><span className="font-mono text-xs">{t.ticket_id}</span><span className={`text-xs px-2 py-0.5 rounded-full border ${t.priority==='High'?'bg-red-50 text-red-700 border-red-200':'bg-zinc-50'}`}>{t.priority}</span></div>
                <div className="font-medium text-sm mt-1">{t.title}</div>
                <div className="text-xs text-zinc-500 line-clamp-2">{t.description}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs bg-zinc-900 text-white px-2 py-1 rounded-full">{t.status}</span>
                  <span className="text-xs text-zinc-500">{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 flex gap-1">
                  {['Reported','Analyzing','Assigned','In Progress','Completed'].map((s,i)=>{
                    const active = ['Reported','Analyzing','Assigned','Scheduled','In Progress','Completed'].indexOf(t.status) >= i
                    return <div key={s} className={`h-1 flex-1 rounded-full ${active?'bg-zinc-900':'bg-zinc-200'}`}/>
                  })}
                </div>
              </Link>)}
          </div>
        </div>
        <div className="bg-zinc-900 text-white rounded-2xl p-5">
          <div className="text-sm font-medium">How FixFlow helps you</div>
          <ul className="text-sm text-zinc-300 mt-2 space-y-1 list-disc pl-4">
            <li>AI triages in seconds</li>
            <li>Technician assigned by manager</li>
            <li>Live status updates</li>
          </ul>
        </div>
      </div>
    </div>
  </PageWrap>
}
