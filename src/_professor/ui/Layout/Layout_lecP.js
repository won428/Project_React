import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";



export const Layout_lecP = () => {
    const navigate = useNavigate();



    return (

        <Row className="pt-0 mt-0 min-vh-100">
            {/* 왼쪽 사이드바 */}

            <Col xs={2} className="bg-dark text-white p-3">

                <Container>
                    <Nav className="flex-column">
                        <Nav.Link
                            onClick={() => navigate(`/Lecture_HomePro`)}
                            className="text-white">강의 홈</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/LRoomPro`)}
                            className="text-white"
                        >강의실 </Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/LecRegisterPro`)}
                            className="text-white">강의등록</Nav.Link>
                        {/* <Nav.Link
                            onClick={() => navigate(`/noticep`)}
                            className="text-white">공지 등록</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/notionlist`)}
                            className="text-white">공지 목록</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/lectureListPro`)}
                            className="text-white">강의 목록</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/asn`)}
<<<<<<< HEAD
                            className="text-white">과제 등록</Nav.Link> */}
=======
                            className="text-white">과제 등록</Nav.Link>
                         <Nav.Link
                            onClick={() => navigate(`/inquiryBoard`)}
                            className="text-white">1:1 문의</Nav.Link>

>>>>>>> 0cdcad7f15d62a0f7210926b9442f0130d8e4b00


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
