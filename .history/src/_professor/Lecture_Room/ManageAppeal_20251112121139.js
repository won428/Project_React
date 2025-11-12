import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Form, Button, Modal } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import axios from "axios";
import { useAuth } from "../../public/context/UserContext";
import { useNavigate, useParams } from "react-router-dom";

function App() {
    const { user } = useAuth();
    const { lectureId } = useParams();
    const navigate = useNavigate();

    const STATUS_MAP = {
        PENDING: "처리중",
        APPROVED: "승인",
        REJECTED: "반려",
    };

    const WEIGHTS = {
        aScore: 20,   // 출석
        asScore: 20,  // 과제
        tScore: 30,   // 중간고사
        ftScore: 30,  // 기말고사
    };

    const [appeals, setAppeals] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [codeError, setCodeError] = useState("");
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updatedScores, setUpdatedScores] = useState({
        aScore: 0,
        asScore: 0,
        tScore: 0,
        ftScore: 0,
        totalScore: 0,
        lectureGrade: 0
    });

    // 🔹 총점/학점 계산 함수
    const calculateTotalAndGrade = ({ aScore, asScore, tScore, ftScore }) => {
        const att = Math.max(0, Math.min(aScore || 0, WEIGHTS.aScore));
        const as = Math.max(0, Math.min(asScore || 0, WEIGHTS.asScore));
        const mid = Math.max(0, Math.min(tScore || 0, WEIGHTS.tScore));
        const fin = Math.max(0, Math.min(ftScore || 0, WEIGHTS.ftScore));

        const totalPoints = att + as + mid + fin;
        const maxPoints = WEIGHTS.aScore + WEIGHTS.asScore + WEIGHTS.tScore + WEIGHTS.ftScore;

        const totalScore = Math.round((totalPoints / maxPoints * 100) * 100) / 100; // 0~100
        const lectureGrade = Math.round((totalScore / 100 * 4.5) * 100) / 100;     // 0~4.5

        return { totalScore, lectureGrade };
    };

    const fetchAppeals = () => {
        if (!lectureId || !user?.id) return;
        axios.get(`${API_BASE_URL}/api/appeals/lectureAppeals/${lectureId}`, { params: { receiverId: user.id } })
            .then(res => setAppeals(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchAppeals();
    }, [lectureId, user]);

    const handleCodeChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setSearchCode(value);
            setCodeError("");
        } else {
            setCodeError("학번만 입력해주세요");
        }
    };

    const handleNameChange = (e) => setSearchName(e.target.value);

    const filteredAppeals = appeals.filter(a => {
        const nameMatch = searchName ? a.studentName.toLowerCase().includes(searchName.toLowerCase()) : true;
        const codeMatch = searchCode ? a.studentCode.includes(searchCode) : true;
        return nameMatch && codeMatch;
    });

    // 🔹 Modal 열 때 점수/총점/학점 초기화
    const openModal = (appeal) => {
        const { totalScore, lectureGrade } = calculateTotalAndGrade({
            aScore: appeal.ascore || 0,
            asScore: appeal.asScore || 0,
            tScore: appeal.tscore || 0,
            ftScore: appeal.ftScore || 0
        });

        setSelectedAppeal(appeal);
        setUpdatedScores({
            aScore: appeal.ascore || 0,
            asScore: appeal.asScore || 0,
            tScore: appeal.tscore || 0,
            ftScore: appeal.ftScore || 0,
            totalScore,
            lectureGrade
        });
        setShowModal(true);
    };

    // 🔹 점수 변경 시 실시간 총점/학점 계산
    const handleScoreChange = (e) => {
        const { name, value } = e.target;
        if (value === "" || /^\d+$/.test(value)) {
            const newScores = { ...updatedScores, [name]: value === "" ? 0 : parseInt(value) };
            const { totalScore, lectureGrade } = calculateTotalAndGrade(newScores);
            setUpdatedScores({ ...newScores, totalScore, lectureGrade });
        }
    };

    const approveAppealDirect = (appealId) => {
        axios.put(`${API_BASE_URL}/api/appeals/${appealId}/approve`, { receiverId: user.id })
            .then(() => fetchAppeals())
            .catch(err => console.error(err));
    };

    const rejectAppeal = (appealId) => {
        axios.put(`${API_BASE_URL}/api/appeals/${appealId}/reject`, { receiverId: user.id })
            .then(() => fetchAppeals())
            .catch(err => console.error(err));
    };

    const saveUpdatedScores = () => {
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
            .then(() => {
                setShowModal(false);
                fetchAppeals();
            })
            .catch(err => console.error(err));
    };

    return (
        <Container style={{ marginTop: 24 }}>
            <Row className="mb-3">
                <Col md={6}>
                    <h4>학생 이의제기 처리</h4>
                </Col>
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
                                    <Button
                                        size="sm"
                                        variant="success"
                                        onClick={() => approveAppealDirect(a.appealId)}
                                        disabled={a.status !== "PENDING"}
                                    >승인</Button>{" "}
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => openModal(a)}
                                        disabled={a.status !== "PENDING"}
                                    >수정</Button>{" "}
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => rejectAppeal(a.appealId)}
                                        disabled={a.status !== "PENDING"}
                                    >반려</Button>
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

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>학생 성적표 수정</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppeal && (
                        <Form>
                            {selectedAppeal.appealType === "GRADE" ? (
                                // 성적 이의제기 폼
                                <>
                                    {["aScore", "asScore", "tScore", "ftScore"].map((field) => (
                                        <Form.Group className="mb-2" key={field}>
                                            <Form.Label>{field === "aScore" ? "출석 점수" :
                                                field === "asScore" ? "과제 점수" :
                                                    field === "tScore" ? "중간고사" : "기말고사"}</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name={field}
                                                value={updatedScores[field] === 0 ? "" : updatedScores[field]}
                                                onChange={handleScoreChange}
                                            />
                                        </Form.Group>
                                    ))}
                                    <Form.Group className="mb-2">
                                        <Form.Label>총점</Form.Label>
                                        <Form.Control type="number" value={updatedScores.totalScore} readOnly />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label>학점</Form.Label>
                                        <Form.Control type="number" value={updatedScores.lectureGrade} readOnly />
                                    </Form.Group>
                                </>
                            ) : (
                                // 출결 이의제기 폼
                                <>
                                    <Form.Group className="mb-2">
                                        <Form.Label>출결 내용</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={selectedAppeal.content || ""}
                                            readOnly
                                        />
                                    </Form.Group>
                                    {/* 필요하면 출결 상태 변경 옵션 추가 */}
                                    <Form.Group className="mb-2">
                                        <Form.Label>처리 결과</Form.Label>
                                        <Form.Select
                                            value={selectedAppeal.status}
                                            onChange={(e) =>
                                                setSelectedAppeal({ ...selectedAppeal, status: e.target.value })
                                            }
                                        >
                                            <option value="PENDING">처리중</option>
                                            <option value="APPROVED">승인</option>
                                            <option value="REJECTED">반려</option>
                                        </Form.Select>
                                    </Form.Group>
                                </>
                            )}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>닫기</Button>
                    <Button variant="primary" onClick={saveUpdatedScores}>저장</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default App;
