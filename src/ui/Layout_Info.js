import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";



export const LayoutStInfo = () => {
    const navigate = useNavigate();

    return (

        <Row className="min-vh-100">
            {/* 왼쪽 사이드바 */}

            <Col xs={2} className="bg-dark text-white p-3">

                <Container>
                    <Nav
                        className="flex-column">
                        <Nav.Link
                            onClick={() => navigate(`/InfoHome`)}
                            className="text-white"
                        >학적</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/This_Credit`)}
                            className="text-white"
                        >당학기 성적 </Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/Entire_Credit`)}
                            className="text-white"
                        >전체 성적</Nav.Link>
                    </Nav>
                </Container>
            </Col>

            {/* 오른쪽 컨텐츠 영역 */}

            <Col xs={10} className="p-4">
                <Container>
                    <Outlet />
                </Container>
            </Col>

        </Row>

    );
}
