import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { PageWrap } from '../components/Layout'
import { useAuth } from '../context/AuthContext'

export default function TicketDetail(){
  const {id}=useParams()
  const {user}=useAuth()
  const [t,setT]=useState<any>(null)
  const [techs,setTechs]=useState<any[]>([])
  const [note,setNote]=useState('')
  const [cost,setCost]=useState('')
  const load=async()=>{ const r=await api.get(`/api/maintenance/${id}`); setT(r.data)}
  useEffect(()=>{ load(); api.get('/api/technicians').then(r=>setTechs(r.data)).catch(()=>{})},[id])
  if(!t) return <PageWrap>Loading...</PageWrap>
  const canManage = user?.role==='manager' || user?.role==='technician'
  const assign=async(techId:number)=>{ await api.post(`/api/maintenance/${t.id}/assign`,{technician_id:techId}); load()}
  const updateStatus=async(s:string)=>{ await api.patch(`/api/maintenance/${t.id}`,{status:s}); load()}
  const addNote=async()=>{ if(!note.trim()) return; await api.post(`/api/maintenance/${t.id}/notes`,{content:note}); setNote(''); load()}
  const complete=async()=>{ await api.post(`/api/maintenance/${t.id}/complete`,{cost: cost? Number(cost): null, notes: note || null}); setNote(''); setCost(''); load()}
  return <PageWrap>
    <div className="flex items-center gap-2 text-sm text-zinc-500"><span>Maintenance</span> / <span className="font-mono text-zinc-900">{t.ticket_id}</span></div>
    <div className="grid lg:grid-cols-3 gap-6 mt-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h1 className="text-xl font-semibold">{t.title}</h1><p className="text-sm text-zinc-600 mt-1">{t.description}</p></div>
            <span className={`text-xs px-3 py-1 rounded-full border ${t.priority==='High'?'bg-red-50 text-red-700 border-red-200':'bg-zinc-50'}`}>{t.priority} • {t.category}</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
            <div className="border rounded-xl p-3"><div className="text-xs text-zinc-500">Property</div><div className="font-medium">#{t.property_id}</div></div>
            <div className="border rounded-xl p-3"><div className="text-xs text-zinc-500">Tenant</div><div className="font-medium">{t.tenant?.full_name}</div></div>
            <div className="border rounded-xl p-3"><div className="text-xs text-zinc-500">Technician</div><div className="font-medium">{t.technician?.full_name || 'Unassigned'}</div></div>
          </div>
          <div className="mt-4 border rounded-xl p-4 bg-violet-50">
            <div className="text-xs font-semibold">AI Analysis {t.ai_category && <span className="ml-2 font-normal text-zinc-600">{t.ai_category} • {t.ai_priority}</span>}</div>
            {t.ai_issue && <div className="text-sm font-medium mt-1">{t.ai_issue}</div>}
            {t.ai_action && <div className="text-xs text-zinc-600 mt-1">{t.ai_action}</div>}
            {t.ai_response && <div className="text-xs bg-white border rounded-xl p-3 mt-2">“{t.ai_response}”</div>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs bg-zinc-900 text-white px-3 py-1 rounded-full">{t.status}</span>
            <span className="text-xs border rounded-full px-3 py-1">{t.location}</span>
            {t.cost!=null && <span className="text-xs border rounded-full px-3 py-1">${t.cost}</span>}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-medium text-sm">Timeline</h3>
          <div className="mt-3 relative">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-zinc-200"/>
            {t.events?.map((e:any)=> <div key={e.id} className="relative flex gap-3 py-2 pl-6"><div className="absolute left-0 w-4 h-4 rounded-full bg-zinc-900 border-2 border-white shadow"/><div><div className="text-sm font-medium">{e.status}</div><div className="text-xs text-zinc-500">{new Date(e.created_at).toLocaleString()}</div></div></div>)}
            {(!t.events || t.events.length===0) && <div className="text-xs text-zinc-500">No events yet.</div>}
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-medium text-sm">Notes</h3>
          <div className="space-y-2 mt-3">
            {t.notes?.map((n:any)=><div key={n.id} className="border rounded-xl p-3"><div className="text-sm">{n.content}</div><div className="text-xs text-zinc-500 mt-1">{n.author?.full_name} • {new Date(n.created_at).toLocaleString()}</div></div>)}
            {(!t.notes || t.notes.length===0) && <div className="text-xs text-zinc-500">No notes yet.</div>}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add repair notes..." className="flex-1 border rounded-xl px-3 py-2 text-sm"/>
            <button onClick={addNote} className="border px-4 py-2 rounded-xl text-sm font-medium">Add</button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {canManage && <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-medium text-sm">Actions</h3>
          <div className="mt-3 space-y-3">
            {user?.role==='manager' && <>
              <div className="text-xs font-medium">Assign technician</div>
              <select onChange={e=> e.target.value && assign(Number(e.target.value))} defaultValue="" className="w-full border rounded-xl px-3 py-2 text-sm">
                <option value="" disabled>Select technician</option>
                {techs.map((th:any)=><option key={th.id} value={th.id}>{th.full_name} — {th.specialty}</option>)}
              </select>
            </>}
            <div className="text-xs font-medium">Change status</div>
            <div className="flex flex-wrap gap-2">
              {['Assigned','Scheduled','In Progress','Completed'].map(s=> <button key={s} onClick={()=>updateStatus(s)} className="text-xs border rounded-full px-3 py-1 hover:bg-zinc-900 hover:text-white">{s}</button>)}
            </div>
            <div className="text-xs font-medium mt-3">Complete with cost</div>
            <input value={cost} onChange={e=>setCost(e.target.value)} placeholder="Estimated cost $" className="w-full border rounded-xl px-3 py-2 text-sm"/>
            <button onClick={complete} className="w-full bg-zinc-900 text-white py-2 rounded-xl text-sm font-medium">Mark Completed</button>
          </div>
        </div>}
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-medium text-sm">Details</h3>
          <div className="text-xs text-zinc-600 mt-2 space-y-1">
            <div>Ticket: <span className="font-mono">{t.ticket_id}</span></div>
            <div>Created: {new Date(t.created_at).toLocaleString()}</div>
            <div>Updated: {new Date(t.updated_at).toLocaleString()}</div>
            <div>Category: {t.category}</div>
          </div>
        </div>
      </div>
    </div>
  </PageWrap>
}
