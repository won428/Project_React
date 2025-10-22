import { useState, useMemo } from "react";
import { Form, Button, Alert, Spinner, Stack } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// 경로는 현재 파일 위치 기준으로 맞추세요: 예) "../config/config" 또는 "config/config"
import { API_BASE_URL } from "../../config/config";

function App() {
    const [form, setForm] = useState({ cType: "", cOffice: "" });
    const [touched, setTouched] = useState({ cType: false, cOffice: false });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });
    const navigate = useNavigate();

    // 2~3-3~4-4 허용
    const phonePattern = /^\d{2,3}-\d{3,4}-\d{4}$/;

    const formatOfficePhone = (raw) => {
        const d = (raw || "").replace(/\D/g, "").slice(0, 11);
        if (!d) return "";
        if (d.startsWith("02")) {
            if (d.length <= 2) return d;
            if (d.length <= 5) return `02-${d.slice(2)}`;
            if (d.length <= 9) return `02-${d.slice(2, 5)}-${d.slice(5)}`;  // 2-3-4
            return `02-${d.slice(2, 6)}-${d.slice(6, 10)}`;                 // 2-4-4
        }
        if (d.length <= 3) return d;
        if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
        if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`; // 3-3-4
        return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;                              // 3-4-4
    };

    const errors = useMemo(() => {
        const e = {};
        if (!form.cType.trim()) e.cType = "계열은 필수입니다.";
        if (form.cOffice && !phonePattern.test(form.cOffice)) {
            e.cOffice = "전화번호는 2~3-3~4-4 형식이어야 합니다.";
        }
        return e;
    }, [form]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "cOffice" ? formatOfficePhone(value) : value,
        }));
    };

    const onBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });
        setTouched({ cType: true, cOffice: true });
        if (errors.cType || errors.cOffice) return;

        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/college/insert`, {
                cType: form.cType.trim(),
                cOffice: form.cOffice.trim() || null,
            });
            window.alert("단과대학 정보가 등록되었습니다.");
            setForm({ cType: "", cOffice: "" });
            setTouched({ cType: false, cOffice: false });
        } catch (err) {
            const reason = err.response?.data?.message || err.message || "요청 실패";
            setMsg({ type: "danger", text: `등록 실패: ${reason}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: 560 }}>
            <h3 className="mb-3">단과대학 등록</h3>

            {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

            <Form onSubmit={onSubmit} noValidate>
                <Form.Group className="mb-3" controlId="cType">
                    <Form.Label>
                        계열 <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                        type="text"
                        name="cType"
                        value={form.cType}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder="예: IT·컴퓨팅계열"
                        maxLength={50}
                        isInvalid={touched.cType && !!errors.cType}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.cType}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="cOffice">
                    <Form.Label>전화번호</Form.Label>
                    <Form.Control
                        type="text"
                        name="cOffice"
                        value={form.cOffice}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder="예: 02-123-4567 / 02-1234-5678 / 010-1234-5678"
                        maxLength={13}
                        isInvalid={touched.cOffice && !!errors.cOffice}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.cOffice}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                        숫자만 입력해도 자동으로 하이픈이 들어갑니다.
                    </Form.Text>
                </Form.Group>

                <Stack direction="horizontal" gap={8}>
                    <Button type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : "등록"}
                    </Button>

                    {/* ✅ 항상 보이는 목록 이동 버튼 */}
                    <div className="ms-auto" />
                    <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => navigate("/CollegeList")}
                        disabled={loading}   // 로딩 중엔 비활성화 (원하면 제거)
                    >
                        목록으로 이동
                    </Button>
                </Stack>
            </Form>
        </div>
    );
}
export default App;