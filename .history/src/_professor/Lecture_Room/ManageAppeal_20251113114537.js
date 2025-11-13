import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Form, Button, Modal, Nav } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../public/config/config";
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
    const [updatedAttendance, setUpdatedAttendance] = useState({ newStatus: "" });

    // 서버에서 강의 이의제기 목록 조회
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

    // 모달 열기
    const openModal = (appeal, mode) => {
        if (appeal.appealType === "ATTENDANCE") {
            // Attendance_records에서 출결일/상태 가져오기
            const attendanceDate = appeal.attendanceDate || "";
            const attendStatus = appeal.attendStatus || "";

            setSelectedAppeal({ ...appeal, attendanceDate, attendStatus });
            setUpdatedAttendance({ newStatus: attendStatus });
            setModalMode(mode === "approve" ? "attApprove" : "attView");
        } else {
            // 성적 이의제기
            setSelectedAppeal({ ...appeal });
            setModalMode(mode === "approve" ? "gradeApprove" : "gradeView");
        }
    };

    const handleAttendanceChange = (e) => {
        setUpdatedAttendance({ newStatus: e.target.value });
    };

    const handleApproveSubmit = async () => {
        if (!selectedAppeal) return;
        try {
            if (selectedAppeal.appealType === "ATTENDANCE") {
                // 출결 상태 업데이트
                await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateStatus`, {
                    attendStudent: updatedAttendance.newStatus,
                    sendingId: selectedAppeal.sendingId,
                    receiverId: user.id,
                    lectureId
                });
            }
            // 승인 처리
            await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/approve`, { receiverId: user.id });
            setModalMode("");
            fetchAppeals();
        } catch (err) {
            console.error(err);
        }
    };

    const rejectAppeal = (appealId) => {
        axios.put(`${API_BASE_URL}/api/appeals/${appealId}/reject`, { receiverId: user.id })
            .then(() => fetchAppeals())
            .catch(err => console.error(err));
    };

    const getAttendanceTypeLabel = (status) => ATTENDANCE_LABELS[status] || status || "";

    return (
        <Container style={{ marginTop: 24 }}>
            {/* 검색 + 탭 */}
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
                                <td><Button variant="link" className="p-0" onClick={() => openModal(a, "view")}>{a.title}</Button></td>
                                <td>{a.appealDate}</td>
                                <td>{STATUS_MAP[a.status]}</td>
                                <td>
                                    <Button size="sm" variant="success" onClick={() => openModal(a, "approve")} disabled={a.status !== "PENDING"}>승인</Button>{" "}
                                    <Button size="sm" variant="danger" onClick={() => rejectAppeal(a.appealId)} disabled={a.status !== "PENDING"}>반려</Button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="6" className="text-center text-muted">처리할 이의제기가 없습니다.</td></tr>}
                    </tbody>
                </Table>
            </div>

            {/* 출결 모달 */}
            {["attView", "attApprove"].includes(modalMode) && selectedAppeal && (
                <Modal show onHide={() => setModalMode("")} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{modalMode === "attApprove" ? "출결 상태 수정 및 승인" : "출결 이의제기 상세"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-2">
                            <Form.Label>강의일</Form.Label>
                            <Form.Control type="text" value={selectedAppeal.attendanceDate || ""} disabled />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>현재 출결 상태</Form.Label>
                            <Form.Control type="text" value={getAttendanceTypeLabel(selectedAppeal.attendStatus)} disabled />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>학생 신청 내용</Form.Label>
                            <Form.Control as="textarea" rows={3} value={selectedAppeal.content || ""} disabled />
                        </Form.Group>

                        {modalMode === "attApprove" &&
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
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        {modalMode === "attApprove" && <Button variant="success" onClick={handleApproveSubmit}>승인 및 저장</Button>}
                        <Button variant="secondary" onClick={() => setModalMode("")}>닫기</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Container>
    );
}

export default ManageAppeal;
