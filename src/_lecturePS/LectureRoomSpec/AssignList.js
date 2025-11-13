import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Button, Pagination, Table } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import { useAuth } from "../../public/context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLectureStore } from "./store/lectureStore";

function App() {
    const { user } = useAuth();
    const [post, setPost] = useState([]); // content
    const [page, setPage] = useState(1);
    const [pageInfo, setPageInfo] = useState(null);

    const { lectureId } = useLectureStore();
    const navigate = useNavigate();
    const pageRange = 10; // 한 번에 표시할 페이지 수

    useEffect(() => {
        const url = `${API_BASE_URL}/assign/List`;
        axios.get(url, {
            params: {
                id: lectureId,
                page: page - 1, // Spring은 0부터 시작!
                size: 10
            }
        })
            .then((res) => {
                setPost(res.data.content);
                setPageInfo(res.data);
            })
            .catch(console.error);
    }, [page, user]);

    console.log(post);

    if (!pageInfo) return null;

    const clickPost = (e, item) => {
        e.stopPropagation();
        navigate("/asnspec", { state: item.id });
    };

    const totalPages = pageInfo.totalPages;

    const startPage = Math.max(1, page - Math.floor(pageRange / 2));
    const endPage = Math.min(totalPages, startPage + pageRange - 1);

    return (
        <Container className="py-4" style={{ maxWidth: 980 }}>
            <Card>
                <Card.Header>
                    <div className="d-flex align-items-center justify-content-between">
                        <h5 className="mb-0">과제</h5>
                        {user.roles.includes("PROFESSOR") && (
                            <Button size="sm" onClick={() => navigate("/asn")}>
                                과제 작성
                            </Button>
                        )}
                    </div>
                </Card.Header>

                <Card.Body className="p-0">
                    <div style={{ maxHeight: "60vh", overflow: "auto" }}>
                        <Table hover bordered size="sm" className="mb-0 align-middle small" style={{ lineHeight: 1.15 }}>
                            <colgroup>
                                <col style={{ width: 70 }} />
                                <col />
                                <col style={{ width: 110 }} />
                                <col style={{ width: 140 }} />
                            </colgroup>

                            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                <tr>
                                    <th className="text-center py-1">과제번호</th>
                                    <th className="text-center py-1">제목</th>
                                    <th className="text-center py-1">작성자</th>
                                    <th className="text-center py-1">작성일</th>
                                </tr>
                            </thead>

                            <tbody>
                                {post.length > 0 ? (
                                    post.map((item) => (
                                        <tr key={item.id} onClick={(e) => clickPost(e, item)} style={{ cursor: "pointer" }}>
                                            <td className="text-center py-1 px-2">{item.id}</td>
                                            <td className="py-1 px-2">{item.title}</td>
                                            <td className="text-center py-1 px-2">{item.username}</td>
                                            <td className="text-center py-1 px-2 text-nowrap">{new Date(item.createAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5 text-muted">
                                            게시물이 존재하지 않습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

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
    )
}

export default App;
