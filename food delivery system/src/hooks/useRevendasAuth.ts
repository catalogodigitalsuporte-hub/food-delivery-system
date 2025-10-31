
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface Revenda {
  _id: string
  email: string
  nomeEmpresa: string
  telefone?: string
  endereco?: string
  horarioFuncionamento?: string
  descricao?: string
  imagemCapa?: string
  logo?: string
  tema?: {
    corPrimaria: string
    corSecundaria: string
    corAcento?: string
  }
  status: string
  linkCatalogo?: string
}

interface RevendasAuthState {
  revenda: Revenda | null
  isAuthenticated: boolean
  loading: boolean
}

export const useRevendasAuth = () => {
  const [authState, setAuthState] = useState<RevendasAuthState>({
    revenda: null,
    isAuthenticated: false,
    loading: true
  })

  // Verificar sessão existente
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedRevenda = localStorage.getItem('revenda-session')
        if (storedRevenda) {
          const revendaData = JSON.parse(storedRevenda)
          
          // Verificar se a revenda ainda existe e está ativa
          const revenda = await lumi.entities.revendas.get(revendaData._id)
          if (revenda && revenda.status === 'ativo') {
            setAuthState({
              revenda,
              isAuthenticated: true,
              loading: false
            })
          } else {
            localStorage.removeItem('revenda-session')
            setAuthState({
              revenda: null,
              isAuthenticated: false,
              loading: false
            })
          }
        } else {
          setAuthState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
        localStorage.removeItem('revenda-session')
        setAuthState({
          revenda: null,
          isAuthenticated: false,
          loading: false
        })
      }
    }

    checkSession()
  }, [])

  const loginRevenda = async (email: string, senha: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))

      // Buscar revenda pelo email
      const { list: revendas } = await lumi.entities.revendas.list({
        filter: { email: email.toLowerCase().trim() }
      })

      if (!revendas || revendas.length === 0) {
        toast.error('Email não encontrado')
        return false
      }

      const revenda = revendas[0]

      // Verificar status
      if (revenda.status !== 'ativo') {
        toast.error('Revenda inativa ou suspensa')
        return false
      }

      // Verificar senha (em produção, usar hash comparison)
      // Para demo, comparação simples - em produção usar bcrypt
      if (revenda.senha !== senha) {
        toast.error('Senha incorreta')
        return false
      }

      // Salvar sessão
      const revendaSession = { ...revenda }
      delete revendaSession.senha // Não armazenar senha na sessão
      
      localStorage.setItem('revenda-session', JSON.stringify(revendaSession))
      
      setAuthState({
        revenda: revendaSession,
        isAuthenticated: true,
        loading: false
      })

      toast.success(`Bem-vindo, ${revenda.nomeEmpresa}!`)
      return true

    } catch (error) {
      console.error('Erro no login:', error)
      toast.error('Erro no login. Tente novamente.')
      setAuthState(prev => ({ ...prev, loading: false }))
      return false
    }
  }

  const logoutRevenda = () => {
    localStorage.removeItem('revenda-session')
    setAuthState({
      revenda: null,
      isAuthenticated: false,
      loading: false
    })
    toast.success('Logout realizado com sucesso')
  }

  const updateRevenda = (updatedData: Partial<Revenda>) => {
    if (authState.revenda) {
      const updatedRevenda = { ...authState.revenda, ...updatedData }
      setAuthState(prev => ({
        ...prev,
        revenda: updatedRevenda
      }))
      localStorage.setItem('revenda-session', JSON.stringify(updatedRevenda))
    }
  }

  return {
    ...authState,
    loginRevenda,
    logoutRevenda,
    updateRevenda
  }
}
