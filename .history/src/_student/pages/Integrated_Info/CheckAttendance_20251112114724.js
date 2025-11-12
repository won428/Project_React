import { useEffect, useRef, useState } from 'react';
import { Container, Form, Button, Row, Col, Table, Modal, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';
import { useAuth } from '../../../public/context/UserContext';

// 모달 컴포넌트
function AttendaceCheckForm({ show, onHide, onExited, loading, form, rows, onAppeal, onCheck }) {

    // 버튼 클릭 시 handleAppeal 호출
    const handleAppealClick = () => {
        const selectedRow = rows.find(r => r.checked);
        if (!selectedRow) return alert("이의제기할 강의차시를 선택하세요.");

        const attendanceCodeMap = {
            '출석': 'PRESENT',
            '지각': 'LATE',
            '결석': 'ABSENT',
            '조퇴': 'EARLY_LEAVE',
            '공결': 'EXCUSED'
        };

        const attendanceType = attendanceCodeMap[selectedRow.attendStudent] || 'ABSENT';

        onAppeal(form, selectedRow, attendanceType);
    }

    return (
        <Modal show={show} onHide={onHide} onExited={onExited} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>출결기록 상세조회</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="d-flex justify-content-center py-4">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <>
                        <div className="mb-3">
                            <div className="fw-semibold">{form.lectureName}</div>
                            <div className="d-flex align-items-center text-muted small">
                                <div>{form.professorName} · {form.majorName}</div>
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="ms-auto"
                                    onClick={handleAppealClick}
                                >
                                    이의제기
                                </Button>
                            </div>
                            <div className="mt-2">
                                <span className="fw-semibold">출결 점수:</span>{" "}
                                {form.score} / {form.total}
                            </div>
                        </div>

                        <Table bordered size="sm" className="mb-0">
                            <thead>
                                <tr>
                                    <th>선택</th>
                                    <th>강의차시</th>
                                    <th>강의일</th>
                                    <th>출결상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, idx) => (
                                    <tr key={r.lectureSession}>
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                checked={r.checked || false}
                                                disabled={rows.some(row => row.checked) && !r.checked}
                                                onChange={() => onCheck(idx)}
                                            />
                                        </td>
                                        <td>{r.lectureSession}</td>
                                        <td>{r.attendanceDate}</td>
                                        <td>{r.attendStudent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>닫기</Button>
            </Modal.Footer>
        </Modal>
    );
}

// 메인 페이지
function App() {
    const [lectureList, setLectureList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const userId = user?.id;

    const { state } = useLocation();
    const { id: paramId } = useParams();
    const navigate = useNavigate();

    const lectureId = (() => {
        if (typeof state === "number") return state;
        if (state && typeof state === "object" && "lectureId" in state) return state.lectureId;
        const n = Number(paramId);
        return Number.isFinite(n) ? n : undefined;
    })();

    const completionDivLabel = {
        MAJOR_REQUIRED: '전공 필수',
        MAJOR_ELECTIVE: '전공 선택',
        LIBERAL_REQUIRED: '교양 필수',
        LIBERAL_ELECTIVE: '교양 선택',
        GENERAL_ELECTIVE: '일반 선택',
    };

    const attendanceLabel = {
        PRESENT: '출석',
        LATE: '지각',
        ABSENT: '결석',
        EARLY_LEAVE: '조퇴',
        EXCUSED: '공결',
    };

    // 모달 상태
    const [modalForm, setModalForm] = useState({
        lectureName: "",
        professorName: "",
        majorName: "",
        score: 0,
        total: 0,
        lectureId: null
    });
    const [attendanceRows, setAttendanceRows] = useState([]);
    const [show, setShow] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // 모달 열기
    const openModal = async (row) => {
        setShow(true);
        setModalLoading(true);
        try {
            const [summaryRes, detailRes, gwRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/attendance/selectById/${row.lectureId}`, { params: { userId } }),
                axios.get(`${API_BASE_URL}/attendance/selectAllAttendance/${row.enrollmentId}`, { params: { userId } }),
                axios.get(`${API_BASE_URL}/gradingWeights/selectAll/${row.lectureId}`)
            ]);

            const summary = summaryRes.data ?? {};
            const details = Array.isArray(detailRes.data) ? detailRes.data : [];
            const grWeights = gwRes.data ?? {};

            setModalForm({
                lectureId: row.lectureId,
                lectureName: row.lectureName ?? "",
                professorName: row.userName ?? "",
                majorName: row.majorName ?? "",
                score: summary.score ?? 0,
                total: grWeights.attendanceScore ?? 0,
            });

            setAttendanceRows(details.map((d, idx) => ({
                lectureSession: idx + 1,
                attendanceDate: d.attendanceDate,
                attendStudent: attendanceLabel[d.attendStudent],
                checked: false
            })));
        } catch (err) {
            console.error(err);
            setModalForm({
                lectureName: row.lectureName ?? "",
                professorName: row.userName ?? "",
                majorName: row.majorName ?? "",
                score: 0,
                total: 0,
                lectureId: row.lectureId
            });
            setAttendanceRows([]);
        } finally {
            setModalLoading(false);
        }
    };

    const closeModal = () => setShow(false);
    const handleExited = () => {
        setAttendanceRows([]);
        setModalForm({
            lectureName: "",
            professorName: "",
            majorName: "",
            score: 0,
            total: 0,
            lectureId: null
        });
        setModalLoading(false);
    };

    const handleCheck = (index) => {
        setAttendanceRows(prev =>
            prev.map((row, idx) => ({ ...row, checked: idx === index ? !row.checked : row.checked }))
        );
    };

    // 모달에서 이의제기 클릭 시
    const handleAppeal = (form, selectedRow, attendanceType) => {
        navigate(`/AttendanceAppeal/${form.lectureId}`, {
            state: {
                lecture: form,
                sessions: [selectedRow],
                attendanceType
            }
        });
    };

    // 학생 수강 목록
    useEffect(() => {
        if (!userId) return;
        (async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_BASE_URL}/enrollment/selectAll`, { params: { userId } });
                const list = Array.isArray(data) ? data
                    : Array.isArray(data?.content) ? data.content
                        : [];
                setLectureList(list);
                setError(null);
            } catch (err) {
                console.error(err);
                setError("목록을 불러오지 못했습니다.");
                setLectureList([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [userId]);

    return (
        <Container style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>출결 조회</h3>
            </div>

            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

            <Row style={{ marginTop: 24 }}>
                <Col md={12} style={{ overflowX: 'auto' }}>
                    {lectureList.length === 0 ? (
                        <div>선택한 학기에 수강한 강의가 없습니다.</div>
                    ) : (
                        <Table bordered hover size="sm" style={{ minWidth: 700 }}>
                            <thead>
                                <tr>
                                    <th>강의명</th>
                                    <th>담당교수</th>
                                    <th>학점</th>
                                    <th>이수구분</th>
                                    <th>학과</th>
                                    <th>상세보기</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lectureList.map((l) => (
                                    <tr key={l.lectureId ?? `${l.lectureName}-${l.userName}`}>
                                        <td>{l.lectureName}</td>
                                        <td>{l.userName}</td>
                                        <td>{l.credit}</td>
                                        <td>{completionDivLabel[l.completionDiv] ?? l.completionDiv}</td>
                                        <td>{l.majorName}</td>
                                        <td>
                                            <Button variant="primary" size="sm" onClick={() => openModal(l)}>상세보기</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Col>
            </Row>

            <AttendaceCheckForm
                show={show}
                onHide={closeModal}
                onExited={handleExited}
                loading={modalLoading}
                form={modalForm}
                rows={attendanceRows}
                onAppeal={handleAppeal}
                onCheck={handleCheck}
            />
        </Container>
    );
}

export default App;
