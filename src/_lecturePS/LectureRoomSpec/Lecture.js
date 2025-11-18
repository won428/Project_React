import axios from "axios";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/config";
import { Button, ButtonGroup, Card, CardBody, Carousel, Col, Container, Pagination, Row } from "react-bootstrap";
import { useLectureStore } from "./store/lectureStore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../public/context/UserContext";


function App() {
    const { user } = useAuth();
    const [post, setPost] = useState();
    const [pageInfo, setPageInfo] = useState(null);
    const [page, setPage] = useState(1);
    const { lectureId } = useLectureStore();
    const navigate = useNavigate();
    const pageRange = 6;
    console.log(user?.id);
    useEffect(() => {
        const url = `${API_BASE_URL}/online/List`
        const parameter = {
            id: lectureId,
            page: page - 1,
            size: 10
        }
        axios.get(url, { params: parameter })
            .then((res) => {
                setPost(res?.data.content);
                setPageInfo(res?.data)
                console.log(res?.data);
            })
            .catch((e) => {
                console.log(e);
            })
    }, [page, user.email])


    if (!pageInfo) {
        return <Container><div>로딩 중...</div></Container>;
    }

    const specificPage = (item) => navigate("/LecSpec", { state: item.id });
    const totalPages = pageInfo.totalPages;

    const startPage = Math.max(1, page - Math.floor(pageRange / 2));
    const endPage = Math.min(totalPages, startPage + pageRange - 1);

    const deleteLec = async (id) => {
        console.log(id);

        try {
            const url = `${API_BASE_URL}/online/delete/${id}`
            const res = await axios.delete(url);

            if (res.status === 200) {
                alert("성공");
                navigate("/Lec")
            } else {
                alert("오류");
                navigate("/Lec")
            }
        } catch {
            alert("오류 발생");
            navigate("/Lec")
        }
    }

    return (

        <Container style={{ maxWidth: "700px", marginTop: "2rem" }}>

            {/* 상단 타이틀 */}
            <Row className="mb-3 align-items-center">
                <Col><h4>온라인 강의</h4></Col>
                {user.roles.includes("PROFESSOR") && (<Col xs="auto">
                    <Button variant="primary" onClick={() => navigate("/lecins")}>
                        강의 업로드
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
                                onClick={() => specificPage(item?.id)}
                                className="mb-3 shadow-sm"
                                style={{ cursor: "pointer" }}

                            >
                                <CardBody
                                    disabled={true}
                                >
                                    <h5 className="fw-bold mb-2">{item.title}</h5>

                                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: "14px" }}>
                                        <span>{item.username}</span>
                                        <span>~{new Date(item.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <br />
                                    {user?.roles.includes("PROFESSOR") &&
                                        <div className="d-flex justify-content-end mt-3 gap-2">
                                            <Button
                                                onClick={() => {
                                                    console.log(item.id);
                                                    deleteLec(item.id);

                                                }}
                                            >삭제</Button>
                                        </div >}
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

    )
}
export default App;