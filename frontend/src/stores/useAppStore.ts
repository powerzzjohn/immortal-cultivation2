import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, Cultivation, CelestialData, Bazi } from '../types'

interface AppState {
  // 认证状态
  auth: AuthState
  setAuth: (auth: Partial<AuthState>) => void
  logout: () => void
  
  // 修炼状态
  cultivation: Cultivation | null
  setCultivation: (cultivation: Cultivation) => void
  updateCultivation: (update: Partial<Cultivation>) => void
  
  // 天时数据
  celestialData: CelestialData | null
  setCelestialData: (data: CelestialData) => void
  
  // 八字数据
  bazi: Bazi | null
  setBazi: (bazi: Bazi) => void
  
  // UI状态
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
      },
      setAuth: (auth) => set((state) => ({ auth: { ...state.auth, ...auth } })),
      logout: () => set({ auth: { user: null, token: null, isLoading: false, error: null } }),
      
      cultivation: null,
      setCultivation: (cultivation) => set({ cultivation }),
      updateCultivation: (update) => set((state) => ({
        cultivation: state.cultivation ? { ...state.cultivation, ...update } : null
      })),
      
      celestialData: null,
      setCelestialData: (celestialData) => set({ celestialData }),
      
      bazi: null,
      setBazi: (bazi) => set({ bazi }),
      
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'immortal-cultivation-storage',
      partialize: (state) => ({ 
        auth: { user: state.auth.user, token: state.auth.token }
      }),
    }
  )
)
