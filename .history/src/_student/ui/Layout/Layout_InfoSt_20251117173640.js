import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import "../../../ui/Layout.css";

const navItems = [
    { label: "학생 정보", path: "/InfoHome" },
    { label: "성적 조회", path: "/Student_Credit" },
    { label: "출결 조회", path: "/CheckAttendance" },
    { label: "학적 변경", path: "/Change_Status" },
];

export const LayoutStInfost = () => {
    const navigate = useNavigate();

    return (
        <div className="page-wrapper">
            <Container fluid="lg" className="layout-container">
                <Row className="g-3">
                    {/* 사이드바 */}
                    <Col xs={12} md={3} lg={2} className="sidebar">
                        <Nav className="flex-column">
                            {navItems.map(({ label, path }) => (
                                <Nav.Link
                                    key={path}
                                    onClick={() => navigate(path)}
                                    className="nav-link"
                                >
                                    {label}
                                </Nav.Link>
                            ))}
                        </Nav>
                    </Col>

<<<<<<< HEAD
    <Row className="flex-grow-1 w-100">
        {/* 왼쪽 사이드바 */}

        <Col xs={2} className="bg-dark text-white p-3">

            <Container>
                <Nav
                    className="flex-column">
                    <Nav.Link
                        onClick={() => navigate(`/InfoHome`)}
                        className="text-white"
                    >학생 정보</Nav.Link>
                    <Nav.Link
                        onClick={() => navigate(`/Student_Credit`)}
                        className="text-white"
                    >성적 조회</Nav.Link>
                    <Nav.Link
                        onClick={() => navigate(`/CheckAttendance`)}
                        className="text-white"
                    >출결 조회</Nav.Link>
                    <Nav.Link
                        onClick={() => navigate(`/Change_Status`)}
                        className="text-white"
                    >학적 변경</Nav.Link>
                    <Nav.Link
                        onClick={() => navigate(`/inquiryBoard`)}
                        className="text-white"
                    >1:1 문의 </Nav.Link>




                </Nav>
            </Container>
        </Col>

        {/* 오른쪽 컨텐츠 영역 */}

        <Col xs={10} className="bg-white p-4" style={{ overflowY: 'auto' }}>
            <Container><Outlet /></Container>
        </Col>
    </Container>
        </div >
        

=======
                    {/* 콘텐츠 */}
                    <Col xs={12} md={9} lg={10} className="content-area">
                        <Outlet />
                    </Col>
                </Row>
            </Container>
        </div>
>>>>>>> e4cd57790507e3f085e5c43c4ab210c4f65bd7df
    );
}