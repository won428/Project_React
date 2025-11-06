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
        total: "-",
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
                        onChange={(e) => onModalChange("asScore", e.target.value)}
                        onBlur={(e) => onModalChange("asScore", clamp(e.target.value, 100))}   // ← 100으로
                        placeholder="0 ~ 100"
                    />
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
                        onChange={(e) => onModalChange("tScore", e.target.value)}
                        onBlur={(e) => onModalChange("tScore", clamp(e.target.value, 100))}    // ← 100으로
                        placeholder="0 ~ 100"
                    />
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
                        onChange={(e) => onModalChange("ftScore", e.target.value)}
                        onBlur={(e) => onModalChange("ftScore", clamp(e.target.value, 100))}   // ← 100으로
                        placeholder="0 ~ 100"
                    />
                </Col>
            </Form.Group>

            {/* 총점 */}
            <Form.Group as={Row} className="mt-3" controlId="f-total">
                <Form.Label column sm={3}>총점</Form.Label>
                <Col sm={9}>
                    <Form.Control
                        readOnly
                        plaintext
                        value={v.total === "" || v.total == null ? "-" : v.total}
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

    const DEFAULT_FORM = {
        name: "",
        userCode: "",
        majorName: "",
        attendance: 0,
        asScore: "",
        tScore: "",
        ftScore: "",
        total: "-",
        gpa: "",
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
    const [selectedId, setSelectedId] = useState(null);

    const dirtyRef = useRef(false);
    const [modalForm, setModalForm] = useState(DEFAULT_FORM);

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
        // 1) 가중치(비율) 정규화
        const W = normalizeWeights(weights); // 합계가 정확히 100이 되도록 보정됨

        // 2) 각 영역을 %로 준비
        //   - attendance는 백엔드에서 '가중치 점수'로 오는 경우가 많아 disabled 되어 있음
        //     (예: 가중치 20점 만점에서 17점이면 85%)
        const attPoints = Number(modalForm.attendance) || 0;        // 예: 0~weights.attendance 범위의 '점수'
        const attPercent = W.attendance > 0
            ? clamp01((attPoints / W.attendance) * 100)               // 포인트→퍼센트 변환
            : 0;

        const asPercent = clamp01(modalForm.asScore);              // 사용자가 0~100 입력
        const midPercent = clamp01(modalForm.tScore);
        const finPercent = clamp01(modalForm.ftScore);

        // 3) 비율대로 가중합 (합계 100점 만점)
        const total =
            (attPercent * W.attendance +
                asPercent * W.assignment +
                midPercent * W.midterm +
                finPercent * W.final) / 100;

        const totalRounded = Math.round(total * 100) / 100;

        // 4) 4.5 만점 환산 (선형 환산: 100점 -> 4.5)
        const gpa = Math.round(((totalRounded / 100) * 4.5) * 100) / 100;

        setModalForm(prev => ({ ...prev, total: totalRounded, gpa }));
    };

    const handleSave = async () => {
        if (!selectedId) return;

        const payload = {
            userId: selectedId,
            lectureId,
            attendance: Number(modalForm.attendance) || 0, // 원점수(가중치 점수)
            asScore: clamp01(modalForm.asScore),           // 0~100
            tScore: clamp01(modalForm.tScore),            // 0~100
            ftScore: clamp01(modalForm.ftScore),           // 0~100
            total: modalForm.total,                      // 0~100
            gpa: modalForm.gpa,                        // 0~4.5
        };
        await axios.post(`${API_BASE_URL}/grade/insertGrades`);

        setFormsById(prev => ({ ...prev, [selectedId]: { ...(prev[selectedId] ?? DEFAULT_FORM), ...modalForm } }));
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
                    </tr>
                </thead>
                <tbody>
                    {studentList.map((it) => (
                        <tr key={it.id} style={{ cursor: "pointer" }} onClick={() => openModal(it.id)}>
                            <td>{it.userCode}</td>
                            <td>{it.name}</td>
                            <td>{it.majorName}</td>
                            <td>{it.email}</td>
                        </tr>
                    ))}
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
                        <Button variant="primary" onClick={handleSave}>저장</Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default GradeCalculation;