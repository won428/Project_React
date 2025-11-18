import axios from "axios";
import { useEffect, useState } from "react";
import { Card, Col, Row, Container, Spinner } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import { useAuth } from "../../public/context/UserContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../ui/LectureSession.css";

function LectureSession() {
    const { state } = useLocation(); // 이전 페이지에서 보낸 state 받기
    const { id: paramId } = useParams(); // URL의 :Id 받기

    const lectureId = (() => {
        if (typeof state === "number") return state;                 // state가 숫자로 온 경우
        if (state && typeof state === "object" && "lectureId" in state) return state.lectureId; // { lectureId }
        const n = Number(paramId);
        return Number.isFinite(n) ? n : undefined;
    })();

    console.log("Layout_lecRoomP lectureId = ", lectureId);

    const [meta, setMeta] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [preview, setPreview] = useState([]);

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    const dayName = {
        MONDAY: "월요일",
        TUESDAY: "화요일",
        WEDNESDAY: "수요일",
        THURSDAY: "목요일",
        FRIDAY: "금요일"
    };

    useEffect(() => {
        if (!lectureId) {
            setLoading(false);
            console.warn("lectureId가 없어 세션 조회를 건너뜁니다.");
            return;
        };

        (async () => {
            try {
                // 강의 메타조회(강의 시작일, 강의 종료일)
                const metaRes = await axios.get(`${API_BASE_URL}/lecture/detailLecture/${lectureId}`);

                // 강의 시간표 조회(요일, 시작시간, 끝시간)
                const schRes = await axios.get(`${API_BASE_URL}/lecture/${lectureId}/schedule`);

                setMeta(metaRes.data);
                setSchedule(schRes.data);

                console.log('schRes.data =', schRes.data);
                const days = [...new Set((schRes.data ?? [])
                    .map(s => s.day ?? s.dayOfWeek)   // 필드명 불일치 대비
                    .filter(Boolean))];
                console.log('days =', days); // 요일 들어간 배열["TUESDAY, ""TURSDAY"]

                // 교시
                const periodStart = schRes.data[0]?.periodStart ?? 1;
                const periodEnd = schRes.data[0]?.periodEnd ?? 2;

                const prevRes = await axios.get(`${API_BASE_URL}/lecture/${lectureId}/sessions`, {
                    params: {
                        start: metaRes.data.startDate,
                        end: metaRes.data.endDate,
                        days,
                        periodStart,
                        periodEnd,
                    },
                    paramsSerializer: p => {
                        // 배열 파라미터 직렬화: days=TUESDAY&days=THURSDAY
                        const usp = new URLSearchParams();
                        Object.entries(p).forEach(([k, v]) => {
                            if (Array.isArray(v)) v.forEach(it => usp.append(k, it));
                            else usp.append(k, v);
                        });
                        return usp.toString();
                    },
                });
                // 백엔드가 엔벌로프(단일 객체)로 바뀌어도 깨지지 않도록 방어
                const envelope = prevRes.data;
                setPreview(envelope?.sessionLists ?? []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();

    }, [lectureId]);


    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" /> <div>불러오는 중...</div>
            </Container>
        );
    }

    return (
        <Container className="mt-3">
            <div className="mb-2" ><h3>강의명 : <strong>{meta?.name}</strong></h3></div>
            <div className="mb-2" ><h4>총 차시 : <strong>{preview.length} 차시</strong></h4></div>
            <Row xs={1} md={2} lg={12} className="g-3">
                {preview.map((s) => {
                    // 오늘(로컬PC 기준) 'YYYY-MM-DD'
                    const today = new Date().toLocaleDateString('en-CA'); // ex) 2025-11-04
                    const isFuture = s.date > today;

                    return (
                        <Col key={s.date}>
                            <Card
                                className={`h-100 cursor-pointer ${isFuture ? 'opacity-50 pe-none' : 'card-hover'}`}
                                onClick={!isFuture ? () => navigate(`/LectureDetail/${lectureId}?date=${encodeURIComponent(s.date)}`, { state: { lectureId, sessionDate: s.date }, }) : undefined}
                            >
                                <Card.Body>
                                    <div className="fw-semibold">{s.weekNo}주차 · {dayName[s.dayOfWeek]}</div>
                                    <div className="text-muted small">{s.date}</div>
                                    <div className="mt-1">
                                        {s.periodStart}~{s.periodEnd}교시 ({s.startTime}~{s.endTime})
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );

                })}
                {preview.length === 0 && (
                    <Col><div className="text-muted">생성된 차시가 없습니다.</div></Col>
                )}
            </Row>
        </Container>
    );
}

export default LectureSession;
