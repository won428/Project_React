import { Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function App() {
    const navigate = useNavigate();
    return (
        <Row>
            <Col>
                <Navbar
                    expand="lg"
                    style={{ backgroundColor: "#d0e7fa" }}
                    className="shadow-sm"
                >
                    <Container>
                        <Navbar.Brand
                            onClick={() => navigate("/home")}
                            className="d-flex align-items-center"
                            style={{ cursor: "pointer", color: "#0d47a1", fontWeight: 600 }}
                        >
                            <div
                                className="me-2 d-flex align-items-center"
                                style={{
                                    padding: "0.25rem",
                                    backgroundColor: "transparent",
                                    borderRadius: "4px",
                                }}
                            >
                                <img src="/logo22.png" height="30" alt="LMS Logo" />
                            </div>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link onClick={() => navigate(`/InfoHome`)} className="text-dark">
                                    통합 정보
                                </Nav.Link>
                                <Nav.Link onClick={() => navigate(`/LHome`)} className="text-dark">
                                    사이버 캠퍼스
                                </Nav.Link>
                                <Nav.Link onClick={() => navigate(`/acsche`)} className="text-dark">
                                    학사일정
                                </Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Col>
        </Row>
    )
}
export default App;