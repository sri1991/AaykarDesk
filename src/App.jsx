import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NewCase from './pages/NewCase.jsx'
import CasePage from './pages/CasePage.jsx'
import Portal from './pages/Portal.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/portal/:token" element={<Portal />} />
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/cases" replace />} />
        <Route path="/cases" element={<Dashboard />} />
        <Route path="/cases/new" element={<NewCase />} />
        <Route path="/cases/:id" element={<CasePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/cases" replace />} />
    </Routes>
  )
}
