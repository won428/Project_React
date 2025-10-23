import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";

function MenuSt() {
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
                        <Navbar.Brand onClick={() => navigate(`/hs`)} > Home </Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => navigate(`/InfoHome`)}>
                                통합 정보
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/LHome`)}>
                                사이버 캠퍼스
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/acsche`)}>
                                학사일정
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Navbar.Text className="text-white">
                                {user.email}님
                            </Navbar.Text>
                            <Button size="sm" onClick={logoutAction} >Logout</Button>

                        </Nav>
                    </Container>
                </Navbar>
            </Col>
        </Row>
    )
}
export default MenuSt;