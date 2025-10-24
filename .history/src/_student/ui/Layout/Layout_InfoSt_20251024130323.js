import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";



export const LayoutStInfost = () => {
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
<<<<<<< HEAD:src/ui/Layout_Info.js
                        >INFOHOME</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/StudentInfo`)}
                            className="text-white"
                        >학생 정보</Nav.Link>
=======
                        >학적 홈</Nav.Link>
>>>>>>> b48c3637750ebf752d3b9b66e448629ff9344bcd:src/_student/ui/Layout/Layout_InfoSt.js
                        <Nav.Link
                            onClick={() => navigate(`/This_Credit`)}
                            className="text-white"
                        >당학기 성적</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/etrcdt`)}
                            className="text-white"
                        >전체 성적 </Nav.Link>


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
