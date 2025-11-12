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
        aScore: 0, asScore: 0, tScore: 0, ftScore: 0, totalScore: 0, lectureGrade: 0
    });
    const [updatedAttendance, setUpdatedAttendance] = useState({ newStatus: "" });
    const [activeTab, setActiveTab] = useState("GRADE");
    const [modalMode, setModalMode] = useState("view"); // view / approve

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

    const handleAttendanceChange = (e) => {
        setUpdatedAttendance({ newStatus: e.target.value });
    };

    // ✅ 승인 클릭 시: appealType에 따라 분기
    const handleApproveClick = async (appeal) => {
        setSelectedAppeal(appeal);
        setModalMode("approve");
        setShowModal(true);

        try {
            // 학생의 기존 성적 불러오기
            const res = await axios.get(`${API_BASE_URL}/api/appeals/grades/one`, {
                params: { userId: appeal.sendingId, lectureId: appeal.lectureId }
            });

            if (res.data) {
                const data = res.data;
                const { totalScore, lectureGrade } = calculateTotalAndGrade({
                    aScore: data.aScore || 0,
                    asScore: data.asScore || 0,
                    tScore: data.tScore || 0,
                    ftScore: data.ftScore || 0
                });
                setUpdatedScores({
                    aScore: data.aScore || 0,
                    asScore: data.asScore || 0,
                    tScore: data.tScore || 0,
                    ftScore: data.ftScore || 0,
                    totalScore,
                    lectureGrade
                });
            } else {
                setUpdatedScores({
                    aScore: 0,
                    asScore: 0,
                    tScore: 0,
                    ftScore: 0,
                    totalScore: 0,
                    lectureGrade: 0
                });
            }
        } catch (err) {
            console.error("학생 성적 조회 실패:", err);
        }
    };

    const rejectAppeal = (appealId) => {
        axios.put(`${API_BASE_URL}/api/appeals/${appealId}/reject`, { receiverId: user.id })
            .then(() => fetchAppeals())
            .catch(err => console.error(err));
    };

    // ✅ async/await 기반으로 수정한 승인 처리
    const handleApproveSubmit = async () => {
        if (!selectedAppeal) return;

        try {
            const appealType = selectedAppeal.appealType;

            // 1️⃣ 성적 이의제기인 경우
            if (appealType === "GRADE") {
                await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateScores`, {
                    ...updatedScores,
                    sendingId: selectedAppeal.sendingId,
                    receiverId: user.id,
                    lectureId
                });
            }
            // 2️⃣ 출결 이의제기인 경우
            else if (appealType === "ATTENDANCE") {
                await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateStatus`, {
                    newStatus: updatedAttendance.newStatus,
                    sendingId: selectedAppeal.sendingId,
                    receiverId: user.id,
                    lectureId
                });
            }

            // 3️⃣ 승인 처리
            await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/approve`, {
                receiverId: user.id
            });

            setShowModal(false);
            fetchAppeals();
        } catch (err) {
            console.error("승인 처리 중 오류:", err);
        }
    };

    const getAttendanceTypeLabel = (types) => {
        if (!types) return "";
        const uniqueTypes = Array.isArray(types) ? [...new Set(types)] : [types];
        return uniqueTypes.map(t => ATTENDANCE_LABELS[t] || t).join(", ");
    };

    return (
        <Container style={{ marginTop: 24 }}>
            {/* ... (중간 부분 동일) ... */}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalMode === "approve"
                            ? (selectedAppeal?.appealType === "ATTENDANCE" ? "출결 상태 수정 및 승인" : "성적 수정 및 승인")
                            : "이의제기 상세보기"}
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
                                </>
                            )}

                            {modalMode === "approve" && selectedAppeal.appealType !== "ATTENDANCE" && (
                                <>
                                    {["aScore", "asScore", "tScore", "ftScore"].map((key) => (
                                        <Form.Group className="mb-2" key={key}>
                                            <Form.Label>{key}</Form.Label>
                                            <Form.Control type="number" name={key} value={updatedScores[key]} onChange={handleScoreChange} />
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

                            {modalMode === "approve" && selectedAppeal.appealType === "ATTENDANCE" && (
                                <>
                                    <Form.Group className="mb-2">
                                        <Form.Label>현재 출결 상태</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={getAttendanceTypeLabel(selectedAppeal.attendanceType)}
                                            disabled
                                        />
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
