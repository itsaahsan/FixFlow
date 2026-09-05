import { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

type User={ id:number,email:string,full_name:string,role:string }
type Ctx={ user:User|null, login:(e:string,p:string)=>Promise<void>, logout:()=>void, loading:boolean }
const Ctx=createContext<Ctx>(null as any)
export const useAuth=()=>useContext(Ctx)
export function AuthProvider({children}:{children:any}){
  const [user,setUser]=useState<User|null>(null)
  const [loading,setLoading]=useState(true)
  const fetchMe=async()=>{
    const t=localStorage.getItem('token')
    if(!t){ setLoading(false); return}
    try{ const r=await api.get('/api/auth/me'); setUser(r.data)}catch{ localStorage.removeItem('token')}
    setLoading(false)
  }
  useEffect(()=>{fetchMe()},[])
  const login=async(email:string,password:string)=>{
    const r=await api.post('/api/auth/login',{email,password})
    localStorage.setItem('token',r.data.access_token)
    const me=await api.get('/api/auth/me')
    setUser(me.data)
  }
  const logout=()=>{ localStorage.removeItem('token'); setUser(null)}
  return <Ctx.Provider value={{user,login,logout,loading}}>{children}</Ctx.Provider>
}
