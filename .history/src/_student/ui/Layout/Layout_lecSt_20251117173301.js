import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import "../../../ui/Layout.css";

const navItems = [
    { label: "강의 홈", path: "/LHome" },
    { label: "강의실", path: "/leclist" },
    { label: "수강신청", path: "/courseRegistration" },
];

export const LayoutStLecst = () => {
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

            <Col xs={2} className="bg-dark text-white p-3 d-flex flex-column">
                <Nav className="flex-column">
                    <Nav.Link
                        onClick={() => navigate(`/LHome`)}
                        className="text-white">강의 홈</Nav.Link>
                    <Nav.Link
                        onClick={() => navigate(`/leclist`)}
                        className="text-white"
                    >강의실 </Nav.Link>
                    {/* <Nav.Link
                            onClick={() => navigate(`/ToDoList`)}
                            className="text-white">TodoList</Nav.Link> */}
                    <Nav.Link
                        onClick={() => navigate(`/courseRegistration`)}
                        className="text-white">수강신청</Nav.Link>

                </Nav>
            </Col>

            {/* 오른쪽 컨텐츠 영역 */}

            <Col xs={10} className="bg-white p-4" style={{ overflowY: 'auto' }}>
                <Container><Outlet /></Container>
            </Col>

        </Row>

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
