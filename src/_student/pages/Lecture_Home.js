import React, { useEffect, useState } from "react";
import { Card, Col, Container, Row, Pagination, Table } from "react-bootstrap";
import { useAuth } from "../../public/context/UserContext"; // 경로 확인 필요
import axios from "axios";
import { API_BASE_URL } from "../../config/config"; // 경로 확인 필요
import { useNavigate } from "react-router-dom";
import "./../ui/Dashboard.css"; // 스타일 파일 임포트

function Dashboard() {
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
    console.log(notice);

    // 로딩 중 표시
    if (!pageInfoNotice || !pageInfoAssign) {
        return <Container className="my-4"><div>Loading...</div></Container>;
    }

    // --- 페이지네이션 계산 ---
    const totalPagesNotice = pageInfoNotice.totalPages;
    const totalPagesAssign = pageInfoAssign.totalPages;

    const startPageNotice = Math.max(1, pageNotice - Math.floor(pageRange / 2));
    const endPageNotice = Math.min(totalPagesNotice, startPageNotice + pageRange - 1);

    const startPageAssign = Math.max(1, pageAssign - Math.floor(pageRange / 2));
    const endPageAssign = Math.min(totalPagesAssign, startPageAssign + pageRange - 1);

    // --- D-Day 계산기 ---
    const remainDate = dueDate => {
        const now = new Date();
        const due = new Date(dueDate);
        const diff = due.setHours(23, 59, 59, 999) - now; // 마감일 자정 기준으로 계산
        const msPerDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / msPerDay);
    };

    /**
     * 과제 목록 (테이블 스타일)
     */
    const AssignList = () => (
        <Card className="list-card h-100 d-flex flex-column">
            <Card.Header className="list-header">과제 To‑Do 리스트</Card.Header>
            <Card.Body className="p-0 flex-grow-1">
                <div style={{ maxHeight: "60vh", overflow: "auto" }}>
                    <Table hover bordered size="sm" className="mb-0 align-middle small" style={{ lineHeight: 1.15 }}>
                        <colgroup>
                            <col />
                            <col style={{ width: 110 }} />
                            <col style={{ width: 110 }} />
                            <col style={{ width: 90 }} />
                        </colgroup>
                        <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                            <tr>
                                <th className="text-center py-1">제목</th>
                                <th className="text-center py-1">강의/작성자</th>
                                <th className="text-center py-1">마감일</th>
                                <th className="text-center py-1">남은 기한</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assign.length > 0 ? (
                                assign.map(item => {
                                    const daysLeft = remainDate(item.dueAt);
                                    return (
                                        <tr key={item.id} onClick={() => navigate(`/assignment/${item.id}`)} style={{ cursor: 'pointer' }}>
                                            <td className="py-1 px-2">{item.title}</td>
                                            <td className="text-center py-1 px-2">{item.username}</td>
                                            <td className="text-center py-1 px-2 text-nowrap">{new Date(item.dueAt).toLocaleDateString()}</td>
                                            <td className="text-center py-1 px-2">
                                                <span className={`badge-remain ${daysLeft < 0 ? "badge-expired" : (daysLeft <= 3 ? "badge-urgent" : "")}`}>
                                                    {daysLeft >= 0 ? `D-${daysLeft}` : "마감"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        등록된 과제가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
            <Card.Footer className="text-center bg-white mt-auto">
                <Pagination className="justify-content-center mb-0" size="sm">
                    <Pagination.First disabled={pageAssign === 1} onClick={() => setPageAssign(1)} />
                    <Pagination.Prev disabled={pageAssign === 1} onClick={() => setPageAssign(pageAssign - 1)} />
                    {[...Array(endPageAssign - startPageAssign + 1)].map((_, idx) => {
                        const pageNum = startPageAssign + idx;
                        return (
                            <Pagination.Item key={pageNum} active={pageAssign === pageNum} onClick={() => setPageAssign(pageNum)}>
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

    /**
     * 공지사항 목록 (테이블 스타일)
     */
    const NoticeList = () => (
        <Card className="list-card h-100 d-flex flex-column">
            <Card.Header className="list-header">공지사항 리스트</Card.Header>
            <Card.Body className="p-0 flex-grow-1">
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
                                <th className="text-center py-1">글번호</th>
                                <th className="text-center py-1">제목</th>
                                <th className="text-center py-1">작성자</th>
                                <th className="text-center py-1">작성일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notice.length > 0 ? (
                                notice.map(item => (
                                    <tr key={item.id} onClick={() => navigate(`/notice/${item.id}`)} style={{ cursor: 'pointer' }}>
                                        <td className="text-center py-1 px-2">{item.id}</td>
                                        <td className="py-1 px-2">{item.title}</td>
                                        <td className="text-center py-1 px-2">{item.username}</td>
                                        {/* 공지사항에 dueAt(마감일)이 있는 것이 이상하지만, 원본 코드를 따릅니다. */}
                                        <td className="text-center py-1 px-2 text-nowrap">{new Date(item.updatedAt).toLocaleDateString()}</td>
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
            <Card.Footer className="text-center bg-white mt-auto">
                <Pagination className="justify-content-center mb-0" size="sm">
                    <Pagination.First disabled={pageNotice === 1} onClick={() => setPageNotice(1)} />
                    <Pagination.Prev disabled={pageNotice === 1} onClick={() => setPageNotice(pageNotice - 1)} />
                    {[...Array(endPageNotice - startPageNotice + 1)].map((_, idx) => {
                        const pageNum = startPageNotice + idx;
                        return (
                            <Pagination.Item key={pageNum} active={pageNotice === pageNum} onClick={() => setPageNotice(pageNum)}>
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
                    <Card className="user-info-card p-3 shadow-sm border-0">
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

export default Dashboard;