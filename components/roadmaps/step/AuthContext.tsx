import React, { useContext, useState, useEffect } from 'react'
import firebase from 'firebase/app'
import { auth } from '$firebase/firebase'
import { apiClient } from '~/utils/apiClient'
import type { User } from '$prisma/client'
import NavictChan from '~/components/NavictChan'

// TODO:Loginなどのメッセージをログじゃなくてちゃんと作る
// TODO:loginを必要になったとき実装する
// TODO: placeholder全部消す

export type SigninMethod = 'google' | 'twitter'
type AuthContext = {
  signup: (method: Partial<SigninMethod>) => void
  logout: () => Promise<void>
  isLoggedIn: boolean
  user: User | null | undefined
}

type Props = {
  children: React.ReactNode
}

const AuthContext = React.createContext<AuthContext | null>(null)
export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }: Props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthContext['user']>()

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
      placeholder(error.message)
    }
  }

  const logout = async () => {
    try {
      await auth.signOut()
      setIsLoggedIn(false)
      placeholder('logged out')
    } catch (error) {
      console.error(error.message)
    }
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
        setUser(user)
        setIsLoggedIn(true)
        placeholder(`hello ${user.name}`)
        setLoading(false)
      } catch (error) {
        console.error('error:useEffect:', error)
      }
    })
    return unsubscribe
  }, [])

  const value: AuthContext = {
    signup,
    logout,
    isLoggedIn,
    user
  }
  return (
    <AuthContext.Provider value={value}>
      {/* FIXME: リリース前のみ表示 */}
      {/* <NavictChan text={`一般公開までもう少し待っててね!`} /> */}
      {loading && <NavictChan text={`LOADING...`} />}
      {!loading && children}
    </AuthContext.Provider>
  )
}