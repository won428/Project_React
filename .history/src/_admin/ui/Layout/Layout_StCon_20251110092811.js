import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";



export const LayoutStCon = () => {
    const navigate = useNavigate();

    return (

        <Row className="min-vh-100">
            {/* 왼쪽 사이드바 */}

            <Col xs={2} className="bg-dark text-white p-3">

                <Container>
                    <Nav
                        className="flex-column">
                        <Nav.Link
                            onClick={() => navigate(`/sthm/ad`)}
                            className="text-white"
                        >구성원 관리 홈</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/user/insert_user`)}
                            className="text-white"
                        >구성원 등록</Nav.Link>
                        <Nav.Link

                            onClick={() => navigate(`/user/UserBatchReg`)}
                            className="text-white"
                        >구성원 일괄등록</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/user/UserList`)}
                            className="text-white"
                        >구성원 리스트</Nav.Link>
                        {/* <Nav.Link
                            onClick={() => navigate(`/user/StatusManage/:userId`)}
                            className="text-white"
                        >학생 학적관리</Nav.Link> */}
                        <Nav.Link
                            onClick={() => navigate(`/user/StMList`)}
                            className="text-white"
                        >학생 학적관리 List</Nav.Link>
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
