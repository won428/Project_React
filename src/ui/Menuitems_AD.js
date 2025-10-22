import { Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function App() {


    const navigate = useNavigate();
    return (
        <Row>
            <Col>
                <Navbar bg="dark" data-bs-theme="dark">
                    <Container>
                        <Navbar.Brand href="/ha" > Home </Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => navigate(`/InfoHome`)}>
                                통합 정보
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/LHome`)}>
                                사이버 캠퍼스
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/acsche`)}>
                                학사일정
                            </Nav.Link>
                        </Nav>
                        <Nav>
                            <Navbar.Text className="text-white">
                                userName 님
                            </Navbar.Text>
                        </Nav>
                    </Container>
                </Navbar>
            </Col>
        </Row>
    )
}
export default App;