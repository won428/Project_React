import { useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../public/context/UserContext";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { API_BASE_URL } from "../../config/config";
import { Button, Col, Row, Container, Form, Modal, Table } from "react-bootstrap";
import axios from "axios";

/* ====== 여기: EightLineForm ====== */
function EightLineForm({ value, onChange, weights, errors = {} }) {
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
                        isInvalid={!!errors.attendance}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.attendance}
                    </Form.Control.Feedback>
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
                        placeholder={`0 ~ ${weights.assignment}`}
                        isInvalid={!!errors.asScore}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.asScore}
                    </Form.Control.Feedback>
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
                        placeholder={`0 ~ ${weights.midterm}`}
                        isInvalid={!!errors.tScore}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.tScore}
                    </Form.Control.Feedback>
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
                        isInvalid={!!errors.ftScore}
                        placeholder={`0 ~ ${weights.final}`}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.ftScore}
                    </Form.Control.Feedback>
                    <Form.Text muted>최대 {weights.final}점</Form.Text>
                </Col>
            </Form.Group>

            {/* 총점(서버 계산 결과를 보여줄 자리. 현재는 읽기전용 표시만 유지) */}
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
/* ====== 여기까지 EightLineForm ====== */

function GradeCalculation() {
    const { state } = useLocation();
    const { id: paramId } = useParams();

    const lectureId = (() => {
        if (typeof state === "number") return state;
        if (state && typeof state === "object" && "lectureId" in state) return state.lectureId;
        const n = Number(paramId);
        return Number.isFinite(n) ? n : undefined;
    })();

    const [loading, setLoading] = useState(false);
    const [studentLoading, setStudentLoading] = useState(false);

    const { user } = useAuth();

    const [studentList, setStudentList] = useState([]);
    const [studentBasic, setStudentBasic] = useState(null);
    const [lecture, setLecture] = useState({});
    const [saveGradeStudent, setSaveGradeStudent] = useState({});
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
    const [form, setForm] = useState(DEFAULT_FORM); // (미사용이지만 변수명 유지)
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

    // 숫자 변환 유틸
    const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : NaN;
    };

    // 가중치(만점) 초과/음수 등 검증
    const errors = useMemo(() => {
        const e = {};
        const as = toNum(modalForm.asScore);
        const mid = toNum(modalForm.tScore);
        const fin = toNum(modalForm.ftScore);

        if (String(modalForm.asScore ?? '').trim() === '') e.asScore = '필수 입력';
        else if (Number.isNaN(as)) e.asScore = '숫자를 입력하세요';
        else if (as < 0) e.asScore = '0 이상';
        else if (as > (weights.assignment || 0)) e.asScore = `최대 ${weights.assignment}점 이하`;

        if (String(modalForm.tScore ?? '').trim() === '') e.tScore = '필수 입력';
        else if (Number.isNaN(mid)) e.tScore = '숫자를 입력하세요';
        else if (mid < 0) e.tScore = '0 이상';
        else if (mid > (weights.midterm || 0)) e.tScore = `최대 ${weights.midterm}점 이하`;

        if (String(modalForm.ftScore ?? '').trim() === '') e.ftScore = '필수 입력';
        else if (Number.isNaN(fin)) e.ftScore = '숫자를 입력하세요';
        else if (fin < 0) e.ftScore = '0 이상';
        else if (fin > (weights.final || 0)) e.ftScore = `최대 ${weights.final}점 이하`;

        // 출결(읽기전용)도 서버와 불일치 방지 차원에서 경고만
        const att = toNum(modalForm.attendance);
        if (!Number.isNaN(att) && att > (weights.attendance || 0)) {
            e.attendance = `출결점수가 만점(${weights.attendance})을 초과했습니다`;
        }
        return e;
    }, [modalForm, weights]);

    const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);
    const canSave = useMemo(() => !hasErrors, [hasErrors]);

    // 데이터 로딩
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

    // 저장된 점수 목록 로딩
    useEffect(() => {
        if (!lectureId) return;
        const controller = new AbortController();

        (async () => {
            setStudentLoading(true);
            try {
                const { data } = await axios.get(
                    `${API_BASE_URL}/grade/listByGrade`,
                    { params: { lectureId }, signal: controller.signal }
                );
                const dict = Object.fromEntries(
                    (Array.isArray(data) ? data : []).map(row => [
                        row.userId,
                        { totalScore: row.totalScore, lectureGrade: row.lectureGrade }
                    ])
                );
                setSaveGradeStudent(dict);
            } catch (err) {
                console.error(err);
            } finally {
                setStudentLoading(false);
            }
        })();

        return () => controller.abort();
    }, [lectureId]);

    // 폼 기본값 준비
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

    const handleSave = async () => {
        if (!selectedId) return;
        if (!canSave) {
            alert("입력값을 확인하세요. 가중치(만점)를 초과했거나 유효하지 않습니다.");
            return;
        }

        const payload = {
            userId: selectedId,
            lectureId,
            attendance: Number(modalForm.attendance) || 0,
            asScore: Number(modalForm.asScore) || 0,
            tScore: Number(modalForm.tScore) || 0,
            ftScore: Number(modalForm.ftScore) || 0,
        };
        console.log('payload ->', payload);

        const { data: saved } = await axios.post(
            `${API_BASE_URL}/grade/insertGrades`,
            payload
        );

        // 서버 계산 결과 반영 또는 재조회
        if (saved && (saved.totalScore != null || saved.lectureGrade != null || saved.gpa != null)) {
            setSaveGradeStudent(prev => ({
                ...prev,
                [selectedId]: {
                    totalScore: saved.totalScore ?? 0,
                    lectureGrade: saved.lectureGrade ?? saved.gpa ?? 0,
                }
            }));
        } else {
            const { data: rows } = await axios.get(`${API_BASE_URL}/grade/listByGrade`, { params: { lectureId } });
            const dict = Object.fromEntries((Array.isArray(rows) ? rows : []).map(r => [
                r.userId,
                { totalScore: r.totalScore, lectureGrade: r.lectureGrade }
            ]));
            setSaveGradeStudent(dict);
        }

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
                            <tr
                                key={it.id}
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
                        errors={errors}
                    />
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <div className="text-muted small">
                        {selectedId && "이 모달의 입력값은 이 ID에만 저장됩니다."}
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" onClick={closeModal}>닫기</Button>
                        <Button variant="primary" onClick={handleSave} disabled={studentLoading || selectedLocked || !canSave}>
                            점수 저장
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default GradeCalculation;
