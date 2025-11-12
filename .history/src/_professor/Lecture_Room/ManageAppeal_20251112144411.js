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
    const WEIGHTS = { aScore: 20, asScore: 20, tScore: 30, ftScore: 30 };

    const ATTENDANCE_LABELS = {
        MEDICAL_PROBLEM: "병결",
        EARLY_LEAVE: "조퇴",
        LATE: "지각",
        ABSENCE: "결석"
    };

    const [appeals, setAppeals] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [codeError, setCodeError] = useState("");
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updatedScores, setUpdatedScores] = useState({
        aScore: 0, asScore: 0, tScore: 0, ftScore: 0, totalScore: 0, lectureGrade: 0
    });
    const [activeTab, setActiveTab] = useState("GRADE");
    const [modalMode, setModalMode] = useState("view"); // view / edit / approve

    const calculateTotalAndGrade = ({ aScore, asScore, tScore, ftScore }) => {
        const att = Math.max(0, Math.min(aScore || 0, WEIGHTS.aScore));
        const as = Math.max(0, Math.min(asScore || 0, WEIGHTS.asScore));
        const mid = Math.max(0, Math.min(tScore || 0, WEIGHTS.tScore));
        const fin = Math.max(0, Math.min(ftScore || 0, WEIGHTS.ftScore));
        const totalPoints = att + as + mid + fin;
        const maxPoints = WEIGHTS.aScore + WEIGHTS.asScore + WEIGHTS.tScore + WEIGHTS.ftScore;
        const totalScore = Math.round((totalPoints / maxPoints * 100) * 100) / 100;
        const lectureGrade = Math.round((totalScore / 100 * 4.5) * 100) / 100;
        return { totalScore, lectureGrade };
    };

    const fetchAppeals = () => {
        if (!lectureId || !user?.id) return;
        axios.get(`${API_BASE_URL}/api/appeals/lectureAppeals/${lectureId}`, { params: { receiverId: user.id } })
            .then(res => setAppeals(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => { fetchAppeals(); }, [lectureId, user]);

    const handleCodeChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { setSearchCode(value); setCodeError(""); }
        else { setCodeError("학번만 입력해주세요"); }
    };
    const handleNameChange = (e) => setSearchName(e.target.value);

    const filteredAppeals = appeals.filter(a => {
        const nameMatch = searchName ? a.studentName.toLowerCase().includes(searchName.toLowerCase()) : true;
        const codeMatch = searchCode ? a.studentCode.includes(searchCode) : true;
        const tabMatch = activeTab === "GRADE"
            ? ["GRADE", "ASSIGNMENT", "MIDTERMEXAM", "FINALEXAM"].includes(a.appealType)
            : activeTab === "ATTENDANCE"
                ? a.appealType === "ATTENDANCE"
                : true;
        return nameMatch && codeMatch && tabMatch;
    });

    const openModal = (appeal, mode = "view") => {
        const { totalScore, lectureGrade } = calculateTotalAndGrade({
            aScore: appeal.aScore || 0,
            asScore: appeal.asScore || 0,
            tScore: appeal.tScore || 0,
            ftScore: appeal.ftScore || 0
        });
        setSelectedAppeal(appeal);
        setUpdatedScores({ aScore: appeal.aScore || 0, asScore: appeal.asScore || 0, tScore: appeal.tScore || 0, ftScore: appeal.ftScore || 0, totalScore, lectureGrade });
        setModalMode(mode);
        setShowModal(true);
    };

    const handleScoreChange = (e) => {
        const { name, value } = e.target;
        if (value === "" || /^\d+$/.test(value)) {
            const newScores = { ...updatedScores, [name]: value === "" ? 0 : parseInt(value) };
            const { totalScore, lectureGrade } = calculateTotalAndGrade(newScores);
            setUpdatedScores({ ...newScores, totalScore, lectureGrade });
        }
    };

    // ✅ 승인 클릭 시: 수정 가능한 모달 오픈
    const handleApproveClick = (appeal) => {
        setSelectedAppeal(appeal);
        const { totalScore, lectureGrade } = calculateTotalAndGrade({
            aScore: appeal.aScore || 0,
            asScore: appeal.asScore || 0,
            tScore: appeal.tScore || 0,
            ftScore: appeal.ftScore || 0
        });
        setUpdatedScores({ aScore: appeal.aScore || 0, asScore: appeal.asScore || 0, tScore: appeal.tScore || 0, ftScore: appeal.ftScore || 0, totalScore, lectureGrade });
        setModalMode("approve");
        setShowModal(true);
    };

    const rejectAppeal = (appealId) => {
        axios.put(`${API_BASE_URL}/api/appeals/${appealId}/reject`, { receiverId: user.id })
            .then(() => fetchAppeals())
            .catch(err => console.error(err));
    };

    // ✅ 점수 수정 + 승인 처리
    const handleApproveSubmit = () => {
        if (!selectedAppeal) return;
        axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateScores`, {
            aScore: updatedScores.aScore,
            asScore: updatedScores.asScore,
            tScore: updatedScores.tScore,
            ftScore: updatedScores.ftScore,
            totalScore: updatedScores.totalScore,
            lectureGrade: updatedScores.lectureGrade,
            sendingId: selectedAppeal.sendingId,
            receiverId: user.id,
            lectureId
        })
            .then(() => axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/approve`, { receiverId: user.id }))
            .then(() => { setShowModal(false); fetchAppeals(); })
            .catch(err => console.error(err));
    };

    const getAttendanceTypeLabel = (types) => {
        if (!types) return "";
        const uniqueTypes = Array.isArray(types) ? [...new Set(types)] : [types];
        return uniqueTypes.map(t => ATTENDANCE_LABELS[t] || t).join(", ");
    };

    return (
        <Container style={{ marginTop: 24 }}>
            <Row className="mb-3">
                <Col md={6}><h4>학생 이의제기 처리</h4></Col>
                <Col md={6} className="d-flex flex-column align-items-end">
                    <Form.Control
                        type="text"
                        placeholder="학번 검색"
                        value={searchCode}
                        onChange={handleCodeChange}
                        style={{ width: "200px", marginBottom: "4px" }}
                    />
                    {codeError && <small className="text-danger mb-2">{codeError}</small>}
                    <Form.Control
                        type="text"
                        placeholder="이름 검색"
                        value={searchName}
                        onChange={handleNameChange}
                        style={{ width: "200px" }}
                    />
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} style={{ marginTop: "8px" }}>
                        <Nav.Item><Nav.Link eventKey="GRADE">성적 이의제기</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="ATTENDANCE">출결 이의제기</Nav.Link></Nav.Item>
                    </Nav>
                </Col>
            </Row>

            <div style={{ maxHeight: 500, overflowY: "auto" }}>
                <Table bordered hover size="sm" className="align-middle">
                    <thead style={{ position: "sticky", top: 0, background: "#f8f9fa" }}>
                        <tr>
                            <th>학생 이름</th>
                            <th>학번</th>
                            <th>제목</th>
                            <th>신청일</th>
                            <th>상태</th>
                            <th>처리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppeals.length
                            ? filteredAppeals.map(a => (
                                <tr key={a.appealId}>
                                    <td>{a.studentName}</td>
                                    <td>{a.studentCode}</td>
                                    <td>
                                        <Button variant="link" className="p-0" onClick={() => openModal(a, "view")}>
                                            {a.title}
                                        </Button>
                                    </td>
                                    <td>{a.appealDate}</td>
                                    <td>{STATUS_MAP[a.status]}</td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="success"
                                            onClick={() => handleApproveClick(a)}
                                            disabled={a.status !== "PENDING"}
                                        >
                                            승인
                                        </Button>{" "}
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => rejectAppeal(a.appealId)}
                                            disabled={a.status !== "PENDING"}
                                        >
                                            반려
                                        </Button>
                                    </td>
                                </tr>
                            ))
                            : <tr><td colSpan="6" className="text-center text-muted">처리할 이의제기가 없습니다.</td></tr>
                        }
                    </tbody>
                </Table>
            </div>

            {/* ✅ 모달 구분: view / approve */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalMode === "approve" ? "성적 수정 및 승인" : "이의제기 상세보기"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppeal && (
                        <>
                            {modalMode === "view" && (
                                <>
                                    <Form.Group className="mb-2">
                                        <Form.Label>학생 신청 내용</Form.Label>
                                        <Form.Control as="textarea" rows={3} value={selectedAppeal.content || ""} disabled />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>첨부 파일</Form.Label>
                                        <div>
                                            {selectedAppeal?.files?.length > 0
                                                ? selectedAppeal.files.map((file, idx) => (
                                                    <div key={idx} className="d-flex align-items-center mb-1">
                                                        <span className="me-2">{file.originalName}</span>
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => window.open(`${API_BASE_URL}/uploads/${file.filename}`, "_blank")}
                                                        >
                                                            ↓
                                                        </Button>
                                                    </div>
                                                ))
                                                : <span className="text-muted">파일이 없습니다</span>}
                                        </div>
                                    </Form.Group>
                                </>
                            )}

                            {modalMode === "approve" && (
                                <>
                                    <Form.Group className="mb-2">
                                        <Form.Label>학생 이름</Form.Label>
                                        <Form.Control type="text" value={selectedAppeal.studentName} disabled />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>학번</Form.Label>
                                        <Form.Control type="text" value={selectedAppeal.studentCode} disabled />
                                    </Form.Group>

                                    <Form.Group className="mb-2">
                                        <Form.Label>출석 점수</Form.Label>
                                        <Form.Control type="number" name="aScore" value={updatedScores.aScore} onChange={handleScoreChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>과제 점수</Form.Label>
                                        <Form.Control type="number" name="asScore" value={updatedScores.asScore} onChange={handleScoreChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>중간고사 점수</Form.Label>
                                        <Form.Control type="number" name="tScore" value={updatedScores.tScore} onChange={handleScoreChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>기말고사 점수</Form.Label>
                                        <Form.Control type="number" name="ftScore" value={updatedScores.ftScore} onChange={handleScoreChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>총점</Form.Label>
                                        <Form.Control type="number" value={updatedScores.totalScore} disabled />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>환산 학점</Form.Label>
                                        <Form.Control type="number" value={updatedScores.lectureGrade} disabled />
                                    </Form.Group>
                                </>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {modalMode === "approve" && (
                        <Button variant="success" onClick={handleApproveSubmit}>
                            승인 및 저장
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => setShowModal(false)}>닫기</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default App;
