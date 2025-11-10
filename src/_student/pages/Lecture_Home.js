import { Card, CardBody, Col, Container, Form, Pagination, Row } from "react-bootstrap";
import { useAuth } from "../../public/context/UserContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/config";
import { useNavigate } from "react-router-dom";

function App() {
    const { user } = useAuth();
    const [assign, setAssign] = useState([]);
    const [notice, setNotice] = useState([]);
    const [userInfo, setUserInfo] = useState({
        user_code: '',
        username: '',
        major: '',
        college: '',
        u_type: ''
    });
    const [pageInfonotice, setPageInfoNotice] = useState(null);
    const [pageInfoassign, setPageInfoAssign] = useState(null);
    const [pagenotice, setPageNotice] = useState(1);
    const [pageassign, setPageAssign] = useState(1);
    const navigate = useNavigate();
    const pageRange = 5; // 한 번에 표시할 페이지 수

    useEffect(() => {
        const parameter = {
            pagenotice: pagenotice - 1, // Spring은 0부터 시작!
            pageassign: pageassign - 1,
            size: pageRange
        }
        axios.get(`${API_BASE_URL}/notice/todo/${user.id}`)
            .then((res) => {
                console.log(res.data);
                setUserInfo({
                    user_code: res.data.user_code,
                    username: res.data.username,
                    major: res.data.major,
                    college: res.data.college,
                    u_type: res.data.u_type

                });
                setNotice(res.data.listDto.content);
                setAssign(res.data.assignmentDto.content);
                setPageInfoNotice(res.data.listDto);
                setPageInfoAssign(res.data.assignmentDto);
            }
            )
            .catch((e) => {
                console.log(e);
            })


    }, [pagenotice, pageassign, user])

    if (!pageInfonotice && !pageInfoassign) return null;

    const totalPagesNotice = pageInfonotice.totalPages;
    const totalPagesAssign = pageInfoassign.totalPages;

    const startPageNotice = Math.max(1, pagenotice - Math.floor(pageRange / 2));
    const endPageNotice = Math.min(totalPagesNotice, startPageNotice + pageRange - 1);

    const startPageAssign = Math.max(1, pageassign - Math.floor(pageRange / 2));
    const endPageAssign = Math.min(totalPagesAssign, startPageAssign + pageRange - 1);


    const remainDate = (dueDate) => {
        const currentDate = new Date();
        const duedate = new Date(dueDate);
        const reamin = duedate - currentDate

        const msPerDay = 1000 * 60 * 60 * 24;
        const remainDays = reamin / msPerDay;

        return Math.ceil(remainDays);
    }

    const AssignList = () => {
        return (
            <Card>

                <Row>
                    <Col>
                        {assign.length > 0 ? (
                            assign.map((item) => (
                                <Card
                                    key={item.id}
                                    className="mb-3 shadow-sm"
                                    style={{ cursor: "pointer" }}
                                >
                                    <CardBody>
                                        <h5 className="fw-bold mb-2">{item.title}</h5>
                                        <div className="d-flex justify-content-between text-muted" style={{ fontSize: "14px" }}>
                                            <span>{item.username}</span>
                                            {remainDate(item.dueAt) > 0 ?
                                                <span>~{
                                                    remainDate(item.dueAt)
                                                }일 남음 </span>
                                                :
                                                <span> 마감 </span>}
                                        </div>
                                    </CardBody>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center mt-5 text-muted">
                                게시물이 존재하지 않습니다.
                            </div>
                        )}
                    </Col>
                </Row>
                <div className="d-flex justify-content-center mt-4">
                    <Pagination>

                        <Pagination.First
                            disabled={pageassign === 1}
                            onClick={() => setPageNotice(1)}
                        />

                        <Pagination.Prev
                            disabled={pageassign === 1}
                            onClick={() => setPageNotice(pageassign - 1)}
                        />

                        {[...Array(endPageAssign - startPageAssign + 1)].map((_, i) => {
                            const pageNumber = startPageAssign + i;
                            return (
                                <Pagination.Item
                                    key={pageNumber}
                                    active={pageassign === pageNumber}
                                    onClick={() => setPageNotice(pageNumber)}
                                >
                                    {pageNumber}
                                </Pagination.Item>
                            );
                        })}

                        <Pagination.Next
                            disabled={pageassign === totalPagesAssign}
                            onClick={() => setPageNotice(totalPagesAssign + 1)}
                        />

                        <Pagination.Last
                            disabled={pageassign === totalPagesAssign}
                            onClick={() => setPageNotice(totalPagesAssign)}
                        />

                    </Pagination>
                </div>
            </Card>
        )

    }

    const NoticeList = () => {
        return (

            <Card>
                <Row>
                    <Col>
                        {notice.length > 0 ? (
                            notice.map((item) => (
                                <Card
                                    key={item.id}
                                    className="mb-3 shadow-sm"
                                    style={{ cursor: "pointer" }}
                                >
                                    <CardBody>
                                        <h5 className="fw-bold mb-2">{item.title}</h5>
                                        <div className="d-flex justify-content-between text-muted" style={{ fontSize: "14px" }}>
                                            <span>{item.username}</span>
                                            <span>~{new Date(item.dueAt).toLocaleDateString()}</span>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center mt-5 text-muted">
                                게시물이 존재하지 않습니다.
                            </div>
                        )}
                    </Col>
                </Row>
                <div className="d-flex justify-content-center mt-4">
                    <Pagination>

                        <Pagination.First
                            disabled={pagenotice === 1}
                            onClick={() => setPageNotice(1)}
                        />

                        <Pagination.Prev
                            disabled={pagenotice === 1}
                            onClick={() => setPageNotice(pagenotice - 1)}
                        />

                        {[...Array(endPageNotice - startPageNotice + 1)].map((_, i) => {
                            const pageNumber = startPageNotice + i;
                            return (
                                <Pagination.Item
                                    key={pageNumber}
                                    active={pagenotice === pageNumber}
                                    onClick={() => setPageNotice(pageNumber)}
                                >
                                    {pageNumber}
                                </Pagination.Item>
                            );
                        })}

                        <Pagination.Next
                            disabled={pagenotice === totalPagesNotice}
                            onClick={() => setPageNotice(pagenotice + 1)}
                        />

                        <Pagination.Last
                            disabled={pagenotice === totalPagesNotice}
                            onClick={() => setPageNotice(totalPagesNotice)}
                        />

                    </Pagination>
                </div>
            </Card>
        )

    }












    return (
        <Container>
            {/* Row 1: 사용자 정보 (전체 너비) */}
            <Row className="mb-3"> {/* mb-3은 아래 Row와 간격을 줍니다 */}
                <Col>
                    <Card>
                        <h1> {userInfo.username} 님 {userInfo.user_code} {userInfo.major}</h1>
                    </Card>
                </Col>
            </Row>

            {/* Row 2: 과제 리스트와 공지 리스트 (좌우 분할) */}
            <Row>
                {/* 왼쪽 컬럼 (6/12 = 50% 너비) */}
                <Col md={6}>
                    <h2>Assign ToDoList</h2>
                    <AssignList />
                </Col>

                {/* 오른쪽 컬럼 (6/12 = 50% 너비) */}
                <Col md={6}>
                    <h2>Notice</h2>
                    <NoticeList />
                </Col>
            </Row>
        </Container>
    )
}
export default App;