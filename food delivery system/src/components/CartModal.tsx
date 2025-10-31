
import React, { useState } from 'react'
import {X, Plus, Minus, Trash2, MessageCircleDashed as MessageCircle, MapPin, CreditCard, User} from 'lucide-react'
import { useCatalogStore } from '../stores/catalogStore'
import toast from 'react-hot-toast'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    company, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    getCartTotal
  } = useCatalogStore()

  const [step, setStep] = useState<'cart' | 'checkout'>('cart')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    neighborhood: '',
    city: '',
    complement: '',
    paymentMethod: '',
    change: '',
    observations: ''
  })

  const total = getCartTotal()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const generateWhatsAppMessage = () => {
    let message = `🛍️ *Novo Pedido - ${company.name}*\n\n`
    message += `📱 *Pedido via Catálogo Digital*\n\n`
    
    // Dados do Cliente
    message += `👤 *DADOS DO CLIENTE*\n`
    message += `Nome: ${customerInfo.name}\n`
    message += `Telefone: ${customerInfo.phone}\n\n`
    
    // Endereço de Entrega
    message += `📍 *ENDEREÇO DE ENTREGA*\n`
    message += `${customerInfo.address}\n`
    message += `Bairro: ${customerInfo.neighborhood}\n`
    message += `Cidade: ${customerInfo.city}\n`
    if (customerInfo.complement) {
      message += `Complemento: ${customerInfo.complement}\n`
    }
    message += '\n'
    
    // Itens do Pedido
    message += `🛒 *ITENS DO PEDIDO*\n`
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}*\n`
      message += `   Quantidade: ${item.quantity}x\n`
      message += `   Valor unitário: ${formatPrice(item.product.price)}\n`
      message += `   Subtotal: ${formatPrice(item.product.price * item.quantity)}\n`
      if (item.observations) {
        message += `   📝 Obs: ${item.observations}\n`
      }
      message += '\n'
    })
    
    // Forma de Pagamento
    message += `💳 *FORMA DE PAGAMENTO*\n`
    message += `${customerInfo.paymentMethod}\n`
    if (customerInfo.paymentMethod === 'Dinheiro' && customerInfo.change) {
      message += `Troco para: ${customerInfo.change}\n`
    }
    message += '\n'
    
    // Total
    message += `💰 *TOTAL DO PEDIDO: ${formatPrice(total)}*\n\n`
    
    // Observações
    if (customerInfo.observations) {
      message += `📝 *OBSERVAÇÕES*\n${customerInfo.observations}\n\n`
    }
    
    message += `✅ Confirma o pedido?`
    
    return encodeURIComponent(message)
  }

  const handleFinishOrder = () => {
    // Validações
    if (!customerInfo.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    if (!customerInfo.phone.trim()) {
      toast.error('Telefone é obrigatório')
      return
    }
    if (!customerInfo.address.trim()) {
      toast.error('Endereço é obrigatório')
      return
    }
    if (!customerInfo.neighborhood.trim()) {
      toast.error('Bairro é obrigatório')
      return
    }
    if (!customerInfo.city.trim()) {
      toast.error('Cidade é obrigatória')
      return
    }
    if (!customerInfo.paymentMethod) {
      toast.error('Forma de pagamento é obrigatória')
      return
    }

    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${company.whatsapp}?text=${message}`
    
    window.open(whatsappUrl, '_blank')
    clearCart()
    onClose()
    setStep('cart')
    setCustomerInfo({
      name: '',
      phone: '',
      address: '',
      neighborhood: '',
      city: '',
      complement: '',
      paymentMethod: '',
      change: '',
      observations: ''
    })
    toast.success('Pedido enviado para o WhatsApp!', {
      duration: 3000,
      position: 'bottom-center'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[95vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {step === 'checkout' && (
              <button
                onClick={() => setStep('cart')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                ←
              </button>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {step === 'cart' ? '🛍️ Meu Carrinho' : '📝 Finalizar Pedido'}
              </h3>
              {step === 'cart' && (
                <p className="text-sm text-gray-500">
                  {cart.length} {cart.length === 1 ? 'item' : 'itens'}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          {step === 'cart' ? (
            // Tela do Carrinho
            cart.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="text-gray-400 mb-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    🛍️
                  </div>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Seu carrinho está vazio
                </h4>
                <p className="text-gray-500 mb-6">
                  Adicione alguns produtos!
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl font-medium text-white"
                  style={{ backgroundColor: company.theme.primaryColor }}
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {formatPrice(item.product.price)} cada
                        </p>
                        {item.observations && (
                          <p className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg mb-2">
                            📝 {item.observations}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          {/* Controles de Quantidade */}
                          <div className="flex items-center space-x-3 bg-white rounded-xl p-1">
                            <button
                              onClick={() => updateCartItem(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            
                            <span className="font-semibold min-w-6 text-center">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateCartItem(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          {/* Subtotal e Remover */}
                          <div className="flex items-center space-x-2">
                            <span className="font-bold" style={{ color: company.theme.primaryColor }}>
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Tela de Checkout
            <div className="p-6 space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="text-gray-600" size={20} />
                  <h4 className="font-semibold text-gray-900">Dados Pessoais</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Nome completo *"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent"
                    style={{ focusRing: `2px solid ${company.theme.primaryColor}` }}
                  />
                  <input
                    type="tel"
                    placeholder="Telefone/WhatsApp *"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent"
                    style={{ focusRing: `2px solid ${company.theme.primaryColor}` }}
                  />
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="text-gray-600" size={20} />
                  <h4 className="font-semibold text-gray-900">Endereço de Entrega</h4>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Rua, número *"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent"
                    style={{ focusRing: `2px solid ${company.theme.primaryColor}` }}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Bairro *"
                      value={customerInfo.neighborhood}
                      onChange={(e) => setCustomerInfo({...customerInfo, neighborhood: e.target.value})}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent"
                      style={{ focusRing: `2px solid ${company.theme.primaryColor}` }}
                    />
                    <input
                      type="text"
                      placeholder="Cidade *"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent"
                      style={{ focusRing: `2px solid ${company.theme.primaryColor}` }}
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Complemento (apartamento, bloco, etc.)"
                    value={customerInfo.complement}
                    onChange={(e) => setCustomerInfo({...customerInfo, complement: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent"
                    style={{ focusRing: `2px solid ${company.theme.primaryColor}` }}
                  />
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CreditCard className="text-gray-600" size={20} />
                  <h4 className="font-semibold text-gray-900">Forma de Pagamento</h4>
                </div>
                
                <div className="space-y-3">
                  {['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'VR/VA'].map((method) => (
                    <label key={method} className="flex items-center space-x-3 p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={customerInfo.paymentMethod === method}
                        onChange={(e) => setCustomerInfo({...customerInfo, paymentMethod: e.target.value})}
                        className="text-blue-600"
                      />
                      <span className="text-gray-900">{method}</span>
                    </label>
                  ))}
                  
                  {customerInfo.paymentMethod === 'Dinheiro' && (
                    <input
                      type="text"
                      placeholder="Troco para quanto?"
                      value={customerInfo.change}
                      onChange={(e) => setCustomerInfo({...customerInfo, change: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent"
                      style={{ focusRing: `2px solid ${company.theme.primaryColor}` }}
                    />
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Observações</h4>
                <textarea
                  placeholder="Alguma observação adicional sobre o pedido?"
                  value={customerInfo.observations}
                  onChange={(e) => setCustomerInfo({...customerInfo, observations: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent resize-none"
                  style={{ focusRing: `2px solid ${company.theme.primaryColor}` }}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer com Total e Ações */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-white">
            {/* Total */}
            <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-sm text-gray-600">Total do Pedido</p>
                <p className="text-2xl font-bold" style={{ color: company.theme.primaryColor }}>
                  {formatPrice(total)}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                {cart.reduce((acc, item) => acc + item.quantity, 0)} itens
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              {step === 'cart' ? (
                <>
                  <button
                    onClick={() => setStep('checkout')}
                    className="w-full py-4 px-4 rounded-2xl font-bold transition-colors text-white text-lg"
                    style={{ backgroundColor: company.theme.primaryColor }}
                  >
                    Continuar para Checkout
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={onClose}
                      className="py-3 px-4 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Continuar Comprando
                    </button>
                    
                    <button
                      onClick={() => {
                        clearCart()
                        toast.success('Carrinho limpo!')
                      }}
                      className="py-3 px-4 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors font-medium"
                    >
                      Limpar Carrinho
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={handleFinishOrder}
                  className="w-full py-4 px-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-lg"
                >
                  <MessageCircle size={24} />
                  <span>Enviar Pedido via WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartModal
