import { Col, Container, Nav, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Layout.css";

export default function Layout({ children }) {
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
                            onClick={() => navigate(`/StudentInfo`)}
                            className="text-white"
                        >학생 정보</Nav.Link>
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

             {/* 콘텐츠 */}
                    <Col xs={12} md={9} lg={10} className="content-area">
                        {children}
                    </Col>

        </Row>

    );
}
