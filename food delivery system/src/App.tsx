
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Catalog from './pages/Catalog'
import DashboardMaster from './pages/DashboardMaster'
import DashboardPro from './pages/DashboardPro'
import LoginRevenda from './pages/LoginRevenda'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Dashboard Master - Admin (Principal) */}
          <Route path="/" element={<DashboardMaster />} />
          <Route path="/dashboard-master" element={<Navigate to="/" replace />} />
          
          {/* Catálogo público */}
          <Route path="/catalogo" element={<Catalog />} />
          
          {/* Login da Revenda */}
          <Route path="/login-revenda" element={<LoginRevenda />} />
          
          {/* Dashboard Pro - Revendas */}
          <Route path="/dashboard-pro" element={<DashboardPro />} />
          
          {/* Redirecionamentos */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/catalog" element={<Navigate to="/catalogo" replace />} />
        </Routes>
        
        {/* Toast Notifications - Mobile Optimized */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              maxWidth: '90vw',
              marginBottom: '80px' // Espaço para não sobrepor botões flutuantes
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
