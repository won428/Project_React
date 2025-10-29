import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useAuth } from "../../../public/context/UserContext";

function App() {

    const [form, setForm] = useState({
        studentStatus: 'ON_LEAVE',
        title: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const url = `${API_BASE_URL}/api/student/record`;

        axios
            .post(url, {
                params: {
                    id: 3
                }
            })
            .then((response) => {
                setApplyList(response.data)
                console.log(response.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }, []);

    // localdate로 신청날짜 신청폼에 나오도록
    // 

    const typeMap = {
        ENROLLED: '재학',    // 재학
        ON_LEAVE: '휴학',    // 휴학
        REINSTATED: '복학',  // 복학
        EXPELLED:'퇴학',    // 퇴학(징계 제적)
        GRADUATED:'졸업',    // 졸업
        MILITARY_LEAVE:'군휴학', // 군 휴학
        MEDICAL_LEAVE:'병가' // 입원으로 인한 출석 인정 용도
  };

    return (
        <Container fluid className="py-4" style={{ maxWidth: "100%" }}>            
            <Row className="align-items-center mb-3">
                <Col md={6}>
                    <h4 className="mb-0">학적 변경 신청 </h4>
                    
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
                        {applyList.map((record) => (
                            <tr key={record.recordId}>
                                <td>{record.title}</td>
                                <td>{record.appliedDate}</td>
                                <td>{record.processedDate}</td>
                                <td>{typeMapTwo[record.studentStatus]}</td>
                                <td>
                                    {typeMap[record.status]}
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