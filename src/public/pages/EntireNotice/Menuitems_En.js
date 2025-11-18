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
        ],
        userItems: [
            { label: "구성원 등록", path: "/user/insert_user" },
            { label: "구성원 일괄등록", path: "/user/UserBatchReg" },
            { label: "구성원 리스트", path: "/user/UserList" },
            { label: "1:1 문의 관리", path: "/inquiry/admin" },
        ],
        lecInfoItems: [
            { label: "통합 정보 홈", path: "/infohome/ad" },
            { label: "단과대학 조회", path: "/collist" },
            { label: "단과대학 등록", path: "/colreg" },
            { label: "학과 조회", path: "/majorList" },
            { label: "학과 등록", path: "/majorReg" },
        ],
        noticeItems: [
            { label: "공지사항 목록", path: "/EnNotList" },
            { label: "공지사항 등록", path: "/EnNot" },
        ],
        scheduleItems: [
            { label: "학사 일정", path: "/acsche" },
            { label: "학사 일정 관리", path: "/acschemod" },
            { label: "학사 일정 등록", path: "/acscheIns" },
        ],
    };
}

if (user?.roles?.includes('STUDENT')) {
    return {
        lecItems: [
            { label: "강의 홈", path: "/LHome" },
            { label: "강의실", path: "/leclist" },
            { label: "수강신청", path: "/courseRegistration" },
            
            ],
        userItems: [
        ],
        lecInfoItems: [
            { label: "통합 정보 홈", path: "/hs" },
            { label: "학생 정보", path: "/InfoHome" },
            { label: "성적 조회", path: "/Student_Credit" },
            { label: "출결 조회", path: "/CheckAttendance" },
            { label: "학적 변경", path: "/Change_Status" },
            { label: "1:1 문의", path: "/inquiryBoard" },
,
        ],
        noticeItems: [
            { label: "공지사항 목록", path: "/EnNotList" },
        ],
        scheduleItems: [
            { label: "학사 일정", path: "/acsche" },
        ],
    };
}

if (user?.roles?.includes('PROFESSOR')) {
    return {
        lecItems: [
        { label: "강의실", path: "/LRoomPro" },
        { label: "강의등록", path: "/LecRegisterPro" },
        { label: "1:1 문의", path: "/inquiryBoard" },
        ],
        userItems: [

        ],
        lecInfoItems: [

        ],
        noticeItems: [
            { label: "공지사항 목록", path: "/EnNotList" },
        ],
        scheduleItems: [
            { label: "학사 일정", path: "/acsche" },  
        ],
    };
}


        return {
            lecItems: [],
        };
    };

        const {
            lecItems: navItems,
            userItems: navUserItems,
            lecInfoItems: navLecItems,
            noticeItems: navNoticeItems,
            scheduleItems: navScheItems,
        } = getNavItemsBasedOnRole();

        const currentRole = user?.roles?.includes("ADMIN")
  ? "ADMIN"
  : user?.roles?.includes("PROFESSOR")
  ? "PROFESSOR"
  : user?.roles?.includes("STUDENT")
  ? "STUDENT"
  : null;

const isStudentOrProfessor =
  user?.roles?.includes("STUDENT") || user?.roles?.includes("PROFESSOR");

const dropdownTitles = {
  user:
    currentRole === "ADMIN"
      ? "구성원 관리"
      : currentRole === "PROFESSOR"
      ? "학생 관리"
      : currentRole === "STUDENT"
      ? "내 정보 / 문의"
      : "구성원 관리",

  lecInfo:
    currentRole === "ADMIN"
      ? "통합 정보 관리"
      : currentRole === "PROFESSOR"
      ? "학과 / 단과대학"
      : "학생 정보",

  lecture:
    currentRole === "ADMIN"
      ? "강의 관리"
      : currentRole === "PROFESSOR"
      ? "사이버 캠퍼스"
      : currentRole === "STUDENT"
      ? "강의"
      : "강의",

  notice:
    currentRole === "ADMIN"
      ? "공지 관리"
      : "공지",

  schedule:
    currentRole === "ADMIN"
      ? "학사 일정 관리"
      : "학사",
};

   

    return (
        <header className="bg-dark border-bottom border-light-subtle sticky-top">
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
                        {/* 구성원 관리 */}
                        {navUserItems.length > 0 && (
                        <NavDropdown
                            title={dropdownTitles.user}
                            id="student-nav-dropdown"
                            menuVariant="dark"
                            className="text-white custom-dropdown me-3"
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
                        )}

                        {/* 통합 정보 */}
                        {navLecItems.length > 0 && (
                        <NavDropdown
                            title={dropdownTitles.lecInfo}
                            id="lecture-nav-dropdown"
                            menuVariant="dark"
                            className="text-white custom-nav-dropdown me-3"
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
                        )}

                        {/* 강의 */}
                        {navItems.length > 0 && (
                        <NavDropdown
                            title={dropdownTitles.lecture}
                            id="student-nav-dropdown"
                            menuVariant="dark"
                            className="text-white custom-dropdown me-3"
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
                        )}

{isStudentOrProfessor ? (
  // 🔹 학생일 때: 단순 링크 2개
  <Nav className="me-auto">
    <Nav.Link
      onClick={() => {
        navigate("/EnNotList");
      }}
      className="text-white"
    >
      전체 공지
    </Nav.Link>
    <Nav.Link
      onClick={() => {
        navigate("/acsche");
      }}
      className="text-white"
    >
      학사 일정
    </Nav.Link>
  </Nav>
) : (
  // 🔹 학생이 아닐 때: 기존 드롭다운 유지
  <>
    {/* 공지 */}
    {navNoticeItems.length > 0 && (
      <NavDropdown
        title={dropdownTitles.notice}
        id="student-nav-dropdown"
        menuVariant="dark"
        className="text-white custom-dropdown me-3"
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
    )}

    {/* 학사 */}
    {navScheItems.length > 0 && (
      <NavDropdown
        title={dropdownTitles.schedule}
        id="student-nav-dropdown"
        menuVariant="dark"
        className="text-white custom-dropdown me-3"
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
    )}
  </>
)}
                        <Nav className="me-auto" />

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
}

export default MenuAd;
