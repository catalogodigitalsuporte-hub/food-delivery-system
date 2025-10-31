
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {Star, Clock, Truck, MapPin, Phone, Info} from 'lucide-react'
import { lumi } from '../lib/lumi'
import MenuItemCard from '../components/MenuItemCard'
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
  address: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  phone: string
  email?: string
  openingHours: Record<string, string>
  paymentMethods: string[]
}

interface MenuItem {
  _id: string
  restaurantId: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  imageUrl?: string
  isAvailable: boolean
  preparationTime?: number
  ingredients?: string[]
  allergens?: string[]
  customizations?: Array<{
    name: string
    type: 'single' | 'multiple'
    required: boolean
    options: Array<{
      name: string
      price: number
    }>
  }>
  isPromotion?: boolean
}

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const menuCategories = [
    { id: '', name: 'Todos' },
    { id: 'entrada', name: 'Entradas' },
    { id: 'prato-principal', name: 'Pratos Principais' },
    { id: 'pizza', name: 'Pizzas' },
    { id: 'lanche', name: 'Lanches' },
    { id: 'sobremesa', name: 'Sobremesas' },
    { id: 'bebida', name: 'Bebidas' },
    { id: 'combo', name: 'Combos' },
    { id: 'promocao', name: 'Promoções' }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'cartao-credito': 'Cartão de Crédito',
      'cartao-debito': 'Cartão de Débito',
      'pix': 'PIX',
      'vale-refeicao': 'Vale Refeição'
    }
    return methods[method] || method
  }

  const fetchRestaurant = async () => {
    if (!id) return

    try {
      const restaurantData = await lumi.entities.restaurants.get(id)
      setRestaurant(restaurantData)
    } catch (error) {
      console.error('Erro ao carregar restaurante:', error)
      toast.error('Restaurante não encontrado')
    }
  }

  const fetchMenuItems = async () => {
    if (!id) return

    try {
      const filter = selectedCategory 
        ? { restaurantId: id, category: selectedCategory }
        : { restaurantId: id }

      const { list } = await lumi.entities.menu_items.list({
        filter,
        sort: { category: 1, name: 1 }
      })
      
      setMenuItems(list || [])
    } catch (error) {
      console.error('Erro ao carregar cardápio:', error)
      toast.error('Erro ao carregar cardápio')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchRestaurant(), fetchMenuItems()])
      setLoading(false)
    }
    
    loadData()
  }, [id, selectedCategory])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Restaurante não encontrado
          </h2>
          <p className="text-gray-600">
            O restaurante que você está procurando não existe ou foi removido.
          </p>
        </div>
      </div>
    )
  }

  const availableMenuItems = menuItems.filter(item => item.isAvailable)
  const promotionItems = menuItems.filter(item => item.isPromotion && item.isAvailable)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header do Restaurante */}
      <div className="relative">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-64 object-cover"
        />
        
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white px-6 py-3 rounded-lg">
              <span className="text-gray-900 font-medium">Fechado no momento</span>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações do Restaurante */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h1>
                  <p className="text-gray-600 mb-4">{restaurant.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{restaurant.rating}</span>
                      <span>({restaurant.totalReviews} avaliações)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4" />
                      <span>
                        {restaurant.deliveryFee === 0 
                          ? 'Frete Grátis' 
                          : formatPrice(restaurant.deliveryFee)
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  restaurant.isOpen
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {restaurant.isOpen ? 'Aberto' : 'Fechado'}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Informações</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">
                    {restaurant.address.street}, {restaurant.address.number} - {restaurant.address.neighborhood}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{restaurant.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Pedido mínimo: {formatPrice(restaurant.minimumOrder)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Formas de Pagamento</h4>
                <div className="flex flex-wrap gap-1">
                  {restaurant.paymentMethods.map((method, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {getPaymentMethodLabel(method)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promoções */}
        {promotionItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🔥 Promoções Especiais
            </h2>
            <div className="space-y-4">
              {promotionItems.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  restaurantName={restaurant.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cardápio */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cardápio</h2>
          
          {/* Filtros de Categoria */}
          <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
            {menuCategories.map((category) => {
              const itemsInCategory = menuItems.filter(
                item => category.id === '' || item.category === category.id
              ).length

              if (itemsInCategory === 0 && category.id !== '') return null

              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({itemsInCategory})
                </button>
              )
            })}
          </div>

          {/* Lista de Itens */}
          {availableMenuItems.length > 0 ? (
            <div className="space-y-4">
              {availableMenuItems.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  restaurantName={restaurant.name}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {selectedCategory 
                  ? 'Nenhum item disponível nesta categoria'
                  : 'Nenhum item disponível no momento'
                }
              </div>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  Ver todos os itens
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RestaurantDetail
