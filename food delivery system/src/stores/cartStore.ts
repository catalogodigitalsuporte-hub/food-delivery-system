
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  restaurantId: string
  restaurantName: string
  imageUrl?: string
  customizations?: Array<{
    name: string
    options: string[]
    price: number
  }>
  specialInstructions?: string
}

interface CartStore {
  items: CartItem[]
  restaurantId: string | null
  restaurantName: string | null
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  canAddItem: (restaurantId: string) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,

      addItem: (newItem) => {
        const state = get()
        
        // Verificar se pode adicionar item (mesmo restaurante)
        if (state.restaurantId && state.restaurantId !== newItem.restaurantId) {
          throw new Error('Você só pode adicionar itens do mesmo restaurante')
        }

        const existingItemIndex = state.items.findIndex(
          item => 
            item.menuItemId === newItem.menuItemId &&
            JSON.stringify(item.customizations) === JSON.stringify(newItem.customizations)
        )

        if (existingItemIndex >= 0) {
          // Item já existe, incrementar quantidade
          set(state => ({
            items: state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            )
          }))
        } else {
          // Novo item
          const id = `${newItem.menuItemId}_${Date.now()}_${Math.random()}`
          set(state => ({
            items: [...state.items, { ...newItem, id }],
            restaurantId: newItem.restaurantId,
            restaurantName: newItem.restaurantName
          }))
        }
      },

      removeItem: (id) => {
        set(state => {
          const newItems = state.items.filter(item => item.id !== id)
          return {
            items: newItems,
            restaurantId: newItems.length > 0 ? state.restaurantId : null,
            restaurantName: newItems.length > 0 ? state.restaurantName : null
          }
        })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set(state => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        }))
      },

      clearCart: () => {
        set({ items: [], restaurantId: null, restaurantName: null })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const customizationPrice = item.customizations?.reduce(
            (sum, custom) => sum + custom.price, 0
          ) || 0
          return total + (item.price + customizationPrice) * item.quantity
        }, 0)
      },

      canAddItem: (restaurantId) => {
        const state = get()
        return !state.restaurantId || state.restaurantId === restaurantId
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)
