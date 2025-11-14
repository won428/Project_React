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
    const [activeTab, setActiveTab] = useState("GRADE");
    const [modalMode, setModalMode] = useState(""); // "gradeView" | "gradeApprove" | "attView" | "attApprove"
    const [updatedScores, setUpdatedScores] = useState({
        ascore: 0, asScore: 0, tscore: 0, ftScore: 0, totalScore: 0, lectureGrade: 0
    });
    const [updatedAttendance, setUpdatedAttendance] = useState({ newStatus: "" });

    const downloadClick = (id) => {
        const url = `${API_BASE_URL}/api/appeals/files/download/${id}`
        axios
            .get(url, { responseType: 'blob' })
            .then((response) => {
                console.log(response.headers)
                const cd = response.headers['content-disposition'] || '';
                const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cd)?.[1];
                const quoted = /filename="([^"]+)"/i.exec(cd)?.[1];
                const filename = (utf8 && decodeURIComponent(utf8)) || quoted || `file-${id}`;

                const blob = new Blob(
                    [response.data],
                    {
                        type: response.headers['content-type'] || 'application/octet-stream',
                    }
                );

                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(a.href);
            })
            .catch((err) => {
                console.error(err.response?.data);
                alert('오류');
            })
    }

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

    const openModal = async (appeal, mode) => {
        try {
            // attachments만 새로 가져오기
            const attachRes = await axios.get(`${API_BASE_URL}/api/appeals/${appeal.appealId}/attachments`);
            const attachments = attachRes.data || [];

            if (appeal.appealType === "ATTENDANCE") {
                const attRes = await axios.get(`${API_BASE_URL}/api/appeals/attendance/${appeal.appealId}`);
                const data = attRes.data;

                const attendance = {
                    attendanceDate: data.attendanceDate ?? data.date ?? "",
                    attendStudent: data.attendStudent ?? data.status ?? ""
                };

                const rawContent = appeal.content ?? ""; // appeal.content 유지
                const studentContent = rawContent.replace(/\[[^\]]*\]/g, "").trim();

                setSelectedAppeal({
                    ...appeal, // 기존 content, title, studentName 등 유지
                    ...attendance,
                    content: studentContent,
                    attachments
                });
                setUpdatedAttendance({ newStatus: attendance.attendStudent });
                setModalMode(mode === "approve" ? "attApprove" : "attView");
            } else {
                const { totalScore, lectureGrade } = calculateTotalAndGrade(appeal);
                setSelectedAppeal({
                    ...appeal,
                    totalScore,
                    lectureGrade,
                    attachments
                });
                setUpdatedScores({ ...appeal, totalScore, lectureGrade });
                setModalMode(mode === "approve" ? "gradeApprove" : "gradeView");
            }
        } catch (err) {
            console.error("모달 열기 오류:", err);
            alert("이의제기 정보를 불러오지 못했습니다.");
        }
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
        console.log(e.target.value)
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
                await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateStatus`, null,{params:{
                    newStatus: updatedAttendance.newStatus,
                    attendanceDate: selectedAppeal.attendanceDate,
                    sendingId: selectedAppeal.sendingId,
                    receiverId: user.id,
                    lectureId : lectureId
                    stat
                }
                    
                });
            } else {
                await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateScores`, {
                    ...updatedScores,
                    sendingId: selectedAppeal.sendingId,
                    receiverId: user.id,
                    lectureId
                });
            }
            await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/approve`, { receiverId: user.id });
            setModalMode("");
            fetchAppeals();
        } catch (err) {
            console.error(err);
        }
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
                                    <Button size="sm" variant="success" onClick={() => handleApproveClick(a)} disabled={a.status !== "PENDING"}>승인</Button>{" "}
                                    <Button size="sm" variant="danger" onClick={() => rejectAppeal(a.appealId)} disabled={a.status !== "PENDING"}>반려</Button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="6" className="text-center text-muted">처리할 이의제기가 없습니다.</td></tr>}
                    </tbody>
                </Table>
            </div>

            {/* 모달 */}
            {modalMode && selectedAppeal && (
                <Modal show onHide={() => setModalMode("")} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {modalMode.includes("grade") ? "성적 이의제기" : "출결 이의제기"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedAppeal.appealType === "ATTENDANCE" ? (
                            <>
                                <Form.Group className="mb-2">
                                    <Form.Label>강의일</Form.Label>
                                    <Form.Control type="text" value={selectedAppeal.attendanceDate || ""} disabled />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>현재 출결 상태</Form.Label>
                                    <Form.Control type="text" value={getAttendanceTypeLabel(selectedAppeal.attendStudent)} disabled />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Label>학생 신청 내용</Form.Label>
                                    <Form.Control as="textarea" rows={3} value={selectedAppeal.content || ""} disabled />
                                </Form.Group>
                                {modalMode === "attApprove" && (
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
                                )}
                            </>
                        ) : (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>이의제기 제목</Form.Label>
                                    <Form.Control type="text" value={selectedAppeal.title || ""} disabled />
                                </Form.Group>
                                <Table bordered size="sm" className="mb-3 text-center">
                                    <thead>
                                        <tr>
                                            <th>출석 점수</th>
                                            <th>과제 점수</th>
                                            <th>중간 점수</th>
                                            <th>기말 점수</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{modalMode === "gradeApprove" ?
                                                <Form.Control type="text" name="ascore" value={updatedScores.ascore ?? ""} onChange={handleScoreChange} />
                                                : selectedAppeal.ascore ?? ""}
                                            </td>
                                            <td>{modalMode === "gradeApprove" ?
                                                <Form.Control type="text" name="asScore" value={updatedScores.asScore ?? ""} onChange={handleScoreChange} />
                                                : selectedAppeal.asScore ?? ""}
                                            </td>
                                            <td>{modalMode === "gradeApprove" ?
                                                <Form.Control type="text" name="tscore" value={updatedScores.tscore ?? ""} onChange={handleScoreChange} />
                                                : selectedAppeal.tscore ?? ""}
                                            </td>
                                            <td>{modalMode === "gradeApprove" ?
                                                <Form.Control type="text" name="ftScore" value={updatedScores.ftScore ?? ""} onChange={handleScoreChange} />
                                                : selectedAppeal.ftScore ?? ""}
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                                <Row className="mb-3">
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>총점</Form.Label>
                                            <Form.Control type="number" value={updatedScores.totalScore ?? selectedAppeal.totalScore ?? ""} disabled />
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group>
                                            <Form.Label>환산 학점</Form.Label>
                                            <Form.Control type="number" value={updatedScores.lectureGrade ?? selectedAppeal.lectureGrade ?? ""} disabled />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-2">
                                    <Form.Label>이의제기 내용</Form.Label>
                                    <Form.Control as="textarea" rows={3} value={selectedAppeal.content || ""} disabled />
                                </Form.Group>
                            </>
                        )}
                        {/* 첨부파일 다운로드: 맨 아래로 이동 */}
                        <div className="mt-3">
                            <div className="text-muted small mb-2">첨부파일</div>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="text-muted w-100">
                                    <ul className="mb-0 w-100">
                                        {selectedAppeal?.attachments?.length > 0 ? (
                                            selectedAppeal.attachments.map(file => (
                                                <li key={file.id} className="mb-1">
                                                    <div className="d-flex align-items-center w-100">
                                                        <span className="text-truncate me-2 flex-grow-1">{file.name}</span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline-secondary"
                                                            className="ms-auto flex-shrink-0"
                                                            onClick={() => downloadClick(file.id)}
                                                        >
                                                            다운로드
                                                        </Button>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-muted">첨부된 파일이 없습니다.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        {modalMode.includes("Approve") && <Button variant="success" onClick={handleApproveSubmit}>승인 및 저장</Button>}
                        <Button variant="secondary" onClick={() => setModalMode("")}>닫기</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </Container>
    );
}

export default ManageAppeal;
