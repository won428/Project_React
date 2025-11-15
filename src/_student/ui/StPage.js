import { Outlet } from "react-router-dom";
import MenuSt from "./Menuitems_St";
import { appName } from "../../public/appName";

const StPage = () => {
    return (
        <div style={{ backgroundColor: '#ffffff' }} className="app-wrapper d-flex flex-column min-vh-100">
            {/* 헤더 */}
            <header>
                <MenuSt />
            </header>

            {/* 콘텐츠 */}
            <main className="flex-grow-1 d-flex justify-content-center">
                <div
                    style={{
                        width: "100%",
                        maxWidth: "1400px",
                        padding: "1rem",
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Outlet />
                </div>
            </main>

            {/* 푸터 */}
            <footer className="py-3 mt-auto text-dark text-center" style={{ backgroundColor: "#d0e7fa" }}>
                <p className="mb-0">&copy;2025 {appName}. All rights reserved</p>
            </footer>
        </div>
    )
}
export default StPage;