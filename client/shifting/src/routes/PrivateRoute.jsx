import useAuth from '../hooks/useAuth'
import { Navigate, useLocation } from 'react-router'

export default function PrivateRoute({ children }) {
    const { user, loading } = useAuth()
    const location = useLocation();

    if (loading) {
        return <span className="loading loading-dots loading-xl"></span>
    }

    if (!user) {
        return <Navigate to="/login" state={{from:location}}/>
    }

    return (
        children
    )
}
