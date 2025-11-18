import { Outlet } from "react-router-dom";
import MenuEn from "./Menuitems_En";
import { appName } from "../../appName";
import { Card, Container } from "react-bootstrap";

const EnPage = () => {
    return (

        <div style={{ backgroundColor: '#ffffff' }} className="app-wrapper d-flex flex-column min-vh-100">

            {/* 헤더 */}
            <header>
                <MenuEn />

            </header>

            {/* 콘텐츠 */}
            <main className="flex-grow-1 d-flex justify-content-center">
                <div
                    style={{
                        width: "100%",
                        maxWidth: "1400px",
                        padding: "1rem", //
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 0 4px rgba(0,0,0,0.05)",
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
    )
}
export default EnPage;
