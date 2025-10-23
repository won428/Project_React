import { useState, useMemo } from "react";
import { Form, Button, Alert, Spinner, Stack } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// 경로는 현재 파일 위치 기준으로 맞추세요: 예) "../config/config" 또는 "config/config"
import { API_BASE_URL } from "../../config/config";

function App() {
    const [form, setForm] = useState({ c_type: "", c_office: "" });
    const [touched, setTouched] = useState({ c_type: false, c_office: false });
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
        if (!form.c_type.trim()) e.c_type = "계열은 필수입니다.";
        if (form.c_office && !phonePattern.test(form.c_office)) {
            e.c_office = "전화번호는 2~3-3~4-4 형식이어야 합니다.";
        }
        return e;
    }, [form]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "c_office" ? formatOfficePhone(value) : value,
        }));
    };

    const onBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setMsg({ type: "", text: "" });
        setTouched({ c_type: true, c_office: true });
        if (errors.c_type || errors.c_office) return;

        try {
            setLoading(true);
            await axios.post(`${API_BASE_URL}/college/insert`, {
                c_type: form.c_type.trim(),
                c_office: form.c_office.trim() || null,
            });
            window.alert("단과대학 정보가 등록되었습니다.");
            setForm({ c_type: "", c_office: "" });
            setTouched({ c_type: false, c_office: false });
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
                <Form.Group className="mb-3" controlId="c_type">
                    <Form.Label>
                        계열 <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                        type="text"
                        name="c_type"
                        value={form.c_type}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder="예: IT·컴퓨팅계열"
                        maxLength={50}
                        isInvalid={touched.c_type && !!errors.c_type}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.c_type}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="c_office">
                    <Form.Label>전화번호</Form.Label>
                    <Form.Control
                        type="text"
                        name="c_office"
                        value={form.c_office}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder="예: 02-123-4567 / 02-1234-5678 / 010-1234-5678"
                        maxLength={13}
                        isInvalid={touched.c_office && !!errors.c_office}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.c_office}
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
                        onClick={() => navigate("/ColList")}
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