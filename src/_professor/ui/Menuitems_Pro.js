import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../public/context/UserContext";
import { useSessionTimer } from "../../public/context/useSessionTimer";
import { requestTokenRefresh } from "../../public/config/api";
function MenuPro() {
    const { user, logout } = useAuth();
    const { formattedTime, refreshTimer } = useSessionTimer();
    const navigate = useNavigate();
    const logoutAction = () => {
        logout();
        navigate("login")
    }
    const handelRefresh = async () => {
        try {
            console.log("refresh");
            const newToken = await requestTokenRefresh();
            refreshTimer(newToken);
            console.log(' refresh success:');
        } catch (e) {
            console.log('토큰 갱신 실패');
        }


    }



    return (
        <Row>
            <Col>
                <Navbar bg="dark" data-bs-theme="dark">
                    <Container>
                        <Navbar.Brand onClick={() => navigate(`/hs`)} > Home </Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => navigate(`/Lecture_HomePro`)}>
                                사이버 캠퍼스
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
                                전체 공지
                            </Nav.Link>
                            <Nav.Link
                                onClick={() => {
                                    if (user && user.IsAuthenticated) {
                                        window.open("http://localhost:3000/acsche", "_blank", "noopener,noreferrer")
                                    } else {
                                        alert("로그인 정보가 없습니다. 다시 로그인하세요.");
                                        navigate("/")
                                    }
                                }
                                }>
                                학사일정
                            </Nav.Link>
                        </Nav>

                        <Nav>
                            <Navbar.Text className="text-white">
                                {user.name} 님 &nbsp;
                            </Navbar.Text>
                            <Navbar.Text className="text-white">
                                {formattedTime}
                            </Navbar.Text>
                            <Button size="sm" variant="link" className="mx-2" onClick={handelRefresh} >⟳</Button>
                        </Nav>
                        <Button size="sm" onClick={logoutAction} >Logout</Button>

                    </Container>
                </Navbar>
            </Col>
        </Row>
    )
}
export default MenuPro;