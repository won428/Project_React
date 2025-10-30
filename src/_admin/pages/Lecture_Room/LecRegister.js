import { use, useEffect, useRef, useState } from "react";

import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
function App() {

    const [collegeList, setCollegeList] = useState([])
    const [professorList, setProfessorList] = useState([])
    const [majorList, setMajorList] = useState([]);
    const [college,setCollege] = useState('');
    const [lecture,setLecture] = useState({
        name:'',
        level:'',
        user:'',
        credit:'',
        startDate:'',
        endDate:'',
        description:'',
        major:'',
        status:'',
        totalStudent:'',
        completionDiv:''
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
      {/* 전체 그리드 여백 최소화 */}
      <Row className="g-3">

        {/* 1) 학년 · 학점 · 상태 */}
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-semibold">학년</Form.Label>
            <Form.Select size="sm"
              onChange={(e) => {
                const value = e.target.value;
                setLecture(prev => ({ ...prev, level: Number(value) }))
                console.log(e.target.value)
              }}>
              <option value={''}>선택</option>
              <option value={'1'}>1학년</option>
              <option value={'2'}>2학년</option>
              <option value={'3'}>3학년</option>
              <option value={'4'}>4학년</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-semibold">학점</Form.Label>
            <Form.Select size="sm"
              onChange={(e) => {
                const value = e.target.value;
                setLecture(prev => ({ ...prev, credit: value }))
                console.log(e.target.value)
              }}>
              <option value={''}>선택</option>
              <option value={'1'}>1학점</option>
              <option value={'2'}>2학점</option>
              <option value={'3'}>3학점</option>
              <option value={'4'}>4학점</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-semibold">상태</Form.Label>
            <Form.Select size="sm"
              onChange={(e) => {
                const value = e.target.value;
                setLecture(prev => ({ ...prev, status: value }))
                console.log(e.target.value)
              }}>
              <option value={''}>선택</option>
              <option value={'PENDING'}>승인 대기</option>
              <option value={'APPROVED'}>승인</option>
              {/* <option value={'INPROGRESS'}>수강중</option>
              <option value={'COMPLETED'}>종강</option> */}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* 2) 소속(단과대/학과) · 담당교수 */}
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-semibold">소속 단과 대학</Form.Label>
            <Form.Select size="sm"
              value={college}
              onChange={(e) => {
                const value = e.target.value
                setCollege(value)
                console.log(value)
              }}>
              <option value={''}>단과 대학을 선택해주세요</option>
              {collegeList.map(c => (
                <option key={c.id} value={c.id}>{c.type}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-semibold">소속 학과</Form.Label>
            <Form.Select size="sm"
              value={lecture.major}
              onChange={(e) => {
                const value = e.target.value
                setMajor(value)
                setLecture((previous)=>({...previous, major: value}))
                console.log(e.target.value)
              }}>
              <option value={''}>소속 학과를 선택해주세요</option>
              {majorList.map(m => (
                <option key={m.id} value={m.id}>{m.m_name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-semibold">담당 교수</Form.Label>
            <Form.Select size="sm"
              value={lecture.user}
              onChange={(e) => {
                const value = e.target.value
                setLecture((previous)=>({...previous, user: value}))
                console.log(value)
              }}>
              <option value={''}>담당 교수를 선택해주세요</option>
              {professorList.map(p => (
                <option key={p.id} value={p.id}>{p.u_name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* 3) 강의 기본정보: 이름 · 이수구분 · 총원 */}
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-semibold">강의 이름</Form.Label>
            <Form.Control size="sm" type="text"
              placeholder="강의 이름을 입력해주세요."
              name="name"
              value={lecture.name}
              onChange={(event) => {
                setLecture((previous)=>({...previous, name: event.target.value}))
                console.log(event.target.value)
              }} />
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-semibold">이수 구분</Form.Label>
            <Form.Select size="sm"
              onChange={(e) => {
                const value = e.target.value;
                setLecture(prev => ({ ...prev, completionDiv: value }))
                console.log(e.target.value)
              }}>
              <option value={''}>선택</option>
              <option value={'MAJOR_REQUIRED'}>전공 필수</option>
              <option value={'MAJOR_ELECTIVE'}>전공 선택</option>
              <option value={'LIBERAL_REQUIRED'}>교양 필수</option>
              <option value={'LIBERAL_ELECTIVE'}>교양 선택</option>
              <option value={'GENERAL_ELECTIVE'}>일반 선택</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-semibold">총원</Form.Label>
            <Form.Control size="sm" type="number"
              placeholder="강의 총원을 입력해주세요."
              name="totalStudent"
              value={lecture.totalStudent}
              onChange={(event) => {
                setLecture((previous)=>({...previous, totalStudent: event.target.value}))
                console.log(event.target.value)
              }} />
          </Form.Group>
        </Col>

        {/* 4) 기간: 시작일 · 종료일 (버튼 포함 가로 배치 유지) */}
        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-semibold">시작 날짜</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control size="sm"
                ref={startRef}
                type="date"
                placeholder="YYYY-MM-DD"
                name="birthdate"
                value={lecture.startDate}
                onChange={(event) => {
                  setLecture(previous => ({ ...previous, startDate: event.target.value }))
                  console.log(event.target.value)
                }} />
              <Button size="sm" variant="outline-secondary"
                onClick={() => startRef.current?.showPicker?.() || startRef.current?.focus()}>
                달력
              </Button>
            </div>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label className="small fw-semibold">종료 날짜</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control size="sm"
                ref={endRef}
                type="date"
                placeholder="YYYY-MM-DD"
                name="birthdate"
                value={lecture.endDate}
                onChange={(event) => {
                  setLecture(previous => ({ ...previous, endDate: event.target.value }))
                  console.log(event.target.value)
                }} />
              <Button size="sm" variant="outline-secondary"
                onClick={() => endRef.current?.showPicker?.() || endRef.current?.focus()}>
                달력
              </Button>
            </div>
          </Form.Group>
        </Col>

        {/* 5) 강의 설명 (넓게 한 줄) */}
        <Col md={12}>
          <Form.Group>
            <Form.Label className="small fw-semibold">강의 설명</Form.Label>
            <Form.Control size="sm" type="text"
              placeholder="강의 설명을 입력해주세요."
              name="descripton"
              value={lecture.description}
              onChange={(event) => {
                setLecture((previous)=>({...previous, description: event.target.value}))
                console.log(event.target.value)
              }} />
          </Form.Group>
        </Col>

        {/* 6) 제출 버튼 */}
        <Col xs={12} className="mt-2">
          <Button size="sm" variant="primary" type="submit">
            등록하기
          </Button>
        </Col>
      </Row>
    </Form>
  </>
)

}
export default App;