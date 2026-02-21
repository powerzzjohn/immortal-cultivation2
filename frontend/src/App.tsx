import { FC } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Profile } from './pages/Profile'
import { BaziSetup } from './pages/BaziSetup'
import { DailySummary } from './pages/DailySummary'
import { Layout } from './components/Layout'

const App: FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bazi-setup" element={<BaziSetup />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/daily-summary" element={<DailySummary />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
