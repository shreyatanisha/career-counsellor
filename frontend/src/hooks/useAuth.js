import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getAuth, signInWithRedirect, GoogleAuthProvider,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from 'firebase/auth'
import { useUserStore } from '../store/userStore'
import { registerUser } from '../api/userApi'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
}

let app, auth, googleProvider

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
} catch (e) {
  console.warn('Firebase initialization failed:', e.message)
}

export function useAuth() {
  const { setUser, clearUser } = useUserStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken()
          localStorage.setItem('auth_token', token)
          const res = await registerUser({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email,
            full_name: firebaseUser.displayName
          })
          setUser(res.data)
        } catch (err) {
          console.error('Auth sync failed:', err)
        }
      } else {
        localStorage.removeItem('auth_token')
        clearUser()
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const loginWithGoogle = () => {
    if (!auth) return Promise.reject(new Error('Firebase not configured'))
    if (firebaseConfig.apiKey === 'demo-key') return loginDemo()
    return signInWithRedirect(auth, googleProvider)
  }

  const loginWithEmail = (email, pass) => {
    if (!auth) return Promise.reject(new Error('Firebase not configured'))
    if (firebaseConfig.apiKey === 'demo-key') return loginDemo()
    return signInWithEmailAndPassword(auth, email, pass)
  }

  const registerWithEmail = (email, pass) => {
    if (!auth) return Promise.reject(new Error('Firebase not configured'))
    if (firebaseConfig.apiKey === 'demo-key') return loginDemo()
    return createUserWithEmailAndPassword(auth, email, pass)
  }

  const logout = () => {
    if (!auth) {
      clearUser()
      localStorage.removeItem('auth_token')
      return Promise.resolve()
    }
    return signOut(auth)
  }

  // Demo login for development without Firebase
  const loginDemo = () => {
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@career.ai',
      full_name: 'Demo User',
      is_admin: true,
    }
    localStorage.setItem('auth_token', 'demo-token')
    setUser(demoUser)
    return Promise.resolve(demoUser)
  }

  return { loginWithGoogle, loginWithEmail, registerWithEmail, logout, loginDemo, loading }
}
