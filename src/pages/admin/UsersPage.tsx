import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Shield, ShieldAlert, User } from 'lucide-react'

interface UserProfile {
    id: string
    email: string
    role: string
    created_at: string
}

const UsersPage = () => {
    const { isAdmin } = useAuth()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUsers = async () => {
        if (!isAdmin) return
        setLoading(true)
        try {
            // Need to fetch from our backend API because direct DB access might be restricted or we prefer API pattern
            // Using the new endpoint we created in backend
            const { session } = await import('../../services/supabase').then(m => m.supabase.auth.getSession()).then(r => r.data)
            const token = session?.access_token

            if (!token) throw new Error("No auth token")

            const response = await fetch('http://localhost:8000/api/users/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }

            const data = await response.json()
            setUsers(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [isAdmin])

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const { session } = await import('../../services/supabase').then(m => m.supabase.auth.getSession()).then(r => r.data)
            const token = session?.access_token
            if (!token) throw new Error("No auth token")

            const response = await fetch(`http://localhost:8000/api/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            })

            if (!response.ok) throw new Error('Failed to update role')

            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        } catch (err: any) {
            alert(`Error: ${err.message}`)
        }
    }

    if (loading) return <div className="p-8 text-zinc-400">Loading users...</div>
    if (error) return <div className="p-8 text-red-400">Error: {error}</div>

    return (
        <div className="space-y-6 p-8">
            <header>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    User Management
                </h1>
                <p className="text-zinc-400 mt-2">Manage user roles and access</p>
            </header>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
                <table className="w-full">
                    <thead>
                        <tr className="bg-zinc-900/50 border-b border-zinc-800 text-left">
                            <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                            <User size={16} />
                                        </div>
                                        <span className="text-zinc-200">{user.email || 'No email'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                        }`}>
                                        {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-500">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {user.role !== 'admin' ? (
                                            <button
                                                onClick={() => handleRoleChange(user.id, 'admin')}
                                                className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                title="Promote to Admin"
                                            >
                                                <Shield size={16} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRoleChange(user.id, 'user')}
                                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Demote to User"
                                            >
                                                <ShieldAlert size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UsersPage
