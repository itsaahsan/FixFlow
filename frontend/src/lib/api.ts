import axios from 'axios'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const api = axios.create({ baseURL: API })
api.interceptors.request.use(c=>{
  const t = localStorage.getItem('token')
  if(t) c.headers.Authorization = `Bearer ${t}`
  return c
})
export default api
export const getAI = async (desc:string) => (await api.post('/api/ai/analyze-maintenance',{description:desc})).data
