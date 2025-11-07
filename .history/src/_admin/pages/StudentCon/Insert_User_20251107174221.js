import { Button, Form } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
    const dateInputRef = useRef(null);
    const [user, setUser] = useState({
        name: "",
        password: "",
        birthdate: "",
        email: "",
        phone: "",
        gender: "",
        major: "",
        type: "",
    });
    const [collegeList, setCollegeList] = useState([]);
    const [majorList, setMajorList] = useState([]);
    const [college, setCollege] = useState("");
    const [file, setFile] = useState(null); // 파일 상태
    const navigate = useNavigate();

    const getCollegeList = () => {
        axios
            .get(`${API_BASE_URL}/college/list`)
            .then((res) => setCollegeList(res.data))
            .catch(() => setCollegeList([]));
    };

    useEffect(() => {
        getCollegeList();
    }, []);

    useEffect(() => {
        if (!college) {
            setMajorList([]);
            return;
        }
        axios
            .get(`${API_BASE_URL}/major/list`, { params: { college_id: college } })
            .then((res) => setMajorList(res.data))
            .catch(console.log);
    }, [college]);

    const signup = async (e) => {
        e.preventDefault();

        if (!user.type) return alert("역할을 선택하세요");
        if (!user.gender) return alert("성별을 선택하세요");

        try {
            const formData = new FormData();
            for (const key in user) {
                formData.append(key, user[key]);
            }
            if (file) {
                formData.append("file", file);
            }

            const response = await axios.post(`${API_BASE_URL}/user/signup`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data", // 명시적으로 설정
                },
            });

            if (response.data.success) {
                alert("등록 성공");
                navigate("/user/UserList");
            }
        } catch (error) {
            const err = error.response;
            if (!err) return alert("네트워크 오류가 발생하였습니다");

            const message = err.data?.message ?? "오류 발생";
            alert(message);
        }
    };

    return (
        <>
            <Form onSubmit={signup}>
                <Form.Group className="mb-3">
                    <Form.Label>이름</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="이름을 입력해 주세요."
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>성별</Form.Label>
                    <Form.Select
                        value={user.gender}
                        onChange={(e) => setUser({ ...user, gender: e.target.value })}
                    >
                        <option value="">선택</option>
                        <option value="MALE">남자</option>
                        <option value="FEMALE">여자</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>이메일</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="이메일을 입력해 주세요."
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>생년월일</Form.Label>
                    <Form.Control
                        ref={dateInputRef}
                        type="date"
                        value={user.birthdate}
                        onChange={(e) => setUser({ ...user, birthdate: e.target.value })}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>휴대전화</Form.Label>
                    <Form.Control
                        type="tel"
                        value={user.phone}
                        onChange={(e) =>
                            setUser({ ...user, phone: e.target.value, password: e.target.value })
                        }
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>단과 대학</Form.Label>
                    <Form.Select
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                    >
                        <option value="">선택</option>
                        {collegeList.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.type}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>학과</Form.Label>
                    <Form.Select
                        value={user.major}
                        onChange={(e) => setUser({ ...user, major: e.target.value })}
                    >
                        <option value="">선택</option>
                        {majorList.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.m_name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>사용자 구분</Form.Label>
                    <Form.Select
                        value={user.type}
                        onChange={(e) => setUser({ ...user, type: e.target.value })}
                    >
                        <option value="">선택</option>
                        <option value="STUDENT">학생</option>
                        <option value="PROFESSOR">교수</option>
                        <option value="ADMIN">관리자</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>프로필 사진</Form.Label>
                    <Form.Control
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])} // 파일 선택
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    등록하기
                </Button>
            </Form>
        </>
    );
}

export default App;
