import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../public/context/UserContext";

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
                        <Navbar.Brand onClick={() => navigate(`/ha`)} > Home </Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => navigate(`/sthm/ad`)}>
                                학생관리
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/infohome/ad`)}>
                                통합 정보
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/LHomeAD`)}>
                                사이버 캠퍼스 관리
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/acschemod`)}>
                                학사일정 관리
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