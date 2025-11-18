import { Button, Col, Container, Nav, Navbar, NavDropdown, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../public/context/UserContext";
import { useSessionTimer } from "../../public/context/useSessionTimer";
import { requestTokenRefresh } from "../../public/config/api";
import HomeStudent from "../../public/Home";

function MenuAd() {
    const { user, logout } = useAuth();
    const { formattedTime, refreshTimer } = useSessionTimer();
    const navigate = useNavigate();

    const logoutAction = () => {
        logout();
        navigate("/");
    };

    const handleRefresh = async () => {
        try {
            const newToken = await requestTokenRefresh();
            refreshTimer(newToken);
        } catch (e) {
            console.error("토큰 갱신 실패", e);
        }
    };

    const navItems = [
        { label: "강의 등록", path: "/lectureRegister" },
        { label: "강의 목록", path: "/lectureList" },
    ];
    const navUserItems = [
        // { label: "구성원 관리 홈", path: "/sthm/ad" },
        { label: "구성원 등록", path: "/user/insert_user" },
        { label: "구성원 일괄등록", path: "/user/UserBatchReg" },
        { label: "구성원 리스트", path: "/user/UserList" },
        { label: "1:1 문의 관리", path: "/inquiry/admin" },
    ];

    const navLecItems = [
        { label: "통합 정보 홈", path: "/infohome/ad" },
        { label: "단과대학 조회", path: "/collist" },
        { label: "단과대학 등록", path: "/colreg" },
        { label: "학과 조회", path: "/majorList" },
        { label: "학과 등록", path: "/majorReg" },
    ];
<<<<<<< HEAD
=======
    const navNoticeItems = [
        { label: "공지사항 목록", path: "/EnNotList" },
        { label: "공지사항 등록", path: "/EnNot" },
    
    ];

    const navScheItems = [
        { label: "학사 일정", path: "/acsche" },
        { label: "학사 일정 관리", path: "/acschemod" },
        { label: "학사 일정 등록", path: "/acscheIns" },
    ];
>>>>>>> origin/won2
    return (
        <header className="bg-dark border-bottom border-light-subtle sticky-top">
            <Navbar expand="lg" className="bg-dark py-3" sticky="top">
                <Container>
                    {/* 로고 */}
                    <Navbar.Brand onClick={() => navigate("/home")} className="d-flex align-items-center text-white fw-bold" style={{ cursor: "pointer" }}>
                        <div
                            className="d-flex align-items-center gap-2"
                            onClick={() => navigate("/home")}
                            style={{ cursor: "pointer" }}
                        >
                            <span className="fw-semibold text-light">
<<<<<<< HEAD
                                <img src="/logo.png" height="30" alt="LMS Logo" />
                            </span>
                        </div>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="bg-white" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {/* 메뉴 항목 */}

                        <NavDropdown
                            title="구성원 관리" id="student-nav-dropdown"
                            menuVariant="dark"
                            className="text-white custom-dropdown"
                        >
                            {navUserItems.map((item, index) => (
                                <NavDropdown.Item
                                    key={index}
                                    onClick={() => navigate(item.path)}
                                >
                                    {item.label}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                        &nbsp;  &nbsp;
                        <NavDropdown title="통합 정보" id="lecture-nav-dropdown"
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
                        &nbsp; &nbsp;

                        <NavDropdown
                            title="강의" id="student-nav-dropdown"
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
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => {
                                navigate("/acschemod")
                            }} className="text-white">학사 일정 수정</Nav.Link>
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

=======
                                <img src="/logo22.png" height="30" alt="LMS Logo" />
                            </span>
                        </div>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="bg-white" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {/* 메뉴 항목 */}

                        <NavDropdown
                            title="구성원 관리" id="student-nav-dropdown"
                            menuVariant="dark"
                            className="text-white custom-dropdown"
                        >
                            {navUserItems.map((item, index) => (
                                <NavDropdown.Item
                                    key={index}
                                    onClick={() => navigate(item.path)}
                                >
                                    {item.label}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                        &nbsp;  &nbsp;
                        <NavDropdown title="통합 정보" id="lecture-nav-dropdown"
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
                        &nbsp; &nbsp;

                        <NavDropdown
                            title="강의" id="student-nav-dropdown"
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
                        &nbsp; &nbsp;
                         <NavDropdown
                            title="공지" id="student-nav-dropdown"
                            menuVariant="dark"
                            className="text-white custom-dropdown"
                        >
                            {navNoticeItems.map((item, index) => (
                                <NavDropdown.Item
                                    key={index}
                                    onClick={() => navigate(item.path)}
                                >
                                    {item.label}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                        &nbsp;  &nbsp;
                        <NavDropdown
                            title="학사" id="student-nav-dropdown"
                            menuVariant="dark"
                            className="text-white custom-dropdown"
                        >
                            {navScheItems.map((item, index) => (
                                <NavDropdown.Item
                                    key={index}
                                    onClick={() => navigate(item.path)}
                                >
                                    {item.label}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                        &nbsp;  &nbsp;
                        <Nav className="me-auto">
                           

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

>>>>>>> origin/won2
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


export default MenuAd;
