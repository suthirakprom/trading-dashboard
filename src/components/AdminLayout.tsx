import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminLayout = () => {
    const { user, isAdmin, loading } = useAuth()

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">Loading...</div>
    }

    // Must be logged in and be an admin
    if (!user || !isAdmin) {
        return <Navigate to="/" replace />
    }

    return (
        <Outlet />
    )
}

export default AdminLayout
