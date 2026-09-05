import { useEffect, useState } from 'react'
import api from '../lib/api'
import { PageWrap } from '../components/Layout'

export default function TechniciansPage(){
  const [list,setList]=useState<any[]>([])
  useEffect(()=>{ api.get('/api/technicians').then(r=>setList(r.data))},[])
  return <PageWrap>
    <h1 className="text-2xl font-semibold tracking-tight">Technicians</h1>
    <p className="text-sm text-zinc-600">Manage your trusted network — assign by specialty.</p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {list.map(t=> <div key={t.id} className="bg-white border rounded-2xl p-5">
        <div className="flex items-center gap-3"><img src={`https://i.pravatar.cc/100?u=${t.email}`} className="w-10 h-10 rounded-full"/><div><div className="font-medium text-sm">{t.full_name}</div><div className="text-xs text-zinc-500">{t.specialty}</div></div></div>
        <div className="text-xs text-zinc-600 mt-3">{t.email}<br/>{t.phone}</div>
        <div className="mt-3 text-xs border rounded-xl p-2 bg-zinc-50">⭐ 4.8 • 127 jobs • Avg 2.1 days</div>
      </div>)}
    </div>
  </PageWrap>
}
