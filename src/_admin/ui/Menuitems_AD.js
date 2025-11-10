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
                            <Nav.Link onClick={() => navigate(`/user/insert_user`)}>
                                학생관리
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/collist`)}>
                                통합 정보
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/lectureRegister`)}>
                                사이버 캠퍼스 관리
                            </Nav.Link>
                            <Nav.Link onClick={() => {
                                if (user && user.IsAuthenticated) {
                                    window.open("http://localhost:3000/EnNotList", "_blank", "noopener,noreferrer")
                                } else {
                                    alert("로그인 정보가 없습니다. 다시 로그인하세요.");
                                    navigate("/")
                                }
                            }
                            }>
                                공지 목록
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