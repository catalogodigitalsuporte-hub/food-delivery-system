
import React, { useState, useEffect } from 'react'
import {Search, Filter, Grid, List, Star, Heart, Share2} from 'lucide-react'
import { useCatalogStore } from '../stores/catalogStore'
import ProductCard from '../components/ProductCard'
import Header from '../components/Header'
import CartModal from '../components/CartModal'

// Dados de exemplo para demonstração
const sampleProducts = [
  {
    id: '1',
    name: 'Hambúrguer Artesanal',
    description: 'Hambúrguer 180g com queijo, alface, tomate e molho especial',
    price: 25.90,
    originalPrice: 29.90,
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
    category: 'lanches',
    isAvailable: true,
    isPromotion: true,
    rating: 4.8,
    reviews: 124
  },
  {
    id: '2',
    name: 'Pizza Margherita',
    description: 'Pizza tradicional com molho de tomate, mussarela e manjericão',
    price: 42.90,
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
    category: 'pizzas',
    isAvailable: true,
    isPromotion: false,
    rating: 4.6,
    reviews: 89
  },
  {
    id: '3',
    name: 'Açaí 500ml',
    description: 'Açaí natural com granola, banana e leite condensado',
    price: 18.90,
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg',
    category: 'sobremesas',
    isAvailable: true,
    isPromotion: false,
    rating: 4.9,
    reviews: 203
  },
  {
    id: '4',
    name: 'Suco Natural de Laranja',
    description: 'Suco 100% natural, sem conservantes',
    price: 8.90,
    image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    category: 'bebidas',
    isAvailable: true,
    isPromotion: false,
    rating: 4.4,
    reviews: 67
  },
  {
    id: '5',
    name: 'Salada Caesar',
    description: 'Alface americana, croutons, parmesão e molho caesar',
    price: 22.90,
    image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
    category: 'saudavel',
    isAvailable: false,
    isPromotion: false,
    rating: 4.2,
    reviews: 45
  },
  {
    id: '6',
    name: 'Combo Família',
    description: '2 hambúrguers + batata grande + 2 refrigerantes',
    price: 49.90,
    originalPrice: 65.90,
    image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
    category: 'combos',
    isAvailable: true,
    isPromotion: true,
    rating: 4.7,
    reviews: 156
  }
]

const sampleCompany = {
  name: 'Burger & Cia',
  logo: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
  whatsapp: '5511999887766',
  address: 'Rua das Flores, 123 - Centro',
  workingHours: 'Seg-Dom: 18h às 23h',
  description: 'Os melhores hambúrguers artesanais da cidade!',
  coverImage: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
  theme: {
    primaryColor: '#ef4444',
    secondaryColor: '#dc2626',
    accentColor: '#fbbf24'
  }
}

const Catalog: React.FC = () => {
  const { 
    products, 
    company, 
    selectedCategory, 
    setProducts, 
    setCompany, 
    setSelectedCategory 
  } = useCatalogStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCart, setShowCart] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Inicializar dados de exemplo
  useEffect(() => {
    setProducts(sampleProducts)
    setCompany(sampleCompany)
  }, [setProducts, setCompany])

  // Categorias disponíveis
  const categories = [
    { id: '', name: 'Todos', icon: '🍽️' },
    { id: 'lanches', name: 'Lanches', icon: '🍔' },
    { id: 'pizzas', name: 'Pizzas', icon: '🍕' },
    { id: 'sobremesas', name: 'Sobremesas', icon: '🍰' },
    { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
    { id: 'saudavel', name: 'Saudável', icon: '🥗' },
    { id: 'combos', name: 'Combos', icon: '🎉' }
  ]

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const availableProducts = filteredProducts.filter(p => p.isAvailable)
  const promotionProducts = filteredProducts.filter(p => p.isPromotion && p.isAvailable)

  const handleShare = async () => {
    const shareData = {
      title: company.name,
      text: `Confira nosso catálogo digital! ${company.description}`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback para navegadores que não suportam Web Share API
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartClick={() => setShowCart(true)} />

      {/* Hero Section - Mobile Optimized */}
      <div 
        className="relative h-48 bg-cover bg-center flex items-end"
        style={{ backgroundImage: `url(${company.coverImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 p-4 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-bold mb-1">{company.name}</h2>
              <p className="text-gray-200 text-sm">{company.description}</p>
            </div>
            <button
              onClick={handleShare}
              className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <main className="px-3 py-4">
        {/* Busca - Mobile First */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent text-base"
                style={{ focusRing: `2px solid ${company.theme.primaryColor}` }}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl transition-colors ${showFilters ? 'text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
              style={{ backgroundColor: showFilters ? company.theme.primaryColor : 'transparent' }}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Categorias - Scroll Horizontal Mobile */}
        {showFilters && (
          <div className="mb-6">
            <div className="flex overflow-x-auto space-x-3 pb-3 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {categories.map((category) => {
                const productsInCategory = products.filter(
                  p => category.id === '' || p.category === category.id
                ).length

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex-shrink-0 flex flex-col items-center space-y-1 p-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap min-w-20 ${
                      selectedCategory === category.id
                        ? 'text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.id ? company.theme.primaryColor : undefined
                    }}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-xs">{category.name}</span>
                    <span className="bg-white bg-opacity-20 px-1.5 py-0.5 rounded-full text-xs">
                      {productsInCategory}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Produtos em Promoção */}
        {promotionProducts.length > 0 && selectedCategory === '' && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                🔥 <span className="ml-1">Ofertas</span>
              </h2>
              <span className="text-xs text-gray-500 bg-red-100 px-2 py-1 rounded-full">
                {promotionProducts.length} itens
              </span>
            </div>
            <div className="flex overflow-x-auto space-x-3 pb-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {promotionProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-64">
                  <ProductCard product={product} compact={true} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Lista de Produtos - Mobile Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.name || 'Categoria'}`
                : 'Cardápio'
              }
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {filteredProducts.length} itens
              </span>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
              </button>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className={`grid gap-3 ${
              viewMode === 'grid' 
                ? 'grid-cols-1' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Tente ajustar sua busca ou filtros
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                  }}
                  className="px-6 py-3 rounded-xl font-medium text-white"
                  style={{ backgroundColor: company.theme.primaryColor }}
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          )}
        </section>

        {/* Botão Flutuante WhatsApp */}
        <div className="fixed bottom-20 right-4 z-40">
          <button
            onClick={() => {
              const whatsappUrl = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre seus produtos.')}`
              window.open(whatsappUrl, '_blank')
            }}
            className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all transform hover:scale-110 flex items-center justify-center"
          >
            <span className="text-2xl">💬</span>
          </button>
        </div>

        {/* Rodapé Compacto */}
        <footer className="mt-8 text-center py-6 border-t border-gray-200">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              📍 {company.address}
            </p>
            <p className="text-sm text-gray-600">
              🕒 {company.workingHours}
            </p>
            <p className="text-xs text-gray-500">
              Catálogo Digital • Powered by Lumi
            </p>
          </div>
        </footer>
      </main>

      {/* Modal do Carrinho */}
      <CartModal isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  )
}

export default Catalog
