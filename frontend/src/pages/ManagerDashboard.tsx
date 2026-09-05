import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Link } from 'react-router-dom'
import { PageWrap } from '../components/Layout'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function ManagerDashboard(){
  const [data,setData]=useState<any>(null)
  const [tickets,setTickets]=useState<any[]>([])
  useEffect(()=>{
    api.get('/api/analytics/overview').then(r=>setData(r.data))
    api.get('/api/maintenance').then(r=>setTickets(r.data))
  },[])
  if(!data) return <PageWrap><div className="animate-pulse h-40 bg-white border rounded-2xl"/></PageWrap>
  const statusData= Object.entries(data.requests_by_status).map(([name,value])=>({name,value}))
  const COLORS={ "Reported":"#ef4444","Assigned":"#f59e0b","Scheduled":"#3b82f6","In Progress":"#8b5cf6","Completed":"#10b981"}
  return <PageWrap>
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1><p className="text-sm text-zinc-600">Welcome back — here's what's happening across your portfolio.</p></div>
      <Link to="/maintenance" className="hidden sm:inline-flex bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-medium">View maintenance</Link>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {[
        {k:"Total properties",v:data.total_properties,sub:"Across 3 cities"},
        {k:"Active requests",v:data.active_requests,sub:"Open + in progress"},
        {k:"High priority",v:data.high_priority,sub:"Needs attention",alert:true},
        {k:"Monthly spending",v:`$${Number(data.monthly_spending).toLocaleString()}`,sub:"Completed + pending"},
      ].map(c=> <div key={c.k} className={`bg-white border rounded-2xl p-4 ${c.alert && data.high_priority>0?'border-red-200 bg-red-50/50':''}`}><div className="text-xs text-zinc-500">{c.k}</div><div className={`text-2xl font-semibold mt-1 ${c.alert&&data.high_priority>0?'text-red-600':''}`}>{c.v}</div><div className="text-xs text-zinc-500 mt-1">{c.sub}</div></div>)}
    </div>

    <div className="grid lg:grid-cols-3 gap-6 mt-6">
      <div className="lg:col-span-2 bg-white border rounded-2xl p-5">
        <div className="font-medium text-sm">Maintenance overview</div>
        <div className="h-[240px] mt-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={statusData}><XAxis dataKey="name" tick={{fontSize:12}}/><YAxis tick={{fontSize:12}}/><Tooltip/><Bar dataKey="value" radius={[8,8,0,0]}>{statusData.map((e:any,i:number)=><Cell key={i} fill={(COLORS as any)[e.name]||'#111827'}/>)}</Bar></BarChart></ResponsiveContainer></div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2 text-xs">
          {statusData.map((s:any)=> <div key={s.name} className="border rounded-xl px-3 py-2 text-center"><div className="font-semibold">{String(s.value)}</div><div className="text-zinc-500">{s.name}</div></div>)}
        </div>
      </div>
      <div className="bg-white border rounded-2xl p-5">
        <div className="font-medium text-sm">Requests by category</div>
        <div className="h-[200px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={Object.entries(data.requests_by_category).map(([name,value])=>({name,value}))} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>{Object.keys(data.requests_by_category).map((_,i)=><Cell key={i} fill={["#0ea5e9","#f59e0b","#10b981","#8b5cf6","#ef4444","#64748b","#06b6d4"][i%7]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
        <div className="space-y-2 text-xs">
          {Object.entries(data.requests_by_category).map(([k,v]:any)=><div key={k} className="flex justify-between border rounded-lg px-3 py-2"><span>{k}</span><b>{v as string}</b></div>)}
        </div>
      </div>
    </div>

    <div className="grid lg:grid-cols-3 gap-6 mt-6">
      <div className="lg:col-span-2 bg-white border rounded-2xl p-5">
        <div className="flex items-center justify-between"><h3 className="font-medium text-sm">Priority queue</h3><Link to="/maintenance" className="text-xs border rounded-full px-3 py-1">View all</Link></div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-zinc-500"><tr><th className="text-left py-2">Ticket</th><th className="text-left">Issue</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
            <tbody>
              {tickets.slice(0,6).map(t=> <tr key={t.id} className="border-t hover:bg-zinc-50"><td className="py-3 font-mono text-xs"><Link to={`/maintenance/${t.id}`} className="underline">{t.ticket_id}</Link></td><td className="pr-2"><div className="font-medium line-clamp-1">{t.title}</div><div className="text-xs text-zinc-500">{t.property_id}</div></td><td><span className={`text-xs px-2 py-1 rounded-full border ${t.priority==='Critical'?'bg-red-600 text-white border-red-600': t.priority==='High'?'bg-red-50 text-red-700 border-red-200': t.priority==='Medium'?'bg-amber-50 text-amber-700':'bg-zinc-50'}`}>{t.priority}</span></td><td><span className="text-xs bg-zinc-900 text-white px-2 py-1 rounded-full">{t.status}</span></td><td className="text-xs text-zinc-500">{new Date(t.created_at).toLocaleDateString()}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-white border rounded-2xl p-5">
          <h3 className="font-medium text-sm">AI Insights</h3>
          <ul className="mt-3 space-y-2">
            {data.insights.map((ins:string,i:number)=><li key={i} className="text-sm bg-zinc-50 border rounded-xl p-3 leading-relaxed">💡 {ins}</li>)}
          </ul>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h3 className="font-medium text-sm text-amber-900">Smart Alerts</h3>
          {data.smart_alerts.map((a:any,i:number)=><div key={i} className="mt-3 bg-white border rounded-xl p-3"><div className="text-sm font-medium">{a.property}</div><div className="text-xs text-zinc-600">{a.pattern}</div><div className="text-xs font-medium text-amber-700 mt-1">{a.insight}</div><div className="text-xs text-zinc-500">→ {a.action}</div></div>)}
        </div>
      </div>
    </div>
  </PageWrap>
}
