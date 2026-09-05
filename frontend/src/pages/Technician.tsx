import { useEffect, useState } from 'react'
import api from '../lib/api'
import { PageWrap } from '../components/Layout'
import { Link } from 'react-router-dom'

export default function Technician(){
  const [tickets,setTickets]=useState<any[]>([])
  const load=()=>api.get('/api/maintenance').then(r=>setTickets(r.data))
  useEffect(()=>{load()},[])
  const assigned=tickets.filter(t=> t.technician) // demo: show all for simplicity
  const today=assigned.filter(t=> t.status!=='Completed').slice(0,4)
  const upcoming=assigned.filter(t=> t.status==='Assigned' || t.status==='Scheduled')
  const completed=assigned.filter(t=> t.status==='Completed').slice(0,5)
  const updateStatus=async(id:number,status:string)=>{
    await api.patch(`/api/maintenance/${id}`,{status}); load()
  }
  return <PageWrap>
    <h1 className="text-2xl font-semibold tracking-tight">Technician Dashboard</h1>
    <p className="text-sm text-zinc-600">Your jobs — accept, update, and close out.</p>
    <div className="grid lg:grid-cols-3 gap-6 mt-6">
      <div className="bg-white border rounded-2xl p-5">
        <h3 className="font-medium text-sm">Today's Jobs • {today.length}</h3>
        <div className="mt-3 space-y-3">
          {today.length===0? <div className="text-sm text-zinc-500 border border-dashed rounded-xl p-6 text-center">No jobs today — check upcoming.</div>:
            today.map(j=> <div key={j.id} className="border rounded-xl p-3">
              <div className="flex justify-between items-start"><Link to={`/maintenance/${j.id}`} className="font-medium text-sm underline">{j.ticket_id} — {j.title}</Link><span className={`text-xs px-2 py-1 rounded-full ${j.priority==='High'?'bg-red-50 text-red-700 border border-red-200':'bg-amber-50'}`}>{j.priority}</span></div>
              <div className="text-xs text-zinc-600 mt-1">{j.description.slice(0,80)}...</div>
              <div className="text-xs text-zinc-500 mt-1">{j.location} • {new Date(j.created_at).toLocaleDateString()}</div>
              <div className="flex gap-2 mt-3">
                {['Accepted','On the way','In Progress','Completed'].map(s=>{
                  const map:any={Accepted:'Assigned', 'On the way':'Scheduled', 'In Progress':'In Progress', Completed:'Completed'}
                  return <button key={s} onClick={()=>updateStatus(j.id, map[s])} className="text-xs border rounded-full px-3 py-1 hover:bg-zinc-900 hover:text-white">{s}</button>
                })}
              </div>
            </div>)}
        </div>
      </div>
      <div className="bg-white border rounded-2xl p-5">
        <h3 className="font-medium text-sm">Upcoming • {upcoming.length}</h3>
        <div className="mt-3 space-y-2">
          {upcoming.map(j=> <Link to={`/maintenance/${j.id}`} key={j.id} className="block border rounded-xl p-3 hover:bg-zinc-50"><div className="font-medium text-sm">{j.ticket_id} — {j.title}</div><div className="text-xs text-zinc-500">{j.status} • {j.priority}</div></Link>)}
          {upcoming.length===0 && <div className="text-xs text-zinc-500">No upcoming.</div>}
        </div>
      </div>
      <div className="bg-white border rounded-2xl p-5">
        <h3 className="font-medium text-sm">Completed • {completed.length}</h3>
        <div className="mt-3 space-y-2">
          {completed.map(j=> <div key={j.id} className="border rounded-xl p-3"><div className="font-medium text-sm">{j.ticket_id} — {j.title}</div><div className="text-xs text-zinc-500">Completed • ${j.cost||0}</div></div>)}
        </div>
      </div>
    </div>
  </PageWrap>
}
