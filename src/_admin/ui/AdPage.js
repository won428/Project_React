import { Outlet } from "react-router-dom";
import MenuAd from "./Menuitems_AD";
import { appName } from "../../public/appName";

const AdPage = () => {
    //Student 권한 Menu + Layout + footer Form
    return (
        <>
            <header><MenuAd /></header>
            <main>
                <Outlet />
            </main>
            <footer className="bg-dark rooter py-3 mt-5 text-light text-center">
                <p>&copy;2025{appName}.All rights reserved</p>
            </footer>
        </>
    )
}
export default AdPage;