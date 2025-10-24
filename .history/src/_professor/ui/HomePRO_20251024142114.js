import { Button, Col, Container, Row } from "react-bootstrap";
import { useAuth } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";


function App() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();


    const logoutAction = () => {
        logout();
        navigate('/login');
    }

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    Processor? : {user.roles}
                    <Button onClick={logoutAction} >Logout</Button>
                </Col>
            </Row>
        </Container>
    )
}
export default App;