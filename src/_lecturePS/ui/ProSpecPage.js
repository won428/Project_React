import { Outlet } from "react-router-dom";
import MenuPro from "../../_professor/ui/Menuitems_Pro";
import MenuSt from "../../_student/ui/Menuitems_St";
import { appName } from "../../public/appName";
import { useAuth } from "../../public/context/UserContext";

const ProPage = () => {
    //Student 권한 Menu + Layout + footer Form
    const { user } = useAuth();
    return (
        <>
            <header>
                {user?.roles.includes("PROFESSOR") ? <MenuPro /> : <MenuSt />}
            </header>
            <main>
                <Outlet />
            </main>
            <footer className="bg-dark rooter py-3 mt-5 text-light text-center">
                <p>&copy;2025{appName}.All rights reserved</p>
            </footer>
        </>
    )
}
export default ProPage;