import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Pagination, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function UsersSkeleton() {

  const [userList, setUserList] = useState([]);
  const [colllegeList, setCollegeList] = useState([]);
  const [majorList, setMajorList] = useState([]);
  const [college, setCollege] = useState('');

  const [paging, setPaging] = useState({
    totalElements: 0, // 전체 데이터 개수(165개)
    pageSize: 10, // 1페이지에 보여 주는 데이터 개수(20개)
    totalPages: 0, // 전체 페이지 개수(28페이지)
    pageNumber: 0, // 현재 페이지 번호(20페이지)
    pageCount: 10, // 페이지 하단 버튼의 개수(10개)
    beginPage: 0, // 페이징 시작 번호
    endPage: 0, // 페이징 끝 번호
    searchCollege: '', // 단과대학
    searchMajor: '', // 학과
    searchGender: '', // 성별
    searchUserType: '', // 유저 역할
    searchMode: '', // 유저 검색 모드(이름, 이메일, 전화번호 등등) 
    searchKeyword: '', // 검색 키워드 입력 상자
  });

  const navigate = useNavigate();

  useEffect(() => {

    const url = `${API_BASE_URL}/user/pageList`
    const parameters = {
      params: {
        pageNumber: paging.pageNumber,
        pageSize: paging.pageSize,
        searchCollege: paging.searchCollege, // 단과대학
        searchMajor: paging.searchMajor, // 학과
        searchGender: paging.searchGender, // 성별
        searchUserType: paging.searchUserType, // 유저 역할
        searchMode: paging.searchMode, // 유저 검색 모드(이름, 이메일, 전화번호 등등) 
        searchKeyword: paging.searchKeyword, // 검색 키워드 입력 상자		
      },
    };
    axios
      .get(url, parameters)
      .then((response) => {
        console.log('응답 받은 데이터')
        console.log(response.data)
        setUserList(response.data.content || []);

        setPaging((previous) => {
          const totalElements = response.data.totalElements;
          const totalPages = response.data.totalPages;
          const pageNumber = response.data.pageable.pageNumber;
          const pageSize = response.data.pageable.pageSize;

          const beginPage = Math.floor(pageNumber / previous.pageCount) * previous.pageCount;
          const endPage = Math.min(beginPage + previous.pageCount - 1, totalPages - 1);


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



      })
      .catch((error) => {
        console.log(error.response.data)
      })

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

    if (!college) {
      setMajorList([]);
      return;
    }

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

  const typeMap = {
    ADMIN: '관리자',
    STUDENT: '학생',
    PROFESSOR: '교수'
  };

  return (
    <Container fluid className="py-4" style={{ maxWidth: "100%" }}>
      {/* 상단 타이틀 + 우측 등록 버튼 */}
      <Row className="align-items-center mb-3 gy-2">
        {/* 타이틀 */}
        <Col xs={12} md="auto">
          <h4 className="mb-0">사용자 목록</h4>
          <div className="text-muted small">엑셀 스타일 표 UI</div>
        </Col>

        {/* 필터/검색: 화면 크기에 따라 자동 줄바꿈 */}
        <Col xs={12} md>
          <Row xs={1} sm={2} md={6} className="g-2">

            <Col>
              <Form.Select size="sm"
                onChange={(e) => {
                  const value = e.target.value;
                  setPaging((previous) => ({ ...previous, pageNumber: 0, searchUserType: value }))
                  console.log(paging)
                }}
              >
                <option value={''}>역할</option>
                <option value={'ADMIN'}>관리자</option>
                <option value={'PROFESSOR'}>교수</option>
                <option value={'STUDENT'}>학생</option>
              </Form.Select>
            </Col>
            <Col>
              <Form.Select
                size="sm"
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
                    {college.type}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Select size="sm"
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
                    {major.m_name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Form.Select size="sm"
                onChange={(e) => {
                  const value = e.target.value;
                  setPaging((previous) => ({ ...previous, pageNumber: 0, searchGender: value }))
                }}
              >
                <option value={''}>성별</option>
                <option value={'MALE'}>남자</option>
                <option value={'FEMALE'}>여자</option>
              </Form.Select>
            </Col>
            <Col>
              <Form.Select size="sm"
                onChange={(e) => {
                  const value = e.target.value;
                  setPaging((previous) => ({ ...previous, pageNumber: 0, searchMode: value }))
                }}
              >
                <option value={''}>전체 검색</option>
                <option value={'name'}>이름</option>
                <option value={'email'}>이메일</option>
                <option value={'phone'}>휴대전화번호</option>
              </Form.Select>
            </Col>
            <Col

            >
              <Form.Control size="sm" placeholder="검색어 입력"
                onChange={(e) => {
                  const value = e.target.value;
                  setPaging((previous) => ({ ...previous, searchKeyword: value }))
                }}
              />
            </Col>

          </Row>
        </Col>

        {/* 등록 버튼: 항상 우측 정렬 */}
        <Col xs="auto" className="text-end">
          <Button size="sm" variant="primary" onClick={() => navigate('/user/insert_user')}>
            등록
          </Button>
          <Button size="sm" variant="outline-success" onClick={() => navigate('/user/StMList')}>
            학생 학적 관리
          </Button>
        </Col>
      </Row>

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
                    <td/>
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
          }}
          disabled={paging.pageNumber >= Math.floor(paging.totalPages / paging.pageCount) * paging.pageCount}
          as="button"
        >
          다음
        </Pagination.Next>
        <Pagination.Last
          onClick={() => {
            const gotoPage = paging.totalPages - 1;
            console.log(`Last 버튼 클릭(${gotoPage} 페이지로 이동)`)
            setPaging((previous) => ({ ...previous, pageNumber: gotoPage }))
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