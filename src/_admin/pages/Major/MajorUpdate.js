import { useEffect, useMemo, useState } from "react";
import { Button, Alert, Spinner, Stack, Form, Col, Row } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function App() {
    const { id } = useParams();
    const [major, setMajor] = useState({ id: "", name: "", office: "", collegeId: "", collegeType: "" });
    const [colleges, setColleges] = useState([]);
    const [form, setForm] = useState({ name: "", office: "" });
    const [saving, setSaving] = useState(false);    // 저장 로딩
    // const [errors, setErrors] = useState({});

    // 입력폼 제출 시 상태 메세지 띄우는 용
    const [msg, setMsg] = useState({ type: "", text: "" });

    const [loading, setLoading] = useState(true);
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

    const errors = useMemo(() => {
        const e = {};
        if (!major.name.trim()) e.name = "계열은 필수입니다.";
        if (major.office && !phonePattern.test(major.office)) {
            e.office = "전화번호는 2~3-3~4-4 형식이어야 합니다.";
        }
        return e;
    }, [major]);

    // 학과 전화번호 포맷 다듬기
    const onChange = (e) => {
        const { name, value } = e.target;
        setMajor((prev) => ({
            ...prev,
            [name]: name === "office" ? formatOfficePhone(value) : value,
        }));
    };

    // 선택한 학과의 정보 불러오기
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${API_BASE_URL}/major/selectOne/${id}`);
                setMajor({
                    id: data.id ?? "",
                    name: data.name ?? "",
                    office: data.office ?? "",
                    collegeId: data.collegeId ?? "",
                    collegeType: data.collegeType ?? ""
                });
            } catch (err) {
                setMsg({ type: "danger", text: `학과를 불러올 수 없습니다.` });
            } finally {
                setLoading(false);
            }

        };
        load();
    }, [id]);


    // 단과대학 콤보박스 목록 가져오는 useEffect
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/college/list`);
                const list = Array.isArray(data) ? data : (data?.content ?? []);
                setColleges(list);
            } catch (e) {
                console.log(e);
                setColleges([]);
            }
        })();
    }, []);


    const onSubmit = async (event) => {

        event.preventDefault();
        setMsg({ type: "", text: "" });
        if (errors.name || errors.office) return;


        try {
            setSaving(true);
            await axios.put(`${API_BASE_URL}/major/update/${id}`, {
                name: major.name.trim(),
                office: major.office.trim() || null,
                collegeId: Number(major.collegeId)
            });
            window.alert("학과 정보가 수정되었습니다.");
            navigate("/majorList");
        }
        catch (err) {
            const reason = err.response?.data?.message || err.message || "요청 실패";
            setMsg({ type: "danger", text: `등록실패 : ${reason}` });
        }
        finally {
            setSaving(false);
        }
    }




    return (
        <div className="container mt-4" style={{ maxWidth: 560 }}>
            <h3 className="mb-3">학과 수정</h3>

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
                        maxLength={50}
                    />

                </Form.Group>

                <Form.Group className="mb-3" controlId="office">
                    <Form.Label>학과 전화번호</Form.Label>
                    <Form.Control
                        type="text"
                        name="office"
                        value={major.office}
                        onChange={onChange}
                        maxLength={13}
                    />

                    <Form.Group controlId="college">
                        <Form.Label>계열 선택</Form.Label>
                        <Form.Select
                            name="collegeId"
                            value={major.collegeId}
                            onChange={onChange}
                            aria-label="단과대학 선택 콤보박스"
                            size="md"
                        >
                            {Array.isArray(colleges) && colleges.map((c) => (
                                <option key={c.id} value={String(c.id)}>{c.type}</option>
                            ))}

                        </Form.Select>

                    </Form.Group>
                </Form.Group>



                <Stack direction="horizontal" gap={8}>
                    <Button type="submit" disabled={saving}>
                        {saving ? <Spinner size="sm" /> : "수정"}
                    </Button>

                    {/* 목록 이동 버튼 */}
                    <div className="ms-auto" />
                    <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={() => navigate("/majorList")}
                        disabled={loading}   // 로딩 중엔 비활성화
                    >
                        목록으로 이동
                    </Button>
                </Stack>
            </Form>
        </div>
    );
}
export default App;
