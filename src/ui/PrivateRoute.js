import { jwtDecode } from "jwt-decode";//( >npm install jwt-decode ))
import { useAuth } from "../context/UserContext";
import { Navigate, Outlet } from "react-router-dom";;

const PrivateRoute = ({ allowedRoles }) => {
    const { isAuthenticated, roles, loadUserFromToken } = useAuth();

    if (!isAuthenticated) {
        loadUserFromToken();
        if (!sessionStorage.getItem("accessToken")) {
            return <Navigate to="/login" replace />
        }
    }
    const hasAccess = roles.some(role => allowedRoles.includes(role));
    return hasAccess ? <Outlet /> : <Navigate to="/" replace />

};


export default PrivateRoute;