import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";
import { requestTokenRefresh } from "../../config/api";
import { useSessionTimer } from "../../context/useSessionTimer";
function MenuEn() {
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
        <header className="bg-dark border-bottom border-light-subtle sticky-top">
            <Row>
                <Col>
                    <Navbar
                        expand="lg"
                        className="bg-dark py-3 shadow-sm"
                        sticky="top"
                    >
                        <Container>

                            <Navbar.Brand onClick={() => navigate("/home")} className="d-flex align-items-center text-white fw-bold" style={{ cursor: "pointer" }}>
                                <div
                                    className="d-flex align-items-center gap-2"
                                    onClick={() =>
                                        user.roles.includes("STUDENT") ? navigate(`/hs`) : user.roles.includes("PROFESSOR") ? navigate(`/hp`) : navigate(`/`)
                                    }
                                    style={{ cursor: "pointer" }}
                                >
                                    <span className="fw-semibold text-light">
                                        <img src="/logo.png" height="30" alt="LMS Logo" />
                                    </span>
                                </div>
                            </Navbar.Brand>

<<<<<<< HEAD
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
=======
                            <Nav className="me-auto" >
                                <Nav.Link onClick={() => navigate(`/EnNotList`)}
                                    className="text-white"
                                >
                                    전체 공지
                                </Nav.Link>
                                <Nav.Link onClick={() => navigate(`/acsche`)}
                                    className="text-white"
                                >
                                    학사일정
                                </Nav.Link>
                                <Nav.Link onClick={() => navigate(`/inquiryBoard`)}
                                    className="text-white"
                                >
                                    1:1 문의
                                </Nav.Link>
                            </Nav>
                            <div className="d-flex align-items-center gap-3">
                                {user?.name && (
                                    <span className="small text-white d-none d-md-inline">
                                        {user.name} 님
                                    </span>
                                )}

                                <span className="small text-white">({formattedTime})</span>

                                {/* 🔄 Refresh Button */}
                                <Button
                                    size="sm"
                                    variant="outline-light"
                                    onClick={handelRefresh}
                                    className="d-flex align-items-center justify-content-center"
                                    style={{ width: 32, height: 32, padding: 0, borderRadius: "50%" }}
                                >
                                    <span style={{ fontSize: "1rem" }}>⟳</span>
                                </Button>

                                {/* 🚪 Logout Button */}
                                <Button
                                    size="sm"
                                    variant="light"
                                    className="fw-semibold"
                                    onClick={logoutAction}
                                >
                                    로그아웃
                                </Button>
                            </div>
                        </Container>
                    </Navbar>
                </Col>
            </Row>
        </header>
>>>>>>> e4cd57790507e3f085e5c43c4ab210c4f65bd7df
    )
}
export default MenuEn;