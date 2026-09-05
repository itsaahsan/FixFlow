import { useEffect, useState } from 'react'
import api from '../lib/api'
import { PageWrap } from '../components/Layout'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Analytics(){
  const [d,setD]=useState<any>(null)
  useEffect(()=>{ api.get('/api/analytics/overview').then(r=>setD(r.data))},[])
  if(!d) return <PageWrap>Loading...</PageWrap>
  return <PageWrap>
    <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
    <p className="text-sm text-zinc-600">Maintenance intelligence — spending, resolution, and recurring issues.</p>
    <div className="grid sm:grid-cols-4 gap-4 mt-6">
      {[
        {k:"Avg resolution",v:`${d.avg_resolution_hours}h`},
        {k:"Active",v:d.active_requests},
        {k:"High priority",v:d.high_priority},
        {k:"Total spending",v:`$${Number(d.monthly_spending).toLocaleString()}`},
      ].map(c=> <div key={c.k} className="bg-white border rounded-2xl p-4"><div className="text-xs text-zinc-500">{c.k}</div><div className="text-xl font-semibold">{c.v}</div></div>)}
    </div>
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white border rounded-2xl p-5">
        <div className="font-medium text-sm">Maintenance requests over time</div>
        <div className="h-[240px] mt-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={d.monthly_spending_trend}><XAxis dataKey="month"/><YAxis/><Tooltip/><Bar dataKey="requests" fill="#111827" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div>
      </div>
      <div className="bg-white border rounded-2xl p-5">
        <div className="font-medium text-sm">Spending trend</div>
        <div className="h-[240px] mt-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={d.monthly_spending_trend}><XAxis dataKey="month"/><YAxis/><Tooltip/><Line type="monotone" dataKey="spending" stroke="#0ea5e9" strokeWidth={2}/></LineChart></ResponsiveContainer></div>
      </div>
    </div>
    <div className="grid lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white border rounded-2xl p-5">
        <div className="font-medium text-sm">Issues by category</div>
        <div className="mt-3 space-y-2">
          {Object.entries(d.requests_by_category as Record<string,number>).map(([k,v])=>{ const total=Object.values(d.requests_by_category as Record<string,number>).reduce((a,b)=>a+b,0); const pct=Math.round((v as number)/total*100); return <div key={k} className="flex items-center gap-3"><span className="w-24 text-sm">{k}</span><div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-zinc-900" style={{width:`${pct}%`}}/></div><span className="text-xs w-10 text-right">{pct}%</span></div>})}
        </div>
      </div>
      <div className="bg-white border rounded-2xl p-5">
        <div className="font-medium text-sm">Issues by property</div>
        <div className="mt-3 space-y-2">
          {Object.entries(d.requests_by_property).map(([k,v]:any)=> <div key={k} className="flex justify-between border rounded-xl px-3 py-2 text-sm"><span>{k}</span><b>{v as string}</b></div>)}
        </div>
      </div>
    </div>
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mt-6">
      <div className="font-medium text-sm text-amber-900">Smart Alerts & Insights</div>
      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        {d.smart_alerts.map((a:any,i:number)=><div key={i} className="bg-white border rounded-xl p-3"><div className="font-medium text-sm">{a.property}</div><div className="text-xs text-zinc-600">{a.insight}</div><div className="text-xs text-amber-700 mt-1">→ {a.action}</div></div>)}
      </div>
      <ul className="mt-3 space-y-2">
        {d.insights.map((s:string,i:number)=><li key={i} className="text-sm bg-white border rounded-xl p-3">{s}</li>)}
      </ul>
    </div>
  </PageWrap>
}
