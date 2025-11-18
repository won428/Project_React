import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useAuth } from "../../../public/context/UserContext";

function App() {

    const [applyList, setApplyList] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();
    console.log(user);



    useEffect(() => {
        const url = `${API_BASE_URL}/api/student/record/my`;
        axios.get(url, { params: { id: user.id } })
            .then(res => setApplyList(res.data));
    }, [user]);
    console.log(user?.id);


    const typeMap = {
        PENDING: '처리중',   // 처리중(검토 대기)
        APPROVED: '승인',  // 승인
        REJECTED: '거부',  // 거부
    };

    const typeMapTwo = {
        ENROLLED: '재학',    // 재학
        ON_LEAVE: '휴학',    // 휴학
        REINSTATED: '복학',  // 복학
        EXPELLED: '퇴학',    // 퇴학(징계 제적)
        GRADUATED: '졸업',    // 졸업
        MILITARY_LEAVE: '군휴학', // 군 휴학
        MEDICAL_LEAVE: '병가' // 입원으로 인한 출석 인정 용도
    };

    const handleDelete = (recordId) => {
        const url = `${API_BASE_URL}/api/student/record/${recordId}`;
        axios.delete(url)
            .then(res => {
                console.log('삭제 성공:', res.data);
                // 삭제 후 리스트 갱신
                setApplyList(prevList => prevList.filter(record => record.recordId !== recordId));
            })
            .catch(err => {
                console.error('삭제 에러:', err);
            });
    };

    const handleEdit = (recordId) => {
        navigate(`/Change_Status?recordId=${recordId}`);
    };

    const handleView = (recordId) => {
        navigate(`/Change_Status?recordId=${recordId}&readonly=true`);
    };

    const handleAdd = () => {
        navigate('/Change_Status');  // 신규 신청 페이지로 이동 (recordId 없이)
    };

    return (
        <Container fluid className="py-4" style={{ maxWidth: "100%" }}>
            {/* 상단 타이틀 + 우측 등록 버튼 */}
            <Row className="align-items-center mb-3">
                <Col md={6}>
                    <h4 className="mb-0">학적 변경 신청 목록</h4>
                    <div className="text-muted small">엑셀 스타일 표 UI</div>
                </Col>
                <Col md={6} className="text-end">
                    <Button variant="primary" onClick={handleAdd}>학적변경신청</Button>
                </Col>

            </Row>

            {/* 표: 헤더 + 한 행(샘플) */}
            <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
                <Table bordered hover size="sm" className="align-middle w-100" style={{ tableLayout: "fixed" }}>
                    <thead style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
                        <tr>
                            <th style={{ width: '25%' }}>제목</th>
                            <th style={{ width: '15%' }}>신청일</th>
                            {/* <th style={{ width: '15%' }}>처리일</th> */}
                            <th style={{ width: '20%' }}>변경 신청 학적</th>
                            <th style={{ width: '40%' }}>처리상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applyList.map((record) => (
                            <tr key={record.recordId}>
                                <td
                                    style={{
                                        width: '25%',
                                        cursor: 'pointer',
                                        color: 'blue',
                                        textDecoration: 'underline',
                                    }}
                                    onClick={() => handleView(record.recordId)}
                                >
                                    {record.title}
                                </td>
                                <td style={{ width: '15%' }}>{record.appliedDate}</td>
                                <td style={{ width: '20%' }}>{typeMapTwo[record.studentStatus]}</td>
                                <td style={{ width: '40%' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            width: '100%',
                                        }}
                                    >
                                        <span style={{ flex: 1, textAlign: 'left' }}>{typeMap[record.status]}</span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                style={{ minWidth: 50 }}
                                                onClick={() => handleDelete(record.recordId)}
                                            >
                                                삭제
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                style={{ minWidth: 50 }}
                                                onClick={() => handleEdit(record.recordId)}
                                            >
                                                수정
                                            </Button>
                                        </div>
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