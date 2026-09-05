import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck, Zap, Users, Wrench, Building2, BarChart3, Star } from 'lucide-react'

export default function Landing(){
  return <div className="bg-white">
    {/* hero */}
    <section className="mx-auto max-w-[1280px] px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-medium border rounded-full px-3 py-1 bg-zinc-50"><Sparkles className="w-3 h-3"/> AI-powered maintenance triage</div>
        <h1 className="text-[40px] lg:text-[56px] font-semibold tracking-tight leading-[0.95] mt-6">Property maintenance,<br/>without the chaos.</h1>
        <p className="text-zinc-600 text-[17px] leading-relaxed mt-4 max-w-[520px]">FixFlow connects tenants, property managers, and technicians in one intelligent workflow — from report to resolution, with insights that prevent the next issue.</p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link to="/login" className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2">Get Started <ArrowRight className="w-4 h-4"/></Link>
          <a href="#how" className="px-6 py-3 rounded-xl border font-medium">See How It Works</a>
        </div>
        <div className="flex items-center gap-6 mt-8 text-sm">
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> SOC2 ready</span>
          <span className="flex items-center gap-2"><Star className="w-4 h-4"/> 4.9/5 pilot rating</span>
        </div>
      </div>
      <div className="bg-zinc-50 border rounded-[20px] p-4 lg:p-6 shadow-sm">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="h-10 border-b flex items-center gap-2 px-4"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/><span className="ml-3 text-xs text-zinc-500">FixFlow Dashboard</span></div>
          <div className="p-4 grid grid-cols-3 gap-3">
            {[{k:"12",l:"Total properties"},{k:"23",l:"Active requests"},{k:"4",l:"High priority",c:"text-red-600"}].map(s=> <div key={s.l} className="border rounded-xl p-3 bg-zinc-50"><div className={`text-xl font-semibold ${s.c||''}`}>{s.k}</div><div className="text-xs text-zinc-500">{s.l}</div></div>)}
          </div>
          <div className="px-4 pb-4">
            <div className="border rounded-xl p-3">
              <div className="text-xs font-medium flex items-center gap-2"><Wrench className="w-3 h-3"/> Priority queue</div>
              {[
                {id:"FF-1048",prop:"Sunrise Apt 4B",issue:"Under-sink leak",pri:"High",st:"Reported"},
                {id:"FF-1047",prop:"Cedar Heights 2A",issue:"AC not cooling",pri:"High",st:"Assigned"},
                {id:"FF-1046",prop:"Harbor Lofts 3C",issue:"Flickering lights",pri:"Medium",st:"Scheduled"},
              ].map(r=> <div key={r.id} className="flex items-center justify-between py-2 text-sm border-b last:border-0"><span className="font-mono text-xs">{r.id}</span><span className="truncate mx-2">{r.issue}</span><span className={`text-xs px-2 py-0.5 rounded-full ${r.pri==='High'?'bg-red-50 text-red-700 border border-red-200':'bg-amber-50 text-amber-700 border'}`}>{r.pri}</span></div>)}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white border rounded-xl p-3"><div className="font-medium flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Analytics</div><div className="text-xs text-zinc-500 mt-1">Spending +12% — view insights →</div></div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3"><div className="font-medium text-amber-800">Smart Alert</div><div className="text-xs text-amber-700 mt-1">3 plumbing incidents at Sunrise → inspect</div></div>
        </div>
      </div>
    </section>

    <section id="how" className="bg-zinc-900 text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {n:"01",t:"Report",d:"Tenant reports a problem in 30 seconds with photo & description."},
            {n:"02",t:"Understand",d:"FixFlow AI triages: category, urgency, and recommended action."},
            {n:"03",t:"Resolve",d:"Manager assigns the right technician and tracks to completion."},
            {n:"04",t:"Learn",d:"History becomes intelligence: recurring issues & preventive alerts."},
          ].map(s=> <div key={s.n} className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900"><div className="text-zinc-500 font-mono text-sm">{s.n}</div><div className="font-semibold text-lg mt-2">{s.t}</div><div className="text-zinc-400 text-sm mt-2 leading-relaxed">{s.d}</div></div>)}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1280px] px-6 py-16">
      <div className="grid lg:grid-cols-3 gap-6">
        {[
          {icon:Building2,title:"For Property Managers",points:["Portfolio dashboard","AI triage & smart alerts","Technician management","Cost & recurring insights"]},
          {icon:Users,title:"For Tenants",points:["30-sec reporting","AI feedback instantly","Live status timeline","History & receipts"]},
          {icon:Wrench,title:"For Technicians",points:["Clear job queue","Photos & notes","Status controls","Faster close-out"]},
        ].map(c=> <div key={c.title} className="border rounded-2xl p-6 bg-white"><c.icon className="w-6 h-6"/><h3 className="font-semibold mt-3">{c.title}</h3><ul className="mt-3 space-y-2 text-sm text-zinc-600">{c.points.map(p=> <li key={p} className="flex gap-2"><span className="text-zinc-900">•</span>{p}</li>)}</ul></div>)}
      </div>
    </section>

    <section className="mx-auto max-w-[1280px] px-6 pb-8">
      <div className="border rounded-[24px] p-8 lg:p-10 bg-zinc-50 grid lg:grid-cols-2 gap-8 items-center">
        <div><h2 className="text-2xl font-semibold tracking-tight">Maintenance Intelligence</h2><p className="text-zinc-600 mt-3">Turn every ticket into operational leverage. Detect patterns before they become emergencies.</p><ul className="mt-6 space-y-3 text-sm">
          <li className="bg-white border rounded-xl p-3">🏢 Sunrise Apartments — 4 plumbing incidents in 60 days, <b>2.3×</b> above average.</li>
          <li className="bg-white border rounded-xl p-3">💸 HVAC = 41% of maintenance spending this quarter.</li>
          <li className="bg-white border rounded-xl p-3">⏱ Avg resolution: 18% faster vs last month.</li>
        </ul></div>
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-sm font-medium">Pricing</div>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            {[
              {name:"Starter",price:"$19",u:"Up to 10 units"},
              {name:"Growth",price:"$59",u:"Up to 100 units",pop:true},
              {name:"Scale",price:"Custom",u:"Unlimited"},
            ].map(p=> <div key={p.name} className={`border rounded-xl p-4 ${p.pop?'border-zinc-900 bg-zinc-900 text-white':''}`}><div className="text-xs opacity-70">{p.name}</div><div className="text-xl font-semibold">{p.price}<span className="text-xs font-normal">/mo</span></div><div className="text-xs mt-1 opacity-70">{p.u}</div></div>)}
          </div>
          <Link to="/login" className="mt-6 w-full bg-zinc-900 text-white py-2.5 rounded-xl font-medium block text-center">Start free trial</Link>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1280px] px-6 py-10 text-center">
      <h2 className="text-3xl font-semibold tracking-tight">Ready to fix the flow?</h2>
      <p className="text-zinc-600 mt-2">Join managers who cut resolution time by 30%.</p>
      <Link to="/login" className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-medium mt-6">Get Started — it's free <Zap className="w-4 h-4"/></Link>
    </section>
    <footer className="border-t py-8 text-center text-sm text-zinc-500">© 2026 FixFlow — Property maintenance, without the chaos.</footer>
  </div>
}
