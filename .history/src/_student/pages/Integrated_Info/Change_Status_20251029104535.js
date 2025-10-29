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
        <Container fluid className="py-4" style={{ maxWidth: "100%" }}>
            <Row className="align-items-center mb-3">
                <Col md={6}>
                    <h4 className="mb-0">학적 변경 신청 </h4>

                </Col>

            </Row>


            <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
                <Form.Select
                    name="studentStatus"
                    value={studentStatus}
                    onChange={(e) => setStudentStatus(e.target.value)}
                    required
                >
                    {Object.entries(typeMap).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </Form.Select>
            </div>
        </Container>
    );
}
export default App;