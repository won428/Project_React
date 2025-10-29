import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = sessionStorage.getItem("accessToken");

        if (token) {
            const decoded = jwtDecode(token);
            try {

                console.log(decoded);

                if (decoded.exp > Date.now() / 1000) {

                    setUser({
                        email: decoded?.sub,
                        id: decoded.uid ? Number(decoded.uid) : undefined, // ★ 추가
                        roles: [decoded.role],
                        IsAuthenticated: true,
                    })
                }

                else {
                    sessionStorage.clear();
                }
            } catch (err) {
                console.log("err : " + err);
            }
        }
        setIsLoading(false)
    }, [])
    const login = (newToken) => {
        const decoded = jwtDecode(newToken);
        const token = sessionStorage.setItem("accessToken", newToken);
        setUser({
            email: decoded.sub,
            id: decoded.uid ? Number(decoded.uid) : undefined, // ★ 추가
            roles: [decoded.role],
            IsAuthenticated: true,
        });
    }

    const logout = () => {
        sessionStorage.removeItem("accessToken");
        setUser(null);
    };




    const value = { user, login, logout }
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}
export const useAuth = () => useContext(UserContext);