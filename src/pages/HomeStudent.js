import { Button, Col, Container, Row } from "react-bootstrap";
import { useAuth } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

function App() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const appName = "LMS";

    const logoutAction = () => {
        logout();
        navigate('/login');
    }

    return (
        <div>

            Home

        </div >
    )
}
export default App;