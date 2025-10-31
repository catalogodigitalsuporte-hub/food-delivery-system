
import React from 'react'
import {ShoppingCart, Phone, MapPin, Clock, Menu} from 'lucide-react'
import { useCatalogStore } from '../stores/catalogStore'

interface HeaderProps {
  onCartClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { company, getCartItemsCount } = useCatalogStore()
  const cartItemsCount = getCartItemsCount()

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg">
      <div className="px-4 py-3">
        {/* Logo e Nome da Empresa - Mobile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {company.logo && (
              <img
                src={company.logo}
                alt={company.name}
                className="w-12 h-12 rounded-full object-cover border-2 flex-shrink-0"
                style={{ borderColor: company.theme.primaryColor }}
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {company.name}
              </h1>
              {company.description && (
                <p className="text-xs text-gray-600 truncate">{company.description}</p>
              )}
            </div>
          </div>

          {/* Carrinho - Mobile */}
          <button
            onClick={onCartClick}
            className="relative p-3 rounded-full text-white shadow-lg hover:shadow-xl transition-all transform active:scale-95 ml-2"
            style={{ backgroundColor: company.theme.primaryColor }}
          >
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </span>
            )}
          </button>
        </div>

        {/* Informações da Empresa - Mobile Compact */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            {company.workingHours && (
              <div className="flex items-center space-x-1">
                <Clock size={12} style={{ color: company.theme.primaryColor }} />
                <span>{company.workingHours}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <Phone size={12} style={{ color: company.theme.primaryColor }} />
              <span>{company.whatsapp.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}</span>
            </div>
          </div>
          
          {company.address && (
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <MapPin size={12} style={{ color: company.theme.primaryColor }} />
              <span className="truncate">{company.address}</span>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Aberto agora</span>
          </div>
          
          <div className="text-xs text-gray-500">
            📱 Catálogo Digital
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
