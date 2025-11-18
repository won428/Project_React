import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
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
        navigate("/");
    };

    const handleRefresh = async () => {
        try {
            console.log("refresh");
            const newToken = await requestTokenRefresh();
            refreshTimer(newToken);
            console.log(' refresh success:');
        } catch (e) {
            console.error('토큰 갱신 실패', e);
        }
    };
    const navItems = [
        { label: "학생 정보", path: "/InfoHome" },
        { label: "성적 조회", path: "/Student_Credit" },
        { label: "출결 조회", path: "/CheckAttendance" },
        { label: "학적 변경", path: "/Change_Status" },
    ];

    const navLecItems = [
        { label: "강의 홈", path: "/LHome" },
        { label: "강의실", path: "/leclist" },
        { label: "수강신청", path: "/courseRegistration" },
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
                                <img src="/logo22.png" height="30" alt="LMS Logo" />
                            </span>
                        </div>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="bg-white" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {/* 메뉴 항목 */}
                        <NavDropdown
                            title="학생 정보" id="student-nav-dropdown"
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
                        &nbsp;  &nbsp;
                        <NavDropdown title="강의 정보" id="lecture-nav-dropdown"
                            menuVariant="dark"
                            className="text-white custom-nav-dropdown"
                        >
                            {navLecItems.map((item, index) => (
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
}
export default MenuSt;