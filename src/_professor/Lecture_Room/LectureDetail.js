import { Badge, Button, Card, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useAuth } from "../../public/context/UserContext";
import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { date } from "yup";
import { usePaging } from "../hooks/usePaging";
import CommonPagination from "./CommonPagination";

function App() {

  const [lecture, setLecture] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const { state } = useLocation();
  const { id: paramId } = useParams(); // URL의 :id값을 '문자열'로 받아서 paramId라는 이름을 붙임
  const lectureId = state?.lectureId ?? Number(paramId); // 이전 페이지에서 state로 넘어온 id를 꺼냄, id가 없으면 에러 없이 undefined로 변환 / state로 넘어온게 있으면 쓰고, 없어서 null이면 paramId 쓰기
  const sessionDate = state?.sessionDate;

  const [loading, setLoading] = useState(true);

  // 출결 선택 상태
  const [attendance, setAttendance] = useState({});

  // 일괄 저장 상태
  const [savingAll, setSavingAll] = useState(false);

  // 출결 저장 후 라디오 잠금 상태
  const [isFinalized, setIsFinalized] = useState(false);

  const AttendOptions = [
    { value: "PRESENT", label: "출석" },
    { value: "LATE", label: "지각" },
    { value: "ABSENT", label: "결석" },
    { value: "EARLY_LEAVE", label: "조퇴" },
    { value: "EXCUSED", label: "공결" },
  ]

  // 강의정보
  useEffect(() => {
    const url = `${API_BASE_URL}/lecture/detail/${lectureId}`;
    axios
      .get(url)
      .then((response) => {
        setLecture(response.data)
        console.log(lecture);
      })
      .catch((error) => {
        const err = error.response;
        if (!err) {
          alert('네트워크 오류가 발생하였습니다')
          return;
        }
      })
  }, [lectureId])


  {/* 커스텀 훅 usePaging으로 페이징 처리 */ }
  const fetchGradePage = useCallback( // useCallback : 함수 버전의 useMemo -> 의존성이 안바뀌면 같은 함수객체를 계속 재사용
    async ({ pageNumber, pageSize, search }) => {
      const url = `${API_BASE_URL}/lecture/detail/enrolledStudentList/${lectureId}`;
      const params = {
        page: pageNumber,
        size: pageSize,
        searchMode: search.mode,
        searchKeyword: search.keyword,
      };

      const res = await axios.get(url, { params });
      const data = res.data;
      return {
        content: data.content, // 출결 리스트
        paging: { // 페이징 정보
          pageNumber: data.number,
          pageSize: data.size,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
        }
      };
    }, [lectureId] // 강의가 바뀔때만 새로 만듦
    // 의존성을 추가하지않으면 컴포넌트가 렌더링됨 
    // -> fetchStudentPage 새로 생성 
    // -> usePaging 내부의 fetcher가 의존성 배열이라 변경됐다고 인식됨
    // -> loadPage도 새로 만들어짐 -> useEffect 의존성 바뀜 -> 다시 useEffect 실행 -> loadPage(0) 호출 무한반복
    // 의존성을 추가해야 lectureId가 안 바뀌는 동안엔 fetchStudentPage가 항상 같은 함수 객체로 유지
  );


  const {
    list: gradeList,
    paging,
    search,
    setSearch,
    loading: pageLoading,
    changePage,
  } = usePaging(fetchGradePage, { mode: "ALL", keyword: "" }, 10);


  // 전체 일괄 선택
  const fillAll = (status) => {
    const next = {};
    gradeList.forEach(s => { next[s.id] = status; });
    setAttendance(next);
  };

  // 전체 선택 초기화
  const resetAll = () => {
    setAttendance({});
  };

  // 학생 출결상태(라디오)를 바꿨을때 호출되는 핸들러, 출결상태 업데이트용
  const onSelect = (id, status) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  // 선택된 학생 수, 일괄저장 카운트에 사용
  const selectCount = Object.keys(attendance).length;

  // 일괄 저장
  const handleBulkSave = async () => {
    // 아무것도 선택 안했으면
    if (selectCount === 0) {
      alert("선택된 학생이 없습니다.");
      return;
    }

    // 미선택 검사
    const unselected = gradeList.filter(s => !attendance[s.id]);
    if (unselected.length > 0) {
      alert(`미선택 ${unselected.lentg}명: ${unselected.slice(0, 3).map(s => s.name).join(",")}${unselected.length > 3 ? " 외" : ""}`);
      return;
    }

    // payload 생성
    const payload = gradeList.map(s => ({
      userId: s.id,
      attendanceDate: sessionDate,
      attendStudent: attendance[s.id],
    }));
    try {
      setSavingAll(true);
      await axios.post(`${API_BASE_URL}/lecture/${lectureId}/insertAttendances`, payload);
      setIsFinalized(true); // 저장 성공 시 바로 잠금
      console.log("일괄 저장 payload : ", payload);
      alert("저장이 완료되었습니다.");
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setIsFinalized(true);
        alert("해당 날짜에 저장된 출결이 있어, 출결 관리를 비활성화 합니다.\n출결 수정을 원하실 경우 출결 수정 메뉴를 이용해주세요.");
        return;
      }
      console.error(err);
      alert("저장에 실패하였습니다.");
    } finally {
      setSavingAll(false);
    }
  }

  // 초기 진입 시 잠금여부 조회 - 라디오 비활성화 영구화
  useEffect(() => {
    if (!lectureId || !sessionDate) return;

    (async () => {
      try {
        const finRes = await axios.get(`${API_BASE_URL}/lecture/${lectureId}/attendance/finalized`, {
          params: { date: sessionDate },
        });
        const fin = Boolean(finRes.data?.finalized);
        setIsFinalized(fin);

        if (fin) {
          const res = await axios.get(`${API_BASE_URL}/lecture/${lectureId}/attendance`, {
            params: { date: sessionDate },
          });
          const next = {};
          (res.data ?? []).forEach(r => {
            next[r.userId] = r.attendStudent;   // 저장된 상태를 그대로 복원
          });
          setAttendance(next);
        }
      } catch (e) {
        // noop
      }
    })();
  }, [lectureId, sessionDate]);

  return (
    <Container className="py-4">
      {/* 상단: 최소 정보만 */}
      <Card className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="fw-semibold">출결 등록</div>
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted">선택: {selectCount}명</small>
            <Button size="sm" variant="primary" onClick={handleBulkSave} disabled={savingAll || gradeList.length === 0}>
              {savingAll ? "저장 중..." : "일괄 저장"}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h3 className="mb-2">{lecture.name}</h3>
              <div className="text-muted">
                학과: {lecture.majorName} · 담당교수: {lecture.userName} · 총원: {lecture.totalStudent}
              </div>
            </Col>
            <Col xs="auto">
              <Button size="sm" variant="outline-secondary" onClick={resetAll} disabled={isFinalized}>
                전체 초기화
              </Button>
              <Button size="sm" variant="outline-success" onClick={() => fillAll("PRESENT")} disabled={isFinalized}>
                전체 출석
              </Button>
              <Button size="sm" variant="primary" onClick={handleBulkSave} disabled={isFinalized || savingAll || gradeList.length === 0}>
                {savingAll ? "저장 중..." : "일괄 저장"}
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => navigate('/LRoomPro')}>돌아가기</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="mb-3">
        <Col md={6}>
          <div className="d-flex gap-2">
            <Form.Select
              style={{ maxWidth: "120px" }}
              value={search.mode}
              onChange={e =>
                setSearch(prev => ({ ...prev, mode: e.target.value }))
              }
            >
              <option value="ALL">전체</option>
              <option value="STUDENT_CODE">학번</option>
              <option value="NAME">학생명</option>
            </Form.Select>

            <Form.Control
              placeholder="검색어를 입력하세요"
              value={search.keyword}
              onChange={e =>
                setSearch(prev => ({ ...prev, keyword: e.target.value }))
              }
            />
          </div>
        </Col>
      </Row>

      {/* 목록: 간단 표기 */}
      <Card>
        <Card.Header className="d-flex justify-content-between">
          <span>수강생 목록</span>
          <span>{lecture.nowStudent + "/" + lecture.totalStudent}</span>
        </Card.Header>
        <div className="d-flex justify-content-end mb-2">
          <Button size="sm" variant="primary" onClick={handleBulkSave}>
            일괄 저장
          </Button>
        </div>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>학번</th>
                <th>이름</th>
                <th>학과</th>
                <th>이메일</th>
                <th>전화번호</th>
                <th className="text-center">출결 수정</th>
              </tr>
            </thead>
            <tbody>
              {gradeList.map((student) => {
                const studentId = student.id;
                const selected = attendance[studentId];

                return (
                  <tr key={student.userCode}>
                    <td>{student.userCode}</td>
                    <td>{student.name}</td>
                    <td>{student.majorName}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-3 justify-content-center">
                        <Form className="d-flex gap-3 flex-wrap">
                          {AttendOptions.map(opt => (
                            <Form.Check
                              key={opt.value}
                              type="radio"
                              inline
                              label={opt.label}
                              name={`attend-${studentId}`}         // 행별 라디오 그룹
                              id={`att-${studentId}-${opt.value}`}
                              // value={opt.value}
                              checked={selected === opt.value}
                              onChange={() => onSelect(studentId, opt.value)}
                              disabled={isFinalized}
                            />
                          ))}
                        </Form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {gradeList.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    수강 중인 학생이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
        <CommonPagination paging={paging} onPageChange={changePage} />
      </Card>
    </Container>
  );

}
export default App;