import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Form, Button, Modal, Nav } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import axios from "axios";
import { useAuth } from "../../public/context/UserContext";
import { useNavigate, useParams } from "react-router-dom";

function App() {
    const { user } = useAuth();
    const { lectureId } = useParams();
    const navigate = useNavigate();

    const STATUS_MAP = { PENDING: "처리중", APPROVED: "승인", REJECTED: "반려" };
    const [appeals, setAppeals] = useState([]);
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updatedScores, setUpdatedScores] = useState({
        aScore: 0, asScore: 0, tScore: 0, ftScore: 0, totalScore: 0, lectureGrade: 0
    });

    const [activeTab, setActiveTab] = useState("GRADE"); // 기본 성적 탭

    const fetchAppeals = () => {
        if (!lectureId || !user?.id) return;
        axios.get(`${API_BASE_URL}/api/appeals/lectureAppeals/${lectureId}`, { params: { receiverId: user.id } })
            .then(res => setAppeals(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => { fetchAppeals(); }, [lectureId, user]);

    const filteredAppeals = appeals.filter(a => {
        if (activeTab === "GRADE") {
            return ["GRADE", "ASSIGNMENT", "MIDTERMEXAM", "FINALEXAM"].includes(a.appealType);
        } else if (activeTab === "ATTENDANCE") {
            return a.appealType === "ATTENDANCE";
        }
        return false;
    });

    // 기존 openModal, handleScoreChange, approveAppealDirect, rejectAppeal, saveAppeal 동일
    // 생략…

    return (
        <Container style={{ marginTop: 24 }}>
            <Row className="mb-3">
                <Col md={6}><h4>학생 이의제기 처리</h4></Col>
                <Col md={6} className="d-flex flex-column align-items-end">
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="GRADE">성적 이의제기</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="ATTENDANCE">출결 이의제기</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
            </Row>

            <div style={{ maxHeight: 500, overflowY: "auto" }}>
                <Table bordered hover size="sm" className="align-middle">
                    <thead style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>
                        <tr>
                            <th>학생 이름</th>
                            <th>학번</th>
                            <th>이의제기 사유</th>
                            <th>신청일</th>
                            <th>상태</th>
                            <th>처리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppeals.length ? filteredAppeals.map(a => (
                            <tr key={a.appealId}>
                                <td>{a.studentName}</td>
                                <td>{a.studentCode}</td>
                                <td>{a.title}</td>
                                <td>{a.appealDate}</td>
                                <td>{STATUS_MAP[a.status]}</td>
                                <td>
                                    <Button size="sm" variant="success" onClick={() => approveAppealDirect(a.appealId)} disabled={a.status !== "PENDING"}>승인</Button>{" "}
                                    <Button size="sm" variant="primary" onClick={() => openModal(a)} disabled={a.status !== "PENDING"}>수정</Button>{" "}
                                    <Button size="sm" variant="danger" onClick={() => rejectAppeal(a.appealId)} disabled={a.status !== "PENDING"}>반려</Button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-center text-muted">처리할 이의제기가 없습니다.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Modal 부분 동일 */}
        </Container>
    );
}

export default App;
