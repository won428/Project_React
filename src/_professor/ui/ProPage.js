import { Outlet } from "react-router-dom";
import MenuPro from "./Menuitems_Pro";
import { appName } from "../../public/appName";
import { Card, Container } from "react-bootstrap";

const ProPage = () => {
    return (
        <div className="app-wrapper d-flex flex-column min-vh-100 bg-light">
            <header><MenuPro /></header>
            <main className="flex-grow-1 d-flex">
                <Outlet />
            </main>
            <footer className="bg-dark py-3 mt-auto text-light text-center">
                <p className="mb-0">&copy;2025 {appName}. All rights reserved</p>
            </footer>
        </div>
    )
}
export default ProPage;