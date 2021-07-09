import React, { useContext, useState, useEffect, createContext } from 'react'
import firebase from 'firebase/app'
import { auth } from '$firebase/firebase'
import { apiClient } from '~/utils/apiClient'
import type { User } from '$prisma/client'
import NavictChan from '~/components/NavictChan'

// TODO:Loginなどのメッセージをログじゃなくてちゃんと作る

export type SigninMethod = 'google' | 'twitter'
type AuthContextType = {
  signup: (method: Partial<SigninMethod>) => void
  logout: () => Promise<void>
  isLoggedIn: boolean
  refreshAuth: () => Promise<void>
  user: User | null | undefined
  token: string | undefined
}

type Props = {
  children: React.ReactNode
}

function createCtx<ContextType>() {
  const ctx = createContext<ContextType | undefined>(undefined)
  function useCtx() {
    const c = useContext(ctx)
    if (!c) throw new Error('useCtx must be inside a Provider with a value')
    return c
  }
  return [useCtx, ctx.Provider] as const
}

const [useAuthCtx, SetAuthProvider] = createCtx<AuthContextType>()
export const useAuth = useAuthCtx

export const AuthProvider = ({ children }: Props) => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthContextType['user']>()
  const [token, setToken] = useState<AuthContextType['token']>()

  const signup = async (method: SigninMethod) => {
    try {
      if (method === 'google') {
        const provider = new firebase.auth.GoogleAuthProvider()
        await firebase.auth().signInWithRedirect(provider)
      } else if (method === 'twitter') {
        const provider = new firebase.auth.TwitterAuthProvider()
        await firebase.auth().signInWithRedirect(provider)
      } else {
        throw Error('signin method not specified.')
      }
    } catch (error) {
      console.error(error.message)
    }
  }

  const logout = async () => {
    try {
      await auth.signOut()
      console.log('logged out')
    } catch (error) {
      console.error(error.message)
    }
  }

  const refreshAuth = async () => {
    if (!auth.currentUser) return
    const idToken = await auth.currentUser.getIdToken(/* forceRefresh */ true)
    // Send token to your backend via HTTPS
    const res = await apiClient.signin.post({
      body: { accessToken: idToken }
    })
    const user = res.body.user
    const token = res.body.token
    setUser(user)
    setToken(token)
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      if (!fbUser) {
        setLoading(false)
        return
      }

      try {
        // user signed-in
        const idToken = await fbUser.getIdToken(/* forceRefresh */ true)
        // Send token to your backend via HTTPS
        const res = await apiClient.signin.post({
          body: { accessToken: idToken }
        })

        const user = res.body.user
        const token = res.body.token
        setUser(user)
        setToken(token)
        console.log(`hello ${user.name}`)
        setLoading(false)
      } catch (error) {
        console.error('error:useEffect:', error)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true')
  }, [isAdmin])

  return (
    <SetAuthProvider
      value={{
        signup,
        logout,
        refreshAuth,
        isLoggedIn: !!user,
        user,
        token
      }}
    >
      {/* FIXME: リリース前はproductionでadminしか使えないようにしている */}
      {!isDevelopment && !isAdmin ? (
        <NavictChan text={`一般公開までもう少し待っててね!`} />
      ) : (
        <></>
      )}
      {(isAdmin || isDevelopment) && loading ? (
        loading && <NavictChan text={`LOADING...`} />
      ) : (
        <></>
      )}
      {(isAdmin || isDevelopment) && !loading ? children : <></>}
    </SetAuthProvider>
  )
}
