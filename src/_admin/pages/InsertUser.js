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