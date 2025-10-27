import { use, useEffect, useRef, useState } from "react";

import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
function App() {

    const [collegeList, setCollegeList] = useState([])
    const [professorList, setProfessorList] = useState([])
    const [majorList, setMajorList] = useState([]);
    const [college,setCollege] = useState('');
    const [lecture,setLecture] = useState({
        name:'',
        user:'',
        credit:'',
        startDate:'',
        endDate:'',
        description:'',
        major:'',
        status:'',
        totalStudent:''
    });
    const [major, setMajor] = useState('');
    
    const startRef = useRef(null);
    const endRef = useRef(null);
    
    

    
    const navigate = useNavigate(); 


    useEffect(() => {
        const url = `${API_BASE_URL}/college/list`
        axios
            .get(url)
            .then((response) => {


                setCollegeList(response.data)
                console.log(collegeList)
            })
            .catch((error) => {
                setCollegeList([]); // 실패 시 안전값
                console.error("status:", error.response?.status);
                console.error("data:", error.response?.data); // ★ 서버의 에러 메시지/스택이 JSON으로 오면 여기 찍힘
            })
    }, []);

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
                setMajorList([]); // 실패 시 안전값
                console.error("status:", error.response?.status);
                console.error("data:", error.response?.data); // ★ 서버의 에러 메시지/스택이 JSON으로 오면 여기 찍힘
            })
    }, [college])

    useEffect(() => {
        if (!major) {           // <= 선택 전엔 요청하지 않기
            setProfessorList([]);
            return;
        }

        const url = `${API_BASE_URL}/user/professorList`;
        axios
            .get(url, { params: { major_id: major } })
            .then((response) => {
                setProfessorList(response.data)
            })
            .catch((error) => {
                setProfessorList([]);
                console.error("status:", error.response?.status);
                console.error("data:", error.response?.data); // ★ 서버의 에러 메시지/스택이 JSON으로 오면 여기 찍힘
            })
    }, [major])
   
    
    
    const signup = async (e) => {
        try {
            e.preventDefault();
            const url = `${API_BASE_URL}/lecture/admin/lectureRegister`;
            const response = await axios.post(url, lecture);

            if (response.status === 200) {
                alert('등록 성공');
                navigate('/user/UserList')
            }
        } catch (error) {
            alert('등록실패');
            console.error("status:", error.response?.status);
            console.error("data:", error.response?.data); // ★ 서버의 에러 메시지/스택이 JSON으로 오면 여기 찍힘

        }


    };

    return (
        <>
            <Form onSubmit={signup}>
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
                        value={lecture.major}
                        onChange={(e) => {
                            const value = e.target.value
                            setMajor(value)
                            setLecture((previous)=>({...previous, major: value}))
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
                    
                    <Form.Label>담당 교수</Form.Label>
                    <Form.Select
                        value={lecture.user}
                        onChange={(e) => {
                            const value = e.target.value
                            setLecture((previous)=>({...previous, user: value}))
                            console.log(value)
                        }}
                    >
                        <option value={''}>담당 교수를 선택해주세요</option>
                        {professorList.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.u_name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                    <Form.Label>강의 이름</Form.Label> {/* +82 같이 국가번호 셀렉박스 추가 */}
                    <Form.Control
                        type="text"
                        placeholder="강의 이름을 입력해주세요."
                        name="name"
                        value={lecture.name}
                        onChange={(event) => {
                            setLecture((previous)=>({...previous, name: event.target.value}))
                            console.log(event.target.value)
                        }}

                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>강의 설명</Form.Label> {/* +82 같이 국가번호 셀렉박스 추가 */}
                    <Form.Control
                        type="text"
                        placeholder="강의 설명을 입력해주세요."
                        name="descripton"
                        value={lecture.description}
                        onChange={(event) => {
                            setLecture((previous)=>({...previous, description: event.target.value}))
                            console.log(event.target.value)
                        }}

                    />
                </Form.Group>

                 <Form.Group className="mb-3">
                    <Form.Label>총원</Form.Label> {/* +82 같이 국가번호 셀렉박스 추가 */}
                    <Form.Control
                        type="number"
                        placeholder="강의 총원을 입력해주세요."
                        name="totalStudent"
                        value={lecture.totalStudent}
                        onChange={(event) => {
                            setLecture((previous)=>({...previous, totalStudent: event.target.value}))
                            console.log(event.target.value)
                        }}

                    />
                </Form.Group>
                
                <Form.Group className="mb-3">
                    <Form.Label>시작 날짜</Form.Label>
                    <div className="d-flex gap-2">
                        <Form.Control
                            ref={startRef}
                            type="date"                 // 브라우저 내장 달력
                            placeholder="YYYY-MM-DD"
                            name="birthdate"
                            value={lecture.startDate}
                            onChange={(event) => {
                                setLecture(previous => ({ ...previous, startDate: event.target.value }))
                                console.log(event.target.value)
                            }}
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => startRef.current?.showPicker?.() || startRef.current?.focus()}
                        >
                            달력
                        </Button>
                    </div>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>종료 날짜</Form.Label>
                    <div className="d-flex gap-2">
                        <Form.Control
                            ref={endRef}
                            type="date"                 // 브라우저 내장 달력
                            placeholder="YYYY-MM-DD"
                            name="birthdate"
                            value={lecture.endDate}
                            onChange={(event) => {
                                setLecture(previous => ({ ...previous, endDate: event.target.value }))
                                console.log(event.target.value)
                            }}
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => endRef.current?.showPicker?.() || endRef.current?.focus()}
                        >
                            달력
                        </Button>
                    </div>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>학점</Form.Label>
                    <Form.Select
                        onChange={(e) => {
                            const value = e.target.value;
                            setLecture(prev => ({ ...prev, credit: value }))
                            console.log(e.target.value)
                        }}
                    >
                        <option value={''}>선택</option>
                        <option value={'1'}>1학점</option>
                        <option value={'2'}>2학점</option>
                        <option value={'3'}>3학점</option>
                        <option value={'4'}>4학점</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>상태</Form.Label>
                    <Form.Select
                        onChange={(e) => {
                            const value = e.target.value;
                            setLecture(prev => ({ ...prev, status: value }))
                            console.log(e.target.value)
                        }}
                    >
                        <option value={''}>선택</option>
                        <option value={'PENDING'}>승인 대기</option>
                        <option value={'INPROGRESS'}>수강중</option>
                        <option value={'COMPLETED'}>종강</option>
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