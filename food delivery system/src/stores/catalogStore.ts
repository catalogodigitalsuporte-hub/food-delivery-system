
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: string
  isAvailable: boolean
  isPromotion?: boolean
  rating?: number
  reviews?: number
  tags?: string[]
}

export interface CartItem {
  product: Product
  quantity: number
  observations?: string
}

export interface CompanyInfo {
  name: string
  logo?: string
  whatsapp: string
  address?: string
  workingHours?: string
  description?: string
  coverImage?: string
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor?: string
  }
  businessType?: 'restaurant' | 'retail' | 'service' | 'other'
  socialMedia?: {
    instagram?: string
    facebook?: string
    website?: string
  }
}

interface CatalogState {
  company: CompanyInfo
  products: Product[]
  cart: CartItem[]
  selectedCategory: string
  favorites: string[]
  
  // Actions
  setCompany: (company: CompanyInfo) => void
  setProducts: (products: Product[]) => void
  addToCart: (product: Product, quantity: number, observations?: string) => void
  removeFromCart: (productId: string) => void
  updateCartItem: (productId: string, quantity: number, observations?: string) => void
  clearCart: () => void
  setSelectedCategory: (category: string) => void
  toggleFavorite: (productId: string) => void
  
  // Computed
  getCartTotal: () => number
  getCartItemsCount: () => number
  generateWhatsAppMessage: () => string
  getFavoriteProducts: () => Product[]
  getProductsByCategory: (category: string) => Product[]
  getPromotionProducts: () => Product[]
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      company: {
        name: 'Minha Empresa',
        whatsapp: '5511999999999',
        theme: {
          primaryColor: '#10b981',
          secondaryColor: '#059669',
          accentColor: '#fbbf24'
        },
        businessType: 'other'
      },
      products: [],
      cart: [],
      selectedCategory: '',
      favorites: [],

      setCompany: (company) => set({ company }),
      
      setProducts: (products) => set({ products }),
      
      addToCart: (product, quantity, observations) => {
        const { cart } = get()
        const existingItem = cart.find(item => item.product.id === product.id)
        
        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity, observations }
                : item
            )
          })
        } else {
          set({
            cart: [...cart, { product, quantity, observations }]
          })
        }
      },
      
      removeFromCart: (productId) => {
        const { cart } = get()
        set({
          cart: cart.filter(item => item.product.id !== productId)
        })
      },
      
      updateCartItem: (productId, quantity, observations) => {
        const { cart } = get()
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        
        set({
          cart: cart.map(item =>
            item.product.id === productId
              ? { ...item, quantity, observations }
              : item
          )
        })
      },
      
      clearCart: () => set({ cart: [] }),
      
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      
      toggleFavorite: (productId) => {
        const { favorites } = get()
        const isFavorite = favorites.includes(productId)
        
        set({
          favorites: isFavorite
            ? favorites.filter(id => id !== productId)
            : [...favorites, productId]
        })
      },
      
      getCartTotal: () => {
        const { cart } = get()
        return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      },
      
      getCartItemsCount: () => {
        const { cart } = get()
        return cart.reduce((total, item) => total + item.quantity, 0)
      },
      
      getFavoriteProducts: () => {
        const { products, favorites } = get()
        return products.filter(product => favorites.includes(product.id))
      },
      
      getProductsByCategory: (category) => {
        const { products } = get()
        return category === '' 
          ? products 
          : products.filter(product => product.category === category)
      },
      
      getPromotionProducts: () => {
        const { products } = get()
        return products.filter(product => product.isPromotion && product.isAvailable)
      },
      
      generateWhatsAppMessage: () => {
        const { cart, company } = get()
        const total = get().getCartTotal()
        
        let message = `🛍️ *Novo Pedido - ${company.name}*\n\n`
        message += `📱 *Pedido via Catálogo Digital*\n\n`
        
        cart.forEach((item, index) => {
          message += `${index + 1}. *${item.product.name}*\n`
          message += `   Quantidade: ${item.quantity}x\n`
          message += `   Valor unitário: R$ ${item.product.price.toFixed(2)}\n`
          message += `   Subtotal: R$ ${(item.product.price * item.quantity).toFixed(2)}\n`
          if (item.observations) {
            message += `   📝 Obs: ${item.observations}\n`
          }
          message += '\n'
        })
        
        message += `💰 *TOTAL: R$ ${total.toFixed(2)}*\n\n`
        message += `📍 Entregar em: _Informar endereço_\n`
        message += `💳 Forma de pagamento: _A combinar_\n\n`
        message += `✅ Confirma o pedido?`
        
        return encodeURIComponent(message)
      }
    }),
    {
      name: 'catalog-storage',
      partialize: (state) => ({
        company: state.company,
        cart: state.cart,
        favorites: state.favorites
      })
    }
  )
)
