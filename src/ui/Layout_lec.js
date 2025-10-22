import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";



export const LayoutStLec = () => {
    const navigate = useNavigate();
    return (

        <Row className="pt-0 mt-0 min-vh-100">
            {/* 왼쪽 사이드바 */}

            <Col xs={2} className="bg-dark text-white p-3">

                <Container>
                    <Nav className="flex-column">
                        <Nav.Link
                            onClick={() => navigate(`/LHome`)}
                            className="text-white">강의 홈</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/LRoom`)}
                            className="text-white"
                        >강의실 </Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/ToDoList`)}
                            className="text-white">TodoList</Nav.Link>

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
