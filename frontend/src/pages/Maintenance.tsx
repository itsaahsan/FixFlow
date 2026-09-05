import { useEffect, useState } from 'react'
import api from '../lib/api'
import { PageWrap } from '../components/Layout'
import { Link } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'

export default function Maintenance(){
  const [tickets,setTickets]=useState<any[]>([])
  const [q,setQ]=useState('')
  const [status,setStatus]=useState('')
  const [priority,setPriority]=useState('')
  const [category,setCategory]=useState('')
  const [sort,setSort]=useState('newest')
  const load=async()=>{
    const params:any={}
    if(q) params.search=q
    if(status) params.status=status
    if(priority) params.priority=priority
    if(category) params.category=category
    if(sort) params.sort=sort
    const r=await api.get('/api/maintenance',{params}); setTickets(r.data)
  }
  useEffect(()=>{ load()},[status,priority,category,sort])
  return <PageWrap>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Maintenance</h1>
      <div className="flex items-center gap-2">
        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400"/><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=> e.key==='Enter' && load()} placeholder="Search ticket, issue..." className="pl-9 pr-3 py-2 border rounded-xl text-sm w-[240px]"/></div>
        <button onClick={load} className="border px-3 py-2 rounded-xl text-sm">Search</button>
      </div>
    </div>

    <div className="bg-white border rounded-2xl p-4 mt-4 flex flex-wrap gap-2 items-center">
      <Filter className="w-4 h-4 text-zinc-500"/>
      <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded-xl px-3 py-2 text-sm"><option value="">All statuses</option><option>Reported</option><option>Assigned</option><option>Scheduled</option><option>In Progress</option><option>Completed</option></select>
      <select value={priority} onChange={e=>setPriority(e.target.value)} className="border rounded-xl px-3 py-2 text-sm"><option value="">All priorities</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
      <select value={category} onChange={e=>setCategory(e.target.value)} className="border rounded-xl px-3 py-2 text-sm"><option value="">All categories</option><option>Plumbing</option><option>Electrical</option><option>HVAC</option><option>Appliance</option><option>Structural</option><option>Internet</option><option>Other</option></select>
      <select value={sort} onChange={e=>setSort(e.target.value)} className="border rounded-xl px-3 py-2 text-sm"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="priority">Highest priority</option><option value="cost">Highest cost</option></select>
    </div>

    <div className="bg-white border rounded-2xl mt-4 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-xs text-zinc-500"><tr><th className="text-left px-4 py-3">Ticket</th><th className="text-left">Property / Unit</th><th className="text-left">Issue</th><th>Priority</th><th>Tech</th><th>Status</th><th className="text-right px-4">Created</th></tr></thead>
          <tbody>
            {tickets.map(t=> <tr key={t.id} className="border-t hover:bg-zinc-50">
              <td className="px-4 py-3 font-mono text-xs"><Link to={`/maintenance/${t.id}`} className="text-zinc-900 underline">{t.ticket_id}</Link></td>
              <td className="py-3"><div className="font-medium text-xs">Property #{t.property_id}</div><div className="text-xs text-zinc-500">Unit #{t.unit_id}</div></td>
              <td className="py-3 max-w-[260px]"><div className="font-medium truncate">{t.title}</div><div className="text-xs text-zinc-500 truncate">{t.category}</div></td>
              <td className="text-center"><span className={`text-xs px-2 py-1 rounded-full border ${t.priority==='Critical'?'bg-red-600 text-white': t.priority==='High'?'bg-red-50 text-red-700 border-red-200': t.priority==='Medium'?'bg-amber-50 text-amber-700':'bg-zinc-50'}`}>{t.priority}</span></td>
              <td className="text-center text-xs">{t.technician? t.technician.full_name.split(' ')[0] : '—'}</td>
              <td className="text-center"><span className="text-xs bg-zinc-900 text-white px-2 py-1 rounded-full">{t.status}</span></td>
              <td className="text-right px-4 text-xs text-zinc-500">{new Date(t.created_at).toLocaleDateString()}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {tickets.length===0 && <div className="p-10 text-center text-sm text-zinc-500">No maintenance requests match your filters.</div>}
    </div>
  </PageWrap>
}
