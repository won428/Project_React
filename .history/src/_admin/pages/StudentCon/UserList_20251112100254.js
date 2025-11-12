import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Pagination, Row, Table, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function UsersSkeleton() {

  const [userList, setUserList] = useState([]);
  const [colllegeList, setCollegeList] = useState([]);
  const [majorList, setMajorList] = useState([]);
  const [college, setCollege] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [professorList, setProfessorList] = useState([]);
  const [adminList, setAdmin] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const roleMap = { students: 'STUDENT', professors: 'PROFESSOR', admins: 'ADMIN' };

  const [paging, setPaging] = useState({
    totalElements : 0,
    pageSize : 10,
    totalPages : 0,
    pageNumber : 0,
    pageCount : 10,
    beginPage : 0,
    endPage : 0,
    searchCollege: '',
    searchMajor: '',
    searchGender: '',
    searchUserType: '',
    searchMode: 'all',
    searchKeyword:'',
    searchLevel:'',
  });

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCollege('');
    setMajorList([]);
    setPaging(prev => ({
      ...prev,
      pageNumber: 0, beginPage: 0, endPage: 0, totalElements: 0, totalPages: 0,
      searchCollege: '', searchMajor: '', searchGender: '', searchMode: 'all', searchKeyword: '', searchLevel: '',
      searchUserType: roleMap[key],
    }));
  };

  const navigate = useNavigate();

  useEffect(() => {
    const url = `${API_BASE_URL}/user/pageList`;

    // 2) 조건부 파라미터 전송 (빈 값/불필요 값 제외, 학년은 학생 탭에서만 전송)
    const params = {
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
      searchCollege: paging.searchCollege || undefined,
      searchMajor: paging.searchMajor || undefined,
      searchGender: paging.searchGender || undefined,
      searchUserType: paging.searchUserType || undefined,
      searchMode: paging.searchMode || undefined,
      searchKeyword: (paging.searchKeyword || '').trim() || undefined,
    };
    if (activeTab === 'students' && paging.searchLevel) {
      params.searchLevel = Number(paging.searchLevel);
    }

    axios
      .get(url, { params })
      .then((response) => {
<<<<<<< HEAD
        console.log('응답 받은 데이터')
        console.log(response.data)
        setUserList(response.data.content || []);

        setPaging((previous) => {
=======
        setUserList(response.data.content || []);
        setPaging((previous)=>{
>>>>>>> origin/develop
          const totalElements = response.data.totalElements;
          const totalPages = response.data.totalPages;
          const pageNumber = response.data.pageable.pageNumber;
          const pageSize = response.data.pageable.pageSize;

          const beginPage = Math.floor(pageNumber / previous.pageCount) * previous.pageCount;
          const endPage = Math.min(beginPage + previous.pageCount - 1, totalPages - 1);

<<<<<<< HEAD

          return {
            ...previous,
            totalElements: totalElements,
            totalPages: totalPages,
            pageNumber: pageNumber,
            pageSize: pageSize,
            beginPage: beginPage,
            endPage: endPage,
          };

        })



=======
          return {
            ...previous,
            totalElements,
            totalPages,
            pageNumber,
            pageSize,
            beginPage,
            endPage,
          };
        });
>>>>>>> origin/develop
      })
      .catch((error) => {
        console.log(error?.response?.data || error);
      });

  // 1) 의존성(이미 적용했다고 했던 부분) — 중복 제거 및 searchLevel 포함
  }, [paging.searchLevel, paging.pageNumber, paging.searchCollege, paging.searchMajor, paging.searchGender, paging.searchUserType, paging.searchMode, paging.searchKeyword, activeTab]);

<<<<<<< HEAD
  }, [paging.pageNumber, paging.searchCollege, paging.searchMajor, paging.searchCollege, paging.searchGender, paging.searchUserType, paging.searchMode, paging.searchKeyword])

  useEffect(() => {
    const url = `${API_BASE_URL}/college/list`;

    axios
      .get(url)
      .then((response) => {
        setCollegeList(response.data)
      })
      .catch((error) => {
        const err = error.response;
        if (!err) {
          alert('네트워크 오류가 발생하였습니다')
          return;
        }
        console.log(error)
      })

  }, [])

  useEffect(() => {
    const url = `${API_BASE_URL}/major/list`
=======
  useEffect(()=>{
    const url = `${API_BASE_URL}/college/list`;
    axios.get(url)
      .then((response)=> setCollegeList(response.data))
      .catch((error)=>{
        const err = error.response;
        if(!err){
          alert('네트워크 오류가 발생하였습니다');
          return;
        }
        console.log(error);
      });
  },[]);

  useEffect(()=>{
    const url = `${API_BASE_URL}/major/list`;
>>>>>>> origin/develop

    if (!college) {
      setMajorList([]);
      return;
    }
<<<<<<< HEAD

    axios
      .get(url, {
        params: {
          college_id: Number(college)
        }
      })
      .then((response) => {
        setMajorList(response.data)
        console.log(response.data)
      })
      .catch((error) => {
        const err = error.response;
        if (!err) {
          alert('네트워크 오류가 발생하였습니다')
          return;
        }
        console.log(error)
      })

  }, [college])
=======
    axios
      .get(url,{ params:{ college_id: Number(college) }})
      .then((response)=> setMajorList(response.data))
      .catch((error)=>{
        const err = error.response;
        if(!err){
          alert('네트워크 오류가 발생하였습니다');
          return;
        }
        console.log(error);
      });
  },[college]);
>>>>>>> origin/develop

  const typeMap = {
    ADMIN: '관리자',
    STUDENT: '학생',
    PROFESSOR: '교수'
  };

  useEffect(() => {
    setStudentList((userList || []).filter(u => u.u_type === 'STUDENT'));
    setProfessorList((userList || []).filter(u => u.u_type === 'PROFESSOR'));
    setAdmin((userList || []).filter(u => u.u_type === 'ADMIN'));
  }, [userList]);

  return (
    <Container fluid className="py-4" style={{ maxWidth: "100%" }}>
      <Row className="align-items-center mb-3 gy-2">
        <Col xs={12} md="auto">
          <h4 className="mb-0">사용자 목록</h4>
        </Col>

        <Col xs={12} md>
          <Row xs={1} sm={2} md={6} className="g-2">
            <Col>
<<<<<<< HEAD
              <Form.Select size="sm"
                onChange={(e) => {
                  const value = e.target.value;
                  setPaging((previous) => ({ ...previous, pageNumber: 0, searchUserType: value }))
                  console.log(paging)
=======
              <Form.Select
                size="sm"
                value={paging.searchLevel ?? ''}
                disabled={activeTab !== 'students'}
                onChange={(e) => {
                  const value = e.target.value;
                  setPaging(prev => ({ ...prev, pageNumber: 0, searchLevel: value }));
>>>>>>> origin/develop
                }}
              >
                <option value=''>학년</option>
                <option value='1'>1학년</option>
                <option value='2'>2학년</option>
                <option value='3'>3학년</option>
                <option value='4'>4학년</option>
              </Form.Select>
            </Col>

            <Col>
              <Form.Select
                size="sm"
<<<<<<< HEAD
                onChange={(e) => {
                  const value = e.target.value;
                  setCollege(value);
                  setPaging((previous) => ({ ...previous, pageNumber: 0, searchCollege: value }))
                }}
              >
                <option value={''}>단과대학</option>
                {colllegeList.map((college) => (
                  <option
                    key={college.id} value={college.id}
                  >
=======
                value={college}
                onChange={(e)=>{
                  const value = e.target.value;
                  setCollege(value);
                  setPaging((previous)=>({...previous, pageNumber: 0, searchCollege : value}));
                }}
              >
                <option value={''}>단과대학</option>
                {colllegeList.map((college)=>(
                  <option key={college.id} value={college.id}>
>>>>>>> origin/develop
                    {college.type}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Select size="sm"
<<<<<<< HEAD
                onChange={(e) => {
                  const value = e.target.value;
                  setPaging((previous) => ({ ...previous, pageNumber: 0, searchMajor: value }))
                }}
              >
                <option value={''}>학과</option>
                {majorList.map((major) => (
                  <option
                    key={major.id} value={major.id}
                  >
=======
                onChange={(e)=>{
                  const value = e.target.value;
                  setPaging((previous)=>({...previous,pageNumber: 0, searchMajor : value}));
                }}
              >
                <option value={''}>학과</option>
                {majorList.map((major)=>(
                  <option key={major.id} value={major.id}>
>>>>>>> origin/develop
                    {major.m_name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Select size="sm"
                onChange={(e) => {
                  const value = e.target.value;
<<<<<<< HEAD
                  setPaging((previous) => ({ ...previous, pageNumber: 0, searchGender: value }))
=======
                  setPaging((previous)=>({...previous,pageNumber: 0, searchGender : value}));
>>>>>>> origin/develop
                }}
              >
                <option value={''}>성별</option>
                <option value={'MALE'}>남자</option>
                <option value={'FEMALE'}>여자</option>
              </Form.Select>
            </Col>
            <Col>
              <Form.Select size="sm"
<<<<<<< HEAD
                onChange={(e) => {
                  const value = e.target.value;
                  setPaging((previous) => ({ ...previous, pageNumber: 0, searchMode: value }))
=======
                onChange={(e)=>{
                  const value = e.target.value;
                  setPaging((previous)=>({...previous,pageNumber: 0, searchMode : value}));
>>>>>>> origin/develop
                }}
              >
                <option value={'all'}>전체 검색</option>
                <option value={'name'}>이름</option>
                <option value={'email'}>이메일</option>
                <option value={'phone'}>휴대전화번호</option>
              </Form.Select>
            </Col>
<<<<<<< HEAD
            <Col

            >
              <Form.Control size="sm" placeholder="검색어 입력"
                onChange={(e) => {
                  const value = e.target.value;
                  setPaging((previous) => ({ ...previous, searchKeyword: value }))
                }}
              />
            </Col>

=======
            <Col>
              <Form.Control size="sm" placeholder="검색어 입력"
                onChange={(e)=>{
                  const value = e.target.value;
                  setPaging((previous)=>({...previous, searchKeyword : value}));
                }}
              />
            </Col>
>>>>>>> origin/develop
          </Row>
        </Col>

        <Col xs="auto" className="text-end">
          <Button size="sm" variant="primary" onClick={() => navigate('/user/insert_user')}>
            등록
          </Button>
          <Button size="sm" variant="outline-success" style={{ marginLeft: 10 }} onClick={() => navigate('/user/StMList')}>
            학생 학적 관리
          </Button>
        </Col>
      </Row>

<<<<<<< HEAD
      {/* 표: 헤더 + 한 행(샘플) */}
      <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
        <Table bordered hover size="sm" className="align-middle w-100" style={{ tableLayout: "fixed" }}>
          <thead style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
            <tr>
              <th style={{ minWidth: 160 }}>이름</th>
              <th style={{ width: 100 }}>성별</th>
              <th style={{ width: 100 }}>생년월일</th>
              <th style={{ width: 140 }}>학번</th>
              <th style={{ minWidth: 300 }}>이메일</th>
              <th style={{ minWidth: 160 }}>휴대전화번호</th>
              <th style={{ minWidth: 160 }}>단과대학</th>
              <th style={{ minWidth: 180 }}>학과</th>
              <th style={{ width: 120 }}>역할구분</th>
              <th style={{ width: 160 }}>액션</th>
            </tr>
          </thead>
          <tbody>
            {/* 나중에 데이터 연결 시, 아래 샘플 <tr>을 map으로 대체하세요.
                예: data.map((u) => (
                      <tr key={u.id}> ... </tr>
                    ))
            */}
            {userList.map((user) => (
              <tr key={user.user_code}>
                <td>{user.u_name}</td>
                <td>{user.gender === '남자' ? '남자' : '여자'}</td>
                <td>{user.birthdate}</td>
                <td>{user.user_code}</td>
                <td style={{ whiteSpace: "normal", wordBreak: "break-all", overflowWrap: "anywhere" }}>
                  {user.email}
                </td>
                <td>{user.phone}</td>
                <td>{user.college}</td>
                <td>{user.major}</td>
                <td>{typeMap[user.u_type]}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => navigate(`/user/${user.user_code}/update`)}>
                      수정
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => console.log("삭제 클릭", /* u.id */)}>
                      삭제
                    </Button>                    
                  </div>
                </td>
              </tr>
            ))}

          </tbody>
        </Table>
      </div>
      {/* 페이징 처리 영역 */}
      <Pagination className="justify-content-center mt-4">
        {/* 앞쪽 영역 */}
        <Pagination.First
          onClick={() => {
            console.log('First 버튼 클릭(0 페이지로 이동)')
            setPaging((previous) => ({ ...previous, pageNumber: 0 }))
          }}
          disabled={paging.pageNumber < paging.pageCount}
          as="button"
        >
          맨처음
        </Pagination.First>

        <Pagination.Prev
          onClick={() => {
            const gotoPage = paging.beginPage - 1;
            console.log(`Prev 버튼 클릭(${gotoPage} 페이지로 이동)`)
            setPaging((previous) => ({ ...previous, pageNumber: gotoPage }))
          }}
          disabled={paging.pageNumber < paging.pageCount}
          as="button"
        >
          이전
        </Pagination.Prev>


        {/* 숫자 링크가 들어가는 영역 */}
        {[...Array(paging.endPage - paging.beginPage + 1)].map((_, idx) => {
          // pageIndex는 숫자 링크 번호입니다.
          const pageIndex = paging.beginPage + idx + 1;

          return (
            <Pagination.Item
              key={pageIndex}
              active={paging.pageNumber === (pageIndex - 1)}
              onClick={() => {
                console.log(`(${pageIndex} 페이지로 이동)`)
                setPaging((previous) => ({ ...previous, pageNumber: pageIndex - 1 }))
              }}
            >
              {pageIndex}
            </Pagination.Item>
          )
        })}



        <Pagination.Next
          onClick={() => {
            const gotoPage = paging.endPage + 1;
            console.log(`Next 버튼 클릭(${gotoPage} 페이지로 이동)`)
            setPaging((previous) => ({ ...previous, pageNumber: gotoPage }))
=======
      {/* 3) Tabs 제어 컴포넌트(activeKey)로 변경 */}
      <Tabs
        id="users-tabs"
        activeKey={activeTab}
        className="mb-3"
        mountOnEnter
        onSelect={handleTabChange}
        unmountOnExit={false}
        style={{
          '--bs-nav-link-color': '#6c757d',
          '--bs-nav-link-hover-color': '#495057',
          '--bs-nav-tabs-link-active-color': '#212529',
          '--bs-nav-tabs-link-active-bg': '#f1f3f5',
          '--bs-nav-tabs-link-active-border-color': '#dee2e6',
          '--bs-nav-tabs-border-color': '#dee2e6',
        }}
      >
        <Tab eventKey="students" title={`학생`}>
          <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
            <Table bordered hover size="sm" className="align-middle w-100" style={{ tableLayout: "fixed" }}>
              <thead style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
                <tr>
                  <th style={{ width: 45 }}>학년</th>
                  <th style={{ width: 100 }}>이름</th>
                  <th style={{ width: 45 }}>성별</th>
                  <th style={{ width: 100 }}>생년월일</th>
                  <th style={{ width: 115 }}>학번</th>
                  <th style={{ width: 200 }}>이메일</th>
                  <th style={{ width: 140 }}>휴대전화</th>
                  <th style={{ width: 120 }}>단과대학</th>
                  <th style={{ width: 180 }}>학과</th>
                  <th style={{ width: 85 }}>역할구분</th>
                  <th style={{ width: 120 }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {studentList.map((user) => (
                  <tr key={user.user_code}>
                    <td>{user.level}</td>
                    <td>{user.u_name}</td>
                    <td>{user.gender === '남자' ? '남자' : '여자'}</td>
                    <td>{user.birthdate}</td>
                    <td>{user.user_code}</td>
                    <td style={{ whiteSpace: "normal", wordBreak: "break-all", overflowWrap: "anywhere" }}>
                      {user.email}
                    </td>
                    <td>{user.phone}</td>
                    <td>{user.college}</td>
                    <td>{user.major}</td>
                    <td>{typeMap[user.u_type]}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-primary" onClick={() => navigate(`/user/${user.user_code}/update`)}>
                          수정
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => console.log("삭제 클릭")}>
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="professors" title={`교수`}>
          <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
            <Table bordered hover size="sm" className="align-middle w-100" style={{ tableLayout: "fixed" }}>
              <thead style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
                <tr>
                  <th style={{ width: 100 }}>이름</th>
                  <th style={{ width: 45 }}>성별</th>
                  <th style={{ width: 100 }}>생년월일</th>
                  <th style={{ width: 115 }}>학번</th>
                  <th style={{ width: 200 }}>이메일</th>
                  <th style={{ width: 140 }}>휴대전화</th>
                  <th style={{ width: 120 }}>단과대학</th>
                  <th style={{ width: 180 }}>학과</th>
                  <th style={{ width: 85 }}>역할구분</th>
                  <th style={{ width: 120 }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {professorList.map((user) => (
                  <tr key={user.user_code}>
                    <td>{user.u_name}</td>
                    <td>{user.gender === '남자' ? '남자' : '여자'}</td>
                    <td>{user.birthdate}</td>
                    <td>{user.user_code}</td>
                    <td style={{ whiteSpace: "normal", wordBreak: "break-all", overflowWrap: "anywhere" }}>
                      {user.email}
                    </td>
                    <td>{user.phone}</td>
                    <td>{user.college}</td>
                    <td>{user.major}</td>
                    <td>{typeMap[user.u_type]}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-primary" onClick={() => navigate(`/user/${user.user_code}/update`)}>
                          수정
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => console.log("삭제 클릭")}>
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>

        <Tab eventKey="admins" title={`관리자`}>
          <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
            <Table bordered hover size="sm" className="align-middle w-100" style={{ tableLayout: "fixed" }}>
              <thead style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
                <tr>
                  <th style={{ width: 100 }}>이름</th>
                  <th style={{ width: 45 }}>성별</th>
                  <th style={{ width: 100 }}>생년월일</th>
                  <th style={{ width: 115 }}>학번</th>
                  <th style={{ width: 200 }}>이메일</th>
                  <th style={{ width: 140 }}>휴대전화</th>
                  <th style={{ width: 120 }}>단과대학</th>
                  <th style={{ width: 180 }}>학과</th>
                  <th style={{ width: 85 }}>역할구분</th>
                  <th style={{ width: 120 }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {adminList.map((user) => (
                  <tr key={user.user_code}>
                    <td>{user.u_name}</td>
                    <td>{user.gender === '남자' ? '남자' : '여자'}</td>
                    <td>{user.birthdate}</td>
                    <td>{user.user_code}</td>
                    <td style={{ whiteSpace: "normal", wordBreak: "break-all", overflowWrap: "anywhere" }}>
                      {user.email}
                    </td>
                    <td>{user.phone}</td>
                    <td>{user.college}</td>
                    <td>{user.major}</td>
                    <td>{typeMap[user.u_type]}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-primary" onClick={() => navigate(`/user/${user.user_code}/update`)}>
                          수정
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => console.log("삭제 클릭")}>
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Tab>
      </Tabs>

      <Pagination className="justify-content-center mt-4">
        <Pagination.First
          onClick={()=> setPaging((previous)=>({...previous, pageNumber: 0}))}
          disabled={paging.pageNumber < paging.pageCount}
          as="button"
        >
          맨처음
        </Pagination.First>

        <Pagination.Prev
          onClick={()=>{
            const gotoPage = paging.beginPage -1;
            setPaging((previous)=>({...previous, pageNumber: gotoPage}));
          }}
          disabled={paging.pageNumber < paging.pageCount}
          as="button"
        >
          이전
        </Pagination.Prev>

        {[...Array(paging.endPage - paging.beginPage + 1)].map((_, idx)=>{
          const pageIndex = paging.beginPage + idx + 1 ;
          return(
            <Pagination.Item
              key={pageIndex}
              active={paging.pageNumber === (pageIndex -1)}
              onClick={()=> setPaging((previous)=>({...previous, pageNumber: pageIndex-1}))}
            >
              {pageIndex}
            </Pagination.Item>
          );
        })}

        <Pagination.Next
          onClick={()=>{
            const gotoPage = paging.endPage +1;
            setPaging((previous)=>({...previous, pageNumber: gotoPage}));
>>>>>>> origin/develop
          }}
          disabled={paging.pageNumber >= Math.floor(paging.totalPages / paging.pageCount) * paging.pageCount}
          as="button"
        >
          다음
        </Pagination.Next>
        <Pagination.Last
<<<<<<< HEAD
          onClick={() => {
            const gotoPage = paging.totalPages - 1;
            console.log(`Last 버튼 클릭(${gotoPage} 페이지로 이동)`)
            setPaging((previous) => ({ ...previous, pageNumber: gotoPage }))
=======
          onClick={()=>{
            const gotoPage = paging.totalPages -1;
            setPaging((previous)=>({...previous, pageNumber: gotoPage}));
>>>>>>> origin/develop
          }}
          disabled={paging.pageNumber >= Math.floor(paging.totalPages / paging.pageCount) * paging.pageCount}
          as="button"
        >
          맨끝
        </Pagination.Last>
      </Pagination>
    </Container>
  );
}

export default UsersSkeleton;
