import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../public/context/UserContext";
import { ca } from "date-fns/locale";
import { useSessionTimer } from "../../public/context/useSessionTimer";
import { requestTokenRefresh } from "../../public/config/api";

function MenuAd() {
    const { user, logout } = useAuth();
    const { formattedTime, refreshTimer } = useSessionTimer();
    const navigate = useNavigate();
    const logoutAction = () => {
        logout();
        navigate("/")
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
                        <Navbar.Brand onClick={() => navigate(`/ha`)} > Home </Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => navigate(`/user/insert_user`)}>
                                사용자 관리
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/collist`)}>
                                통합 정보
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/lectureRegister`)}>
                                사이버 캠퍼스 관리
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/acschemod`)}>
                                학사일정 관리
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
                        </Nav>
                        <Nav>
                            <Navbar.Text className="text-white">
                                {user.name} 님
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
export default MenuAd;