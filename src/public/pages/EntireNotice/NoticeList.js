import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/UserContext";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";
import { Button, Card, Container, Pagination, Table, Form, InputGroup, Badge, Row, Col } from "react-bootstrap";
import { Search, Pin, Eye, Calendar, User } from "lucide-react";

/**
 * 전체 공지사항 (게시판 스타일)
 */
function NoticeList() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [post, setPost] = useState([]);
    const [page, setPage] = useState(1);
    const [pageInfo, setPageInfo] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchType, setSearchType] = useState("title"); // title, content, username
    const pageRange = 10;

    useEffect(() => {
        const url = `${API_BASE_URL}/Entire/List`;
        const parameter = {
            page: page - 1,
            size: 10,
            ...(searchKeyword && { 
                searchType: searchType,
                keyword: searchKeyword 
            })
        };

        axios.get(url, {
            params: parameter
        })
            .then((res) => {
                setPost(res.data.content);
                setPageInfo(res.data);
                console.log(res.data)
            })
            .catch(console.error);

    }, [page, user?.email, searchKeyword, searchType]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // 검색 시 첫 페이지로
    };

    const clickPost = (item) => navigate("/EnNotSpec", { state: item.id });

    const newClick = async(e, id, item) => {
         try {
      e.preventDefault();
        const url = `${API_BASE_URL}/Entire/clickTitle/${id}`;
        const res = await axios.patch(url)

      if (res.status === 200) {
        clickPost(item)
      }

    } catch (error) {
      const err = error.response;
      console.log(error)
      if (!err) {
        alert('네트워크 오류가 발생하였습니다');
        return;
      }
      const message = err.data?.message ?? '오류 발생';
      alert(message);

    }
        
    }

    if (!pageInfo) {
        return (
            <Container className="py-4">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Container>
        );
    }

    const totalPages = pageInfo.totalPages;
    const startPage = Math.max(1, page - Math.floor(pageRange / 2));
    const endPage = Math.min(totalPages, startPage + pageRange - 1);

    return (
        <Container className="py-4" style={{ maxWidth: 1000 }}>
            {/* 헤더 섹션 */}
            <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                        <h3 className="mb-1">공지사항</h3>
                        <p className="text-muted mb-0">
                            전체 <strong>{pageInfo.totalElements}</strong>개의 게시글
                        </p>
                    </div>
                    {user?.roles?.includes("ADMIN") && (
                        <Button 
                            variant="primary" 
                            onClick={() => navigate("/EnNot")}
                        >
                            공지 작성
                        </Button>
                    )}
                </div>

           
            </div>

            {/* 게시판 테이블 */}
            <Card className="shadow-sm">
                <Card.Body className="p-0">
                    <div style={{ overflowX: "auto" }}>
                        <Table hover className="mb-0" style={{ minWidth: 600 }}>
                            <colgroup>
                                <col style={{ width: 80 }} />
                                <col />
                                <col style={{ width: 120 }} />
                                <col style={{ width: 100 }} />
                                <col style={{ width: 140 }} />
                            </colgroup>

                            <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                                <tr>
                                    <th className="text-center py-3">번호</th>
                                    <th className="py-3">제목</th>
                                    <th className="text-center py-3">작성자</th>
                                    <th className="text-center py-3">조회</th>
                                    <th className="text-center py-3">작성일</th>
                                </tr>
                            </thead>

                            <tbody>
                                {post.length > 0 ? (
                                    post.map((item, index) => {
                                        const isNotice = item.isNotice || item.pinned; // 중요 공지
                                        const isNew = (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24) < 1; // 3일 이내

                                        return (
                                            <tr 
                                                key={item.id} 
                                                onClick={(e) => newClick(e,item.id, item)} 
                                                style={{ 
                                                    cursor: "pointer",
                                                    backgroundColor: isNotice ? "#fff9e6" : "transparent"
                                                }}
                                                className="border-bottom"
                                            >
                                                <td className="text-center py-3">
                                                    {isNotice ? (
                                                        <Badge bg="danger">
                                                            <Pin size={12} />
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted">{item.id}</span>
                                                    )}
                                                </td>
                                                <td className="py-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        {isNotice && (
                                                            <Badge bg="danger" className="me-1">공지</Badge>
                                                        )}
                                                        <span style={{ fontWeight: isNotice ? 600 : 400 }}>
                                                            {item.title}
                                                        </span>
                                                        {isNew && (
                                                            <Badge bg="success" className="ms-1" style={{ fontSize: "0.65rem" }}>
                                                                NEW
                                                            </Badge>
                                                        )}
                                                        {item.commentCount > 0 && (
                                                            <span className="text-primary" style={{ fontSize: "0.85rem" }}>
                                                                [{item.commentCount}]
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-center py-3">
                                                    <div className="d-flex align-items-center justify-content-center gap-1">
                                                        <User size={14} className="text-muted" />
                                                        <span>{item.username}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center py-3">
                                                    <div className="d-flex align-items-center justify-content-center gap-1">
                                                        <Eye size={14} className="text-muted" />
                                                        <span>{item.viewCount || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 text-muted" style={{ fontSize: "0.9rem" }}>
                                                    <div className="d-flex align-items-center justify-content-center gap-1">
                                                        <Calendar size={14} className="text-muted" />
                                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="text-muted">
                                                <Search size={48} className="mb-3 opacity-25" />
                                                <p className="mb-0">게시물이 존재하지 않습니다.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* 페이지네이션 */}
            {totalPages > 0 && (
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
            )}

            {/* 페이지 정보 */}
            <div className="text-center mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
                {page} / {totalPages} 페이지
            </div>
        </Container>
    );
}

export default NoticeList;
