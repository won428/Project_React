import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useAuth } from "../../../public/context/UserContext";

function App() {
    // useState를 뭐로 놔야 학적변경신청 폼에 적합한지 확인

    const today = new Date().toLocaleDateString('sv');

    const [form, setForm] = useState({
        userId: null,
        studentStatus: 'ON_LEAVE',
        title: '',
        content: '',
        appliedDate: today
    });

    


    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(s => ({ ...s, [name]: value }));
    };
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



    return (
        <Container fluid className="py-4" style={{ maxWidth: "100%" }}>
            <Row className="align-items-center mb-3">
                <Col md={6}>
                    <h4 className="mb-0">학적 변경 신청</h4>
                </Col>
            </Row>

            <Form.Select
                name="studentStatus"
                value={form.studentStatus}
                onChange={onChange}
                required
                style={{ width: '25%', fontSize: '0.875rem', padding: '0.25rem 0.5rem', marginBottom: '16px' }}
            >
                {Object.entries(typeMap).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </Form.Select>
            <Form.Group className="mb-3">
                <Form.Label>신청 내용</Form.Label>

                {/* 제목 */}
                <Form.Control
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    placeholder="제목을 입력하세요"
                    required
                    className="mb-2"
                />

                {/* 내용 */}
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
                <Button type="submit" variant="primary" >
                    신청 접수
                </Button>
                <Button type="button" variant="outline-secondary" onClick={() => navigate('/ChangeStatusList')}>
                    내 신청내역 보기
                </Button>
            </div>
        </Container>
    );
}
export default App;