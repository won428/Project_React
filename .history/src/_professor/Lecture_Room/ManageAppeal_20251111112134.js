import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Form, Button, Modal } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import axios from "axios";
import { useAuth } from "../../public/context/UserContext";
import { useNavigate, useParams } from "react-router-dom";

function App() {
    const { user } = useAuth(); // 교수 로그인 정보
    const { lectureId } = useParams(); // LRoomPro에서 클릭된 강의 ID
    const navigate = useNavigate();

    const STATUS_MAP = {
        PENDING: "처리중",
        APPROVED: "승인",
        REJECTED: "반려",
    };

    const [appeals, setAppeals] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState(""); // 이름 or 학번
    const [selectedAppeal, setSelectedAppeal] = useState(null); // modal용
    const [showModal, setShowModal] = useState(false);
    const [updatedScores, setUpdatedScores] = useState({
        aScore: 0,
        asScore: 0,
        tScore: 0,
        ftScore: 0,
        totalScore: 0,
        lectureGrade: 0
    });

    // 학생 이의제기 목록 조회
    const fetchAppeals = () => {
        axios.get(`${API_BASE_URL}/api/appeals/lecture/${lectureId}`, { params: { receiverId: user.id } })
            .then(res => setAppeals(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        if (!user?.id || !lectureId) return;
        fetchAppeals();
    }, [lectureId, user]);

    // 학생 이름/학번 검색
    const filteredAppeals = appeals.filter(a => {
        if (!searchKeyword) return true;
        const keyword = searchKeyword.toLowerCase();
        return a.studentName.toLowerCase().includes(keyword) ||
            a.studentCode.toLowerCase().includes(keyword);
    });

    // Modal 열기 및 성적 불러오기
    const openModal = (appeal) => {
        setSelectedAppeal(appeal);
        setUpdatedScores({
            aScore: appeal.aScore || 0,
            asScore: appeal.asScore || 0,
            tScore: appeal.tScore || 0,
            ftScore: appeal.ftScore || 0,
            totalScore: appeal.totalScore || 0,
            lectureGrade: appeal.lectureGrade || 0
        });
        setShowModal(true);
    };

    // 점수 수정 input
    const handleScoreChange = (e) => {
        const { name, value } = e.target;
        setUpdatedScores(s => ({ ...s, [name]: Number(value) }));
    };

    // 승인 처리
    const approveAppeal = () => {
        if (!selectedAppeal) return;
        axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/approve`, updatedScores)
            .then(() => {
                setShowModal(false);
                fetchAppeals();
            })
            .catch(err => console.error(err));
    };

    // 반려 처리
    const rejectAppeal = (appealId) => {
        axios.put(`${API_BASE_URL}/api/appeals/${appealId}/reject`)
            .then(() => fetchAppeals())
            .catch(err => console.error(err));
    };

    return (
        <Container style={{ marginTop: 24 }}>
            <Row className="mb-3">
                <Col md={6}>
                    <h4>학생 성적 이의제기 처리</h4>
                </Col>
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="학생 이름 또는 학번으로 검색"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
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
                                <td>{a.content}</td>
                                <td>{a.appealDate}</td>
                                <td>{STATUS_MAP[a.status]}</td>
                                <td>
                                    <Button size="sm" variant="primary" onClick={() => openModal(a)} disabled={a.status !== "PENDING"}>승인/수정</Button>{" "}
                                    <Button size="sm" variant="danger" onClick={() => rejectAppeal(a.appealId)} disabled={a.status !== "PENDING"}>반려</Button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted">처리할 이의제기가 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Modal - 성적 확인 및 승인 */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>학생 성적표 수정</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppeal && (
                        <Form>
                            <Form.Group className="mb-2">
                                <Form.Label>출석 점수</Form.Label>
                                <Form.Control type="number" name="aScore" value={updatedScores.aScore} onChange={handleScoreChange} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>과제 점수</Form.Label>
                                <Form.Control type="number" name="asScore" value={updatedScores.asScore} onChange={handleScoreChange} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>중간고사</Form.Label>
                                <Form.Control type="number" name="tScore" value={updatedScores.tScore} onChange={handleScoreChange} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>기말고사</Form.Label>
                                <Form.Control type="number" name="ftScore" value={updatedScores.ftScore} onChange={handleScoreChange} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>총점</Form.Label>
                                <Form.Control type="number" name="totalScore" value={updatedScores.totalScore} onChange={handleScoreChange} />
                            </Form.Group>
                            <Form.Group className="mb-2">
                                <Form.Label>학점</Form.Label>
                                <Form.Control type="number" name="lectureGrade" value={updatedScores.lectureGrade} onChange={handleScoreChange} />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>닫기</Button>
                    <Button variant="primary" onClick={approveAppeal}>승인</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default App;