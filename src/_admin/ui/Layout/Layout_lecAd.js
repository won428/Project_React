import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";



export const LayoutStLec = () => {
    const navigate = useNavigate();

    return (

        <Row className="flex-grow-1 w-100">
            {/* 왼쪽 사이드바 */}

            <Col xs={2} className="bg-dark text-white p-3 d-flex flex-column">
                <Nav className="flex-column">
                    <Nav.Link
                        onClick={() => navigate(`/lectureRegister`)}
                        className="text-white">강의 등록</Nav.Link>
                    <Nav.Link
                        onClick={() => navigate(`/lectureList`)}
                        className="text-white">강의 목록</Nav.Link>
                </Nav>
            </Col>

            {/* 오른쪽 컨텐츠 영역 */}

            <Col xs={10} className="bg-white p-4" style={{ overflowY: 'auto' }}>
                <Container><Outlet /></Container>
            </Col>

        </Row>

    );
}
