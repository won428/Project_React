import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Button, Pagination, Table } from "react-bootstrap";
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

    }, [page, user]);

    if (!pageInfo) return <Container className="py-4" style={{ maxWidth: 980 }}><div>Loading...</div></Container>;



    const totalPages = pageInfo.totalPages;

    const startPage = Math.max(1, page - Math.floor(pageRange / 2));
    const endPage = Math.min(totalPages, startPage + pageRange - 1);



    const clickPost = (e, item) => {
        e.stopPropagation(); // tr의 클릭 이벤트와 분리
        console.log("Post 클릭:", item.id);
        // 1:1 문의 상세 페이지로 이동 (경로 수정 필요)
        navigate("/notionlistspec", { state: item.id });
    };



    return (
        <Container className="py-4" style={{ maxWidth: 980 }}>
            <Card >
                <Card.Header>
                    <div className="d-flex align-items-center justify-content-between">
                        <h5 className="mb-0">공지사항</h5>
                        {user.roles.includes("PROFESSOR") && (
                            <Button size="sm" onClick={() => navigate("/createPost")}>
                                공지 작성
                            </Button>
                        )}

                    </div>
                </Card.Header>

                <Card.Body className="p-0">
                    <div style={{ maxHeight: "60vh", overflow: "auto" }}>
                        <Table
                            hover
                            bordered
                            size="sm"
                            className="mb-0 align-middle small"
                            style={{ lineHeight: 1.15 }}
                        >
                            <colgroup>
                                <col style={{ width: 70 }} />
                                <col />
                                <col style={{ width: 110 }} />
                                <col style={{ width: 140 }} />
                                {/* <col style={{ width: 70 }} /> */}
                            </colgroup>

                            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                <tr>

                                    <th className="text-center py-1">글번호</th>
                                    <th className="text-center py-1">제목</th>
                                    <th className="text-center py-1">작성자</th>
                                    <th className="text-center py-1">작성일</th>
                                    {/* <th className="text-center py-1">조회수</th> */}
                                </tr>
                            </thead>

                            <tbody>
                                {post.length > 0 ? (
                                    post.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            {/* API 응답(item)에 맞게 필드명 수정 */}

                                            <td className="text-center py-1 px-2">{item.postNumber || item.id}</td>
                                            <td className="text-center py-1 px-2"
                                                onClick={(e) => { clickPost(e, item) }}
                                            >
                                                <span
                                                    className="d-inline-block text-truncate"
                                                    style={{ maxWidth: 400, cursor: "pointer" }}
                                                    role="button"
                                                >
                                                    {item.title}
                                                </span>
                                            </td>
                                            <td className="text-center py-1 px-2">{item.username || item.userName}</td>
                                            <td className="text-center py-1 px-2 text-nowrap">{new Date(item.createdAt).toLocaleDateString()}</td>
                                            {/* <td className="text-center py-1 px-2">{item.viewCount ?? 0}</td> */}
                                        </tr>
                                    ))
                                ) : (
                                    // 게시물이 없을 때
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">
                                            게시물이 존재하지 않습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* 페이지네이션 (App.js에서 가져옴) */}
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
