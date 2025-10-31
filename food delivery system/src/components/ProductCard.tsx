
import React, { useState } from 'react'
import {Plus, Minus, ShoppingCart, Star, Heart, X} from 'lucide-react'
import { useCatalogStore } from '../stores/catalogStore'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: any
  compact?: boolean
  viewMode?: 'grid' | 'list'
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false, viewMode = 'grid' }) => {
  const { addToCart, company } = useCatalogStore()
  const [quantity, setQuantity] = useState(1)
  const [observations, setObservations] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handleAddToCart = () => {
    if (!product.isAvailable) {
      toast.error('Produto indisponível no momento')
      return
    }

    addToCart(product, quantity, observations.trim() || undefined)
    toast.success(`${product.name} adicionado ao carrinho!`, {
      duration: 2000,
      position: 'bottom-center'
    })
    setQuantity(1)
    setObservations('')
    setShowModal(false)
  }

  const openProductModal = () => {
    setShowModal(true)
  }

  if (compact) {
    return (
      <>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover cursor-pointer"
              onClick={openProductModal}
            />
            {product.isPromotion && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-lg">
                🔥 OFERTA
              </div>
            )}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full"
            >
              <Heart size={16} className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'} />
            </button>
          </div>
          
          <div className="p-3">
            <h3 
              className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1 cursor-pointer hover:text-blue-600"
              onClick={openProductModal}
            >
              {product.name}
            </h3>
            
            <div className="flex items-center space-x-1 mb-2">
              <Star size={12} className="text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviews})</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {product.originalPrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="font-bold text-sm" style={{ color: company.theme.primaryColor }}>
                  {formatPrice(product.price)}
                </span>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
                className="p-2 rounded-full text-white text-xs disabled:opacity-50"
                style={{ backgroundColor: company.theme.primaryColor }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Produto */}
        {showModal && (
          <ProductModal
            product={product}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onAddToCart={handleAddToCart}
            quantity={quantity}
            setQuantity={setQuantity}
            observations={observations}
            setObservations={setObservations}
            company={company}
            formatPrice={formatPrice}
          />
        )}
      </>
    )
  }

  const isListView = viewMode === 'list'

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 ${isListView ? 'flex' : ''}`}>
        {/* Imagem do Produto */}
        <div className={`relative ${isListView ? 'w-24 h-24 flex-shrink-0' : 'h-48'}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover cursor-pointer"
            onClick={openProductModal}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {product.isPromotion && (
              <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-lg">
                🔥 OFERTA
              </span>
            )}
            {!product.isAvailable && (
              <span className="bg-gray-500 text-white px-2 py-1 text-xs font-bold rounded-lg">
                INDISPONÍVEL
              </span>
            )}
          </div>

          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full"
          >
            <Heart size={16} className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className={`p-4 ${isListView ? 'flex-1' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 
              className="font-bold text-base text-gray-900 line-clamp-2 flex-1 cursor-pointer hover:text-blue-600"
              onClick={openProductModal}
            >
              {product.name}
            </h3>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-3">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviews} avaliações)</span>
          </div>

          {/* Preços */}
          <div className="flex items-center space-x-2 mb-4">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 text-sm line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-xl font-bold" style={{ color: company.theme.primaryColor }}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Botão de Ação */}
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable}
            className="w-full py-3 px-4 rounded-xl font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            style={{ 
              backgroundColor: product.isAvailable ? company.theme.primaryColor : '#9ca3af'
            }}
          >
            <ShoppingCart size={18} />
            <span>Adicionar ao Carrinho</span>
          </button>
        </div>
      </div>

      {/* Modal de Produto */}
      {showModal && (
        <ProductModal
          product={product}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onAddToCart={handleAddToCart}
          quantity={quantity}
          setQuantity={setQuantity}
          observations={observations}
          setObservations={setObservations}
          company={company}
          formatPrice={formatPrice}
        />
      )}
    </>
  )
}

// Componente Modal do Produto
interface ProductModalProps {
  product: any
  isOpen: boolean
  onClose: () => void
  onAddToCart: () => void
  quantity: number
  setQuantity: (qty: number) => void
  observations: string
  setObservations: (obs: string) => void
  company: any
  formatPrice: (price: number) => string
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  quantity,
  setQuantity,
  observations,
  setObservations,
  company,
  formatPrice
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex-1 pr-4">
            {product.name}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {/* Imagem */}
          <div className="relative h-64">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isPromotion && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-sm font-bold rounded-lg">
                🔥 OFERTA
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Descrição */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Descrição</h4>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star size={16} className="text-yellow-400 fill-current" />
                <span className="font-medium text-gray-700">{product.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{product.reviews} avaliações</span>
            </div>

            {/* Preços */}
            <div className="flex items-center space-x-3">
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-gray-400 text-lg line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-2xl font-bold" style={{ color: company.theme.primaryColor }}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full font-medium">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Controle de Quantidade */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Quantidade</h4>
              <div className="flex items-center justify-center space-x-4 bg-gray-50 rounded-xl p-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <Minus size={18} />
                </button>
                <span className="font-bold text-xl min-w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Observações */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Observações (opcional)</h4>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex: sem cebola, bem passado, extra queijo..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent text-sm resize-none"
                style={{ focusRing: `2px solid ${company.theme.primaryColor}` }}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Footer com Preço e Botão */}
        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Subtotal:</span>
            <span className="text-xl font-bold" style={{ color: company.theme.primaryColor }}>
              {formatPrice(product.price * quantity)}
            </span>
          </div>

          <button
            onClick={onAddToCart}
            disabled={!product.isAvailable}
            className="w-full py-4 px-4 rounded-xl font-bold transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            style={{ backgroundColor: product.isAvailable ? company.theme.primaryColor : '#9ca3af' }}
          >
            Adicionar ao Carrinho • {formatPrice(product.price * quantity)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
