import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Form, Button, Modal, Nav } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import axios from "axios";
import { useAuth } from "../../public/context/UserContext";
import { useNavigate, useParams } from "react-router-dom";

function ManageAppeal() {
    const { user } = useAuth();
    const { lectureId } = useParams();
    const navigate = useNavigate();

    const STATUS_MAP = { PENDING: "처리중", APPROVED: "승인", REJECTED: "반려" };
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
    const [activeTab, setActiveTab] = useState("GRADE");
    const [modalMode, setModalMode] = useState(""); // "gradeView" | "gradeApprove" | "attView" | "attApprove"
    const [updatedScores, setUpdatedScores] = useState({ ascore: 0, asScore: 0, tscore: 0, ftScore: 0, totalScore: 0, lectureGrade: 0 });
    const [updatedAttendance, setUpdatedAttendance] = useState({ newStatus: "" });

    const fetchAppeals = () => {
        if (!lectureId || !user?.id) return;
        axios.get(`${API_BASE_URL}/api/appeals/lectureAppeals/${lectureId}`, { params: { receiverId: user.id } })
            .then(res => {
                setAppeals(res.data);
            })
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
        const nameMatch = searchName ? a.studentName?.toLowerCase().includes(searchName.toLowerCase()) : true;
        const codeMatch = searchCode ? a.studentId?.toString().includes(searchCode) : true;
        const tabMatch = activeTab === "GRADE"
            ? ["GRADE", "ASSIGNMENT", "MIDTERMEXAM", "FINALEXAM"].includes(a.appealType)
            : activeTab === "ATTENDANCE"
                ? a.appealType === "ATTENDANCE"
                : true;
        return nameMatch && codeMatch && tabMatch;
    });

    const openModal = (appeal, mode) => {
        if (appeal.appealType === "ATTENDANCE") {
            const attendanceDate = appeal.attendanceDate || "";
            const attendStatus = appeal.attendStudent || "";

            setSelectedAppeal({ ...appeal, attendanceDate, attendStatus });
            setUpdatedAttendance({ newStatus: attendStatus });

            setModalMode(mode === "approve" ? "attApprove" : "attView");
        } else {
            setSelectedAppeal({ ...appeal });
            setModalMode(mode === "approve" ? "gradeApprove" : "gradeView");
        }
    };

    const handleAttendanceChange = (e) => {
        setUpdatedAttendance({ newStatus: e.target.value });
    };

    const handleApproveClick = (appeal) => openModal(appeal, "approve");

    const rejectAppeal = (appealId) => {
        axios.put(`${API_BASE_URL}/api/appeals/${appealId}/reject`, { receiverId: user.id })
            .then(() => fetchAppeals())
            .catch(err => console.error(err));
    };

    const handleApproveSubmit = async () => {
        if (!selectedAppeal) return;
        try {
            if (selectedAppeal.appealType === "ATTENDANCE") {
                await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateStatus`, {
                    attendStudent: updatedAttendance.newStatus
                });
            } else {
                await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateScores`, {
                    ...updatedScores
                });
            }
            await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/approve`);
            setModalMode("");
            fetchAppeals();
        } catch (err) {
            console.error(err);
        }
    };

    const getAttendanceTypeLabel = (status) => ATTENDANCE_LABELS[status] || status || "";

    return (
        <Container style={{ marginTop: 24 }}>
            <Row className="mb-3">
                <Col md={6}><h4>학생 이의제기 처리</h4></Col>
                <Col md={6} className="d-flex flex-column align-items-end">
                    <Form.Control type="text" placeholder="학번 검색" value={searchCode} onChange={handleCodeChange} style={{ width: "200px", marginBottom: "4px" }} />
                    {codeError && <small className="text-danger mb-2">{codeError}</small>}
                    <Form.Control type="text" placeholder="이름 검색" value={searchName} onChange={handleNameChange} style={{ width: "200px" }} />
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
                        {filteredAppeals.length ? filteredAppeals.map(a => (
                            <tr key={a.appealId}>
                                <td>{a.studentName}</td>
                                <td>{a.studentId}</td>
                                <td><Button variant="link" className="p-0" onClick={() => openModal(a, "view")}>{a.title}</Button></td>
                                <td>{a.appealDate}</td>
                                <td>{STATUS_MAP[a.status]}</td>
                                <td>
                                    <Button size="sm" variant="success" onClick={() => handleApproveClick(a)} disabled={a.status !== "PENDING"}>승인</Button>{" "}
                                    <Button size="sm" variant="danger" onClick={() => rejectAppeal(a.appealId)} disabled={a.status !== "PENDING"}>반려</Button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="6" className="text-center text-muted">처리할 이의제기가 없습니다.</td></tr>}
                    </tbody>
                </Table>
            </div>

            {/* 🟩 모달 구조는 기존 그대로 유지, 컬럼명만 백엔드 DTO 기준으로 맞춤 */}
            {/* ATTENDANCE 모달도 selectedAppeal.attendanceDate, selectedAppeal.attendStudent 등으로 데이터 출력 */}
        </Container>
    );
}

export default ManageAppeal;
