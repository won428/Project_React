import { Outlet } from "react-router-dom";
import MenuPro from "../../_professor/ui/Menuitems_Pro";
import MenuSt from "../../_student/ui/Menuitems_St";
import { appName } from "../../public/appName";
import { useAuth } from "../../public/context/UserContext";
import { Card, Container } from "react-bootstrap";

const ProSpecPage = () => {
    const { user } = useAuth();
    return (
        <div className="app-wrapper d-flex flex-column min-vh-100 bg-light">
            <header>{user?.roles.includes("PROFESSOR") ? <MenuPro /> : <MenuSt />}</header>
            <main className="flex-grow-1 d-flex">
                <Outlet />
            </main>
            <footer className="bg-dark py-3 mt-auto text-light text-center">
                <p className="mb-0">&copy;2025 {appName}. All rights reserved</p>
            </footer>
        </div>
    );

}
export default ProSpecPage;