import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../public/context/UserContext";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { API_BASE_URL } from "../../config/config";
import { Button, Col, Row, Container, Form, Modal, Table } from "react-bootstrap";
import axios from "axios";


/* ====== 여기: EightLineForm을 최상위로 이동 ====== */
function EightLineForm({ value, onChange, weights }) {
    const DEFAULT_FORM = {
        name: "",
        userCode: "",
        majorName: "",
        attendance: 0,
        asScore: "",
        tScore: "",
        ftScore: "",
        total_score: 0,
    };
    const v = value ?? DEFAULT_FORM;

    const allowDecimal = (raw) => raw === "" || /^\d*\.?\d*$/.test(raw);
    const clamp = (raw, max) => {
        const n = Math.max(0, Math.min(Number.parseFloat(raw) || 0, max));
        return String(n);
    };

    const handle = (e) => {
        const { name, value } = e.target;
        if (name === "asScore" || name === "tScore" || name === "ftScore") {
            if (!allowDecimal(value)) return;
            onChange(name, value);
        } else {
            onChange(name, value);
        }
    };

    return (
        <Form>
            {/* 1 */}
            <Form.Group as={Row} className="mb-3" controlId="f-name">
                <Form.Label column sm={3}>학생명</Form.Label>
                <Col sm={9}>
                    <Form.Control name="name" value={v.name} onChange={handle} disabled />
                </Col>
            </Form.Group>

            {/* 2 */}
            <Form.Group as={Row} className="mb-3" controlId="f-userCode">
                <Form.Label column sm={3}>학번</Form.Label>
                <Col sm={9}>
                    <Form.Control name="userCode" value={v.userCode} onChange={handle} disabled />
                </Col>
            </Form.Group>

            {/* 3 */}
            <Form.Group as={Row} className="mb-3" controlId="f-majorName">
                <Form.Label column sm={3}>전공</Form.Label>
                <Col sm={9}>
                    <Form.Control name="majorName" value={v.majorName} onChange={handle} disabled />
                </Col>
            </Form.Group>

            {/* 4 */}
            <Form.Group as={Row} className="mb-3" controlId="f-score">
                <Form.Label column sm={3}>출석점수</Form.Label>
                <Col sm={9}>
                    <Form.Control
                        type="number"
                        name="attendance"
                        value={v.attendance ?? 0}
                        onChange={handle}
                        step="0.01"
                        min="0"
                        max={weights.attendance}
                        disabled
                    />
                </Col>
            </Form.Group>

            {/* 5 */}
            <Form.Group as={Row} className="mb-3" controlId="f-asScore">
                <Form.Label column sm={3}>과제점수</Form.Label>
                <Col sm={9}>
                    <Form.Control
                        type="text"
                        inputMode="decimal"
                        name="asScore"
                        value={v.asScore ?? ""}
                        onChange={handle}
                        onBlur={(e) => onChange("asScore", clamp(e.target.value, weights.assignment))}   // ← 100으로
                        placeholder={`0 ~ ${weights.assignment}`}
                    />
                    <Form.Text muted>최대 {weights.assignment}점</Form.Text>
                </Col>
            </Form.Group>

            {/* 6 */}
            <Form.Group as={Row} className="mb-1" controlId="f-tScore">
                <Form.Label column sm={3}>중간 시험 점수</Form.Label>
                <Col sm={9}>
                    <Form.Control
                        type="text"
                        inputMode="decimal"
                        name="tScore"
                        value={v.tScore ?? ""}
                        onChange={handle}
                        onBlur={(e) => onChange("tScore", clamp(e.target.value, weights.midterm))}    // ← 100으로
                        placeholder={`0 ~ ${weights.midterm}`}
                    />
                    <Form.Text muted>최대 {weights.midterm}점</Form.Text>
                </Col>
            </Form.Group>

            {/* 7 */}
            <Form.Group as={Row} className="mb-1" controlId="f-ftScore">
                <Form.Label column sm={3}>기말 시험 점수</Form.Label>
                <Col sm={9}>
                    <Form.Control
                        inputMode="decimal"
                        name="ftScore"
                        value={v.ftScore ?? ""}
                        onChange={handle}
                        onBlur={(e) => onChange("ftScore", clamp(e.target.value, weights.final))}   // ← 100으로
                        placeholder={`0 ~ ${weights.final}`}
                    />
                    <Form.Text muted>최대 {weights.final}점</Form.Text>
                </Col>
            </Form.Group>

            {/* 총점 */}
            <Form.Group as={Row} className="mt-3" controlId="f-total">
                <Form.Label column sm={3}>총점</Form.Label>
                <Col sm={9}>
                    <Form.Control
                        readOnly
                        plaintext
                        value={v.total_score === "" || v.total_score == null ? "-" : v.total_score}
                    />
                </Col>
            </Form.Group>
        </Form>
    );
}
/* ====== 여기까지 최상위 이동 ====== */

function GradeCalculation() {
    const { state } = useLocation();
    const { id: paramId } = useParams();

    const lectureId = (() => {
        if (typeof state === "number") return state;
        if (state && typeof state === "object" && "lectureId" in state) return state.lectureId;
        const n = Number(paramId);
        return Number.isFinite(n) ? n : undefined;
    })();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [studentLoading, setStudentLoading] = useState(false);

    const { user } = useAuth();

    const [studentList, setStudentList] = useState([]);
    const [studentBasic, setStudentBasic] = useState(null);
    const [lecture, setLecture] = useState({});
    const [saveGradeStudent, setSaveGradeStudent] = useState({});
    const [isLocked, setIslocked] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const selectedLocked = !!(selectedId && saveGradeStudent && saveGradeStudent[selectedId]);

    const DEFAULT_FORM = {
        name: "",
        userCode: "",
        majorName: "",
        attendance: 0,
        asScore: "",
        tScore: "",
        ftScore: "",
        total_score: null,
        gpa: null,
    };
    const [form, setForm] = useState(DEFAULT_FORM); // 그대로 두셔도 됩니다(미사용)

    const DEFAULT_ATTENDANCE = {
        total: 0,
        present: 0,
        late: 0,
        earlyLeave: 0,
        absent: 0,
        excused: 0,
        score: 0,
    };
    const [attendanceDetail, setAttendanceDetail] = useState(DEFAULT_ATTENDANCE);

    const weights = useMemo(() => ({
        attendance: Number(lecture?.gradingWeights?.attendanceScore ?? 20),
        assignment: Number(lecture?.gradingWeights?.assignmentScore ?? 20),
        midterm: Number(lecture?.gradingWeights?.midtermExam ?? 30),
        final: Number(lecture?.gradingWeights?.finalExam ?? 30),
    }), [lecture]);

    const cacheRef = useRef(new Map());
    const [studentsErr, setStudentsErr] = useState(null);
    const [lectureErr, setLectureErr] = useState(null);

    const [formsById, setFormsById] = useState({});
    const [show, setShow] = useState(false);


    const dirtyRef = useRef(false);
    const [modalForm, setModalForm] = useState(DEFAULT_FORM);

    // 점수 3개가 모두 입력(빈문자 아님) + 숫자 + 0 이상일 때만 저장 가능
    const canSave = useMemo(() => {
        const isNum = (v) => {
            const s = String(v ?? "").trim();
            if (s === "") return false;               // 빈값 불가
            const n = Number(s);
            return Number.isFinite(n) && n >= 0;      // 숫자 && 0 이상
        };
        return isNum(modalForm.asScore) && isNum(modalForm.tScore) && isNum(modalForm.ftScore);
    }, [modalForm.asScore, modalForm.tScore, modalForm.ftScore]);

    useEffect(() => {
        if (!lectureId) return;
        const ac = new AbortController();
        setLoading(true);
        setStudentsErr(null);
        setLectureErr(null);

        (async () => {
            const [s, l] = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/lecture/detail/enrolledStudentList/${lectureId}`, { signal: ac.signal }),
                axios.get(`${API_BASE_URL}/lecture/detailLecture/${lectureId}`, { signal: ac.signal }),
            ]);
            if (s.status === "fulfilled") setStudentList(s.value.data);
            else setStudentsErr(s.reason);

            if (l.status === "fulfilled") setLecture(l.value.data);
            else setLectureErr(l.reason);

            setLoading(false);
        })();

        return () => ac.abort();
    }, [lectureId]);

    useEffect(() => {
        if (!selectedId || !lectureId) return;
        const ac = new AbortController();
        setStudentLoading(true);
        const idAtRequest = selectedId;

        (async () => {
            try {
                const basic = studentList.find((s) => s.id === selectedId) || null;
                setStudentBasic(basic);

                const { data: attend } = await axios.get(
                    `${API_BASE_URL}/attendance/selectById/${lectureId}`,
                    { params: { userId: selectedId }, signal: ac.signal }
                );
                setAttendanceDetail(attend);

                setFormsById((prev) => ({
                    ...prev,
                    [selectedId]: {
                        ...(prev[selectedId] ?? DEFAULT_FORM),
                        name: basic?.name ?? "",
                        userCode: basic?.userCode ?? "",
                        majorName: basic?.majorName ?? "",
                        attendance: attend?.score ?? 0,
                    },
                }));

                if (!dirtyRef.current && selectedId === idAtRequest) {
                    setModalForm((prev) => ({
                        ...prev,
                        name: basic?.name ?? "",
                        userCode: basic?.userCode ?? "",
                        majorName: basic?.majorName ?? "",
                        attendance: attend?.score ?? 0,
                    }));
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    console.error("status:", err.response?.status);
                    console.error("data:", err.response?.data);
                } else {
                    console.error(err);
                }
            } finally {
                setStudentLoading(false);
            }
        })();

        return () => ac.abort();
    }, [selectedId, lectureId, studentList]);


    useEffect(() => {
        if (!lectureId) return;

        const idAtRequest = selectedId;
        const minScore = 0;
        const controller = new AbortController();

        (async () => {
            setStudentLoading(true); // async 위로 빼면 목록 바뀔때마다 계속 호출됨.
            try {
                const { data } = await axios.get(
                    `${API_BASE_URL}/grade/listByGrade`, {
                    params: { lectureId },
                    signal: controller.signal
                });

                const dict = Object.fromEntries(
                    (Array.isArray(data) ? data : []).map(row => [
                        row.userId,
                        { totalScore: row.totalScore, lectureGrade: row.lectureGrade }
                    ])
                );
                // 변수명은 그대로 사용: saveGradeStudent에 딕셔너리 저장
                setSaveGradeStudent(dict);
            } catch (err) {
                console.error(err);
            } finally {
                setStudentLoading(false);
            }
        })();

        return () => controller.abort();
    }, [lectureId]);

    useEffect(() => {
        setFormsById((prev) => {
            const next = { ...prev };
            for (const it of studentList) {
                if (!next[it.id]) {
                    next[it.id] = {
                        ...DEFAULT_FORM,
                        name: it.name ?? "",
                        userCode: it.userCode ?? "",
                        majorName: it.majorName ?? "",
                        attendance: 0,
                    };
                }
            }
            return next;
        });
    }, [studentList]);

    const openModal = (id, preset) => {
        setFormsById((prev) => ({ ...prev, [id]: prev[id] ?? DEFAULT_FORM }));
        setSelectedId(id);
        const base = formsById[id] ?? DEFAULT_FORM;
        dirtyRef.current = false;
        setModalForm(base);
        setStudentBasic(preset ?? null);
        setAttendanceDetail(cacheRef.current.get(id) ?? null);
        setShow(true);
    };

    const closeModal = () => {
        setShow(false);
        setSelectedId(null);
        setAttendanceDetail(null);
        setStudentBasic(null);
    };

    const onModalChange = useCallback((name, value) => {
        dirtyRef.current = true;
        setModalForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    // (추가) 가중치 정규화: 합이 100이 아니어도 자동 보정
    const normalizeWeights = (w) => {
        const a = Number(w.attendance) || 0;
        const b = Number(w.assignment) || 0;
        const m = Number(w.midterm) || 0;
        const f = Number(w.final) || 0;
        const sum = a + b + m + f;
        if (!sum) return { attendance: 25, assignment: 25, midterm: 25, final: 25 };
        return {
            attendance: (a / sum) * 100,
            assignment: (b / sum) * 100,
            midterm: (m / sum) * 100,
            final: (f / sum) * 100,
        };
    };

    // (추가) 0~100 클램프
    const clamp01 = (x) => {
        const n = Number(x);
        if (!Number.isFinite(n)) return 0;
        return Math.max(0, Math.min(100, n));
    };

    // (교체) 총점/학점 계산: 입력은 0~100% 기준, 가중치 비율대로 100점 만점으로 합산
    const gradeCalcul = () => {
        // 각 영역의 만점(가중치)
        const maxA = Number(weights.attendance) || 0;
        const maxAs = Number(weights.assignment) || 0;
        const maxMid = Number(weights.midterm) || 0;
        const maxFin = Number(weights.final) || 0;

        const denom = maxA + maxAs + maxMid + maxFin || 1; // 분모 보호

        // 사용자가 입력한 "원점"을 각 만점으로 클램프
        const att = Math.min(Number(modalForm.attendance) || 0, maxA); // 출석은 이미 백엔드 계산값
        const as = Math.min(Number(modalForm.asScore) || 0, maxAs);
        const mid = Math.min(Number(modalForm.tScore) || 0, maxMid);
        const fin = Math.min(Number(modalForm.ftScore) || 0, maxFin);

        // 원점 합계 → 100점 만점으로 환산
        const totalPoints = att + as + mid + fin;                 // 최대 denom
        const total = Math.round((totalPoints / denom * 100) * 100) / 100; // 0~100
        const gpa = Math.round(((total / 100) * 4.5) * 100) / 100;       // 0~4.5

        setModalForm(prev => ({ ...prev, total_score: total, gpa }));
    };

    const handleSave = async () => {
        if (!selectedId) return;
        if (!canSave) {
            alert("과제/중간/기말 점수를 모두 입력하세요. 0도 입력 가능합니다.");
            return;
        }

        // 1) 가중치(만점) 가져오기
        const maxA = Number(weights.attendance) || 0;
        const maxAs = Number(weights.assignment) || 0;
        const maxMid = Number(weights.midterm) || 0;
        const maxFin = Number(weights.final) || 0;
        const denom = Math.max(1, maxA + maxAs + maxMid + maxFin); // 0 나눗셈 보호

        // 2) 입력값 클램프 & 합산 (점수산출 버튼 안 눌러도 여기서 계산)
        const att = Math.min(Number(modalForm.attendance) || 0, maxA);
        const as = Math.min(Number(modalForm.asScore) || 0, maxAs);
        const mid = Math.min(Number(modalForm.tScore) || 0, maxMid);
        const fin = Math.min(Number(modalForm.ftScore) || 0, maxFin);
        const totalPoints = att + as + mid + fin;                    // 원점 합
        const total = Math.round((totalPoints / denom * 100) * 100) / 100; // 0~100
        const gpa = Math.round(((total / 100) * 4.5) * 100) / 100;       // 0~4.5

        const payload = {
            userId: selectedId,
            lectureId,
            attendance: Number(modalForm.attendance) || 0, // 원점수(가중치 점수)
            asScore: clamp01(modalForm.asScore),           // 0~100
            tScore: clamp01(modalForm.tScore),            // 0~100
            ftScore: clamp01(modalForm.ftScore),           // 0~100
            totalScore: total,                      // 0~100
            gpa: gpa,                        // 0~4.5
        };
        console.log('payload ->', payload); // 보내기 전 확인
        await axios.post(`${API_BASE_URL}/grade/insertGrades`, payload);

        setSaveGradeStudent(prev => ({
            ...prev,
            [selectedId]: { totalScore: total, lectureGrade: gpa }
        }));
        alert("점수 저장이 완료되었습니다.");
        closeModal();
    };

    return (
        <Container className="py-4">
            <h2>강의명 : {lecture.name}</h2>
            <p>강의 기간 : {lecture.startDate} ~ {lecture.endDate}</p>
            <p>총원  {lecture.totalStudent} 명</p>
            <p>수강인원  {lecture.nowStudent} 명</p>

            <Table hover responsive className="align-middle">
                <thead className="table-light sticky-top">
                    <tr>
                        <th style={{ width: 100 }}>학번</th>
                        <th>학생명</th>
                        <th style={{ width: 180 }}>전공</th>
                        <th style={{ width: 240 }}>이메일</th>
                        <th style={{ width: 240 }}>총점</th>
                        <th style={{ width: 240 }}>학점</th>
                    </tr>
                </thead>
                <tbody>
                    {studentList.map((it) => {
                        const info = saveGradeStudent?.[it.id]; // { totalScore, lectureGrade } | undefined  
                        const locked = !!info; // 이미 점수 저장된 학생
                        return (
                            <tr key={it.id}
                                style={{ cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.6 : 1 }}
                                onClick={() => { if (!locked) openModal(it.id); }}>
                                <td>{it.userCode}</td>
                                <td>{it.name}</td>
                                <td>{it.majorName}</td>
                                <td>{it.email}</td>
                                <td>{info?.totalScore ?? 0}</td>
                                <td>{info?.lectureGrade ?? 0}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

            <Modal
                show={show}
                onHide={closeModal}
                size="lg"
                centered
                enforceFocus={false}
                autoFocus={false}
                restoreFocus={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>폼 입력 — {selectedId ? `ID ${selectedId}` : ""}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <EightLineForm
                        value={modalForm}
                        onChange={onModalChange}
                        weights={weights}
                    />
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <div className="text-muted small">
                        {selectedId && "이 모달의 입력값은 이 ID에만 저장됩니다."}
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" onClick={closeModal}>닫기</Button>
                        <Button variant="outline-secondary" onClick={gradeCalcul}>점수 산출</Button>
                        <Button variant="primary" onClick={handleSave} disabled={studentLoading || selectedLocked || !canSave}>점수 저장</Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default GradeCalculation;