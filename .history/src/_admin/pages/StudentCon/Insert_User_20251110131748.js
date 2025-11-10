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

                <Form.Group className="mb-3">
                    <Form.Label>휴대전화</Form.Label> {/* +82 같이 국가번호 셀렉박스 추가 */}
                    <Form.Control
                        type="tel"
                        placeholder="휴대폰 번호를 입력해 주세요."
                        name="phone"
                        value={user.phone}
                        onChange={(event) => {
                            setUser(previous => ({ ...previous, phone: event.target.value }))
                            setUser(previous => ({ ...previous, password: event.target.value }))
                            console.log(event.target.value)
                        }}

                    />
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