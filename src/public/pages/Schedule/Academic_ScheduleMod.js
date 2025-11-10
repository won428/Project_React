import React, { useEffect, useState } from "react";
import { Card, Col, Container, Form, Row, Pagination, Button } from "react-bootstrap";
// import { API_BASE_URL } from "../../config/config"; // 이 부분은 실제 URL로 대체해야 합니다.
import axios from "axios";
import { API_BASE_URL } from "../../../public/config/config";
import { useNavigate } from "react-router-dom";


function App() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // getMonth()는 0-11을 반환

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const Months = Array.from({ length: 12 }, (_, i) => i + 1);
    const navigate = useNavigate();
    const [post, setPost] = useState([]); // content
    const [page, setPage] = useState(1); // 현재 페이지 (1부터 시작)
    const [YY, setYY] = useState(currentYear); // 현재 연도로 초기화
    const [MM, setMM] = useState(currentMonth); // 현재 월로 초기화
    const [pageInfo, setPageInfo] = useState(null); // Spring Pageable 객체 저장

    const pageRange = 10; // 한 번에 표시할 페이지 수 (size)

    useEffect(() => {
        const fetchData = async () => {
            const url = `${API_BASE_URL}/calendar/List/ad`;
            const params = {
                year: YY,
                month: MM,
                page: page - 1, // Spring은 0부터 시작!
                size: pageRange
            };
            console.log(params);

            try {
                const res = await axios.get(url, { params });
                console.log(res.data);

                // Spring Pageable 응답을 가정
                if (res.data && res.data.content) {
                    setPost(res.data.content);
                    setPageInfo(res.data);
                } else {
                    setPost(res.data || []);
                    setPageInfo(null);
                }

            } catch (e) {
                console.error("데이터를 불러오는 데 실패했습니다.", e);
                setPost([]); // 에러 발생 시 목록 비우기
                setPageInfo(null);
            }
        };

        fetchData();
    }, [YY, MM, page]); // 연도, 월, 또는 페이지가 변경될 때마다 실행

    // 연도 변경 핸들러
    const handleYearChange = (e) => {
        setYY(Number(e.target.value));
        setPage(1); // 연도가 바뀌면 1페이지로 리셋
    };

    // 월 변경 핸들러
    const handleMonthChange = (e) => {
        setMM(Number(e.target.value));
        setPage(1); // 월이 바뀌면 1페이지로 리셋
    };

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setPage(pageNumber);
    };

    // Pagination 컴포넌트 렌더링
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
        return <Pagination className="justify-content-center mt-3">{items}</Pagination>;
    };

    const removeSche = (item) => {
        console.log(item);

        const url = `${API_BASE_URL}/calendar/delete/${item}`;
        axios.delete(url)


    }

    return (
        <Container className="mt-3 bg-light p-4 rounded-3 shadow-sm">
            <h2 className="text-center mb-4 text-primary">학사일정 관리</h2>
            <Row className="mb-3 justify-content-center">
                <Col md={3}>
                    <Form.Select value={YY} onChange={handleYearChange}>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}년
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Select value={MM} onChange={handleMonthChange}>
                        {Months.map((month) => (
                            <option key={month} value={month}>
                                {month}월
                            </option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white py-3">
                            <strong>{YY}년 {MM}월 일정</strong>
                        </Card.Header>
                        <Card.Body style={{ minHeight: '300px' }}>
                            {post.length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {post.map((item, index) => (
                                        <li key={item.id || index} className="list-group-item d-flex justify-content-between align-items-center">
                                            {item.title || `일정 항목 ${item.id}`}

                                            <div className="badge bg-secondary  rounded-pill">
                                                <span>
                                                    {item.calStartDate ? new Date(item.calStartDate).toLocaleDateString() : '날짜 없음'}
                                                </span>
                                                &nbsp;
                                                <Button
                                                    size="sm"
                                                    onClick={() => navigate(`예정`)}
                                                    style={{ backgroundColor: 'transparent' }}
                                                    variant="outline-light"
                                                >
                                                    수정
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        removeSche(item.id);
                                                    }}
                                                    style={{ backgroundColor: 'transparent' }}
                                                    variant="outline-light"
                                                >
                                                    삭제
                                                </Button>

                                            </div>
                                        </li>

                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted mt-3">
                                    해당 월에 일정이 없습니다.
                                </p>
                            )}
                        </Card.Body>
                    </Card>

                    {/* 페이지네이션 렌더링 */}
                    {renderPagination()}
                </Col>
            </Row>
        </Container>
    );
}

export default App;