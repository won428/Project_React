import { Button, Form, Image } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";


function App() {
    const dateInputRef = useRef(null);
    const [user, setUser] = useState({
        name: '',
        password: '',
        birthdate: '',
        email: '',
        phone: '',
        gender: '',
        major: '',
        type: '',
    });
    const [collegeList, setCollegeList] = useState([]);
    const [majorList, setMajorList] = useState([]);
    const [college, setCollege] = useState('');
    const [file, setFile] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [errors, setErrors] = useState({
        name: '', email: '', password: '', birthdate: '', phone: '', gender: '', major: '', type: ''
    });

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

    useEffect(() => {
        // 컴포넌트가 사라질 때(unmount) 실행될 클린업 함수
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);
    const signup = async (e) => {

        try {
            e.preventDefault();



            if (user.type === '') {
                alert('역할을 선택하세요')
                return;
            }
            if (user.gender === '') {
                alert('성별을 선택하세요')
                return;
            }

            const newformData = new FormData();
            newformData.append("name", user.name);
            newformData.append("password", user.password);
            newformData.append("birthdate", user.birthdate);
            newformData.append("email", user.email);
            newformData.append("phone", user.phone);
            newformData.append("gender", user.gender);
            newformData.append("major", user.major);
            newformData.append("type", user.type);
            newformData.append("file", file);
            const url = `${API_BASE_URL}/user/signup`;
            const response = await axios.post(url, newformData);

            if (response.data.success) {
                alert('등록 성공');
                navigate('/user/UserList')
            } else {
                alert('등록 성공');
                navigate('/user/UserList')
            }
        } catch (error) {

            const err = error.response;
            if (!err) {
                alert('네트워크 오류가 발생하였습니다')
                return;
            }

            const httpStatus = err.status;
            const errData = err.data;

            const message = errData?.message ?? '오류 발생'

            alert(message)
        }
    };

    const FileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const newPreviewUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(newPreviewUrl);
        }
    }

    // 필요 훅: useState, useEffect, useRef가 이미 import돼 있어야 합니다.
        const phoneMidRef = useRef(null);
        const phoneLastRef = useRef(null);

        // 내부 세그먼트 상태 (저장은 계속 user.phone 만 사용)
        const [phonePrefix, setPhonePrefix] = useState("010");
        const [phoneMid, setPhoneMid] = useState("");
        const [phoneLast, setPhoneLast] = useState("");

        useEffect(() => {
        const p = user?.phone ?? "";
        // 하이픈 포함 & 올바른 자리수일 때만 동작
        const m = p.match(/^01[016789]-(\d{3,4})-(\d{4})$/);
        if (!m) return;

        setPhonePrefix(p.slice(0, 3)); // 010, 011, ...
        setPhoneMid(m[1]);             // 3~4자리
        setPhoneLast(m[2]);            // 4자리
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
                {previewUrl && (
                    <div className="mt-3">
                        <p>미리보기:</p>
                        <Image
                            src={previewUrl}
                            alt="Preview"
                            thumbnail // 부트스트랩의 썸네일 스타일 적용
                            style={{ maxWidth: '300px' }}
                        />
                    </div>
                )}
                <Form.Group>
                    <Form.Label>사진</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={FileChange}
                        max={1}
                    />

                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>이름</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="이름을 입력해 주세요."
                        name="name"
                        value={user.name}
                        onChange={(event) => {
                            setUser(previous => ({ ...previous, name: event.target.value }))
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
                            setUser(previous => ({ ...previous, email: event.target.value }))
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
                            min="0001-01-01"
                            max="9999-12-31"
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
                            setUser(prev => ({ ...prev, type: value }))
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