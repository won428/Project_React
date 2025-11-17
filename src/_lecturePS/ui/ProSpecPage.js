import { Outlet } from "react-router-dom";
import MenuPro from "../../_professor/ui/Menuitems_Pro";
import MenuSt from "../../_student/ui/Menuitems_St";
import { appName } from "../../public/appName";
import { useAuth } from "../../public/context/UserContext";

const ProSpecPage = () => {
    const { user } = useAuth();
    return (
        <div style={{ backgroundColor: '#ffffff' }} className="app-wrapper d-flex flex-column min-vh-100">
            {/* 헤더 */}
            <header>{user?.roles.includes("PROFESSOR") ? <MenuPro /> : <MenuSt />}</header>

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
            <footer className="py-3 mt-auto text-light text-center bg-dark" >
                <p className="mb-0">&copy;2025 {appName}. All rights reserved</p>
            </footer>
        </div>
    );

}
export default ProSpecPage;