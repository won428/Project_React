import { jwtDecode } from "jwt-decode";//( >npm install jwt-decode ))
import { useAuth } from "./../public/context/UserContext";
import { Navigate, Outlet } from "react-router-dom"; import { useEffect } from "react";
;

const PrivateRoute = ({ allowedRoles }) => {
    const { user, isLoading } = useAuth();
    console.log(user);
    console.log(allowedRoles);


    if (isLoading) { return <div>Loading...</div>; }
    if (!user) { return <Navigate to="/" replace />; }
    if (!user.isAuthenticated && localStorage.getItem("accessToken")) {
        if (!localStorage.getItem("accessToken")) {
            return <Navigate to="/" replace />;
        }
    }

    console.log(user?.roles);

    const hasAccess = user?.roles?.some(role => allowedRoles.includes(role));
    console.log(hasAccess);


    if (!hasAccess) { return <Navigate to="/Unauthorizedpage" replace />; }
    return <Outlet />;

};


export default PrivateRoute;