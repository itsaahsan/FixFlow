import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { TopNav } from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import ManagerDashboard from './pages/ManagerDashboard'
import Tenant from './pages/Tenant'
import Technician from './pages/Technician'
import Maintenance from './pages/Maintenance'
import TicketDetail from './pages/TicketDetail'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import Analytics from './pages/Analytics'
import TechniciansPage from './pages/TechniciansPage'

function Protected({children, roles}:{children:any, roles?:string[]}){
  const {user,loading}=useAuth()
  if(loading) return <div className="p-10 text-center">Loading...</div>
  if(!user) return <Navigate to="/login"/>
  if(roles && !roles.includes(user.role)) return <Navigate to={user.role==='manager'?'/dashboard': user.role==='tenant'?'/tenant':'/technician'}/>
  return children
}

export default function App(){
  return <AuthProvider>
    <BrowserRouter>
      <TopNav/>
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/dashboard" element={<Protected roles={['manager']}><ManagerDashboard/></Protected>}/>
        <Route path="/tenant" element={<Protected roles={['tenant']}><Tenant/></Protected>}/>
        <Route path="/technician" element={<Protected roles={['technician']}><Technician/></Protected>}/>
        <Route path="/maintenance" element={<Protected><Maintenance/></Protected>}/>
        <Route path="/maintenance/:id" element={<Protected><TicketDetail/></Protected>}/>
        <Route path="/properties" element={<Protected roles={['manager']}><Properties/></Protected>}/>
        <Route path="/properties/:id" element={<Protected roles={['manager']}><PropertyDetail/></Protected>}/>
        <Route path="/analytics" element={<Protected roles={['manager']}><Analytics/></Protected>}/>
        <Route path="/technicians" element={<Protected roles={['manager']}><TechniciansPage/></Protected>}/>
        <Route path="*" element={<Navigate to="/"/>}/>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
}
