import { Button, Form } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";


function App() {
    const dateInputRef = useRef(null);
    const [user, setUser] = useState({
        u_name: '',
        password: '',
        birthdate: '',
        email: '',
        phone: '',
        gender: '',
        major: '',
        u_type: '',
    });
    const [collegeList, setCollegeList] = useState([]);
    const [majorList, setMajorList] = useState([]);
    const [college, setCollege] = useState('');

    const navigate = useNavigate();

    const getCollegeList = () => {
        const url = `${API_BASE_URL}/college/list`
        axios
            .get(url)
            .then((response) => {


                setCollegeList(response.data)
                console.log(collegeList)
            })
            .catch((error) => {
                setCollegeList([]); // 실패 시 안전값
            })
    }

    useEffect(() => { getCollegeList(); }, []);

    useEffect(() => {
        if (!college) {           // <= 선택 전엔 요청하지 않기
            setMajorList([]);
            return;
        }

        const url = `${API_BASE_URL}/major/list`;
        axios
            .get(url, { params: { college_id: college } })
            .then((response) => {
                setMajorList(response.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }, [college])


    const signup = async (e) => {

        try {
            e.preventDefault();
            const url = `${API_BASE_URL}/user/signup`;
            const response = await axios.post(url, user);

            if (response.status === 200) {
                alert('등록 성공');
                navigate('/user/UserList')
            }
        } catch (err) {
            alert('등록실패');
            console.error("status:", err.response?.status);
            console.error("data:", err.response?.data); // ★ 서버의 에러 메시지/스택이 JSON으로 오면 여기 찍힘

        }


    };
    // 필요 훅: useState, useEffect, useRef가 이미 import돼 있어야 합니다.
        const phoneMidRef = useRef(null);
        const phoneLastRef = useRef(null);

        // 내부 세그먼트 상태 (저장은 계속 user.phone 만 사용)
        const [phonePrefix, setPhonePrefix] = useState("010");
        const [phoneMid, setPhoneMid] = useState("");
        const [phoneLast, setPhoneLast] = useState("");

        // 초기값 분해 (수정 화면 진입 시 user.phone -> 세 칸으로 쪼개기)
        useEffect(() => {
        const raw = (user?.phone ?? "").replace(/[^0-9]/g, "");
        if (!raw) return;

        const pref = raw.slice(0, 3) || "010";
        const rest = raw.slice(3);
        const last = rest.slice(-4);
        const mid = rest.slice(0, Math.max(0, rest.length - 4));

        setPhonePrefix(pref);
        setPhoneMid(mid);
        setPhoneLast(last);
        }, [user?.phone]);

        // 세 칸이 바뀔 때마다 user.phone 을 "010-1234-5678" 형태로 동기화
        useEffect(() => {
        const mid = phoneMid.replace(/\D/g, "").slice(0, 4);
        const last = phoneLast.replace(/\D/g, "").slice(0, 4);
        const pref = phonePrefix;

        const value = [pref, mid, last].filter(Boolean).join("-");
        setUser(prev => (prev?.phone === value ? prev : { ...prev, phone: value }));
        }, [phonePrefix, phoneMid, phoneLast, setUser]);

        const handleMidChange = (e) => {
        const v = e.target.value.replace(/\D/g, "").slice(0, 4);
        setPhoneMid(v);
        if (v.length === 4) phoneLastRef.current?.focus();
        };

        const handleLastChange = (e) => {
        const v = e.target.value.replace(/\D/g, "").slice(0, 4);
        setPhoneLast(v);
        };

        const handleLastKeyDown = (e) => {
        if (e.key === "Backspace" && !phoneLast) {
            phoneMidRef.current?.focus();
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
                        name="name"
                        value={user.u_name}
                        onChange={(event) => {
                            setUser(previous => ({ ...previous, u_name: event.target.value }))
                            console.log(event.target.value)
                        }}

                    />

                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>성별</Form.Label>
                    <Form.Select
                        onChange={(e) => {
                            const value = e.target.value;
                            setUser(prev => ({ ...prev, gender: value }))
                            console.log(e.target.value)
                        }}
                    >
                        <option value={''}>선택</option>
                        <option value={'MALE'}>남자</option>
                        <option value={'FEMALE'}>여자</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>이메일</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="이메일을 입력해 주세요."
                        name="email"
                        value={user.email}
                        onChange={(event) => {
                            setUser(previous => ({ ...previous, email: event.target.value , password: event.target.value }))
                            
                            console.log(event.target.value)
                        }}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>생년월일</Form.Label>
                    <div className="d-flex gap-2">
                        <Form.Control
                            ref={dateInputRef}
                            type="date"                 // 브라우저 내장 달력
                            placeholder="YYYY-MM-DD"
                            name="birthdate"
                            value={user.birthdate}
                            onChange={(event) => {
                                setUser(previous => ({ ...previous, birthdate: event.target.value }))
                                console.log(event.target.value)
                            }}
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
                        >
                            달력
                        </Button>
                    </div>
                </Form.Group>

                <Form.Group controlId="phone" className="mb-3">
                <Form.Label>휴대전화</Form.Label>
                <div className="d-flex align-items-center gap-2">
                    <Form.Select
                    size="sm"
                    style={{ width: 110 }}
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    >
                    <option value="010">010</option>
                    <option value="011">011</option>
                    <option value="016">016</option>
                    <option value="017">017</option>
                    <option value="018">018</option>
                    <option value="019">019</option>
                    </Form.Select>

                    <span className="text-muted">-</span>

                    <Form.Control
                    size="sm"
                    ref={phoneMidRef}
                    inputMode="numeric"
                    pattern="\d*"
                    placeholder="1234"
                    value={phoneMid}
                    onChange={handleMidChange}
                    maxLength={4}
                    style={{ width: 120 }}
                    />

                    <span className="text-muted">-</span>

                    <Form.Control
                    size="sm"
                    ref={phoneLastRef}
                    inputMode="numeric"
                    pattern="\d*"
                    placeholder="5678"
                    value={phoneLast}
                    onChange={handleLastChange}
                    onKeyDown={handleLastKeyDown}
                    maxLength={4}
                    style={{ width: 120 }}
                    />
                </div>
  <Form.Text muted>저장 값: {user.phone || "미입력"}</Form.Text>
</Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>소속 단과 대학</Form.Label>
                    <Form.Select
                        value={college}
                        onChange={(e) => {
                            const value = e.target.value
                            setCollege(value)
                            console.log(value)
                        }}
                    >
                        <option value={''}>단과 대학을 선택해주세요</option>
                        {collegeList.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.type}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>소속 학과</Form.Label>
                    <Form.Select
                        value={user.major}
                        onChange={(e) => {
                            const value = e.target.value
                            setUser(prev => ({ ...prev, major: value }))
                            console.log(e.target.value)
                        }}
                    >
                        <option value={''}>소속 학과를 선택해주세요</option>
                        {majorList.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.m_name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>사용자 구분</Form.Label>
                    <Form.Select
                        onChange={(e) => {
                            const value = e.target.value;
                            setUser(prev => ({ ...prev, u_type: value }))
                            console.log(e.target.value)
                        }}
                    >
                        <option value={''}>선택</option>
                        <option value={'STUDENT'}>학생</option>
                        <option value={'PROFESSOR'}>교수</option>
                        <option value={'ADMIN'}>관리자</option>
                    </Form.Select>
                </Form.Group>



                <Button variant="primary" type="submit">
                    등록하기
                </Button>
            </Form>

        </>
    )
}
export default App;