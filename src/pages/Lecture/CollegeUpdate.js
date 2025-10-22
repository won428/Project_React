// src/pages/college/CollegeEditPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Alert, Spinner, Stack } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../config/config";

function App() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({ c_type: "", c_office: "" });
    const [touched, setTouched] = useState({ c_type: false, c_office: false });
    const [loading, setLoading] = useState(true);   // 초기 로딩
    const [saving, setSaving] = useState(false);    // 저장 로딩
    const [msg, setMsg] = useState({ type: "", text: "" });

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
        if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
        return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
    };

    const errors = useMemo(() => {
        const e = {};
        if (!form.c_type.trim()) e.c_type = "계열은 필수입니다.";
        if (form.c_office && !phonePattern.test(form.c_office)) {
            e.c_office = "전화번호는 2~3-3~4-4 형식이어야 합니다.";
        }
        return e;
    }, [form]);

    // 기존 데이터 로드
    useEffect(() => {
        const load = async () => {
            setMsg({ type: "", text: "" });
            try {
                const res = await axios.get(`${API_BASE_URL}/college/${id}`);
                // 서버 응답 키에 맞춰 세팅 (id, c_type, c_office 사용 가정)
                setForm({
                    c_type: res.data.c_type ?? "",
                    c_office: res.data.c_office ?? "",
                });
            } catch (err) {
                const reason = err.response?.data?.message || err.message || "요청 실패";
                setMsg({ type: "danger", text: `상세 조회 실패: ${reason}` });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

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
        setTouched({ c_type: true, c_office: true });
        setMsg({ type: "", text: "" });

        if (errors.c_type || errors.c_office) return;

        try {
            setSaving(true);
            await axios.put(`${API_BASE_URL}/college/${id}`, {
                c_type: form.c_type.trim(),
                c_office: form.c_office.trim() || null,
            }, { headers: { "Content-Type": "application/json" } });

            window.alert("단과대학 정보가 수정되었습니다.");
            navigate("/ColList");
        } catch (err) {
            const reason = err.response?.data?.message || err.message || "요청 실패";
            setMsg({ type: "danger", text: `수정 실패: ${reason}` });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mt-4 d-flex justify-content-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="container mt-4" style={{ maxWidth: 560 }}>
            <Stack direction="horizontal" className="mb-3">
                <h3 className="mb-0">단과대학 수정</h3>
                <div className="ms-auto">
                    <Button variant="outline-secondary" onClick={() => navigate("/ColList")}>
                        목록으로
                    </Button>
                </div>
            </Stack>

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
                </Form.Group>

                <Stack direction="horizontal" gap={2}>
                    <div className="ms-auto" />
                    <Button type="submit" disabled={saving}>
                        {saving ? <Spinner size="sm" /> : "수정 저장"}
                    </Button>
                    <Button type="button" variant="outline-secondary" onClick={() => navigate("/ColList")} disabled={saving}>
                        취소
                    </Button>
                </Stack>
            </Form>
        </div>
    );
}
export default App;
