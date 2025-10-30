import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Button, Pagination } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import { useAuth } from "../../../public/context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLectureStore } from "../store/lectureStore";

function App() {
    const { user } = useAuth();
    const [post, setPost] = useState([]); // content
    const [page, setPage] = useState(1);
    const [pageInfo, setPageInfo] = useState(null);
    const { lectureId } = useLectureStore();
    const navigate = useNavigate();
    const pageRange = 10; // 한 번에 표시할 페이지 수

    useEffect(() => {
        const url = `${API_BASE_URL}/notice/List`;
        const parameter = {
            id: lectureId,
            page: page - 1, // Spring은 0부터 시작!
            size: 10
        }


        axios.get(url, {
            params: parameter

        })
            .then((res) => {
                setPost(res.data.content);
                setPageInfo(res.data);

            })
            .catch(console.error);

    }, [page, user.email]);

    if (!pageInfo) return null;

    const specificPage = (item) => navigate("/notionlistspec", { state: item.id });

    const totalPages = pageInfo.totalPages;

    const startPage = Math.max(1, page - Math.floor(pageRange / 2));
    const endPage = Math.min(totalPages, startPage + pageRange - 1);

    return (
        <Container style={{ maxWidth: "700px", marginTop: "2rem" }}>

            {/* 상단 타이틀 */}
            <Row className="mb-3 align-items-center">
                <Col><h4>공지사항</h4></Col>
                <Col xs="auto">
                    <Button variant="primary" onClick={() => navigate("/noticep")}>
                        공지 작성
                    </Button>
                </Col>
            </Row>

            {/* 게시글 목록 */}
            <Row>
                <Col>
                    {post.length > 0 ? (
                        post.map((item) => (
                            <Card
                                key={item.id}
                                onClick={() => specificPage(item)}
                                className="mb-3 shadow-sm"
                                style={{ cursor: "pointer" }}
                            >
                                <CardBody>
                                    <h5 className="fw-bold mb-2">{item.title}</h5>
                                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: "14px" }}>
                                        <span>{item.username}</span>
                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
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

            {/* 페이지네이션 */}
            <div className="d-flex justify-content-center mt-4">
                <Pagination>

                    <Pagination.First
                        disabled={page === 1}
                        onClick={() => setPage(1)}
                    />

                    <Pagination.Prev
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    />

                    {[...Array(endPage - startPage + 1)].map((_, i) => {
                        const pageNumber = startPage + i;
                        return (
                            <Pagination.Item
                                key={pageNumber}
                                active={page === pageNumber}
                                onClick={() => setPage(pageNumber)}
                            >
                                {pageNumber}
                            </Pagination.Item>
                        );
                    })}

                    <Pagination.Next
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    />

                    <Pagination.Last
                        disabled={page === totalPages}
                        onClick={() => setPage(totalPages)}
                    />

                </Pagination>
            </div>

        </Container>
    );
}

export default App;
