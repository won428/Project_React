import { jwtDecode } from "jwt-decode";//( >npm install jwt-decode ))
import { useAuth } from "./../public/context/UserContext";
import { Navigate, Outlet } from "react-router-dom"; import { useEffect } from "react";
;

const PrivateRoute = ({ allowedRoles }) => {
    const { user, isloading } = useAuth();
    console.log(user);
    console.log(allowedRoles);


    if (isloading) { return <div>Loading...</div>; }
    if (!user) { return <Navigate to="/" replace />; }
    if (!user.isAuthenticated && sessionStorage.getItem("accessToken")) {
        if (!sessionStorage.getItem("accessToken")) {
            return <Navigate to="/" replace />;
        }
    }

    console.log(user?.roles);

    const hasAccess = user?.roles?.some(role => allowedRoles.includes(role));


    if (!hasAccess) { return <Navigate to="/Unauthorizedpage" replace />; }
    return <Outlet />;

};


export default PrivateRoute;