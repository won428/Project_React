import { useEffect, useRef, useState } from 'react';
import { Container, Form, Button, Row, Col, Table, Modal, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';
import { useAuth } from '../../../public/context/UserContext';

function AttendaceCheckForm({ show, onHide, onExited, loading, form, rows, onAppeal, onCheck }) {

    const handleAppealClick = () => {
        const selectedRow = rows.find(r => r.checked);
        if (!selectedRow) return alert("이의제기할 강의차시를 선택하세요.");
        onAppeal(selectedRow);
    }

    return (
        <Modal show={show} onHide={onHide} onExited={onExited} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{form.lectureName}</Modal.Title>
                <Button
                    size="sm"
                    variant="outline-primary"
                    className="ms-auto"
                    onClick={handleAppealClick}
                >
                    이의제기
                </Button>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="d-flex justify-content-center py-4">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <>
                        <div className="mb-3">
                            <div className="fw-semibold">{form.professorName} · {form.majorName}</div>
                            <div className="mt-2">
                                <span className="fw-semibold">출결 점수:</span> {form.score} / {form.total}
                            </div>
                        </div>
                        <Table bordered size="sm">
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}>선택</th>
                                    <th style={{ width: 100 }}>강의차시</th>
                                    <th style={{ width: 160 }}>강의일</th>
                                    <th>출결상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted">
                                            출결 기록이 없습니다.
                                        </td>
                                    </tr>
                                ) : rows.map((r, idx) => (
                                    <tr key={r.lectureSession}>
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                checked={r.checked || false}
                                                disabled={rows.some(row => row.checked) && !r.checked} // 단일 선택
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

function App() {
    const [lectureList, setLectureList] = useState([]);
    const [loading, setLoading] = useState(false);

    const { state } = useLocation();
    const { id: paramId } = useParams();
    const { user } = useAuth();
    const userId = user?.id;
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [modalForm, setModalForm] = useState({ lectureName: "", professorName: "", majorName: "", score: 0, total: 0 });
    const [show, setShow] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [attendanceRows, setAttendanceRows] = useState([]);

    const completionDivLabel = {
        MAJOR_REQUIRED: '전공 필수',
        MAJOR_ELECTIVE: '전공 선택',
        LIBERAL_REQUIRED: '교양 필수',
        LIBERAL_ELECTIVE: '교양 선택',
        GENERAL_ELECTIVE: '일반 선택',
    }

    const attendanceLabel = {
        PRESENT: '출석',
        LATE: '지각',
        ABSENT: '결석',
        EARLY_LEAVE: '조퇴',
        EXCUSED: '공결',
    }

    const openModal = async (row) => {
        setShow(true);
        setModalLoading(true);
        try {
            const [summaryRes, detailRes, gwRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/attendance/selectById/${row.lectureId}`, { params: { userId } }),
                axios.get(`${API_BASE_URL}/attendance/selectAllAttendance/${row.enrollmentId}`, { params: { userId } }),
                axios.get(`${API_BASE_URL}/gradingWeights/selectAll/${row.lectureId}`)
            ]);

            setModalForm({
                lectureName: row.lectureName,
                professorName: row.userName,
                majorName: row.majorName,
                score: summaryRes.data?.score ?? 0,
                total: gwRes.data?.attendanceScore ?? 0,
            });

            setAttendanceRows((detailRes.data ?? []).map((d, idx) => ({
                lectureSession: idx + 1,
                attendanceDate: d.attendanceDate,
                attendStudent: attendanceLabel[d.attendStudent],
                checked: false
            })));
        } catch (err) {
            console.error(err);
            setAttendanceRows([]);
        } finally {
            setModalLoading(false);
        }
    }

    const closeModal = () => setShow(false);

    const handleExited = () => {
        setModalForm({ lectureName: "", professorName: "", majorName: "", score: 0, total: 0 });
        setAttendanceRows([]);
    }

    const handleAppeal = (selectedRow) => {
        navigate(`/AttendanceAppeal/${modalForm.lectureId}`, {
            state: { lecture: modalForm, session: selectedRow }
        });
    }

    const handleCheck = (index) => {
        setAttendanceRows(prev =>
            prev.map((row, idx) => ({
                ...row,
                checked: idx === index ? !row.checked : row.checked
            }))
        );
    }

    useEffect(() => {
        if (!userId) return;
        (async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_BASE_URL}/enrollment/selectAll`, { params: { userId } });
                setLectureList(Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []);
                setError(null);
            } catch {
                setError("목록을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, [userId]);

    return (
        <Container style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 24 }}>출결 조회</h3>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <Row>
                <Col md={12} style={{ overflowX: 'auto' }}>
                    {lectureList.length === 0 ? (
                        <div>선택한 학기에 수강한 강의가 없습니다.</div>
                    ) : (
                        <Table bordered hover size="sm">
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
                                    <tr key={l.lectureId}>
                                        <td>{l.lectureName}</td>
                                        <td>{l.userName}</td>
                                        <td>{l.credit}</td>
                                        <td>{completionDivLabel[l.completionDiv] ?? l.completionDiv}</td>
                                        <td>{l.majorName}</td>
                                        <td>
                                            <Button size="sm" onClick={() => openModal(l)}>상세보기</Button>
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
