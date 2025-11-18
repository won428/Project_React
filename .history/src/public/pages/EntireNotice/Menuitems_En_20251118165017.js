import { Button, Col, Container, Nav, Navbar, NavDropdown, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";
import { useSessionTimer } from "../../../public/context/useSessionTimer";
import { requestTokenRefresh } from "../../../public/config/api";

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

    // 각 역할에 맞는 메뉴 항목 직접 입력
    const getNavItemsBasedOnRole = () => {
        if (user?.roles?.includes('ADMIN')) {
            return {
                lecItems: [
                    { label: "강의 등록", path: "/lectureRegister" },
                    { label: "강의 목록", path: "/lectureList" },
                    { label: "단과대학 조회", path: "/collist" },
                    { label: "단과대학 등록", path: "/colreg" },
                    { label: "학과 조회", path: "/majorList" },
                    { label: "학과 등록", path: "/majorReg" },
                    { label: "구성원 등록", path: "/user/insert_user" },
                    { label: "구성원 일괄등록", path: "/user/UserBatchReg" },
                    { label: "구성원 리스트", path: "/user/UserList" },
                    { label: "1:1 문의 관리", path: "/inquiry/admin" },
                    { label: "학사 일정", path: "/acsche" },
                    { label: "학사 일정 관리", path: "/acschemod" },
                    { label: "학사 일정 등록", path: "/acscheIns" },
                ],
            };
        }

        if (user?.roles?.includes('STUDENT')) {
            return {
                lecItems: [
                    { label: "강의 목록", path: "/lectureList" },
                    { label: "내 수강신청", path: "/myLecture" },
                    { label: "공지사항 목록", path: "/EnNotList" },
                    { label: "학사 일정", path: "/acsche" },
                ],
            };
        }

        if (user?.roles?.includes('PROFESSOR')) {
            return {
                lecItems: [
                    { label: "강의 목록", path: "/lectureList" },
                    { label: "내 강의 관리", path: "/myLectures" },
                    { label: "공지사항 목록", path: "/EnNotList" },
                    { label: "학사 일정", path: "/acsche" },
                ],
            };
        }

        return {
            lecItems: [],
        };
    };

    const { lecItems } = getNavItemsBasedOnRole();

    return (
        <header className="bg-dark border-bottom border-light-subtle sticky-top">
<<<<<<< HEAD
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
    )
=======
            <Navbar expand="lg" className="bg-dark py-3" sticky="top">
                <Container>
                    {/* 로고 */}
                    <Navbar.Brand onClick={() => navigate("/home")} className="d-flex align-items-center text-white fw-bold" style={{ cursor: "pointer" }}>
                        <div className="d-flex align-items-center gap-2" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
                            <span className="fw-semibold text-light">
                                <img src="/logo22.png" height="30" alt="LMS Logo" />
                            </span>
                        </div>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="bg-white" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {/* 메뉴 항목 */}
                       <NavDropdown 
                            title="메뉴" 
                            id="student-nav-dropdown" 
                            menuVariant="dark" 
                            className="custom-dropdown" // Removed ms-auto to keep it on the left
                            style={{ color: 'white' }} // Inline style to enforce white text color
                        >
                            {lecItems.map((item, index) => (
                                <NavDropdown.Item key={index} onClick={() => navigate(item.path)}>
                                    {item.label}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>

                        {/* 유저 정보 */}
                        <div className="d-flex align-items-center gap-3 ms-auto">
                            {user?.name && (
                                <span className="small text-white d-none d-md-inline">{user.name} 님</span>
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
                            <Button size="sm" variant="light" className="fw-semibold" onClick={logoutAction}>
                                로그아웃
                            </Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
>>>>>>> origin/won2
}

export default MenuAd;
