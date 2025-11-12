import axios from "axios"
import { API_BASE_URL } from "./config";

//공통 axios 인스턴스 생성
const API = axios.create({
    baseURL: { API_BASE_URL },
    withCredentials: false
});

let accessToken = null;
let refreshToken = null;

//토큰 관리용 함수
export function setToken(access, refresh) {
    accessToken = access;
    refreshToken = refresh;
    sessionStorage.setItem("accessToken", accessToken)
    sessionStorage.setItem("refreshToken", refreshToken)
}

//요청 인서셉터 Accss Token 자동 첨부
API.interceptors.request.use((config) => {
    const token = accessToken || sessionStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config;
});

//응답 인터셉터 Access 만료시 Refresh 토큰 재발급
API.interceptors.response.use(
    (res) => res, async (error) => {
        const originalRequest = error.config;

        //401 시에 Access 재발급 시도 
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
        }
        try {
            const username = sessionStorage.getItem("username");
            const refresh = sessionStorage.getItem("refreshToken")

            const responese = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                username,
                refreshToken: refresh
            });

            // 새 Access Token 저장
            const newAccess = responese.data.accessToken;
            sessionStorage.setItem("accessToken", newAccess);

            // 재시도
            originalRequest.headers.Authorization = `Bearer ${newAccess}`
            return API(originalRequest);
        } catch (error) {
            console.log("Refresh 실패", error);
            sessionStorage.clear();
            window.location.href = "/login";

        }
        return Promise.reject(error);
    }
);

export default API;
