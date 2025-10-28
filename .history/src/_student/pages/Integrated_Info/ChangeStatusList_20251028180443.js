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


    useEffect(() => {
        const url = `${API_BASE_URL}/api/student/record/my`;

        axios
            .get(url, {
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
                        {applyList.map((record) => (
                            <tr key={record.recordId}>
                                <td>{record.title}??'제목'</td>
                                <td>{record.appliedDate}?'신청일'</td>
                                <td>{record.processedDate}?'처리일'</td>
                                <td>{record.studentStatus}?'변경 신청 학적'</td>
                                <td>
                                    {record.status}?'처리상태'
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