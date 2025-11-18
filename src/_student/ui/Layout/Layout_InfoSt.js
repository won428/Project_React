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

                    {/* 콘텐츠 */}
                    <Col xs={12} md={9} lg={10} className="content-area">
                        <Outlet />
                    </Col>
                </Row>
            </Container>
        </div>
    );
}