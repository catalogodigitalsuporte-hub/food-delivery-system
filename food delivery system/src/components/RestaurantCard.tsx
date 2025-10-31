
import React from 'react'
import { Link } from 'react-router-dom'
import {Star, Clock, Truck} from 'lucide-react'

interface Restaurant {
  _id: string
  name: string
  description: string
  category: string
  imageUrl: string
  isOpen: boolean
  deliveryFee: number
  minimumOrder: number
  deliveryTime: string
  rating: number
  totalReviews: number
}

interface RestaurantCardProps {
  restaurant: Restaurant
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'brasileira': 'Brasileira',
      'italiana': 'Italiana',
      'japonesa': 'Japonesa',
      'chinesa': 'Chinesa',
      'mexicana': 'Mexicana',
      'pizza': 'Pizza',
      'hamburger': 'Hambúrguer',
      'saudavel': 'Saudável',
      'doces': 'Doces',
      'bebidas': 'Bebidas',
      'padaria': 'Padaria',
      'lanchonete': 'Lanchonete'
    }
    return categories[category] || category
  }

  return (
    <Link to={`/restaurante/${restaurant._id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-red-200">
        {/* Imagem */}
        <div className="relative">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Status */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              restaurant.isOpen
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {restaurant.isOpen ? 'Aberto' : 'Fechado'}
            </span>
          </div>

          {/* Taxa de entrega */}
          {restaurant.deliveryFee === 0 && (
            <div className="absolute top-3 right-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full">
                Frete Grátis
              </span>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          {/* Nome e categoria */}
          <div className="mb-2">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
              {restaurant.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-2">
              {restaurant.description}
            </p>
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-full">
              {getCategoryLabel(restaurant.category)}
            </span>
          </div>

          {/* Avaliação */}
          <div className="flex items-center space-x-1 mb-3">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-medium text-gray-900">{restaurant.rating}</span>
            <span className="text-gray-500 text-sm">
              ({restaurant.totalReviews} avaliações)
            </span>
          </div>

          {/* Informações de entrega */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Truck className="w-4 h-4" />
              <span>
                {restaurant.deliveryFee === 0 
                  ? 'Grátis' 
                  : formatPrice(restaurant.deliveryFee)
                }
              </span>
            </div>
          </div>

          {/* Pedido mínimo */}
          <div className="mt-2 text-xs text-gray-500">
            Pedido mínimo: {formatPrice(restaurant.minimumOrder)}
          </div>

          {/* Overlay quando fechado */}
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center rounded-xl">
              <div className="bg-white px-4 py-2 rounded-lg">
                <span className="text-gray-900 font-medium">Fechado no momento</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default RestaurantCard
