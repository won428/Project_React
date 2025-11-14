import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../public/context/UserContext";
import { requestTokenRefresh } from "../../public/config/api";
import { useSessionTimer } from "../../public/context/useSessionTimer";
function MenuSt() {
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
                        <Navbar.Brand onClick={() => navigate('/hs')} className="d-flex align-items-center">
                            <img
                                src="/logo (2).png" // 생성된 이미지 경로로 변경 예정
                                height="30" // 로고 이미지 높이 조절
                                className="me-2"
                            />
                        </Navbar.Brand>


                        <Nav className="me-auto">
                            <Nav.Link onClick={() => navigate(`/InfoHome`)}>
                                통합 정보
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/LHome`)}>
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
                                공지 목록
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
export default MenuSt;