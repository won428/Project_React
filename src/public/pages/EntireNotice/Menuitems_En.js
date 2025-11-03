import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";

function App() {
    const { user, logout } = useAuth();

    const navigate = useNavigate();


    const logoutAction = () => {
        logout();
        navigate("login")
    }
    return (
        <Row>
            <Col>
                <Navbar bg="dark" data-bs-theme="dark">
                    <Container>
                        <Navbar.Brand onClick={() => navigate(`/`)} > Home </Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => navigate(`/EnNotList`)}>
                                학생관리
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/acschemod`)}>
                                학사일정
                            </Nav.Link>


                        </Nav>
                        <Nav>
                            <Navbar.Text className="text-white">
                                {user.email} 님
                            </Navbar.Text>
                            <Button size="sm" onClick={logoutAction} >Logout</Button>
                        </Nav>
                    </Container>
                </Navbar>
            </Col>
        </Row>
    )
}
export default App;