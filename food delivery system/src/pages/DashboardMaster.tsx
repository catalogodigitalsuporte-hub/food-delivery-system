
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { lumi } from '../lib/lumi'
import {Plus, Edit, Trash2, Eye, EyeOff, Search, Filter} from 'lucide-react'
import toast from 'react-hot-toast'

interface Revenda {
  _id: string
  email: string
  senha: string
  nomeEmpresa: string
  telefone?: string
  endereco?: string
  status: 'ativo' | 'inativo' | 'suspenso'
  linkCatalogo?: string
  criadoEm: string
  tema?: {
    corPrimaria: string
    corSecundaria: string
    corAcento?: string
  }
}

const DashboardMaster: React.FC = () => {
  const { user, isAuthenticated, signIn } = useAuth()
  const [revendas, setRevendas] = useState<Revenda[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRevenda, setEditingRevenda] = useState<Revenda | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Buscar revendas
  const fetchRevendas = async () => {
    try {
      setLoading(true)
      let filter: any = {}
      
      if (searchTerm) {
        filter.$or = [
          { nomeEmpresa: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ]
      }
      
      if (statusFilter) {
        filter.status = statusFilter
      }

      const { list } = await lumi.entities.revendas.list({
        filter,
        sort: { criadoEm: -1 }
      })
      
      setRevendas(list || [])
    } catch (error) {
      console.error('Erro ao carregar revendas:', error)
      toast.error('Erro ao carregar revendas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.userRole === 'ADMIN') {
      fetchRevendas()
    }
  }, [isAuthenticated, user, searchTerm, statusFilter])

  // Criar/Editar revenda
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const revendaData = {
      email: (formData.get('email') as string).toLowerCase().trim(),
      senha: formData.get('senha') as string,
      nomeEmpresa: formData.get('nomeEmpresa') as string,
      telefone: formData.get('telefone') as string,
      endereco: formData.get('endereco') as string,
      horarioFuncionamento: formData.get('horarioFuncionamento') as string,
      descricao: formData.get('descricao') as string,
      imagemCapa: formData.get('imagemCapa') as string,
      logo: formData.get('logo') as string,
      status: (formData.get('status') as string) || 'ativo',
      linkCatalogo: (formData.get('nomeEmpresa') as string)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '-2024',
      tema: {
        corPrimaria: (formData.get('corPrimaria') as string) || '#10b981',
        corSecundaria: (formData.get('corSecundaria') as string) || '#059669',
        corAcento: (formData.get('corAcento') as string) || '#f59e0b'
      },
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      criadoPor: user?.userId || 'master-admin'
    }

    try {
      if (editingRevenda) {
        await lumi.entities.revendas.update(editingRevenda._id, {
          ...revendaData,
          criadoEm: editingRevenda.criadoEm // Manter data original
        })
        toast.success('Revenda atualizada com sucesso!')
      } else {
        await lumi.entities.revendas.create(revendaData)
        toast.success('Revenda criada com sucesso!')
      }
      
      setShowForm(false)
      setEditingRevenda(null)
      fetchRevendas()
    } catch (error) {
      console.error('Erro ao salvar revenda:', error)
      toast.error('Erro ao salvar revenda')
    }
  }

  // Deletar revenda
  const handleDelete = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja deletar a revenda "${nome}"?`)) {
      try {
        await lumi.entities.revendas.delete(id)
        toast.success('Revenda deletada com sucesso!')
        fetchRevendas()
      } catch (error) {
        console.error('Erro ao deletar revenda:', error)
        toast.error('Erro ao deletar revenda')
      }
    }
  }

  // Verificar autenticação
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Dashboard Master</h1>
          <p className="text-gray-600 text-center mb-6">
            Acesso restrito para administradores
          </p>
          <button
            onClick={signIn}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  // Verificar se é admin
  if (user?.userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar o Dashboard Master.
          </p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Master</h1>
              <p className="text-gray-600">Gerenciar revendas do sistema</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bem-vindo, {user?.userName}
              </span>
              <button
                onClick={() => lumi.auth.signOut()}
                className="text-red-600 hover:text-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controles */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <button
              onClick={() => { setEditingRevenda(null); setShowForm(true) }}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Nova Revenda</span>
            </button>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar revendas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Revendas */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Revendas Cadastradas ({revendas.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando revendas...</p>
            </div>
          ) : revendas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revendas.map((revenda) => (
                    <tr key={revenda._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div 
                              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                              style={{ backgroundColor: revenda.tema?.corPrimaria || '#10b981' }}
                            >
                              {revenda.nomeEmpresa.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {revenda.nomeEmpresa}
                            </div>
                            <div className="text-sm text-gray-500">
                              {revenda.linkCatalogo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {revenda.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          revenda.status === 'ativo' 
                            ? 'bg-green-100 text-green-800'
                            : revenda.status === 'inativo'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {revenda.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(revenda.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => { setEditingRevenda(revenda); setShowForm(true) }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(revenda._id, revenda.nomeEmpresa)}
                            className="text-red-600 hover:text-red-900"
                            title="Deletar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">Nenhuma revenda encontrada</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingRevenda ? 'Editar Revenda' : 'Nova Revenda'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa *
                  </label>
                  <input
                    name="nomeEmpresa"
                    defaultValue={editingRevenda?.nomeEmpresa || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingRevenda?.email || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    name="senha"
                    type="password"
                    defaultValue={editingRevenda?.senha || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone WhatsApp
                  </label>
                  <input
                    name="telefone"
                    defaultValue={editingRevenda?.telefone || ''}
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
                    defaultValue={editingRevenda?.endereco || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de Funcionamento
                  </label>
                  <input
                    name="horarioFuncionamento"
                    defaultValue={editingRevenda?.horarioFuncionamento || ''}
                    placeholder="Seg-Dom: 18h às 23h"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingRevenda?.status || 'ativo'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="suspenso">Suspenso</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    rows={3}
                    defaultValue={editingRevenda?.descricao || ''}
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
                    defaultValue={editingRevenda?.imagemCapa || ''}
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
                    defaultValue={editingRevenda?.logo || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Cores do Tema */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Tema de Cores</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor Primária
                      </label>
                      <input
                        name="corPrimaria"
                        type="color"
                        defaultValue={editingRevenda?.tema?.corPrimaria || '#10b981'}
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
                        defaultValue={editingRevenda?.tema?.corSecundaria || '#059669'}
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
                        defaultValue={editingRevenda?.tema?.corAcento || '#f59e0b'}
                        className="w-full h-10 rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingRevenda(null) }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRevenda ? 'Atualizar' : 'Criar'} Revenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardMaster
