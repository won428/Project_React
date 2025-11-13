import { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Form, Button, Row, Col, Table, Modal, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';
import { useAuth } from '../../../public/context/UserContext';

function AttendaceCheckForm({ show, onHide, onExited, loading, form, rows, onAppeal }) {

    return (
        <Modal show={show} onHide={onHide} onExited={onExited}>
            <Modal.Header closeButton>
                <Modal.Title>출결기록 상세조회</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="d-flex justify-content-center py-4">
                        <Spinner animation="border" />
                    </div>
                ) : (<>
                    <div className="mb-3">
                        <div className="fw-semibold">{form.lectureName}</div>
                        <div className="d-flex align-items-center text-muted small">
                            <div>{form.professorName} · {form.majorName}</div>
                            <Button
                                size="sm"
                                variant="outline-primary"
                                className="ms-auto"
                                onClick={() => onAppeal?.(form)}
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
                                <th style={{ width: 100 }}>강의차시</th>
                                <th style={{ width: 160 }}>강의일</th>
                                <th>출결상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr><td colSpan={3} className="text-center text-muted">출결 기록이 없습니다.</td></tr>
                            ) : rows.map(r => (
                                <tr key={r.lectureSession}>
                                    <td>{r.lectureSession}</td>
                                    <td>{r.attendanceDate}</td>
                                    <td>{r.attendStudent}</td>
                                </tr>))}
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

    const lectureId = (() => {
        if (typeof state === "number") return state;
        if (state && typeof state === "object" && "lectureId" in state) return state.lectureId;
        const n = Number(paramId);
        return Number.isFinite(n) ? n : undefined;
    })();

    const navigate = useNavigate();

    const [lectures, setLectures] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState(null);

    const [error, setError] = useState(null);

    // 상세보기 모달 On/Off
    const [modalForm, setModalForm] = useState({
        lectureName: "",
        professorName: "",
        majorName: "",
        score: 0,         // 받은 점수
        total: 0,         // 만점
    });
    const [show, setShow] = useState(false);
    const [formsById, setFormsById] = useState({});
    const [modalLoading, setModalLoading] = useState(false);
    const dirtyRef = useRef(false);

    const [attendanceRows, setAttendanceRows] = useState([]); // 차시/일자/상태 리스트

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

    // 학기 계산기
    const groupLecturesByYear = (l) => {
        return l.reduce((acc, lecture) => {
            const d = lecture?.startDate ? new Date(lecture.startDate) : null;
            if (!d || Number.isNaN(d.getTime())) return acc;           // 시작일 없거나 잘못되면 스킵

            const year = d.getUTCFullYear().toString(); // 연도
            const month = d.getUTCMonth() + 1; // 월

            let semester = null;
            if (month >= 3 && month <= 6) semester = 1;
            else if (month >= 9 && month <= 12) semester = 2;
            else if (month >= 1 && month <= 2) semester = 3;
            else if (month >= 7 && month <= 8) semester = 4;

            (acc[year] ??= []).push({ ...lecture, semester });
            return acc;
        }, {});
    };

    // 모달 창 열기
    const openModal = async (row) => {
        setShow(true);
        setModalLoading(true);
        try {
            // 요약 점수
            const summaryPromise = axios.get(`${API_BASE_URL}/attendance/selectById/${row.lectureId}`, {
                params: { userId }
            });

            // 강의에 대한 세부목록
            const detailPromise = axios.get(
                `${API_BASE_URL}/attendance/selectAllAttendance/${row.enrollmentId}`,
                { params: { userId } }
            );

            const graingWeightsPromise = axios.get(
                `${API_BASE_URL}/gradingWeights/selectAll/${row.lectureId}`
            );

            const [summaryRes, detailRes, gwRes] = await Promise.all([summaryPromise, detailPromise, graingWeightsPromise]);
            const summary = summaryRes.data ?? {};
            const details = Array.isArray(detailRes.data) ? detailRes.data : [];
            const grWeights = gwRes.data ?? {};

            // 상세보기 모달 헤더에 보일 폼
            setModalForm({
                lectureName: row.lectureName ?? "",
                professorName: row.userName ?? "",
                majorName: row.majorName ?? "",
                score: summary.score ?? 0,
                total: grWeights.attendanceScore ?? 0,
            });

            // 상세보기 모달 바디(테이블)에 보일 폼
            setAttendanceRows(
                details.map((d, idx) => ({
                    lectureSession: idx + 1,
                    attendanceDate: d.attendanceDate,
                    attendStudent: attendanceLabel[d.attendStudent],
                }))
            );
        } catch (err) {
            console.error(err);
            // 최소한의 정보라도 표시
            setModalForm({
                lectureName: row.lectureName ?? "",
                professorName: row.userName ?? "",
                majorName: row.majorName ?? "",
                score: 0,
                total: 0,
            });
            setAttendanceRows([]);
        } finally {
            setModalLoading(false);
        }
    }

    // 모달 창 닫기
    const closeModal = () => {
        setShow(false);
    };

    const makeEmptyForm = () => ({
        lectureName: "",
        professorName: "",
        majorName: "",
        score: 0,
        total: 0,
    });
    const handleExited = () => {
        setModalLoading(false);
        setModalForm(makeEmptyForm());
        setAttendanceRows([]);
    };

    // 이의제기 전송 버튼 여기에 만드시면 됩니다.
    const handleAppeal = (form) => {
        // form.lectureName, form.professorName ... 사용 가능
        // 모달 열기 / 라우팅 / API 호출 등 원하는 동작
        console.log('이의제기 클릭:', form);
    };

    // 학생이 수강중인 학생 목록 불러오는 useEffect
    useEffect(() => {
        if (!userId) return;
        (async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_BASE_URL}/enrollment/selectAll`, {
                    params: { userId }
                });
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

    const [raw, setRaw] = useState([]);
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/grades/semester/lectures`, { params: { userId } })
            .then(res => { setRaw(res.data); setError(null); })
            .catch(() => { setError('불러오기 실패'); setRaw([]); });
    }, [userId]);

    const grouped = useMemo(() => groupLecturesByYear(raw), [raw]);

    useEffect(() => {
        const ys = Object.keys(grouped).sort((a, b) => b.localeCompare(a)); // 최신년도가 먼저
        setYears(ys);

        // 최초 진입: 기본 연/학기 자동 선택
        if (!selectedYear && ys.length) {
            const y = ys[0];
            setSelectedYear(y);
            const semesters = [...new Set((grouped[y] || [])
                .map(l => l.semester)
                .filter(Boolean))].sort((a, b) => a - b);
            setSelectedSemester(semesters[0] ?? null);
            return;
        }

        // 선택된 연도가 사라졌거나, 선택 학기가 그 연도에 없으면 보정
        if (selectedYear) {
            const semesters = [...new Set((grouped[selectedYear] || [])
                .map(l => l.semester)
                .filter(Boolean))].sort((a, b) => a - b);
            if (semesters.length && !semesters.includes(selectedSemester)) {
                setSelectedSemester(semesters[0]);
            }
        }
    }, [grouped]);

    useEffect(() => {
        if (!selectedYear || !selectedSemester) {
            setLectures([]);
            return;
        }
        // 선택된 연/학기에 해당하는 lectureId 집합
        const ids = new Set(
            (grouped[selectedYear] || [])
                .filter(l => l.semester === selectedSemester)
                .map(l => l.lectureId)
        );
        // enrollment 목록에서 해당 lectureId만 남김(열에 enrollmentId 등 유지)
        const filtered = lectureList.filter(l => ids.has(l.lectureId));
        setLectures(filtered);
    }, [grouped, selectedYear, selectedSemester, lectureList]);

    const handleYearChange = (e) => {
        const y = e.target.value;
        setSelectedYear(y);
        const semesters = [...new Set((grouped[y] || []).map(l => l.semester).filter(Boolean))];
        setSelectedSemester(semesters[0] ?? null); // 여기서 추가 fetch 없음!
    };

    const handleSemesterChange = (e) => {
        setSelectedSemester(parseInt(e.target.value, 10)); // 추가 fetch 없음!
    };

    return (
        <Container style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>출결 조회</h3>

            </div>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <Row>
                <Col md={3} style={{ maxHeight: '60vh', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
                    <Form>
                        <Form.Select name="year" value={selectedYear} onChange={handleYearChange}>
                            <option value="" disabled>년도 선택</option>
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year}년
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Select name="semester" value={selectedSemester || ''} onChange={handleSemesterChange} style={{ marginTop: 8 }}>
                            <option value="" disabled>학기 선택</option>
                            <option value={1}>1학기 (3~6월)</option>
                            <option value={2}>2학기 (9~12월)</option>
                            <option value={3}>계절학기_상반기 (1~2월)</option>
                            <option value={4}>계절학기_하반기 (7~8월)</option>
                        </Form.Select>
                    </Form>
                </Col>
            </Row>

            <Row style={{ marginTop: 24 }}>
                <Col md={12} style={{ overflowX: 'auto' }}>
                    {lectures.length === 0 ? (
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
                                {lectures.map((l) => (
                                    <tr key={l.lectureId ?? `${l.lectureName}-${l.userName}`}>
                                        <td>{l.lectureName}</td>
                                        <td>{l.userName}</td>
                                        <td>{l.credit}</td>
                                        <td>{completionDivLabel[l.completionDiv] ?? l.completionDiv}</td>
                                        <td>{l.majorName}</td>
                                        <td>
                                            <Button variant="primary" size="sm" onClick={() => openModal(l)}  >상세보기</Button>
                                        </td>
                                    </tr>
                                )
                                )}
                            </tbody>
                        </Table>
                    )}
                </Col>
            </Row>import { useEffect, useMemo, useRef, useState } from 'react';
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

    

    const [lectures, setLectures] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState(null);

    

    // 상세보기 모달 On/Off
    const [modalForm, setModalForm] = useState({
        lectureName: "",
        professorName: "",
        majorName: "",
        score: 0,         // 받은 점수
        total: 0,         // 만점
    });
    const [show, setShow] = useState(false);
    const [formsById, setFormsById] = useState({});
    const [modalLoading, setModalLoading] = useState(false);
    const dirtyRef = useRef(false);

    const [attendanceRows, setAttendanceRows] = useState([]); // 차시/일자/상태 리스트

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

    // 학기 계산기
    const groupLecturesByYear = (l) => {
        return l.reduce((acc, lecture) => {
            const d = lecture?.startDate ? new Date(lecture.startDate) : null;
            if (!d || Number.isNaN(d.getTime())) return acc;           // 시작일 없거나 잘못되면 스킵

            const year = d.getUTCFullYear().toString(); // 연도
            const month = d.getUTCMonth() + 1; // 월

            let semester = null;
            if (month >= 3 && month <= 6) semester = 1;
            else if (month >= 9 && month <= 12) semester = 2;
            else if (month >= 1 && month <= 2) semester = 3;
            else if (month >= 7 && month <= 8) semester = 4;

            (acc[year] ??= []).push({ ...lecture, semester });
            return acc;
        }, {});
    };

    // 모달 창 열기
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
        setModalLoading(false);
        setModalForm(makeEmptyForm());
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
                lectureDate: selectedRow.attendanceDate,
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

    const [raw, setRaw] = useState([]);
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/grades/semester/lectures`, { params: { userId } })
            .then(res => { setRaw(res.data); setError(null); })
            .catch(() => { setError('불러오기 실패'); setRaw([]); });
    }, [userId]);

    const grouped = useMemo(() => groupLecturesByYear(raw), [raw]);

    useEffect(() => {
        const ys = Object.keys(grouped).sort((a, b) => b.localeCompare(a)); // 최신년도가 먼저
        setYears(ys);

        // 최초 진입: 기본 연/학기 자동 선택
        if (!selectedYear && ys.length) {
            const y = ys[0];
            setSelectedYear(y);
            const semesters = [...new Set((grouped[y] || [])
                .map(l => l.semester)
                .filter(Boolean))].sort((a, b) => a - b);
            setSelectedSemester(semesters[0] ?? null);
            return;
        }

        // 선택된 연도가 사라졌거나, 선택 학기가 그 연도에 없으면 보정
        if (selectedYear) {
            const semesters = [...new Set((grouped[selectedYear] || [])
                .map(l => l.semester)
                .filter(Boolean))].sort((a, b) => a - b);
            if (semesters.length && !semesters.includes(selectedSemester)) {
                setSelectedSemester(semesters[0]);
            }
        }
    }, [grouped]);

    useEffect(() => {
        if (!selectedYear || !selectedSemester) {
            setLectures([]);
            return;
        }
        // 선택된 연/학기에 해당하는 lectureId 집합
        const ids = new Set(
            (grouped[selectedYear] || [])
                .filter(l => l.semester === selectedSemester)
                .map(l => l.lectureId)
        );
        // enrollment 목록에서 해당 lectureId만 남김(열에 enrollmentId 등 유지)
        const filtered = lectureList.filter(l => ids.has(l.lectureId));
        setLectures(filtered);
    }, [grouped, selectedYear, selectedSemester, lectureList]);

    const handleYearChange = (e) => {
        const y = e.target.value;
        setSelectedYear(y);
        const semesters = [...new Set((grouped[y] || []).map(l => l.semester).filter(Boolean))];
        setSelectedSemester(semesters[0] ?? null); // 여기서 추가 fetch 없음!
    };

    const handleSemesterChange = (e) => {
        setSelectedSemester(parseInt(e.target.value, 10)); // 추가 fetch 없음!
    };

    return (
        <Container style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>출결 조회</h3>
            </div>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <Row>
                <Col md={3} style={{ maxHeight: '60vh', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
                    <Form>
                        <Form.Select name="year" value={selectedYear} onChange={handleYearChange}>
                            <option value="" disabled>년도 선택</option>
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year}년
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Select name="semester" value={selectedSemester || ''} onChange={handleSemesterChange} style={{ marginTop: 8 }}>
                            <option value="" disabled>학기 선택</option>
                            <option value={1}>1학기 (3~6월)</option>
                            <option value={2}>2학기 (9~12월)</option>
                            <option value={3}>계절학기_상반기 (1~2월)</option>
                            <option value={4}>계절학기_하반기 (7~8월)</option>
                        </Form.Select>
                    </Form>
                </Col>
            </Row>

            <Row style={{ marginTop: 24 }}>
                <Col md={12} style={{ overflowX: 'auto' }}>
                    {lectures.length === 0 ? (
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
                                {lectures.map((l) => (
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

            <AttendaceCheckForm
                show={show}
                onHide={closeModal}
                onExited={handleExited}
                loading={modalLoading}
                form={modalForm}
                rows={attendanceRows}
                onAppeal={handleAppeal}
            />
        </Container>
    );
}

export default App;