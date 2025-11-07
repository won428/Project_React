import { useNavigate, useParams } from "react-router-dom";
import { use, useEffect, useRef, useState } from "react";
import { Button, Card, Col, Container, Form, Row, Table } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function App() {

  const { id } = useParams()
  const [userinfo, setUserinfo] = useState({});
  const navigate = useNavigate();
  const dateInputRef = useRef(null);
  const [user, setUser] = useState({
    u_name: '',
    password: '',
    birthdate: '',
    email: '',
    phone: '',
    gender: '',
    major: '',
    college: '',
    u_type: '',
  });
  const [collegeList, setCollegeList] = useState([]);
  const [majorList, setMajorList] = useState([]);
  const [college, setCollege] = useState('');

  const getCollegeList = () => {
    const url = `${API_BASE_URL}/college/list`
    axios
      .get(url)
      .then((response) => {


        setCollegeList(response.data)
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
        console.error("status:", error.response?.status);
        console.error("data:", error.response?.data); // ★ 서버의 에러 메시지/스택이 JSON으로 오면 여기 찍힘

      })
  }, [college])

  useEffect(() => {
    const url = `${API_BASE_URL}/user/selectUserCode/${id}`
    console.log({ id })
    if (!id) return;
    axios.get(url)
      .then((response) => {
        setUserinfo(response.data)
        console.log(response.data)

      })
      .catch((error) => {
        console.error("status:", error.response?.status);
        console.error("data:", error.response?.data); // ★ 서버의 에러 메시지/스택이 JSON으로 오면 여기 찍힘
      })


  }, [id])

  useEffect(() => {

    setUser((previous) => ({
      ...previous,
      u_name: userinfo.u_name,
      password: '',
      birthdate: userinfo.birthdate,
      email: userinfo.email,
      phone: userinfo.phone,
      gender: userinfo.gender,
      u_type: userinfo.u_type,
      major: userinfo.major,
      college: userinfo.college
    }))

  }, [userinfo])

  const signup = async (e) => {
    try {
      e.preventDefault();
      const url = `${API_BASE_URL}/user/admin/update/${id}`;
      const response = await axios.patch(url, user);

      if (response.status === 200) {
        alert('등록 성공');
        navigate('/user/UserList')
      }
    } catch (error) {
      alert('등록실패');
      console.log(error)

    }
  };




  const typeMap = {
    ADMIN: '관리자',
    STUDENT: '학생',
    PROFESSOR: '교수'
  };

  return (
    <>
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <Row className="w-100">
          {/* 가로 폭 제한: 필요에 맞게 조절 (md=8, lg=6, xl=5 등) */}
          <Col xs={12} md={8} lg={6} xl={5} className="mx-auto">
            {/* 네모 상자 카드 */}
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Header className="bg-white border-0 px-4 pt-4">
                <h5 className="mb-0">사용자 수정</h5>
              </Card.Header>

              {/* 내부 여백 넉넉하게 */}
              <Card.Body className="p-4 p-md-5">

                <Form onSubmit={signup}>
                  <Form.Group className="mb-3">
                    <Form.Label>이름</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="이름을 입력해 주세요."
                      name="name"
                      defaultValue={user.u_name}
                      readOnly
                      onChange={(event) => {
                        setUser((previous) => ({ ...previous, u_name: event.target.value }));
                        console.log(event.target.value);
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>성별</Form.Label>
                    <Form.Select
                      value={user.gender ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setUser((prev) => ({ ...prev, gender: value }));
                        console.log(e.target.value);
                      }}
                    >
                      <option value={""}>선택</option>
                      <option value={"남자"}>남자</option>
                      <option value={"여자"}>여자</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>이메일</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="이메일을 입력해 주세요."
                      name="email"
                      defaultValue={user.email}
                      onChange={(event) => {
                        setUser((previous) => ({ ...previous, email: event.target.value }));
                        console.log(event.target.value);
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>비밀번호</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="비밀번호를 입력해주세요."
                      name="password"
                      value={user.password}
                      onChange={(event) => {
                        setUser((previous) => ({ ...previous, password: event.target.value }));
                        console.log(event.target.value);
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>생년월일</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Control
                        ref={dateInputRef}
                        type="date"
                        placeholder="YYYY-MM-DD"
                        name="birthdate"
                        defaultValue={user.birthdate}
                        onChange={(event) => {
                          setUser((previous) => ({ ...previous, birthdate: event.target.value }));
                          console.log(event.target.value);
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
                    <Form.Label>휴대전화</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="휴대폰 번호를 입력해 주세요."
                      name="phone"
                      defaultValue={user.phone}
                      onChange={(event) => {
                        setUser((previous) => ({ ...previous, phone: event.target.value }));
                        setUser((previous) => ({ ...previous, password: event.target.value }));
                        console.log(event.target.value);
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
                      value={user.u_type}
                      onChange={(e) => {
                        const value = e.target.value;
                        setUser((prev) => ({ ...prev, u_type: value }));
                        console.log(e.target.value);
                      }}
                    >
                      <option value={""}>선택</option>
                      <option value={"STUDENT"}>학생</option>
                      <option value={"PROFESSOR"}>교수</option>
                      <option value={"ADMIN"}>관리자</option>
                    </Form.Select>
                  </Form.Group>

                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <Button variant="primary" type="submit" className="px-4">
                      수정하기
                    </Button>
                    <Button
                      variant="outline-secondary"   // ← 뒤로/취소 느낌
                      type="button"
                      className="px-4"
                      onClick={() => navigate('/user/UserList')}
                    >
                      돌아가기
                    </Button>
                  </div>
                </Form>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}
export default App;