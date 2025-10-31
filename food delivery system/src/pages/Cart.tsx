
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {Minus, Plus, Trash2, Tag, MapPin, CreditCard} from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { useAuth } from '../hooks/useAuth'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface Coupon {
  _id: string
  code: string
  name: string
  description: string
  type: 'percentage' | 'fixed' | 'free-delivery'
  value: number
  minimumOrderValue: number
  maxDiscount?: number
}

interface Address {
  _id: string
  label: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

const Cart: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, signIn } = useAuth()
  const { 
    items, 
    restaurantName, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalPrice 
  } = useCartStore()

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const subtotal = getTotalPrice()
  const deliveryFee = subtotal >= 50 ? 0 : 8.90 // Frete grátis acima de R$ 50
  const serviceFee = subtotal * 0.05 // 5% de taxa de serviço

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0

    if (appliedCoupon.type === 'percentage') {
      const discount = subtotal * (appliedCoupon.value / 100)
      return appliedCoupon.maxDiscount ? Math.min(discount, appliedCoupon.maxDiscount) : discount
    } else if (appliedCoupon.type === 'fixed') {
      return Math.min(appliedCoupon.value, subtotal)
    } else if (appliedCoupon.type === 'free-delivery') {
      return deliveryFee
    }
    
    return 0
  }

  const discount = calculateDiscount()
  const finalDeliveryFee = appliedCoupon?.type === 'free-delivery' ? 0 : deliveryFee
  const total = subtotal + finalDeliveryFee + serviceFee - discount

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const fetchUserAddresses = async () => {
    if (!isAuthenticated || !user) return

    try {
      const { list } = await lumi.entities.user_addresses.list({
        filter: { userId: user.userId },
        sort: { isDefault: -1, createdAt: -1 }
      })
      
      setAddresses(list || [])
      const defaultAddress = list?.find(addr => addr.isDefault)
      if (defaultAddress) {
        setSelectedAddress(defaultAddress)
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error)
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Digite um código de cupom')
      return
    }

    try {
      const { list } = await lumi.entities.coupons.list({
        filter: { 
          code: couponCode.toUpperCase(),
          isActive: true
        }
      })

      const coupon = list?.[0]
      
      if (!coupon) {
        toast.error('Cupom não encontrado ou inválido')
        return
      }

      if (subtotal < coupon.minimumOrderValue) {
        toast.error(`Pedido mínimo de ${formatPrice(coupon.minimumOrderValue)} para este cupom`)
        return
      }

      const now = new Date()
      const validFrom = new Date(coupon.validFrom)
      const validUntil = new Date(coupon.validUntil)

      if (now < validFrom || now > validUntil) {
        toast.error('Cupom expirado ou ainda não válido')
        return
      }

      setAppliedCoupon(coupon)
      setCouponCode('')
      toast.success(`Cupom aplicado: ${coupon.name}`)
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error)
      toast.error('Erro ao aplicar cupom')
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    toast.success('Cupom removido')
  }

  const finalizePurchase = async () => {
    if (!isAuthenticated) {
      try {
        await signIn()
        return
      } catch (error) {
        toast.error('É necessário fazer login para finalizar o pedido')
        return
      }
    }

    if (!selectedAddress) {
      toast.error('Selecione um endereço de entrega')
      return
    }

    if (!paymentMethod) {
      toast.error('Selecione uma forma de pagamento')
      return
    }

    if (items.length === 0) {
      toast.error('Carrinho vazio')
      return
    }

    setLoading(true)

    try {
      const orderData = {
        userId: user.userId,
        restaurantId: items[0].restaurantId,
        orderNumber: `ORD-${Date.now()}`,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations || [],
          specialInstructions: item.specialInstructions || ''
        })),
        subtotal,
        deliveryFee: finalDeliveryFee,
        serviceFee,
        discount,
        totalAmount: total,
        status: 'pendente',
        deliveryAddress: {
          street: selectedAddress.street,
          number: selectedAddress.number,
          complement: selectedAddress.complement || '',
          neighborhood: selectedAddress.neighborhood,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          reference: selectedAddress.reference || ''
        },
        paymentMethod,
        paymentStatus: 'pendente',
        estimatedDeliveryTime: new Date(Date.now() + 35 * 60 * 1000).toISOString(), // +35 minutos
        trackingCode: `TRK${Date.now()}`,
        customerNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const newOrder = await lumi.entities.orders.create(orderData)
      
      clearCart()
      toast.success('Pedido realizado com sucesso!')
      navigate(`/pedido/${newOrder._id}`)
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      toast.error('Erro ao finalizar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserAddresses()
    }
  }, [isAuthenticated, user])

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-600 mb-8">
              Que tal explorar nossos deliciosos restaurantes?
            </p>
            <Link
              to="/"
              className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Ver Restaurantes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Itens do Carrinho */}
          <div className="lg:col-span-2 space-y-6">
            {/* Restaurante */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {restaurantName}
              </h2>
              <p className="text-gray-600 text-sm">
                {items.length} {items.length === 1 ? 'item' : 'itens'}
              </p>
            </div>

            {/* Lista de Itens */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      
                      {item.customizations && item.customizations.length > 0 && (
                        <div className="text-sm text-gray-600 mb-2">
                          {item.customizations.map((custom, index) => (
                            <div key={index}>
                              {custom.name}: {custom.options.join(', ')}
                              {custom.price > 0 && ` (+${formatPrice(custom.price)})`}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500 mb-2">
                          Obs: {item.specialInstructions}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="ml-4 text-right">
                      <div className="font-bold text-lg">
                        {formatPrice((item.price + (item.customizations?.reduce((sum, c) => sum + c.price, 0) || 0)) * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cupom */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Cupom de Desconto</h3>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="font-medium text-green-800">{appliedCoupon.name}</div>
                      <div className="text-sm text-green-600">{appliedCoupon.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Digite o código do cupom"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="space-y-6">
            {/* Endereço de Entrega */}
            {isAuthenticated && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Endereço de Entrega
                </h3>
                
                {addresses.length > 0 ? (
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <label key={address._id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress?._id === address._id}
                          onChange={() => setSelectedAddress(address)}
                          className="mt-1 text-red-500 focus:ring-red-500"
                        />
                        <div className="flex-1 text-sm">
                          <div className="font-medium">{address.label}</div>
                          <div className="text-gray-600">
                            {address.street}, {address.number}
                            {address.complement && ` - ${address.complement}`}
                          </div>
                          <div className="text-gray-600">
                            {address.neighborhood}, {address.city} - {address.state}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Nenhum endereço cadastrado
                  </div>
                )}
              </div>
            )}

            {/* Forma de Pagamento */}
            {isAuthenticated && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Forma de Pagamento
                </h3>
                
                <div className="space-y-2">
                  {[
                    { id: 'pix', name: 'PIX' },
                    { id: 'cartao-credito', name: 'Cartão de Crédito' },
                    { id: 'cartao-debito', name: 'Cartão de Débito' },
                    { id: 'dinheiro', name: 'Dinheiro' }
                  ].map((method) => (
                    <label key={method.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">{method.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Taxa de entrega</span>
                  <span>
                    {finalDeliveryFee === 0 ? (
                      <span className="text-green-600">Grátis</span>
                    ) : (
                      formatPrice(finalDeliveryFee)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Taxa de serviço</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={finalizePurchase}
                disabled={loading || (!isAuthenticated && false)}
                className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {loading ? 'Processando...' : 
                 !isAuthenticated ? 'Fazer Login para Finalizar' : 
                 `Finalizar Pedido ${formatPrice(total)}`}
              </button>

              {subtotal < 25 && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Adicione mais {formatPrice(25 - subtotal)} para atingir o pedido mínimo
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
