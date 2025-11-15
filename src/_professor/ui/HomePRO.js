// Pagination을 import에 추가합니다.
import { Card, Col, Container, Row, Spinner, ListGroup, Pagination } from "react-bootstrap";
import { useAuth } from "../../public/context/UserContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../public/config/config";
import { Mortarboard, CalendarWeek, PersonBadge } from "react-bootstrap-icons";

function HomePRO() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState([]);
    const [lecture, setLecture] = useState([]);
    const [userInfo, setUserInfo] = useState({
        userCode: null,
        userName: "",
        major: "",
        college: "",
        u_type: ""
    });
    // pageInfo가 academicCalendar의 페이지네이션 정보를 담습니다.
    const [pageInfo, setPageInfo] = useState(null);
    const [page, setPage] = useState(1); // 현재 페이지 (1-based)
    const pageRange = 5;

    useEffect(() => {
        if (!user?.username) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/Entire/proHome`, {
                    params: {
                        userCode: user.username,
                        page: page - 1, // API는 0-based page를 사용
                        size: pageRange,
                    }
                });
                const { data } = response;
                setUserInfo({
                    userCode: data.userCode,
                    userName: data.userName,
                    major: data.major,
                    college: data.college,
                    u_type: data.u_type
                });
                // 페이지네이션된 학사 일정 설정
                setPost(data.academicCalendar.content || []);
                // 페이지 정보 설정 (totalPages, first, last 등)
                setPageInfo(data.academicCalendar);
                setLecture(data.lectureDtoList || []);

            } catch (error) {
                console.error("Error fetching proHome data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.username, page]); // page가 변경될 때마다 fetchData 다시 실행

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    const EmptyState = ({ message }) => (
        <div className="d-flex align-items-center justify-content-center text-muted" style={{ minHeight: '100px' }}>
            <p className="mb-0">{message}</p>
        </div>
    );

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pageInfo.totalPages) {
            setPage(newPage);
        }
    };

    // 페이지네이션 아이템을 렌더링하는 함수 (선택적: 페이지가 많을 때 사용)
    // 간단한 버전을 위해 우선 모든 페이지를 표시합니다.
    const renderPaginationItems = () => {
        if (!pageInfo) return null;

        const items = [];
        for (let number = 1; number <= pageInfo.totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === page}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return items;
    };


    return (
        <Container className="dashboard-container my-4">
            {/* ... (교수 정보 카드) ... */}
            <Row className="mb-4">
                <Col>
                    <Card className="user-info-card p-4 shadow-sm border-0">
                        <Card.Title as="h2" className="mb-2 d-flex align-items-center">
                            <PersonBadge size={30} className="me-2" /> {userInfo.userName} 교수님
                        </Card.Title>
                        <Card.Text className="text-muted fs-5">
                            {userInfo.college} <span className="mx-2">&middot;</span> {userInfo.major}
                        </Card.Text>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* ... (개강 강의 목록 카드) ... */}
                <Col md={6}>
                    <Card className="p-3 shadow-sm border-0">
                        <Card.Title className="d-flex align-items-center mb-3">
                            <Mortarboard size={24} className="me-2" /> 개강 강의 목록
                        </Card.Title>
                        <Card.Body className="p-0">
                            {lecture.length > 0 ? (
                                <ListGroup variant="flush">
                                    {lecture.map((lec, index) => (
                                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{lec.name}</strong>
                                                <small className="text-muted d-block">{lec.userName} ({lec.completionDiv}) / {lec.status}</small>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : <EmptyState message="개강 강의가 없습니다." />
                            }
                        </Card.Body>
                    </Card>
                </Col>

                {/* === 학사 일정 카드 (페이지네이션 추가됨) === */}
                <Col md={6}>
                    <Card className="p-3 shadow-sm border-0">
                        <Card.Title className="d-flex align-items-center mb-3">
                            <CalendarWeek size={24} className="me-2" /> 이번달 학사 일정
                        </Card.Title>
                        <Card.Body className="p-0">
                            {post.length > 0 ? (
                                <ListGroup variant="flush">
                                    {post.map((item, index) => {
                                        const startDate = new Date(item.calStartDate).toLocaleDateString();
                                        const endDate = new Date(item.eneDate).toLocaleDateString();
                                        const dateDisplay = startDate === endDate ? startDate : `${startDate} ~ ${endDate}`;
                                        return (
                                            <ListGroup.Item key={index}>
                                                <div className="fw-bold">{dateDisplay}</div>
                                                <div className="text-dark">{item.title}</div>
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            ) : <EmptyState message="이번달 학사 일정이 없습니다." />
                            }
                        </Card.Body>

                        {/* === 페이지네이션 UI 추가 === */}
                        {pageInfo && pageInfo.totalPages > 1 && (
                            <Card.Footer className="bg-transparent border-0 pt-3">
                                <Pagination className="justify-content-center mb-0">
                                    <Pagination.First
                                        disabled={pageInfo.first} // 첫 페이지일 때 비활성화
                                        onClick={() => handlePageChange(1)}
                                    />
                                    <Pagination.Prev
                                        disabled={pageInfo.first}
                                        onClick={() => handlePageChange(page - 1)}
                                    />

                                    {/* 페이지 번호 렌더링 */}
                                    {renderPaginationItems()}

                                    <Pagination.Next
                                        disabled={pageInfo.last} // 마지막 페이지일 때 비활성화
                                        onClick={() => handlePageChange(page + 1)}
                                    />
                                    <Pagination.Last
                                        disabled={pageInfo.last}
                                        onClick={() => handlePageChange(pageInfo.totalPages)}
                                    />
                                </Pagination>
                            </Card.Footer>
                        )}
                        {/* === 페이지네이션 UI 끝 === */}

                    </Card>
                </Col>
            </Row>
        </Container>
    )
}
export default HomePRO;