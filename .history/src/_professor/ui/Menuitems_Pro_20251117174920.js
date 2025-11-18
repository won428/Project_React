import { Button, Col, Container, Nav, Navbar, NavDropdown, Row } from "react-bootstrap";
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
    const navItems = [
        { label: "강의실", path: "/LRoomPro" },
        { label: "강의등록", path: "/LecRegisterPro" },
        { label: "1:1 문의", path: "/inquiryBoard" },
    ];
    return (
        <header className="bg-dark border-bottom border-light-subtle sticky-top">
            <Navbar expand="lg" className="bg-dark py-3" sticky="top">
                <Container>
                    {/* 로고 */}
                    <Navbar.Brand onClick={() => navigate("/home")} className="d-flex align-items-center text-white fw-bold" style={{ cursor: "pointer" }}>
                        <div
                            className="d-flex align-items-center gap-2"
                            onClick={() => navigate("/hs")}
                            style={{ cursor: "pointer" }}
                        >
                            <span className="fw-semibold text-light">
                                <img src="/logo.png" height="30" alt="LMS Logo" />
                            </span>
                        </div>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="bg-white" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {/* 메뉴 항목 */}
                        <NavDropdown
                            title="사이버 캠퍼스" id="student-nav-dropdown"
                            menuVariant="dark"
                            className="text-white custom-dropdown"
                        >
                            {navItems.map((item, index) => (
                                <NavDropdown.Item
                                    key={index}
                                    onClick={() => navigate(item.path)}
                                >
                                    {item.label}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>

                        &nbsp;
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => {
                                if (user?.IsAuthenticated) {
                                    window.open("http://localhost:3000/EnNotList", "_blank", "noopener,noreferrer");
                                } else {
                                    alert("로그인 정보가 없습니다. 다시 로그인하세요.");
                                    navigate("/");
                                }
                            }} className="text-white">전체 공지</Nav.Link>
                            <Nav.Link onClick={() => {
                                if (user?.IsAuthenticated) {
                                    window.open("http://localhost:3000/acsche", "_blank", "noopener,noreferrer");
                                } else {
                                    alert("로그인 정보가 없습니다. 다시 로그인하세요.");
                                    navigate("/");
                                }
<<<<<<< HEAD
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
=======
                            }} className="text-white">성적 조회</Nav.Link>

                        </Nav>

                        {/* 유저 정보 */}
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
                                onClick={handleRefresh}
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
                    </Navbar.Collapse>
                </Container>
            </Navbar>

        </header>
    );
>>>>>>> e4cd57790507e3f085e5c43c4ab210c4f65bd7df
}
export default MenuPro;