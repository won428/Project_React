import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/UserContext"; // 경로 확인 필요
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/config"; // 경로 확인 필요
import axios from "axios";
import { Button, Card, Col, Container, Pagination, Row, Table } from "react-bootstrap";

/**
 * 전체 공지사항 (레이아웃 높이 최적화)
 */
function NoticeList() {
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

    }, [page, user?.email]); // user가 null일 수 있으므로 user?.email

    if (!pageInfo) return <Container className="py-4"><div>Loading...</div></Container>;

    const clickPost = (item) => navigate("/EnNotSpec", { state: item.id });

    const totalPages = pageInfo.totalPages;

    const startPage = Math.max(1, page - Math.floor(pageRange / 2));
    const endPage = Math.min(totalPages, startPage + pageRange - 1);

    return (
        /* * [수정 1]
         * h-100: 부모(Outlet)의 높이를 100% 채움
         * d-flex flex-column: 내부 요소(Card, Pagination)를 세로로 정렬
         */
        <Container className="py-4 h-100 d-flex flex-column" style={{ maxWidth: 800 }}>

            {/* * [수정 2]
             * d-flex flex-column: Card 내부를 세로 정렬
             * flex-grow-1: Card가 Container 내의 남은 공간을 모두 차지
             */
            }
            <Card className="d-flex flex-column flex-grow-1">
                <Card.Header>
                    <div className="d-flex align-items-center justify-content-between">
                        <h5 className="mb-0">공지사항</h5>
                        {user.roles.includes("ADMIN") && (
                            <Button size="sm" onClick={() => navigate("/EnNot")}>
                                공지 작성
                            </Button>
                        )}
                    </div>
                </Card.Header>

                {/* * [수정 3]
                 * flex-grow-1: Card.Body가 Card.Header를 제외한 남은 공간을 모두 차지
                 * style={{ overflow: 'hidden' }}: 내부 스크롤 div가 넘치지 않도록
                 */
                }
                <Card.Body className="p-0 flex-grow-1" style={{ overflow: 'hidden' }}>
                    {/* * [수정 4]
                     * maxHeight: "100vh" -> height: "100%"
                     * 부모(Card.Body)의 높이를 100% 채우고, 내부에서 스크롤
                     */
                    }
                    <div style={{ height: "100%", overflow: "auto" }}>
                        <Table hover bordered size="sm" className="mb-0 align-middle small" style={{ lineHeight: 1.15 }}>
                            <colgroup>
                                <col style={{ width: 70 }} />
                                <col />
                                <col style={{ width: 110 }} />
                                <col style={{ width: 140 }} />
                            </colgroup>

                            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                <tr>
                                    <th className="text-center py-1">글번호</th>
                                    <th className="text-center py-1">제목</th>
                                    <th className="text-center py-1">작성자</th>
                                    <th className="text-center py-1">작성일</th>
                                </tr>
                            </thead>

                            <tbody>
                                {post.length > 0 ? (
                                    post.map((item) => (
                                        <tr key={item.id} onClick={() => clickPost(item)} style={{ cursor: "pointer" }}>
                                            <td className="text-center py-1 px-2">{item.id}</td>
                                            <td className="py-1 px-2">{item.title}</td>
                                            <td className="text-center py-1 px-2">{item.username}</td>
                                            <td className="text-center py-1 px-2 text-nowrap">{new Date(item.createdAt).toLocaleDateString()}</td>
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

            {/* * 페이지네이션 (flex-grow-1에 의해 Card 하단에 자동으로 위치)
             * mt-auto: 혹시 모를 공간을 대비해 상단 마진을 최대로
             */
            }
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

export default NoticeList;