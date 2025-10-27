import { useEffect, useState } from "react";
import { Button, Alert, Spinner, Stack, Form, Col, Row } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {

    const [major, setMajor] = useState({ name: "", office: "", collegeId: "" });
    const [colleges, setColleges] = useState([]);

    // 해당 input에 포커스를 올렸는지 안올렸는지 상태 체크
    const [touched, setTouched] = useState({ name: false, office: false, collegeId: false });

    const [errors, setErrors] = useState({});

    // 입력폼 제출 시 상태 메세지 띄우는 용
    const [msg, setMsg] = useState({ type: "", text: "" });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


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

    // 학과 전화번호 포맷 다듬기
    const onChange = (e) => {
        const { name, value } = e.target;
        setMajor((prev) => ({
            ...prev,
            [name]: name === "office" ? formatOfficePhone(value) : value,
        }));
    };

    // 입력칸을 건드릴 시 해당 input 상태 true로 바꾸기
    const onBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({
            ...prev,
            [name]: true
        }))
    };

    // 단과대학 콤보박스 목록 가져오는 useEffect
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/college/list`);
                setColleges(data);
                if (data.length > 0) {
                    setMajor(f => ({ ...f, collegeId: f.collegeId || String(data[0].id) }))
                }
            } catch (e) {
                console.log(e);
            }
        })();
    }, []);

    // 검증용 useEffect
    useEffect(() => {
        const e = {};
        if (!(major.name ?? '').trim()) e.name = "학과명은 필수입니다.";
        if ((major.office ?? '').trim() && !phonePattern.test(major.office)) {
            e.office = "전화번호는 2~3-3~4-4 형식이어야 합니다.";
        }
        if (!(major.collegeId ?? '').toString().trim()) e.collegeId = "단과대학을 선택하세요.";
        setErrors(e);
    }, [major]);

    const onSubmit = async (event) => {

        event.preventDefault();
        setMsg({ type: "", text: "" });
        setTouched({
            name: true, office: true, collegeId: true
        });
        if (errors.name || errors.office || errors.collegeId) return;


        try {
            setLoading(true);
            const url = `${API_BASE_URL}/major/insert`;
            await axios.post(url, {
                name: major.name.trim(),
                office: major.office.trim() || null,
                collegeId: Number(major.collegeId)
            });
            window.alert("학과 정보가 등록되었습니다.");
            setMajor({ name: "", office: "", collegeId: colleges[0] ? String(colleges[0].id) : "" });
            setTouched({ name: false, office: false, collegeId: false });
            setMsg({ type: "success", text: "등록 완료" });
        }
        catch (err) {
            const reason = err.response?.data?.message || err.message || "요청 실패";
            setMsg({ type: "danger", text: `등록실패 : ${reason}` });
        }
        finally {
            setLoading(false);
        }
    }




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
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder="예: 컴퓨터공학과,소프트웨어공학과"
                        maxLength={50}
                        isInvalid={touched.name && !!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                        {errors.name}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="office">
                    <Form.Label>학과 전화번호</Form.Label>
                    <Form.Control
                        type="text"
                        name="office"
                        value={major.office}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder="예: 02-123-4567 / 02-1234-5678 / 010-1234-5678"
                        maxLength={13}
                        isInvalid={touched.office && !!errors.office}
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
                            name="collegeId"
                            value={major.collegeId}
                            onChange={onChange}
                            onBlur={onBlur}
                            aria-label="단과대학 선택 콤보박스"
                            size="md"
                            isInvalid={touched.collegeId && !!errors.collegeId}
                        >
                            {colleges.map((res) => (
                                <option key={res.id} value={String(res.id)}>{res.type}</option>
                            ))}

                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.collegeId}</Form.Control.Feedback>
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
