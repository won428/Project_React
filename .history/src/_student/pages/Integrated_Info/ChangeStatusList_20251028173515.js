import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function App() {

    const [userList, setUserList] = useState([]);
    const navigate = useNavigate();

   







    
    return (
        <Container fluid className="py-4" style={{ maxWidth: "100%" }}>
            {/* 상단 타이틀 + 우측 등록 버튼 */}
            <Row className="align-items-center mb-3">
                <Col md={6}>
                    <h4 className="mb-0">학적 변경 신청 목록</h4>
                    <div className="text-muted small">엑셀 스타일 표 UI</div>
                </Col>

            </Row>

            {/* 표: 헤더 + 한 행(샘플) */}
            <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
                <Table bordered hover size="sm" className="align-middle w-100" style={{ tableLayout: "fixed" }}>
                    <thead style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
                        <tr>
                            <th style={{ minWidth: 100 }}>제목</th>
                            <th style={{ width: 100 }}>신청일</th>
                            <th style={{ width: 100 }}>처리일</th>
                            <th style={{ width: 140 }}>변경 신청 학적</th>
                            <th style={{ minWidth: 300 }}>처리상태</th>

                        </tr>
                    </thead>
                    <tbody>
                        {/* 나중에 데이터 연결 시, 아래 샘플 <tr>을 map으로 대체하세요.
                예: data.map((u) => (
                      <tr key={u.id}> ... </tr>
                    ))
            */}
                        {userList.map((user) => (
                            <tr key={user.user_code}>
                                <td>{user.u_name}</td>
                                <td>{user.gender === 'MALE' ? '남자' : '여자'}</td>
                                <td>{user.birthdate}</td>
                                <td>{user.user_code}</td>
                                <td style={{ whiteSpace: "normal", wordBreak: "break-all", overflowWrap: "anywhere" }}>
                                    {user.email}
                                </td>

                                <td>
                                    <div className="d-flex gap-2">
                                        <Button size="sm" variant="outline-primary" onClick={() => navigate(`/user/${user.user_code}/update`)}>
                                            수정
                                        </Button>
                                        <Button size="sm" variant="outline-danger" onClick={() => console.log("삭제 클릭", /* u.id */)}>
                                            삭제
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                    </tbody>
                </Table>
            </div>
        </Container>
    );
}
export default App;