import { Card, Col, Container, Pagination, Row, ListGroup, Badge } from "react-bootstrap"; // ListGroup, Badge 임포트
import { useAuth } from "../../../public/context/UserContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../../config/config";
import axios from "axios";
import { set } from "date-fns";

function App() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const appName = "LMS";
    const [userdata, setUserdata] = useState({});
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState((new Date().getMonth()) + 1);

    const [post, setPost] = useState([]);
    const [postlec, setPostLec] = useState([]);
    const [pageInfo, setPageInfo] = useState(null);
    const [pageInfoLec, setPageInfoLec] = useState(null);
    const [page, setPage] = useState(1); // 현재 페이지 (1-based)
    const pageRange = 5;
    const Semester = new Date().getMonth() === 1 || new Date().getMonth() === 2 ?
        4 : Math.ceil(new Date().getMonth() / 3);
    const semester = {
        year: year.toString().padStart(4, '0'),
        semester: Semester.toString().padStart(2, '0'),
    }

    // --- (데이터 로직은 동일) ---
    useEffect(() => {
        // user.id가 유효할 때만 API 호출
        if (user?.id) {
            const url = `${API_BASE_URL}/user/detailAll/${user.id}`;

            axios.get(url, { params: semester })
                .then((res) => {
                    setUserdata(res.data);
                    console.log("User data fetched:", res.data);
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                });
        }
    }, [user?.id]); // user.id를 의존성으로 사용

    useEffect(() => {
        const url = `${API_BASE_URL}/calendar/List/ad`;
        const params = {
            year,
            month,
            page: page - 1,
            size: pageRange,
        };
        axios.get(url, { params })
            .then((res) => {
                setPageInfo(res.data);
                setPost(res.data.content);
            })
            .catch((error) => {
                console.error("Error fetching academicCalendar:", error);
            });
    }, [year, month, page]);

    useEffect(() => {
        const url = `${API_BASE_URL}/lecture/lecProgress/ad`;
        axios.get(url, { params: semester })
            .then((res) => {
                setPageInfoLec(res.data);
                setPostLec(res.data.content);
                console.log("User data fetched:", res.data);
            })
            .catch((error) => {
                console.error("Error fetching academicCalendar:", error);
            });
    }, [user?.id]);



    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };

    const renderPagination = () => {
        if (!pageInfo || pageInfo.totalPages <= 1) {
            return null;
        }

        let items = [];
        for (let number = 1; number <= pageInfo.totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === pageInfo.number + 1}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>,
            );
        }
        return (
            <Card.Footer className="d-flex justify-content-center py-2">
                <Pagination className="mb-0">{items}</Pagination>
            </Card.Footer>
        );
    };

    // ========= ⬇️ [핵심] JSX(UI) 부분 수정 ⬇️ =========
    return (
        <Container className="my-4">

            {/* --- 1. 나의 정보 (상단, 전체 너비) --- */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header as="h5"> 나의 정보</Card.Header>
                        <Card.Body>
                            <Row className="align-items-center">
                                {/* 프로필 이미지 영역 */}
                                <Col md={3} className="text-center mb-3 mb-md-0">
                                    <img
                                        src={userdata.profileImageUrl || "https://placehold.co/150x150/6c757d/white?text=PHOTO"}
                                        alt="Profile"
                                        className="img-fluid rounded-circle shadow-sm"
                                        style={{ maxWidth: '150px' }}
                                    />
                                </Col>
                                {/* 정보 리스트 영역 */}
                                <Col md={9}>
                                    <h4 className="mb-3">{userdata?.name}님, 환영합니다!</h4>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>
                                            <strong>학번:</strong> {userdata.userCode}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>소속 학과:</strong> {userdata?.college?.type} {userdata?.major?.name}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>전화번호:</strong> {userdata.phone}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>이메일:</strong> {userdata.email}
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* --- 2. 수강 현황 및 학사 일정 (하단, 2열) --- */}
            <Row>
                <Col lg={6} md={12} className="mb-4">
                    <Card className="h-100">
                        <Card.Header as="h5">강의 신청 내역</Card.Header>
                        <ListGroup variant="flush">
                            {postlec?.length > 0 ? (
                                postlec.map((post, index) => (
                                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                        {post.name} ({post.userName}/{post.majorName})
                                        <Badge bg="primary" pill>
                                            {post.status}
                                        </Badge>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item className="text-muted">학적 정보가 없습니다.</ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>

                {/* 2-2. 학사 일정 */}
                <Col lg={6} md={12} className="mb-4">
                    <Card className="h-100 d-flex flex-column"> {/* 카드 높이 100% 및 flex */}
                        <Card.Header as="h5"> {month}월 학사일정</Card.Header>
                        <ListGroup variant="flush" style={{ flexGrow: 1 }}> {/* 리스트가 남은 공간 채우기 */}
                            {post.length > 0 ? (
                                post.map((item, index) => (
                                    <ListGroup.Item key={item.id || index} className="d-flex justify-content-between align-items-center">
                                        <span>{item.title || `일정 항목 ${item.id}`}</span>
                                        <Badge bg="secondary" pill>
                                            {item.calStartDate ? new Date(item.calStartDate).toLocaleDateString() : '날짜 없음'}
                                        </Badge>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item className="text-muted text-center">
                                    해당 월에 일정이 없습니다.
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                        {/* 페이지네이션 (내용이 넘칠 때만 보이도록 수정) */}
                        {pageInfo && pageInfo.totalPages > 1 && renderPagination()}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default App;