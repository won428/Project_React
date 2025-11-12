import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { useLectureStore } from "../LectureRoomSpec/store/lectureStore";
import { useAuth } from "../../public/context/UserContext";



export const Layout_lecRoomP = () => {
    const navigate = useNavigate();
    const { lectureId } = useLectureStore();
    const { user } = useAuth();
    return (

        <Row className="pt-0 mt-0 min-vh-100">
            {/* 왼쪽 사이드바 */}

            <Col xs={2} className="bg-dark text-white p-3">

                <Container>
                    <Nav className="flex-column">
                        <Nav.Link
                            onClick={() => navigate(`/notionlist`)}
                            className="text-white">강의 홈(TodoList)</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/notionlist`)}
                            className="text-white">공지 </Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/asnlst`)}
                            className="text-white">과제</Nav.Link>
                        <Nav.Link
                            onClick={() => navigate(`/Lec`)}
                            className="text-white">강의</Nav.Link>
                        {user.roles.includes('PROFESSOR') ?
                            <> <Nav.Link
                                onClick={() => navigate(`/lectureSession/${lectureId}`, { state: { lectureId } })}
                                className="text-white">출결 관리</Nav.Link>
                                <Nav.Link
                                    onClick={() => navigate(`/gradeCalculation/${lectureId}`, { state: { lectureId } })}
                                    className="text-white">성적 관리</Nav.Link>
                            </>
                            :
                            <></>
                        }
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
