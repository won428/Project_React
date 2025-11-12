import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Pagination } from "react-bootstrap";
import { useAuth } from "../../public/context/UserContext";
import axios from "axios";
import { API_BASE_URL } from "../../config/config";
import { useNavigate } from "react-router-dom";
import "./../ui/Dashboaed.css";  // 스타일을 별도 파일로 분리

function App() {
    const { user } = useAuth();
    const [assign, setAssign] = useState([]);
    const [notice, setNotice] = useState([]);
    const [userInfo, setUserInfo] = useState({
        user_code: "",
        username: "",
        major: "",
        college: "",
        u_type: ""
    });
    const [pageInfoNotice, setPageInfoNotice] = useState(null);
    const [pageInfoAssign, setPageInfoAssign] = useState(null);
    const [pageNotice, setPageNotice] = useState(1);
    const [pageAssign, setPageAssign] = useState(1);
    const navigate = useNavigate();
    const pageRange = 5;

    useEffect(() => {
        if (!user) return;
        const params = {
            pagenotice: pageNotice - 1,
            pageassign: pageAssign - 1,
            size: pageRange
        };

        axios.get(`${API_BASE_URL}/notice/todo/${user.id}`, { params })
            .then(res => {
                const data = res.data;
                setUserInfo({
                    user_code: data.user_code,
                    username: data.username,
                    major: data.major,
                    college: data.college,
                    u_type: data.u_type
                });
                setNotice(data.listDto.content);
                setAssign(data.assignmentDto.content);
                setPageInfoNotice(data.listDto);
                setPageInfoAssign(data.assignmentDto);
            })
            .catch(e => {
                console.error("API 호출 오류:", e);
            });
    }, [user, pageNotice, pageAssign]);

    if (!pageInfoNotice || !pageInfoAssign) return null;

    const totalPagesNotice = pageInfoNotice.totalPages;
    const totalPagesAssign = pageInfoAssign.totalPages;

    const startPageNotice = Math.max(1, pageNotice - Math.floor(pageRange / 2));
    const endPageNotice = Math.min(totalPagesNotice, startPageNotice + pageRange - 1);

    const startPageAssign = Math.max(1, pageAssign - Math.floor(pageRange / 2));
    const endPageAssign = Math.min(totalPagesAssign, startPageAssign + pageRange - 1);

    const remainDate = dueDate => {
        const now = new Date();
        const due = new Date(dueDate);
        const diff = due - now;
        const msPerDay = 1000 * 60 * 60 * 24;
        return Math.ceil(diff / msPerDay);
    };

    const AssignList = () => (
        <Card className="list-card">
            <Card.Header className="list-header">과제 To‑Do 리스트</Card.Header>
            <Card.Body>
                {assign.length > 0 ? (
                    assign.map(item => (
                        <Card key={item.id} className="mb-2 item-card" onClick={() => navigate(`/assignment/${item.id}`)}>
                            <Card.Body className="item-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="item-title mb-0">{item.title}</h5>
                                    <span className={`badge badge-remain ${remainDate(item.dueAt) <= 0 ? "badge-expired" : ""}`}>
                                        {remainDate(item.dueAt) > 0 ? `~${remainDate(item.dueAt)}일 남음` : "마감"}
                                    </span>
                                </div>
                                <div className="text-muted small mt-1">{item.username}</div>
                            </Card.Body>
                        </Card>
                    ))
                ) : (
                    <div className="text-center mt-4 text-muted">게시물이 존재하지 않습니다.</div>
                )}
            </Card.Body>
            <Card.Footer className="text-center bg-white">
                <Pagination className="justify-content-center mb-0">
                    <Pagination.First disabled={pageAssign === 1} onClick={() => setPageAssign(1)} />
                    <Pagination.Prev disabled={pageAssign === 1} onClick={() => setPageAssign(pageAssign - 1)} />
                    {[...Array(endPageAssign - startPageAssign + 1)].map((_, idx) => {
                        const pageNum = startPageAssign + idx;
                        return (
                            <Pagination.Item
                                key={pageNum}
                                active={pageAssign === pageNum}
                                onClick={() => setPageAssign(pageNum)}
                            >
                                {pageNum}
                            </Pagination.Item>
                        );
                    })}
                    <Pagination.Next disabled={pageAssign === totalPagesAssign} onClick={() => setPageAssign(pageAssign + 1)} />
                    <Pagination.Last disabled={pageAssign === totalPagesAssign} onClick={() => setPageAssign(totalPagesAssign)} />
                </Pagination>
            </Card.Footer>
        </Card>
    );

    const NoticeList = () => (
        <Card className="list-card">
            <Card.Header className="list-header">공지사항 리스트</Card.Header>
            <Card.Body>
                {notice.length > 0 ? (
                    notice.map(item => (
                        <Card key={item.id} className="mb-2 item-card" onClick={() => navigate(`/notice/${item.id}`)}>
                            <Card.Body className="item-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="item-title mb-0">{item.title}</h5>
                                    <span className="text-muted small">{new Date(item.dueAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-muted small mt-1">{item.username}</div>
                            </Card.Body>
                        </Card>
                    ))
                ) : (
                    <div className="text-center mt-4 text-muted">게시물이 존재하지 않습니다.</div>
                )}
            </Card.Body>
            <Card.Footer className="text-center bg-white">
                <Pagination className="justify-content-center mb-0">
                    <Pagination.First disabled={pageNotice === 1} onClick={() => setPageNotice(1)} />
                    <Pagination.Prev disabled={pageNotice === 1} onClick={() => setPageNotice(pageNotice - 1)} />
                    {[...Array(endPageNotice - startPageNotice + 1)].map((_, idx) => {
                        const pageNum = startPageNotice + idx;
                        return (
                            <Pagination.Item
                                key={pageNum}
                                active={pageNotice === pageNum}
                                onClick={() => setPageNotice(pageNum)}
                            >
                                {pageNum}
                            </Pagination.Item>
                        );
                    })}
                    <Pagination.Next disabled={pageNotice === totalPagesNotice} onClick={() => setPageNotice(pageNotice + 1)} />
                    <Pagination.Last disabled={pageNotice === totalPagesNotice} onClick={() => setPageNotice(totalPagesNotice)} />
                </Pagination>
            </Card.Footer>
        </Card>
    );

    return (
        <Container className="dashboard-container my-4">
            <Row className="mb-4">
                <Col>
                    <Card className="user-info-card p-3">
                        <h2 className="mb-1">{userInfo.username}님</h2>
                        <div className="text-muted">{userInfo.user_code} · {userInfo.major} · {userInfo.college}</div>
                    </Card>
                </Col>
            </Row>
            <Row className="g-4">
                <Col md={6}>
                    <AssignList />
                </Col>
                <Col md={6}>
                    <NoticeList />
                </Col>
            </Row>
        </Container>
    );
}

export default App;
