// src/pages/college/CollegeEditPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Button, Alert, Spinner, Stack } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../config/config";

function App() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({ cType: "", cOffice: "" });
    const [touched, setTouched] = useState({ cType: false, cOffice: false });
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
        if (!form.cType.trim()) e.cType = "계열은 필수입니다.";
        if (form.cOffice && !phonePattern.test(form.cOffice)) {
            e.cOffice = "전화번호는 2~3-3~4-4 형식이어야 합니다.";
        }
        return e;
    }, [form]);

    // 기존 데이터 로드
    useEffect(() => {
        const load = async () => {
            setMsg({ type: "", text: "" });
            try {
                const res = await axios.get(`${API_BASE_URL}/college/${id}`);
                // 서버 응답 키에 맞춰 세팅 (id, cType, cOffice 사용 가정)
                setForm({
                    cType: res.data.cType ?? "",
                    cOffice: res.data.cOffice ?? "",
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
            [name]: name === "cOffice" ? formatOfficePhone(value) : value,
        }));
    };

    const onBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setTouched({ cType: true, cOffice: true });
        setMsg({ type: "", text: "" });

        if (errors.cType || errors.cOffice) return;

        try {
            setSaving(true);
            await axios.put(`${API_BASE_URL}/college/${id}`, {
                cType: form.cType.trim(),
                cOffice: form.cOffice.trim() || null,
            }, { headers: { "Content-Type": "application/json" } });

            window.alert("단과대학 정보가 수정되었습니다.");
            navigate("/CollegeList");
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
                    <Button variant="outline-secondary" onClick={() => navigate("/CollegeList")}>
                        목록으로
                    </Button>
                </div>
            </Stack>

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
                </Form.Group>

                <Stack direction="horizontal" gap={2}>
                    <div className="ms-auto" />
                    <Button type="submit" disabled={saving}>
                        {saving ? <Spinner size="sm" /> : "수정 저장"}
                    </Button>
                    <Button type="button" variant="outline-secondary" onClick={() => navigate("/CollegeList")} disabled={saving}>
                        취소
                    </Button>
                </Stack>
            </Form>
        </div>
    );
}
export default App;
