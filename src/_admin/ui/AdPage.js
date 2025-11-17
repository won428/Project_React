import { Outlet } from "react-router-dom";
import MenuAd from "./Menuitems_AD";
import { appName } from "../../public/appName";

const AdPage = () => {
    return (
        <div style={{ backgroundColor: '#ffffffb0' }} className="app-wrapper d-flex flex-column min-vh-100">

            {/* 헤더 */}
            <header>
                <MenuAd />
            </header>

            {/* 콘텐츠 */}
            <main className="flex-grow-1 d-flex justify-content-center">
                <div
                    style={{
                        width: "100%",
                        maxWidth: "1400px",
                        padding: "1rem", // ✅ 기존보다 살짝 줄임
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#ffffff", // ✅ 배경 겹침 방지 (선택)
                        boxShadow: "0 0 4px rgba(0,0,0,0.05)", // ✅ 약한 그림자
                        borderRadius: "8px", // 선택
                    }}
                >
                    <Outlet />
                </div>
            </main>


            {/* 푸터 */}
            <footer className="py-3 mt-auto text-light text-center bg-dark" >
                <p className="mb-0">&copy;2025 {appName}. All rights reserved</p>
            </footer>
        </div>
    );
};

export default AdPage;
