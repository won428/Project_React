import { Nav, Container, Row, Col } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import "../../../ui/Layout.css";

const navItems = [
    { label: "통합 정보 홈", path: "/infohome/ad" },
    { label: "단과대학 조회", path: "/collist" },
    { label: "단과대학 등록", path: "/colreg" },
    { label: "학과 조회", path: "/majorList" },
    { label: "학과 등록", path: "/majorReg" },
];

export const LayoutStInfo = () => {
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
};
