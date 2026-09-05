import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { PageWrap } from '../components/Layout'

export default function PropertyDetail(){
  const {id}=useParams()
  const [p,setP]=useState<any>(null)
  useEffect(()=>{ api.get(`/api/properties/${id}`).then(r=>setP(r.data))},[id])
  if(!p) return <PageWrap>Loading...</PageWrap>
  return <PageWrap>
    <div className="bg-white border rounded-2xl overflow-hidden">
      <img src={p.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900'} className="h-64 w-full object-cover"/>
      <div className="p-6">
        <h1 className="text-2xl font-semibold">{p.name}</h1>
        <div className="text-sm text-zinc-600">{p.address}</div>
        <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
          <div className="border rounded-xl p-3"><div className="text-xs text-zinc-500">Units</div><div className="font-semibold">{p.units.length}</div></div>
          <div className="border rounded-xl p-3"><div className="text-xs text-zinc-500">Total cost</div><div className="font-semibold">${p.total_cost}</div></div>
          <div className="border rounded-xl p-3"><div className="text-xs text-zinc-500">Categories</div><div className="text-xs">{Object.entries(p.category_breakdown).map(([k,v]:any)=> `${k} ${v}`).join(' • ')}</div></div>
        </div>
      </div>
    </div>
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white border rounded-2xl p-5">
        <h3 className="font-medium text-sm">Units & Tenants</h3>
        <div className="mt-3 space-y-2">
          {p.units.map((u:any)=><div key={u.id} className="border rounded-xl px-3 py-2 flex justify-between text-sm"><span>{u.unit_number}</span><span className="text-zinc-500">{u.tenant || 'Vacant'}</span></div>)}
        </div>
      </div>
      <div className="bg-white border rounded-2xl p-5">
        <h3 className="font-medium text-sm">Maintenance history</h3>
        <div className="mt-3 space-y-2 max-h-[320px] overflow-auto">
          {p.maintenance.map((m:any)=><div key={m.ticket_id} className="border rounded-xl px-3 py-2 flex justify-between text-sm"><div><div className="font-mono text-xs">{m.ticket_id}</div><div className="font-medium text-xs">{m.title}</div></div><div className="text-right"><div className="text-xs bg-zinc-900 text-white px-2 py-0.5 rounded-full">{m.status}</div><div className="text-xs text-zinc-500">{m.cost? `$${m.cost}`:'—'}</div></div></div>)}
        </div>
      </div>
    </div>
  </PageWrap>
}
