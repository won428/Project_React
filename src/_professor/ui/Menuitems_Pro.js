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
    const handleRefresh = async () => {
        try {
            console.log("refresh");
            const newToken = await requestTokenRefresh();
            refreshTimer(newToken);
            console.log(' refresh success:');
        } catch (e) {
            console.error('토큰 갱신 실패', e);
        }
    }

    return (
        <Row>
            <Col>
                <Navbar
                    expand="lg"
                    style={{ backgroundColor: "#d0e7fa" }}
                    className="shadow-sm"
                >
                    <Container>
                        <Navbar.Brand
                            onClick={() => navigate("/hp")}
                            className="d-flex align-items-center"
                            style={{ cursor: "pointer", color: "#0d47a1", fontWeight: 600 }}
                        >
                            <div
                                className="me-2 d-flex align-items-center"
                                style={{
                                    padding: "0.25rem",
                                    backgroundColor: "transparent",
                                    borderRadius: "4px",
                                }}
                            >
                                <img src="/logo22.png" height="30" alt="LMS Logo" />
                            </div>
                        </Navbar.Brand>

                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link onClick={() => navigate(`/LRoomPro`)} className="text-dark">
                                    사이버 캠퍼스
                                </Nav.Link>
                                <Nav.Link
                                    onClick={() => {
                                        if (user?.IsAuthenticated) {
                                            window.open("http://localhost:3000/EnNotList", "_blank", "noopener,noreferrer");
                                        } else {
                                            alert("로그인 정보가 없습니다. 다시 로그인하세요.");
                                            navigate("/");
                                        }
                                    }}
                                    className="text-dark"
                                >
                                    전체 공지
                                </Nav.Link>
                                <Nav.Link
                                    onClick={() => {
                                        if (user?.IsAuthenticated) {
                                            window.open("http://localhost:3000/acsche", "_blank", "noopener,noreferrer");
                                        } else {
                                            alert("로그인 정보가 없습니다. 다시 로그인하세요.");
                                            navigate("/");
                                        }
                                    }}
                                    className="text-dark"
                                >
                                    학사일정
                                </Nav.Link>
                            </Nav>
                            <Nav className="ms-auto align-items-center">
                                <Navbar.Text className="text-dark me-2">
                                    {user.name} 님
                                </Navbar.Text>
                                <Navbar.Text className="text-dark me-2">
                                    ({formattedTime})
                                </Navbar.Text>
                                <Button size="sm" variant="outline-primary" className="me-2" onClick={handleRefresh} style={{ fontSize: "1.2rem", padding: "0 0.4rem" }}>
                                    ⟳
                                </Button>
                                <Button size="sm" variant="outline-dark" onClick={logoutAction}>
                                    Logout
                                </Button>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Col>
        </Row>
    )
}
export default MenuPro;