
import React, { useState } from 'react'
import {Plus, Minus, ShoppingCart} from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import toast from 'react-hot-toast'

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

interface MenuItemCardProps {
  item: MenuItem
  restaurantName: string
  onAddToCart?: () => void
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, 
  restaurantName, 
  onAddToCart 
}) => {
  const { addItem, canAddItem } = useCartStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string[]>>({})
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [showCustomizations, setShowCustomizations] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handleCustomizationChange = (customizationName: string, optionName: string, isMultiple: boolean) => {
    setSelectedCustomizations(prev => {
      if (isMultiple) {
        const current = prev[customizationName] || []
        const updated = current.includes(optionName)
          ? current.filter(item => item !== optionName)
          : [...current, optionName]
        return { ...prev, [customizationName]: updated }
      } else {
        return { ...prev, [customizationName]: [optionName] }
      }
    })
  }

  const calculateCustomizationPrice = () => {
    let total = 0
    
    item.customizations?.forEach(customization => {
      const selected = selectedCustomizations[customization.name] || []
      selected.forEach(selectedOption => {
        const option = customization.options.find(opt => opt.name === selectedOption)
        if (option) {
          total += option.price
        }
      })
    })
    
    return total
  }

  const getTotalPrice = () => {
    return (item.price + calculateCustomizationPrice()) * quantity
  }

  const validateCustomizations = () => {
    if (!item.customizations) return true

    for (const customization of item.customizations) {
      if (customization.required) {
        const selected = selectedCustomizations[customization.name] || []
        if (selected.length === 0) {
          toast.error(`Por favor, selecione uma opção para: ${customization.name}`)
          return false
        }
      }
    }
    return true
  }

  const handleAddToCart = () => {
    if (!item.isAvailable) {
      toast.error('Item não disponível no momento')
      return
    }

    if (!canAddItem(item.restaurantId)) {
      toast.error('Você só pode adicionar itens do mesmo restaurante')
      return
    }

    if (!validateCustomizations()) {
      return
    }

    const customizations = Object.entries(selectedCustomizations)
      .filter(([_, options]) => options.length > 0)
      .map(([name, options]) => {
        const customization = item.customizations?.find(c => c.name === name)
        const price = options.reduce((sum, optionName) => {
          const option = customization?.options.find(opt => opt.name === optionName)
          return sum + (option?.price || 0)
        }, 0)
        
        return { name, options, price }
      })

    try {
      addItem({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity,
        restaurantId: item.restaurantId,
        restaurantName,
        imageUrl: item.imageUrl,
        customizations: customizations.length > 0 ? customizations : undefined,
        specialInstructions: specialInstructions.trim() || undefined
      })

      toast.success(`${item.name} adicionado ao carrinho`)
      setQuantity(1)
      setSelectedCustomizations({})
      setSpecialInstructions('')
      setShowCustomizations(false)
      onAddToCart?.()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Imagem */}
        {item.imageUrl && (
          <div className="w-32 h-32 flex-shrink-0">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {item.name}
                {item.isPromotion && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    Promoção
                  </span>
                )}
              </h3>
              
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                {item.description}
              </p>

              {/* Ingredientes */}
              {item.ingredients && item.ingredients.length > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  {item.ingredients.join(', ')}
                </p>
              )}

              {/* Alérgenos */}
              {item.allergens && item.allergens.length > 0 && (
                <p className="text-xs text-orange-600 mb-2">
                  Contém: {item.allergens.join(', ')}
                </p>
              )}
            </div>

            {/* Preço */}
            <div className="text-right ml-4">
              <div className="flex items-center space-x-2">
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-gray-400 text-sm line-through">
                    {formatPrice(item.originalPrice)}
                  </span>
                )}
                <span className="font-bold text-lg text-gray-900">
                  {formatPrice(item.price)}
                </span>
              </div>
              
              {item.preparationTime && (
                <p className="text-xs text-gray-500 mt-1">
                  {item.preparationTime} min
                </p>
              )}
            </div>
          </div>

          {/* Customizações rápidas */}
          {item.customizations && item.customizations.length > 0 && (
            <button
              onClick={() => setShowCustomizations(!showCustomizations)}
              className="text-sm text-red-600 hover:text-red-700 mb-3"
            >
              {showCustomizations ? 'Ocultar' : 'Ver'} opções de personalização
            </button>
          )}

          {/* Controles de quantidade e adicionar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                item.isAvailable
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={16} />
              <span>
                {item.isAvailable 
                  ? `Adicionar ${formatPrice(getTotalPrice())}`
                  : 'Indisponível'
                }
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Customizações expandidas */}
      {showCustomizations && item.customizations && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {item.customizations.map((customization, index) => (
            <div key={index}>
              <h4 className="font-medium text-gray-900 mb-2">
                {customization.name}
                {customization.required && <span className="text-red-500 ml-1">*</span>}
              </h4>
              
              <div className="space-y-2">
                {customization.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type={customization.type === 'single' ? 'radio' : 'checkbox'}
                      name={customization.type === 'single' ? customization.name : undefined}
                      checked={(selectedCustomizations[customization.name] || []).includes(option.name)}
                      onChange={() => handleCustomizationChange(
                        customization.name, 
                        option.name, 
                        customization.type === 'multiple'
                      )}
                      className="text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{option.name}</span>
                    {option.price > 0 && (
                      <span className="text-sm text-gray-500">
                        +{formatPrice(option.price)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Observações especiais */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações especiais (opcional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Ex: sem cebola, bem passado..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuItemCard
