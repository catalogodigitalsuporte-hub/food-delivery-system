
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {Search, Star, Clock, Truck, ArrowRight} from 'lucide-react'
import { lumi } from '../lib/lumi'
import RestaurantCard from '../components/RestaurantCard'
import toast from 'react-hot-toast'

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

const Home: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const categories = [
    { id: '', name: 'Todos', icon: '🍽️' },
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'hamburger', name: 'Hambúrguer', icon: '🍔' },
    { id: 'japonesa', name: 'Japonesa', icon: '🍱' },
    { id: 'italiana', name: 'Italiana', icon: '🍝' },
    { id: 'brasileira', name: 'Brasileira', icon: '🍖' },
    { id: 'saudavel', name: 'Saudável', icon: '🥗' },
    { id: 'doces', name: 'Doces', icon: '🍰' },
    { id: 'bebidas', name: 'Bebidas', icon: '🥤' }
  ]

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const filter = selectedCategory ? { category: selectedCategory } : {}
      
      const { list } = await lumi.entities.restaurants.list({
        filter,
        sort: { rating: -1 }
      })
      
      setRestaurants(list || [])
    } catch (error) {
      console.error('Erro ao carregar restaurantes:', error)
      toast.error('Erro ao carregar restaurantes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [selectedCategory])

  const openRestaurants = restaurants.filter(r => r.isOpen)
  const featuredRestaurants = restaurants.filter(r => r.rating >= 4.5).slice(0, 6)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Sua comida favorita
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              Entregue na sua porta em minutos
            </p>
            
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">{restaurants.length}+</div>
                <div className="text-red-100">Restaurantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">25-35</div>
                <div className="text-red-100">Minutos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.8★</div>
                <div className="text-red-100">Avaliação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Categorias</h2>
          
          <div className="flex overflow-x-auto space-x-4 pb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex flex-col items-center space-y-2 p-4 rounded-xl transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurantes em Destaque */}
      {!selectedCategory && featuredRestaurants.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Restaurantes em Destaque
              </h2>
              <Link 
                to="/restaurantes" 
                className="flex items-center space-x-1 text-red-500 hover:text-red-600 font-medium"
              >
                <span>Ver todos</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lista de Restaurantes */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory 
                ? `Restaurantes - ${categories.find(c => c.id === selectedCategory)?.name}`
                : 'Todos os Restaurantes'
              }
            </h2>
            <div className="text-sm text-gray-500">
              {restaurants.length} restaurantes encontrados
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                Nenhum restaurante encontrado
              </div>
              <button
                onClick={() => setSelectedCategory('')}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Ver todos os restaurantes
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Seção de Benefícios */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Por que escolher o FoodDelivery?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              A melhor experiência de delivery da cidade
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Entrega Rápida
              </h3>
              <p className="text-gray-600">
                Entregamos sua comida em até 35 minutos, sempre quentinha e fresquinha.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Qualidade Garantida
              </h3>
              <p className="text-gray-600">
                Trabalhamos apenas com restaurantes selecionados e avaliados pelos clientes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Acompanhe seu Pedido
              </h3>
              <p className="text-gray-600">
                Rastreie seu pedido em tempo real, desde o preparo até a entrega.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
