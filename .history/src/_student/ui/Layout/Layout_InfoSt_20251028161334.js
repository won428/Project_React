// src/_student/ui/Layout/Layout_InfoSt.js
import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";
import axios from "axios";
import { useCallback, useState } from "react";
import { API_BASE_URL } from "../../../public/config/config";

export const LayoutStInfost = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [meId, setMeId] = useState(null);
    const [fetching, setFetching] = useState(false);

    const goStudentInfo = () => navigate("/StudentInfo");
    const goThisCredit = () => navigate("/This_Credit");
    const goEntireCredit = () => navigate("/etrcdt");

    // 현재 로그인 사용자 id 확보 → state로 전달
    const goChangeStatus = useCallback(async () => {
        // 1) 컨텍스트에서 시도
        const uidFromCtx = user?.id ?? user?.userId ?? user?.userid ?? null;
        if (uidFromCtx) {
            navigate("/Change_Status", { state: { userId: uidFromCtx } });
            return;
        }

        // 2) 이전에 캐시된 id 사용
        if (meId) {
            navigate("/Change_Status", { state: { userId: meId } });
            return;
        }

        // 3) 존재하는 API로 현재 사용자 id 확보: /api/student/info
        if (fetching) return;
        try {
            setFetching(true);
            const token = sessionStorage.getItem("accessToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const { data } = await axios.get(`${API_BASE_URL}/api/student/info`, { headers });

            // 백엔드 응답 구조에 맞춰 userId 추출
            // 예: { studentInfo: { userid: 3, ... }, statusRecords: {...}, type: 'STUDENT' }
            const uid =
                data?.studentInfo?.userid ??
                data?.studentInfo?.userId ??
                data?.studentInfo?.id ??
                null;

            if (!uid) {
                alert("학생 ID를 확인할 수 없습니다. 다시 로그인해 주세요.");
                navigate("/login");
                return;
            }

            setMeId(uid);
            navigate("/Change_Status", { state: { userId: uid } });
        } catch (e) {
            console.error(e);
            alert("학생 정보를 불러오지 못했습니다. 다시 로그인해 주세요.");
            navigate("/login");
        } finally {
            setFetching(false);
        }
    }, [user, meId, fetching, navigate]);

    return (
        <Row className="min-vh-100">
            <Col xs={2} className="bg-dark text-white p-3">
                <Container>
                    <Nav className="flex-column">
                        <Nav.Link onClick={goStudentInfo} className="text-white">학적 홈</Nav.Link>
                        <Nav.Link onClick={goThisCredit} className="text-white">당학기 성적</Nav.Link>
                        <Nav.Link onClick={goEntireCredit} className="text-white">전체 성적</Nav.Link>
                        <Nav.Link onClick={goChangeStatus} className="text-white">학적 변경</Nav.Link>
                    </Nav>
                </Container>
            </Col>

            <Col xs={10} className="p-4">
                <Container>
                    <Outlet />
                </Container>
            </Col>
        </Row>
    );
};

export default LayoutStInfost;
