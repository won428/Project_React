import axios from "axios"
import { API_BASE_URL } from "./config";

//공통 axios 인스턴스 생성
const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false
});

let accessToken = null;
let refreshToken = null;

//토큰 관리용 함수
export function setToken(access, refresh) {
    accessToken = access;
    refreshToken = refresh;
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
}

//요청 인서셉터 Accss Token 자동 첨부
API.interceptors.request.use((config) => {
    const token = accessToken || localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
});

export const requestTokenRefresh = async () => {
    try {

        const username = localStorage.getItem("username");
        const refresh = localStorage.getItem("refreshToken");
        if (!username || !refresh) {
            throw new Error("No username or refresh token available");
        }
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            username: username,
            refreshToken: refresh
        });
        const newAccessToken = response.data.accessToken;
        setToken(newAccessToken, refresh);
        return newAccessToken;
    } catch (error) {
        console.error("Token refresh failed:", error);
        window.location.href = '/';
        throw error;
    }
}



//응답 인터셉터 Access 만료시 Refresh 토큰 재발급
API.interceptors.response.use(
    (res) => res, async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
            console.log("AccessToken 만료, 강제 로그아웃 ");
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            window.location.href = "/";
        }

        return Promise.reject(error);

    }
);

export default API;
