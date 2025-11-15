import { Col, Container, Nav, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Layout.css";

export default function Layout({ children }) {
    const navigate = useNavigate();
    return (
        <div className="page-wrapper">
            <Container fluid="lg" className="layout-container">
                <Row className="g-3">
                    {/* 사이드바 */}
                    <Col xs={12} md={3} lg={2} className="sidebar">
                        <Nav className="flex-column">
                            <Nav.Link onClick={() => navigate(`/LHome`)} className="nav-link">
                                강의 홈
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/LRoom`)} className="nav-link">
                                강의실
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/ToDoList`)} className="nav-link">
                                TodoList
                            </Nav.Link>
                        </Nav>
                    </Col>
                    {/* 콘텐츠 */}
                    <Col xs={12} md={9} lg={10} className="content-area">
                        {children}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
