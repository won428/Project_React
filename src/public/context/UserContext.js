import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp > Date.now() / 1000) {
                    console.log(decoded);

                    setUser({
                        username: decoded.sub,
                        id: decoded.uid ? Number(decoded.uid) : undefined,
                        roles: [decoded.role],
                        name: decoded.uname,
                        IsAuthenticated: true,
                    });
                } else {
                    localStorage.clear();
                }
            } catch (err) {
                console.log("JWT Decode Error:", err);
            } finally {
                // ✅ 토큰 처리(성공/실패) 끝난 후에 false 설정
                setIsLoading(false);
            }
        } else {
            // ✅ 토큰 자체가 없으면 여기서 false 설정
            setIsLoading(false);
        }
    }, [])
    const login = (newToken) => {
        try {
            const decoded = jwtDecode(newToken);
            localStorage.setItem("accessToken", newToken);
            localStorage.setItem("username", decoded.sub);
            setUser({
                username: decoded.sub,
                id: decoded?.uid ? Number(decoded.uid) : undefined,
                roles: [decoded.role],
                name: decoded.uname,
                IsAuthenticated: true,
            });
        } catch (e) {
            console.error("login() decode error:", e);
        } finally {
            // ✅ user 세팅 후 isLoading false 처리
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("username");
        setUser(null);
    };




    const value = { user, login, logout, isLoading }
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}
export const useAuth = () => useContext(UserContext);