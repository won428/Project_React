import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/UserContext";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";
import { Button, Card, CardBody, Col, Container, Pagination, Row } from "react-bootstrap";





function App() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [post, setPost] = useState([]); // content
    const [page, setPage] = useState(1);
    const [pageInfo, setPageInfo] = useState(null);
    const pageRange = 10;

    useEffect(() => {
        const url = `${API_BASE_URL}/Entire/List`;
        const parameter = {
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

    const specificPage = (item) => navigate("/EnNotSpec", { state: item.id });

    const totalPages = pageInfo.totalPages;

    const startPage = Math.max(1, page - Math.floor(pageRange / 2));
    const endPage = Math.min(totalPages, startPage + pageRange - 1);
    console.log(post);

    return (
        <Container style={{ maxWidth: "700px", marginTop: "2rem" }}>

            {/* 상단 타이틀 */}
            <Row className="mb-3 align-items-center">
                <Col><h4>공지사항</h4></Col>
                {user.roles.includes("ADMIN") && (<Col xs="auto">
                    <Button variant="primary" onClick={() => navigate("/EnNot")}>
                        공지 작성
                    </Button>
                </Col>)}
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