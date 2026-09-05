import { useEffect, useState } from 'react'
import api from '../lib/api'
import { PageWrap } from '../components/Layout'
import { Link } from 'react-router-dom'

export default function Properties(){
  const [props,setProps]=useState<any[]>([])
  useEffect(()=>{ api.get('/api/properties').then(r=>setProps(r.data))},[])
  return <PageWrap>
    <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
    <p className="text-sm text-zinc-600">Portfolio overview — occupancy, open requests, and costs.</p>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
      {props.map(p=> <Link to={`/properties/${p.id}`} key={p.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-sm">
        <img src={p.image} className="h-44 w-full object-cover"/>
        <div className="p-4">
          <div className="font-semibold">{p.name}</div>
          <div className="text-xs text-zinc-500">{p.address}</div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="border rounded-xl p-2 text-center"><div className="font-semibold">{p.units_count}</div><div className="text-zinc-500">Units</div></div>
            <div className="border rounded-xl p-2 text-center"><div className="font-semibold">{p.occupancy}/{p.units_count}</div><div className="text-zinc-500">Occupied</div></div>
            <div className={`border rounded-xl p-2 text-center ${p.open_requests>0?'bg-red-50 border-red-200':''}`}><div className={`font-semibold ${p.open_requests>0?'text-red-700':''}`}>{p.open_requests}</div><div className="text-zinc-500">Open</div></div>
          </div>
          <div className="mt-3 text-xs flex justify-between"><span className="text-zinc-500">Monthly cost</span><b>${Number(p.monthly_cost).toLocaleString()}</b></div>
        </div>
      </Link>)}
    </div>
  </PageWrap>
}
