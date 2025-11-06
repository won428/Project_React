import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { API_BASE_URL } from "../../../public/config/config";
import { useAuth } from "../../../public/context/UserContext";

function CreditAppealList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appealList, setAppealList] = useState([]);

    useEffect(() => {
        if (!user?.id) return;
        axios.get(`${API_BASE_URL}/api/appeals/mylist`, { params: { id: user.id } })
            .then(res => setAppealList(res.data))
            .catch(err => console.error(err));
    }, [user]);

    const statusMap = {
        PENDING: "처리중",
        APPROVED: "승인",
        REJECTED: "거부",
    };

    const handleAdd = () => {
        navigate('/CreditAppeal/${');
    };

    

    return (
        <Container fluid className="py-4">
            <Row className="align-items-center mb-3">
                <Col md={6}>
                    <h4 className="mb-0">나의 이의신청 리스트</h4>
                    <div className="text-muted small">성적 이의신청 내역 조회</div>
                </Col>
                <Col md={6} className="text-end">
                    <Button variant="primary" onClick={handleAdd}>
                        이의신청하기
                    </Button>
                </Col>
            </Row>

            <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
                <Table bordered hover size="sm" className="align-middle w-100">
                    <thead style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>
                        <tr>
                            <th style={{ width: 200 }}>강의명</th>
                            <th style={{ width: 400 }}>이의 사유</th>
                            <th style={{ width: 120 }}>신청일</th>
                            <th style={{ width: 120 }}>처리상태</th>
                        </tr>
                    </thead>

                    <tbody>
                        {appealList.length > 0 ? (
                            appealList.map((appeal) => (
                                <tr key={appeal.appealId}>
                                    <td
                                        style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}                                    
                                    >
                                        {appeal.lectureName}
                                    </td>
                                    <td>{appeal.content}</td>
                                    <td>{appeal.appealDate}</td>
                                    <td>{statusMap[appeal.status]}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center text-muted">
                                    이의신청 내역이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </Container>
    );
}

export default CreditAppealList;
