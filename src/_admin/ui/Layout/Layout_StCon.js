import { Nav, Container, Row, Col } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import "../../../ui/Layout.css";

const navItems = [
    { label: "구성원 관리 홈", path: "/sthm/ad" },
    { label: "구성원 등록", path: "/user/insert_user" },
    { label: "구성원 일괄등록", path: "/user/UserBatchReg" },
    { label: "구성원 리스트", path: "/user/UserList" },
    { label: "1:1 문의 관리", path: "/inquiry/admin" },
];

export const LayoutStCon = () => {
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
