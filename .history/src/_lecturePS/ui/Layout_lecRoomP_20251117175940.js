import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { useLectureStore } from "../LectureRoomSpec/store/lectureStore";
import { useAuth } from "../../public/context/UserContext";
import "../../ui/Layout.css";


export const Layout_lecRoomP = () => {
    const navigate = useNavigate();
    const { lectureId } = useLectureStore();
    const { user } = useAuth();

    const navItems = [
        { label: "공지", path: "/notionlist" },
        { label: "과제", path: "/asnlst" },
        { label: "강의", path: "/Lec" },
    ];

    if (user.roles.includes('PROFESSOR')) {
        navItems.push(
            { label: "출결 관리", path: `/lectureSession/${lectureId}`, state: { lectureId } },
            { label: "성적 관리", path: `/gradeCalculation/${lectureId}`, state: { lectureId } },
            { label: "성적 관리", path: `/gradeCalculation/${lectureId}`, state: { lectureId } }

        );
    }

    return (
        <div className="page-wrapper">
            <Container fluid="lg" className="layout-container">
                <Row className="g-3">
                    {/* 사이드바 */}
                    <Col xs={12} md={3} lg={2} className="sidebar">
                        <Nav className="flex-column">
                            {navItems.map(({ label, path, state }) => (
                                <Nav.Link
                                    key={path}
                                    onClick={() => navigate(path, { state })}
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
