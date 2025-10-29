import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useAuth } from "../../../public/context/UserContext";

function App() {
    // useState를 뭐로 놔야 학적변경신청 폼에 적합한지 확인

    const [form, setForm] = useState({
        studentStatus: 'ON_LEAVE',
        title: '',
        content: ''
    });
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
                setForm(response.data)
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
        EXPELLED: '퇴학',    // 퇴학(징계 제적)
        GRADUATED: '졸업',    // 졸업
        MILITARY_LEAVE: '군휴학', // 군 휴학
        MEDICAL_LEAVE: '병가' // 입원으로 인한 출석 인정 용도
    };

    const [studentStatus, setStudentStatus] = useState('ON_LEAVE');

    return (
        <Container style={{ maxWidth: 720, marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>학적 변경 신청</h3>

            {notice && (
                <Alert variant="secondary" onClose={() => setNotice('')} dismissible>
                    {notice}
                </Alert>
            )}

            <Form onSubmit={onSubmit}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label>신청 목적</Form.Label>
                        <Form.Select
                            name="studentStatus"
                            value={form.studentStatus}
                            onChange={onChange}
                            required
                        >
                            {OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={6}>
                        <Form.Label>신청일</Form.Label>
                        <Form.Control
                            type="date"
                            name="appliedDate"
                            value={form.appliedDate}
                            readOnly
                        />
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>제목</Form.Label>
                    <Form.Control
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        placeholder="제목을 입력하세요"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>내용</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        name="content"
                        value={form.content}
                        onChange={onChange}
                        placeholder="신청 내용을 입력하세요"
                        required
                    />
                </Form.Group>

                <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? '제출 중...' : '신청 접수'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={loading}>
                        이전
                    </Button>
                    <Button type="button" variant="outline-secondary" onClick={() => navigate('/ChangeStatusList')} disabled={loading}>
                        내 신청내역 보기
                    </Button>
                </div>
            </Form>
        </Container>
    );
}
export default App;