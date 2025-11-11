import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Pagination, Row, Table, Tabs, Tab } from "react-bootstrap"; // ★ 추가: Tabs, Tab
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
	});

  const navigate = useNavigate();

  

  useEffect(() => {

    const url = `${API_BASE_URL}/user/pageList`
    const parameters = {
			params:{
			pageNumber: paging.pageNumber,
			pageSize: paging.pageSize,
			searchCollege: paging.searchCollege,
      searchMajor: paging.searchMajor,
      searchGender: paging.searchGender,
      searchUserType: paging.searchUserType,
      searchMode: paging.searchMode,
      searchKeyword:paging.searchKeyword,
			},
		};
    axios
      .get(url, parameters)
      .then((response) => {
        console.log('응답 받은 데이터')
				console.log(response.data)
				setUserList(response.data.content||[]);
        
        setPaging((previous)=>{
          const totalElements = response.data.totalElements;
					const totalPages =response.data.totalPages;
					const pageNumber = response.data.pageable.pageNumber;
          const pageSize = response.data.pageable.pageSize;

          const beginPage = Math.floor(pageNumber/ previous.pageCount )* previous.pageCount;
					const endPage = Math.min(beginPage + previous.pageCount -1, totalPages -1);

           return {
						...previous,
						totalElements:totalElements,
						totalPages:totalPages,
						pageNumber:pageNumber,
						pageSize:pageSize,
						beginPage:beginPage,
						endPage:endPage,
						};

        })
      })
      .catch((error) => {
        console.log(error.response.data)
      })

  }, [paging.pageNumber, paging.searchCollege, paging.searchMajor, paging.searchCollege, paging.searchGender, paging.searchUserType, paging.searchMode, paging.searchKeyword])
  
  useEffect(()=>{
    const url = `${API_BASE_URL}/college/list`;

    axios
      .get(url)
      .then((response)=>{
        setCollegeList(response.data)
      })
      .catch((error)=>{
        const err = error.response;
           if(!err){
            alert('네트워크 오류가 발생하였습니다')
            return;
           }
        console.log(error)
      })

  },[])

  useEffect(()=>{
    const url = `${API_BASE_URL}/major/list`

     if (!college) {
    setMajorList([]);
    return;
  }
    
    axios
      .get(url,{
         params:{
          college_id: Number(college)
        }
      })
      .then((response)=>{
        setMajorList(response.data)
        console.log(response.data)
      })
      .catch((error)=>{
         const err = error.response;
           if(!err){
            alert('네트워크 오류가 발생하였습니다')
            return;   
           }
        console.log(error)
      })

  },[college])

  const typeMap = {
    ADMIN: '관리자',
    STUDENT: '학생',
    PROFESSOR: '교수'
  };

  useEffect(() => { 
    // ★ 추가: 가져온 userList를 역할별로 분배
    setStudentList((userList || []).filter(u => u.u_type === 'STUDENT'));
    setProfessorList((userList || []).filter(u => u.u_type === 'PROFESSOR'));
    setAdmin((userList || []).filter(u => u.u_type === 'ADMIN'));
  }, [userList]); // ★ 추가

  return (
    <Container fluid className="py-4" style={{ maxWidth: "100%" }}>
      <Row className="align-items-center mb-3 gy-2">
        <Col xs={12} md="auto">
          <h4 className="mb-0">사용자 목록</h4>
        </Col>

        <Col xs={12} md>
          <Row xs={1} sm={2} md={6} className="g-2">
            {/* 역할 콤보박스 제거됨 (요청사항) */}

            <Col>
              <Form.Select 
                size="sm"
                onChange={(e)=>{
                  const value = e.target.value;
                  setCollege(value);
                  setPaging((previous)=>({...previous, pageNumber: 0, searchCollege : value}))
                }}
                >
                <option value={''}>단과대학</option>
                {colllegeList.map((college)=>(
                  <option
                    key={college.id} value={college.id}
                  >
                    {college.type}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Select size="sm"
                 onChange={(e)=>{
                  const value = e.target.value;
                  setPaging((previous)=>({...previous,pageNumber: 0, searchMajor : value}))
                }}
              >
                <option value={''}>학과</option>
                {majorList.map((major)=>(
                  <option
                    key={major.id} value={major.id}
                  >
                    {major.m_name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Select size="sm"
                onChange={(e)=>{
                  const value = e.target.value;
                  setPaging((previous)=>({...previous,pageNumber: 0, searchGender : value}))
                }}
              >
                <option value={''}>성별</option>
                <option value={'MALE'}>남자</option>
                <option value={'FEMALE'}>여자</option>
              </Form.Select>
            </Col>
            <Col>
              <Form.Select size="sm"
                  onChange={(e)=>{
                  const value = e.target.value;
                  setPaging((previous)=>({...previous,pageNumber: 0, searchMode : value}))
                }}
              >
                <option value={'all'}>전체 검색</option>
                <option value={'name'}>이름</option>
                <option value={'email'}>이메일</option>
                <option value={'phone'}>휴대전화번호</option>
              </Form.Select>
            </Col>
            <Col>
              <Form.Control size="sm" placeholder="검색어 입력" 
                onChange={(e)=>{
                  const value = e.target.value;
                  setPaging((previous)=>({...previous, searchKeyword : value}))
                }}
              />
            </Col>
          </Row>
        </Col>

        <Col xs="auto" className="text-end">
          <Button size="sm" variant="primary" onClick={() => navigate('/user/insert_user')}>
            등록
          </Button>
        </Col>
      </Row>

      {/* ★ 추가: 탭 UI (학생 / 교수 / 관리자) + 회색 톤 */}
      <Tabs
        id="users-tabs"
        defaultActiveKey="students"
        className="mb-3"
        mountOnEnter
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
        {/* ★ 추가: 학생 탭 */}
        <Tab eventKey="students" title={`학생 (${studentList.length})`}>
          <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
            <Table bordered hover size="sm" className="align-middle w-100" style={{ tableLayout: "fixed" }}>
              <thead style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
                <tr>
                  <th style={{ width: 80 }}>학년</th> {/* ★ 추가: 학생 전용 학년 컬럼 */}
                  <th style={{ minWidth: 140 }}>이름</th> 
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

        {/* ★ 추가: 교수 탭 */}
        <Tab eventKey="professors" title={`교수 (${professorList.length})`}>
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

        {/* ★ 추가: 관리자 탭 */}
        <Tab eventKey="admins" title={`관리자 (${adminList.length})`}>
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
      {/* ★ 추가 끝 */}

      <Pagination className="justify-content-center mt-4">
        <Pagination.First
          onClick={()=>{
            console.log('First 버튼 클릭(0 페이지로 이동)')
            setPaging((previous)=>({...previous, pageNumber: 0}))
          }}
          disabled={paging.pageNumber < paging.pageCount}
          as="button"
        >
          맨처음
        </Pagination.First>
        
        <Pagination.Prev
          onClick={()=>{
            const gotoPage = paging.beginPage -1;
            console.log(`Prev 버튼 클릭(${gotoPage} 페이지로 이동)`)
            setPaging((previous)=>({...previous, pageNumber: gotoPage}))
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
              onClick={()=>{
                console.log(`(${pageIndex} 페이지로 이동)`)
                setPaging((previous)=>({...previous, pageNumber: pageIndex-1}))
              }}
            >
              {pageIndex}
            </Pagination.Item>
          )
        })}
        
        <Pagination.Next 
          onClick={()=>{
            const gotoPage = paging.endPage +1;
            console.log(`Next 버튼 클릭(${gotoPage} 페이지로 이동)`)
            setPaging((previous)=>({...previous, pageNumber: gotoPage}))
          }}
          disabled={paging.pageNumber >= Math.floor(paging.totalPages / paging.pageCount) * paging.pageCount}
          as="button"
        >
          다음
        </Pagination.Next>
        <Pagination.Last 
          onClick={()=>{
            const gotoPage = paging.totalPages -1;
            console.log(`Last 버튼 클릭(${gotoPage} 페이지로 이동)`)
            setPaging((previous)=>({...previous, pageNumber: gotoPage}))
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
