
import React, { useState, useEffect } from 'react'
import { useRevendasAuth } from '../hooks/useRevendasAuth'
import { lumi } from '../lib/lumi'
import {Plus, Edit, Trash2, Settings, Share2, Eye, Upload, Save} from 'lucide-react'
import toast from 'react-hot-toast'

interface Produto {
  _id: string
  revendaId: string
  nome: string
  descricao?: string
  preco: number
  precoOriginal?: number
  categoria: string
  imagem?: string
  disponivel: boolean
  promocao?: boolean
  avaliacao?: number
  numeroAvaliacoes?: number
  tags?: string[]
}

const DashboardPro: React.FC = () => {
  const { revenda, isAuthenticated, logoutRevenda, updateRevenda } = useRevendasAuth()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'produtos' | 'configuracoes'>('produtos')
  const [showProdutoForm, setShowProdutoForm] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)

  // Carregar produtos da revenda
  const fetchProdutos = async () => {
    if (!revenda?._id) return

    try {
      setLoading(true)
      const { list } = await lumi.entities.produtos_revenda.list({
        filter: { revendaId: revenda._id },
        sort: { criadoEm: -1 }
      })
      setProdutos(list || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && revenda) {
      fetchProdutos()
    }
  }, [isAuthenticated, revenda])

  // Criar/Editar produto
  const handleProdutoSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const produtoData = {
      revendaId: revenda!._id,
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string,
      preco: parseFloat(formData.get('preco') as string),
      precoOriginal: formData.get('precoOriginal') ? parseFloat(formData.get('precoOriginal') as string) : undefined,
      categoria: formData.get('categoria') as string,
      imagem: formData.get('imagem') as string,
      disponivel: formData.get('disponivel') === 'true',
      promocao: formData.get('promocao') === 'true',
      avaliacao: formData.get('avaliacao') ? parseFloat(formData.get('avaliacao') as string) : 0,
      numeroAvaliacoes: formData.get('numeroAvaliacoes') ? parseInt(formData.get('numeroAvaliacoes') as string) : 0,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    }

    try {
      if (editingProduto) {
        await lumi.entities.produtos_revenda.update(editingProduto._id, {
          ...produtoData,
          criadoEm: editingProduto.criadoEm
        })
        toast.success('Produto atualizado com sucesso!')
      } else {
        await lumi.entities.produtos_revenda.create(produtoData)
        toast.success('Produto criado com sucesso!')
      }
      
      setShowProdutoForm(false)
      setEditingProduto(null)
      fetchProdutos()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      toast.error('Erro ao salvar produto')
    }
  }

  // Deletar produto
  const handleDeleteProduto = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja deletar "${nome}"?`)) {
      try {
        await lumi.entities.produtos_revenda.delete(id)
        toast.success('Produto deletado com sucesso!')
        fetchProdutos()
      } catch (error) {
        console.error('Erro ao deletar produto:', error)
        toast.error('Erro ao deletar produto')
      }
    }
  }

  // Atualizar configurações da revenda
  const handleConfigSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const configData = {
      nomeEmpresa: formData.get('nomeEmpresa') as string,
      telefone: formData.get('telefone') as string,
      endereco: formData.get('endereco') as string,
      horarioFuncionamento: formData.get('horarioFuncionamento') as string,
      descricao: formData.get('descricao') as string,
      imagemCapa: formData.get('imagemCapa') as string,
      logo: formData.get('logo') as string,
      tema: {
        corPrimaria: formData.get('corPrimaria') as string,
        corSecundaria: formData.get('corSecundaria') as string,
        corAcento: formData.get('corAcento') as string
      },
      atualizadoEm: new Date().toISOString()
    }

    try {
      await lumi.entities.revendas.update(revenda!._id, configData)
      updateRevenda(configData)
      toast.success('Configurações atualizadas com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      toast.error('Erro ao atualizar configurações')
    }
  }

  // Compartilhar catálogo
  const handleShareCatalog = async () => {
    const catalogUrl = `${window.location.origin}/catalog/${revenda?.linkCatalogo}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${revenda?.nomeEmpresa} - Catálogo Digital`,
          text: `Confira nosso catálogo digital! ${revenda?.descricao}`,
          url: catalogUrl
        })
      } catch (err) {
        console.log('Erro ao compartilhar:', err)
      }
    } else {
      // Fallback - copiar para clipboard
      try {
        await navigator.clipboard.writeText(catalogUrl)
        toast.success('Link do catálogo copiado!')
      } catch (err) {
        toast.error('Erro ao copiar link')
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Dashboard Pro</h1>
          <p className="text-gray-600 text-center mb-6">
            Faça login para gerenciar seu catálogo
          </p>
          <div className="text-center">
            <a 
              href="/login-revenda"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fazer Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: revenda?.tema?.corPrimaria || '#10b981' }}
              >
                {revenda?.nomeEmpresa.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{revenda?.nomeEmpresa}</h1>
                <p className="text-sm text-gray-600">Dashboard Pro</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShareCatalog}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Share2 size={16} />
                <span>Compartilhar</span>
              </button>
              
              <button
                onClick={logoutRevenda}
                className="text-red-600 hover:text-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('produtos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'produtos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Produtos
            </button>
            <button
              onClick={() => setActiveTab('configuracoes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configuracoes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Configurações
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab: Produtos */}
        {activeTab === 'produtos' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Meus Produtos ({produtos.length})
              </h2>
              <button
                onClick={() => { setEditingProduto(null); setShowProdutoForm(true) }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                <span>Novo Produto</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando produtos...</p>
              </div>
            ) : produtos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produtos.map((produto) => (
                  <div key={produto._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="relative">
                      <img
                        src={produto.imagem || 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?w=300'}
                        alt={produto.nome}
                        className="w-full h-48 object-cover"
                      />
                      {produto.promocao && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                          PROMOÇÃO
                        </div>
                      )}
                      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                        produto.disponivel ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{produto.nome}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {produto.descricao}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-green-600">
                            R$ {produto.preco.toFixed(2)}
                          </span>
                          {produto.precoOriginal && produto.precoOriginal > produto.preco && (
                            <span className="text-sm text-gray-500 line-through">
                              R$ {produto.precoOriginal.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {produto.categoria}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          produto.disponivel 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {produto.disponivel ? 'Disponível' : 'Indisponível'}
                        </span>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => { setEditingProduto(produto); setShowProdutoForm(true) }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduto(produto._id, produto.nome)}
                            className="text-red-600 hover:text-red-800"
                            title="Deletar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  Nenhum produto cadastrado ainda
                </p>
                <button
                  onClick={() => setShowProdutoForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cadastrar Primeiro Produto
                </button>
              </div>
            )}
          </>
        )}

        {/* Tab: Configurações */}
        {activeTab === 'configuracoes' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Configurações da Empresa
            </h2>
            
            <form onSubmit={handleConfigSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    name="nomeEmpresa"
                    defaultValue={revenda?.nomeEmpresa || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    name="telefone"
                    defaultValue={revenda?.telefone || ''}
                    placeholder="5511999999999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    name="endereco"
                    defaultValue={revenda?.endereco || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Funcionamento
                  </label>
                  <input
                    name="horarioFuncionamento"
                    defaultValue={revenda?.horarioFuncionamento || ''}
                    placeholder="Seg-Dom: 18h às 23h"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    rows={3}
                    defaultValue={revenda?.descricao || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem de Capa
                  </label>
                  <input
                    name="imagemCapa"
                    type="url"
                    defaultValue={revenda?.imagemCapa || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL do Logo
                  </label>
                  <input
                    name="logo"
                    type="url"
                    defaultValue={revenda?.logo || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Cores do Tema */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Personalizar Cores</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor Primária
                      </label>
                      <input
                        name="corPrimaria"
                        type="color"
                        defaultValue={revenda?.tema?.corPrimaria || '#10b981'}
                        className="w-full h-10 rounded-lg border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor Secundária
                      </label>
                      <input
                        name="corSecundaria"
                        type="color"
                        defaultValue={revenda?.tema?.corSecundaria || '#059669'}
                        className="w-full h-10 rounded-lg border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor de Acento
                      </label>
                      <input
                        name="corAcento"
                        type="color"
                        defaultValue={revenda?.tema?.corAcento || '#f59e0b'}
                        className="w-full h-10 rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={20} />
                  <span>Salvar Configurações</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Modal de Formulário de Produto */}
      {showProdutoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduto ? 'Editar Produto' : 'Novo Produto'}
              </h2>
            </div>

            <form onSubmit={handleProdutoSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    name="nome"
                    defaultValue={editingProduto?.nome || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    name="categoria"
                    defaultValue={editingProduto?.categoria || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecionar categoria</option>
                    <option value="lanches">Lanches</option>
                    <option value="pizzas">Pizzas</option>
                    <option value="sobremesas">Sobremesas</option>
                    <option value="bebidas">Bebidas</option>
                    <option value="saudavel">Saudável</option>
                    <option value="combos">Combos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço *
                  </label>
                  <input
                    name="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingProduto?.preco || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço Original (promoção)
                  </label>
                  <input
                    name="precoOriginal"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingProduto?.precoOriginal || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem
                  </label>
                  <input
                    name="imagem"
                    type="url"
                    defaultValue={editingProduto?.imagem || ''}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    rows={3}
                    defaultValue={editingProduto?.descricao || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="disponivel"
                    defaultValue={editingProduto?.disponivel?.toString() || 'true'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Disponível</option>
                    <option value="false">Indisponível</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promoção
                  </label>
                  <select
                    name="promocao"
                    defaultValue={editingProduto?.promocao?.toString() || 'false'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="false">Não</option>
                    <option value="true">Sim</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    name="tags"
                    defaultValue={editingProduto?.tags?.join(', ') || ''}
                    placeholder="artesanal, queijo, promoção"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowProdutoForm(false); setEditingProduto(null) }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProduto ? 'Atualizar' : 'Criar'} Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPro
