import { useEffect, useMemo, useState } from "react";
import { Table, Button, Alert, Spinner, Stack, Form, Col, Row } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {

    const [major, setMajor] = useState({ name: "", office: "", collegeId: "" });
    const [colleges, setColleges] = useState([]);

    const [form, setForm] = useState({ name: "", office: "", college: '' });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`; // 3-3-4
        return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;                              // 3-4-4
    };

    const errors = useMemo(() => {
        const e = {};
        if (!form.name.trim()) e.name = "학과명은 필수입니다.";
        if (!form.office && !phonePattern.test(form.office)) {
            e.office = "전화번호는 2~3-3~4-4 형식이어야 합니다.";
        }
        if (!form.college) {
            e.college = "단과대학은 필수입니다."
        }
        return e;
    }, [form]);

    useEffect(async () => {
        setLoading(true);
        const url = `${API_BASE_URL}/college/list`;
        await axios.get(url)
            .then((response) => {
                setColleges(response.data);
                console.log(response.data);
            })
            .catch((err) => {
                console.log(err);
            })
    }, []
    );

    const onSubmit = async (e) => {
        // e.preventDefault();
        // setMsg({ type: "", text: "" });
        // setTouched({ type: true, office: true });
        // if (errors.type || errors.office) return;

        // try {
        //     setLoading(true);
        //     await axios.post(`${API_BASE_URL}/college/insert`, {
        //         type: form.type.trim(),
        //         office: form.office.trim() || null,
        //     });
        //     window.alert("단과대학 정보가 등록되었습니다.");
        //     setForm({ type: "", office: "" });
        //     setTouched({ type: false, office: false });
        // } catch (err) {
        //     const reason = err.response?.data?.message || err.message || "요청 실패";
        //     setMsg({ type: "danger", text: `등록 실패: ${reason}` });
        // } finally {
        //     setLoading(false);
        // }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: 560 }}>
            <h3 className="mb-3">학과 등록</h3>

            {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

            <Form onSubmit={onSubmit} noValidate>
                <Form.Group className="mb-3" controlId="name">
                    <Form.Label>
                        학과명 <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={major.name}
                        onChange={(e) => {
                            setMajor((prev) => ({
                                ...prev, name: e.target.value
                            }))
                        }}
                        // onBlur={onBlur}
                        placeholder="예: IT·컴퓨팅계열"
                        maxLength={50}
                    // isInvalid={touched.type && !!errors.type}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.type}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="office">
                    <Form.Label>학과 전화번호</Form.Label>
                    <Form.Control
                        type="text"
                        name="office"
                        value={major.office}
                        onChange={(e) => {
                            setMajor((prev) => ({
                                ...prev, office: e.target.value
                            }))
                        }}
                        // onBlur={onBlur}
                        placeholder="예: 02-123-4567 / 02-1234-5678 / 010-1234-5678"
                        maxLength={13}
                    // isInvalid={touched.office && !!errors.office}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.office}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                        숫자만 입력해도 자동으로 하이픈이 들어갑니다.
                    </Form.Text>
                    <Form.Group controlId="college">
                        <Form.Label>계열 선택</Form.Label>
                        <Form.Select
                            value={major.collegeId}
                            onChange={(e) => {
                                const value = e.target.value;
                                setMajor((prev) => ({
                                    ...prev, collegeId: value
                                }));
                            }}
                            aria-label="단과대학 선택 콤보박스"
                            size="md"
                        >

                            <option value="">해당 단과대학</option>
                            {colleges.map((res) => (
                                <option key={res.id} value={res.id}>{res.type}</option>
                            ))}

                        </Form.Select>
                        <Form.Text className="text-muted">
                            목록 필터링 기준을 선택하세요.
                        </Form.Text>
                    </Form.Group>
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
                        onClick={() => navigate("/majorList")}
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
