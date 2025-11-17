import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import "../../../ui/Layout.css";

const navItems = [
    { label: "강의실", path: "/LRoomPro" },
    { label: "강의등록", path: "/LecRegisterPro" },
    { label: "1:1 문의", path: "/inquiryBoard" },
];

export const Layout_lecP = () => {
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
