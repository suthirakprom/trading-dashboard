
import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

interface AuthContextType {
    user: User | null
    session: any | null
    role: string | null
    isAdmin: boolean
    loading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    role: null,
    isAdmin: false,
    loading: true,
    signOut: async () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<any | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .single()

                if (data && !error) {
                    setRole(data.role)
                } else {
                    setRole('user') // Default to user if fail
                }
            } catch (error) {
                console.error("Error fetching profile:", error)
                setRole('user')
            }
        }

        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            const currentUser = session?.user ?? null
            setUser(currentUser)

            if (currentUser) {
                fetchProfile(currentUser.id).finally(() => setLoading(false))
            } else {
                setRole(null)
                setLoading(false)
            }
        })

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            const currentUser = session?.user ?? null
            setUser(currentUser)

            if (currentUser) {
                // If user just signed in, fetch profile
                fetchProfile(currentUser.id)
            } else {
                setRole(null)
                setLoading(false) // Stop loading immediately on sign out
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const signOut = async () => {
        await supabase.auth.signOut()
        setRole(null)
        setUser(null)
        setSession(null)
    }

    const value = {
        user,
        session,
        role,
        isAdmin: role === 'admin',
        loading,
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
