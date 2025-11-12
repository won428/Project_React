import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Form, Button, Modal, Nav } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import axios from "axios";
import { useAuth } from "../../public/context/UserContext";
import { useNavigate, useParams } from "react-router-dom";
import AttendanceAppeal from "../path/to/AttendanceAppeal"; // 경로 맞춤

function ManageAppeal() {
    const { user } = useAuth();
    const { lectureId } = useParams();
    const navigate = useNavigate();

    const STATUS_MAP = { PENDING: "처리중", APPROVED: "승인", REJECTED: "반려" };
    const WEIGHTS = { ascore: 20, asScore: 20, tscore: 30, ftScore: 30 };
    const ATTENDANCE_LABELS = {
        MEDICAL_PROBLEM: "병결",
        EARLY_LEAVE: "조퇴",
        LATE: "지각",
        ABSENT: "결석",
        PRESENT: "출석",
        EXCUSED: "공결"
    };

    const [appeals, setAppeals] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [codeError, setCodeError] = useState("");
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updatedScores, setUpdatedScores] = useState({
        ascore: 0, asScore: 0, tscore: 0, ftScore: 0, totalScore: 0, lectureGrade: 0
    });
    const [updatedAttendance, setUpdatedAttendance] = useState({ newStatus: "" });
    const [activeTab, setActiveTab] = useState("GRADE");
    const [modalMode, setModalMode] = useState("view"); // view / approve

    const calculateTotalAndGrade = ({ ascore, asScore, tscore, ftScore }) => {
        const att = Math.max(0, Math.min(ascore || 0, WEIGHTS.ascore));
        const as = Math.max(0, Math.min(asScore || 0, WEIGHTS.asScore));
        const mid = Math.max(0, Math.min(tscore || 0, WEIGHTS.tscore));
        const fin = Math.max(0, Math.min(ftScore || 0, WEIGHTS.ftScore));
        const totalPoints = att + as + mid + fin;
        const maxPoints = WEIGHTS.ascore + WEIGHTS.asScore + WEIGHTS.tscore + WEIGHTS.ftScore;
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
            ascore: appeal.ascore || 0,
            asScore: appeal.asScore || 0,
            tscore: appeal.tscore || 0,
            ftScore: appeal.ftScore || 0
        });
        setSelectedAppeal(appeal);
        setUpdatedScores({ ascore: appeal.ascore || 0, asScore: appeal.asScore || 0, tscore: appeal.tscore || 0, ftScore: appeal.ftScore || 0, totalScore, lectureGrade });
        setModalMode(mode);
        setShowModal(true);
    };

    const handleScoreChange = (e) => {
        const { name, value } = e.target;
        if (value === "" || /^\d+$/.test(value)) {
            const numValue = value === "" ? 0 : Number(value);
            const newScores = { ...updatedScores, [name]: numValue };
            const { totalScore, lectureGrade } = calculateTotalAndGrade(newScores);
            setUpdatedScores({ ...newScores, totalScore, lectureGrade });
        }
    };

    const handleAttendanceChange = (e) => {
        setUpdatedAttendance({ newStatus: e.target.value });
    };

    const handleApproveSubmit = async () => {
        if (!selectedAppeal) return;
        try {
            if (selectedAppeal.appealType !== "ATTENDANCE") {
                await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateScores`, {
                    ...updatedScores,
                    sendingId: selectedAppeal.sendingId,
                    receiverId: user.id,
                    lectureId
                });
            } else {
                await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateStatus`, {
                    newStatus: updatedAttendance.newStatus,
                    sendingId: selectedAppeal.sendingId,
                    receiverId: user.id,
                    lectureId
                });
            }
            await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/approve`, { receiverId: user.id });
            setShowModal(false);
            fetchAppeals();
        } catch (err) {
            console.error(err);
        }
    };

    const getAttendanceTypeLabel = (types) => {
        if (!types) return "";
        const uniqueTypes = Array.isArray(types) ? [...new Set(types)] : [types];
        return uniqueTypes.map(t => ATTENDANCE_LABELS[t] || t).join(", ");
    };

    return (
        <Container style={{ marginTop: 24 }}>
            {/* 검색 + 탭 */}
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

            {/* 테이블 */}
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
                        {filteredAppeals.length ? filteredAppeals.map(a => (
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
                                        onClick={() => openModal(a, "approve")}
                                        disabled={a.status !== "PENDING"}
                                    >
                                        승인
                                    </Button>{" "}
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => axios.put(`${API_BASE_URL}/api/appeals/${a.appealId}/reject`, { receiverId: user.id }).then(fetchAppeals)}
                                        disabled={a.status !== "PENDING"}
                                    >
                                        반려
                                    </Button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="6" className="text-center text-muted">처리할 이의제기가 없습니다.</td></tr>}
                    </tbody>
                </Table>
            </div>

            {/* 모달 */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalMode === "approve"
                            ? (selectedAppeal?.appealType === "ATTENDANCE" ? "출결 상태 수정 및 승인" : "성적 수정 및 승인")
                            : "출결 이의제기 상세보기"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppeal && (
                        <>
                            {/* 🔹 학생 출결 이의제기 폼 읽기 전용 */}
                            {modalMode === "view" && selectedAppeal.appealType === "ATTENDANCE" && (
                                <AttendanceAppeal
                                    readOnly={true}
                                    appealData={{
                                        lectureId: selectedAppeal.lectureId,
                                        lectureName: selectedAppeal.lectureName,
                                        professorId: selectedAppeal.receiverId,
                                        professorName: selectedAppeal.professorName,
                                        sendingId: selectedAppeal.sendingId,
                                        attendanceType: selectedAppeal.attendanceType,
                                        attendanceDetail: selectedAppeal.attendanceDetail,
                                        lectureDate: selectedAppeal.lectureDate,
                                        title: selectedAppeal.title,
                                        content: selectedAppeal.content,
                                        status: selectedAppeal.status
                                    }}
                                />
                            )}

                            {/* 승인 모드 */}
                            {modalMode === "approve" && selectedAppeal.appealType === "ATTENDANCE" && (
                                <>
                                    <Form.Group className="mb-2">
                                        <Form.Label>학생 이름</Form.Label>
                                        <Form.Control type="text" value={selectedAppeal.studentName} disabled />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>현재 출결 상태</Form.Label>
                                        <Form.Control type="text" value={getAttendanceTypeLabel(selectedAppeal.attendanceType)} disabled />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>변경할 출결 상태</Form.Label>
                                        <Form.Select value={updatedAttendance.newStatus} onChange={handleAttendanceChange}>
                                            <option value="">상태 선택</option>
                                            <option value="PRESENT">출석</option>
                                            <option value="LATE">지각</option>
                                            <option value="EARLY_LEAVE">조퇴</option>
                                            <option value="ABSENT">결석</option>
                                            <option value="EXCUSED">공결</option>
                                        </Form.Select>
                                    </Form.Group>
                                </>
                            )}

                            {/* 성적 이의제기 승인 모드 */}
                            {modalMode === "approve" && selectedAppeal.appealType !== "ATTENDANCE" && (
                                <>
                                    <Form.Group className="mb-2">
                                        <Form.Label>학생 이름</Form.Label>
                                        <Form.Control type="text" value={selectedAppeal.studentName} disabled />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>학번</Form.Label>
                                        <Form.Control type="text" value={selectedAppeal.studentCode} disabled />
                                    </Form.Group>
                                    {["ascore", "asScore", "tscore", "ftScore"].map(k => (
                                        <Form.Group key={k} className="mb-2">
                                            <Form.Label>{k}</Form.Label>
                                            <Form.Control type="text" name={k} value={updatedScores[k]} onChange={handleScoreChange} />
                                        </Form.Group>
                                    ))}
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

export default ManageAppeal;
