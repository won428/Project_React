import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const loadUserFromToken = () => {


        const token = sessionStorage.getItem("accessToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log(decoded);

                if (decoded.exp > Date.now() / 1000) {
                    setUser({ email: decoded.email })
                    setRoles([decoded.role]);
                    console.log(roles);

                    setIsAuthenticated(true);
                }
            } catch { sessionStorage.clear(); }

        }


    };

    return (
        <UserContext.Provider value={{ user, isAuthenticated, roles, loadUserFromToken }}>
            {children}
        </UserContext.Provider>
    )
}
export const useAuth = () => useContext(UserContext);