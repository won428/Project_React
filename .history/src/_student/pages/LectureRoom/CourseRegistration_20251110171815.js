import { useCallback, useEffect, useState } from "react";
import { Button, Form, Table, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function App() {

  const [lectureList, setLectureList] = useState([]);
  const [lectureListSt, setLectureListSt] = useState([]);
  const [myLectureList, setMyLectureList] = useState([]);
  const [submitLecList,setSubmitlecList] = useState([]);
  const [approvedLecList, setApprovedLecList] = useState([]) 
  const [majorList, setMajorList] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState([]);
  
  const [paging, setPaging] = useState({
    totalElements : 0,
    pageSize : 10,
    totalPages : 0,
    pageNumber : 0,
    pageCount : 10,
    beginPage : 0,
    endPage : 0,
    searchMajor: '',
    searchCompletionDiv: '',
    searchLevel: '',
    searchCredit: '',
    searchMode: '',
    searchKeyword:'',
  });

  // ───────── 상세 모달 상태 ─────────
  const [open, setOpen] = useState(false);
  const [modalId, setModalId] = useState('');
  const [modalLec, setModalLec] = useState({});

  const fetchLectures = useCallback(()=>{
    const url = `${API_BASE_URL}/lecture/apply/list`;
    axios
      .get(url,{ params:{ id:user.id }})
      .then((response) => {
        setLectureList(response.data)
        console.log(response.data)
      })
      .catch((error) => {
        setLectureList([]);
        console.error("status:", error.response?.status);
        console.error("data:", error.response?.data);
      })
  },[])

  useEffect(() => { fetchLectures(); }, [fetchLectures]);

  useEffect(() => {
    const url = `${API_BASE_URL}/lecture/mylist`;
    axios
      .get(url, { params: { userId: user.id }})
      .then((response) => { setMyLectureList(response.data) })
      .catch((error) => {
        const err = error.response;
        if (!err) { alert('네트워크 오류가 발생하였습니다'); return; }
      })
  }, [lectureList]);

  useEffect(()=>{
    const url = `${API_BASE_URL}/major/all/list`;
    axios
      .get(url)
      .then((response)=>{ 
        setMajorList(response.data); 
        console.log(response.data) })
      .catch((error)=>{
        const err = error.response;
        if (!err) { alert('네트워크 오류가 발생하였습니다'); return; }
      })
  },[])
  
  useEffect(() => {
    if (!Array.isArray(lectureList)) return;
    setLectureListSt(lectureList.filter(lec => lec.status === 'APPROVED'));
  }, [lectureList]);

  useEffect(() => {
    if (!Array.isArray(myLectureList)) return;
    setSubmitlecList(myLectureList.filter(lec => lec.status === 'SUBMITTED'))
    setApprovedLecList(myLectureList.filter(lec => lec.status === 'PENDING' ))
  }, [myLectureList]);

  const splitStartDate = (date) => {
    const [yyyy, mm] = date.split("-");
    const yaer = yyyy.slice(-2);
    const m = Number(mm);
    if (m >= 1 && m <= 2) return `${yaer}년도 겨울 계절학기`;
    if (m >= 3 && m <= 6) return `${yaer}년도 1학기`;
    if (m >= 7 && m <= 8) return `${yaer}년도 여름 계절학기`;
    return `${yaer}년도 2학기`;
  };

  const typeMap = {
    PENDING: "처리중",
    APPROVED: "신청 가능",
    REJECTED: "거부",
    INPROGRESS: "개강",
    COMPLETED: "종강"
  };

  const typeMap2 = {
    MAJOR_REQUIRED: '전공 필수',
    MAJOR_ELECTIVE: '전공 선택',
    LIBERAL_REQUIRED: '교양 필수',
    LIBERAL_ELECTIVE: '교양 선택',
    GENERAL_ELECTIVE: ' 일반 선택'
  };

  const typeMap3 = {
    APPROVED: "개강 대기",
    REJECTED: "거부",
    INPROGRESS: "개강",
    COMPLETED: "종강",
    SUBMITTED:"신청 완료"
  };

  // ───────── 요일/교시 표기 ─────────
  const typeMapDay = {
    MONDAY: "월", TUESDAY: "화", WEDNESDAY: "수", THURSDAY: "목", FRIDAY: "금",
  };
  const typeMapStart = {
    '9:00': "1교시",'10:00': "2교시",'11:00': "3교시",'12:00': "4교시",
    '13:00': "5교시",'14:00': "6교시",'15:00': "7교시",'16:00': "8교시",'17:00': "9교시"
  };
  const typeMapEnd = {
    '10:00': "1교시",'11:00': "2교시",'12:00': "3교시",'13:00': "4교시",
    '14:00': "5교시",'15:00': "6교시",'16:00': "7교시",'17:00': "8교시",'18:00': "9교시"
  };

  const addSelect = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    setSelected(prev =>
      checked
        ? (prev.includes(value) ? prev : [...prev, value])
        : prev.filter(v => v !== value)
    );
  };

  useEffect(() => { console.log(selected) }, [selected]);

  const apply = async () => {
    const url = `${API_BASE_URL}/lecture/apply`;
    try {
      const response = await axios.post(url, selected, { params: { id: user.id } });
      if (response.data.success) {
        alert('등록 성공'); setSelected([]); fetchLectures();
      } else {
        alert('등록 성공'); setSelected([]); fetchLectures();
      }
    } catch (error) {
      const err = error.response;
      if (!err) { alert('네트워크 오류가 발생하였습니다'); return; }
      const message = err.data?.message ?? '오류 발생';
      alert(message);
    }
  };

  const applyOne = async (lecId) => {
    const url = `${API_BASE_URL}/lecture/applyOne`;
    console.log(lecId)
    try {
      const response = await axios.post(
        url,
        Number(lecId),
        { params: { id: user.id }, headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        alert('등록 성공'); setSelected([]); fetchLectures();
      } else {
        alert('등록 성공'); setSelected([]); fetchLectures();
      }
    } catch (error) {
      const err = error.response;
      if (!err) { alert('네트워크 오류가 발생하였습니다'); return; }
      const message = err.data?.message ?? '오류 발생';
      alert(message);
    }
  };

  const stautsRequest = async (id, status) => {
    const url = `${API_BASE_URL}/courseReg/applyStatus`;
    try {
      const response = await axios.put(url, null, { params: { status, id } });
      if (response.status === 200) { alert("처리 완료"); fetchLectures(); }
    } catch (error) {
      const err = error.response;
      if (!err) { alert('네트워크 오류가 발생하였습니다'); return; }
      const message = err.data?.message ?? '오류 발생';
      alert(message);
    }
  };

  // ───────── 모달 데이터 로딩 ─────────
  useEffect(() => {
    if (!modalId) return;
    const url = `${API_BASE_URL}/lecture/info`;
    axios
      .get(url, { params: { modalId: Number(modalId) } })
      .then(
        (res) =>{
          setModalLec(res.data)
          console.log(res.data)
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        alert('오류');
      });
  }, [modalId]);

  const downloadClick = (id) => {
    const url = `${API_BASE_URL}/attachment/download/${id}`;
    axios
      .get(url, { responseType: 'blob' })
      .then((response) => {
        const cd = response.headers['content-disposition'] || '';
        const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cd)?.[1];
        const quoted = /filename="([^"]+)"/i.exec(cd)?.[1];
        const filename = (utf8 && decodeURIComponent(utf8)) || quoted || `file-${id}`;

        const blob = new Blob([response.data], {
          type: response.headers['content-type'] || 'application/octet-stream',
        });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        alert('오류');
      });
  };



  return (
    <>
      <div className="table-responsive" style={{ overflowX: 'hidden' }}>

        {/* ───────── 수강신청 가능 목록: 필터/검색 UI ───────── */}
        <Row className="g-2 mb-2 flex-wrap">
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="학과(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchMajor: value})) }}>
              <option value="">학과</option>
              {majorList.map((major)=>(
                <option key={major.id} value={major.id}>{major.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="이수구분(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchCompletionDiv: value})) }}>
              <option value="">이수구분</option>
              <option value="MAJOR_REQUIRED">전공  필수</option>
              <option value="MAJOR_ELECTIVE">전공 선택</option>
              <option value="LIBERAL_REQUIRED">교양 필수</option>
              <option value="LIBERAL_ELECTIVE">교양 선택</option>
              <option value="GENERAL_ELECTIVE">일반 선택</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="학년(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchLevel: value})) }}>
              <option value="">학년</option>
              <option value={1}>1학년</option>
              <option value={2}>2학년</option>
              <option value={3}>3학년</option>
              <option value={4}>4학년</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="학점(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchCredit: value})) }}>
              <option value="">학점</option>
              <option value={1}>1학점</option>
              <option value={2}>2학점</option>
              <option value={3}>3학점</option>
              <option value={4}>4학점</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="검색조건(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchMode: value})) }}>
              <option value="">전체 검색</option>
              <option value="name">강의명</option>
              <option value="professor">담당교수</option>
              <option value="major">학과</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={8} md={2}>
            <Form.Control size="sm" placeholder="검색어 입력" aria-label="검색어(가능)" 
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchKeyword: value})) }}/>
          </Col>
        </Row>

        {/* ───────── 수강신청 가능 목록 ───────── */}
        <Table bordered hover size="sm" className="align-middle shadow-sm rounded-3 mb-2">
          <colgroup>
            <col style={{ width: "3rem" }} />
            <col style={{ width: "16rem" }} />
            <col style={{ width: "12rem" }} />
            <col style={{ width: "10rem" }} />
            <col style={{ width: "6rem" }} />
            <col style={{ width: "10rem" }} />
            <col style={{ width: "10rem" }} />
            <col style={{ width: "12rem" }} /> {/* 수업 요일 */}
            <col style={{ width: "5rem" }} />
            <col style={{ width: "4rem" }} />
            <col style={{ width: "6rem" }} />
            <col style={{ width: "8rem" }} />
            <col style={{ width: "7.5rem" }} />
          </colgroup>

          <tbody>
            <tr className="table-secondary">
              <td colSpan={13} className="fw-bold py-2">수강신청 가능 목록</td>
            </tr>
            <tr className="table-light">
              <th className="text-center text-nowrap py-2">체크</th>
              <th className="py-2">강의명</th>
              <th className="py-2">과이름</th>
              <th className="text-center text-nowrap py-2">이수 구분</th>
              <th className="text-center text-nowrap py-2">학년</th>
              <th className="text-nowrap py-2">담당교수</th>
              <th className="text-center text-nowrap py-2">학기</th>
              <th className="text-center text-nowrap py-2">수업 요일</th>
              <th className="text-center text-nowrap py-2">총원</th>
              <th className="text-center text-nowrap py-2">학점</th>
              <th className="text-center text-nowrap py-2">자료</th>
              <th className="text-center text-nowrap py-2">상태</th>
              <th className="text-center text-nowrap py-2">상세</th>
            </tr>

            {lectureListSt.map((lec) => (
              <tr key={lec.id}>
                <td className="text-center text-nowrap">
                  <Form.Check type="checkbox" value={lec.id} onChange={addSelect} />
                </td>
                <td className="fw-semibold">
                  <span className="d-inline-block text-truncate w-100">{lec.name}</span>
                </td>
                <td>
                  <span className="d-inline-block text-truncate w-100">{lec.majorName}</span>
                </td>
                <td className="text-center text-nowrap">{typeMap2[lec.completionDiv]}</td>
                <td className="text-center text-nowrap">{lec.level}</td>
                <td className="text-nowrap">{lec.userName}</td>
                <td className="text-center text-nowrap">{splitStartDate(lec.startDate)}</td>
                <td className="text-center text-nowrap">
                  {(lec.lectureSchedules ?? []).map(s => typeMapDay[s.day]).join(', ')}
                </td>
                <td className="text-center text-nowrap">{lec.totalStudent}</td>
                <td className="text-center text-nowrap">{lec.credit}</td>
                <td className="text-center text-nowrap">
                  <Button
                    size="sm"
                    variant="outline-dark"
                    onClick={() => { setModalId(lec.id); setOpen(true); }}
                  >
                    상세
                  </Button>
                </td>
                <td className="text-center text-nowrap">{typeMap[lec.status]}</td>
                <td className="text-center text-nowrap">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="fw-semibold px-3"
                    value={lec.id}
                    onClick={() => applyOne(Number(lec.id))}
                  >
                    수강 신청
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* ✅ 일괄 신청 */}
        <div className="d-flex justify-content-end mb-4">
          <Button size="sm" variant="primary" className="fw-semibold px-3" onClick={apply}>
            일괄 신청
          </Button>
        </div>

        {/* ───────── 장바구니: 필터/검색 UI ───────── */}
        <Row className="g-2 mb-2 flex-wrap">
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="학과(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchMajor: value})) }}>
              <option value="">학과</option>
              {majorList.map((major)=>(
                <option key={major.id} value={major.id}>{major.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="이수구분(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchCompletionDiv: value})) }}>
              <option value="">이수구분</option>
              <option value="MAJOR_REQUIRED">전공  필수</option>
              <option value="MAJOR_ELECTIVE">전공 선택</option>
              <option value="LIBERAL_REQUIRED">교양 필수</option>
              <option value="LIBERAL_ELECTIVE">교양 선택</option>
              <option value="GENERAL_ELECTIVE">일반 선택</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="학년(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchLevel: value})) }}>
              <option value="">학년</option>
              <option value={1}>1학년</option>
              <option value={2}>2학년</option>
              <option value={3}>3학년</option>
              <option value={4}>4학년</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="학점(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchCredit: value})) }}>
              <option value="">학점</option>
              <option value={1}>1학점</option>
              <option value={2}>2학점</option>
              <option value={3}>3학점</option>
              <option value={4}>4학점</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="검색조건(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchMode: value})) }}>
              <option value="">전체 검색</option>
              <option value="name">강의명</option>
              <option value="professor">담당교수</option>
              <option value="major">학과</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={8} md={2}>
            <Form.Control size="sm" placeholder="검색어 입력" aria-label="검색어(가능)" 
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchKeyword: value})) }}/>
          </Col>
        </Row>

        {/* ───────── 장바구니 목록 ───────── */}
        <Table bordered hover size="sm" className="align-middle shadow-sm rounded-3 mb-2">
          <colgroup>
            <col style={{ width: "3rem" }} />
            <col style={{ width: "15rem" }} />
            <col style={{ width: "11rem" }} />
            <col style={{ width: "10rem" }} />
            <col style={{ width: "6rem" }} />
            <col style={{ width: "9rem" }} />
            <col style={{ width: "9rem" }} />
            <col style={{ width: "12rem" }} /> {/* 수업 요일 */}
            <col style={{ width: "5rem" }} />
            <col style={{ width: "4rem" }} />
            <col style={{ width: "6rem" }} />
            <col style={{ width: "7rem" }} />
            <col style={{ width: "8rem" }} />
            <col style={{ width: "7.5rem" }} />
          </colgroup>

          <tbody>
            <tr className="table-secondary">
              <td colSpan={14} className="fw-bold py-2">장바구니</td>
            </tr>
            <tr className="table-light">
              <th className="text-center text-nowrap py-2">체크</th>
              <th className="py-2">강의명</th>
              <th className="py-2">과이름</th>
              <th className="text-center text-nowrap py-2">이수 구분</th>
              <th className="text-center text-nowrap py-2">학년</th>
              <th className="text-nowrap py-2">담당교수</th>
              <th className="text-center text-nowrap py-2">학기</th>
              <th className="text-center text-nowrap py-2">수업 요일</th>
              <th className="text-center text-nowrap py-2">총원</th>
              <th className="text-center text-nowrap py-2">학점</th>
              <th className="text-center text-nowrap py-2">자료</th>
              <th className="text-center text-nowrap py-2">상태</th>
              <th className="text-center text-nowrap py-2" colSpan={2}>상세 </th>
            </tr>

            {approvedLecList.map((lec) => (
              <tr key={lec.id}>
                <td className="text-center text-nowrap">{/* <Form.Check type="checkbox" value={lec.id} /> */}</td>
                <td className="fw-semibold">
                  <span className="d-inline-block text-truncate w-100">{lec.name}</span>
                </td>
                <td>
                  <span className="d-inline-block text-truncate w-100">{lec.majorName}</span>
                </td>
                <td className="text-center text-nowrap">{typeMap2[lec.completionDiv]}</td>
                <td className="text-center text-nowrap">{lec.level}</td>
                <td className="text-nowrap">{lec.userName}</td>
                <td className="text-center text-nowrap">{splitStartDate(lec.startDate)}</td>
                <td className="text-center text-nowrap">
                  {(lec.lectureSchedules ?? []).map(s => typeMapDay[s.day]).join(', ')}
                </td>
                <td className="text-center text-nowrap">{lec.totalStudent}</td>
                <td className="text-center text-nowrap">{lec.credit}</td>
                <td className="text-center text-nowrap">
                  <Button
                    size="sm"
                    variant="outline-dark"
                    onClick={() => { setModalId(lec.id); setOpen(true); }}
                  >
                    상세
                  </Button>
                </td>
                <td className="text-center text-nowrap">{typeMap3[lec.lecStatus]}</td>
                <td className="text-center text-nowrap" colSpan={2}>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="fw-semibold px-3 me-4"
                    onClick={() => { const status = "SUBMITTED"; stautsRequest(lec.id, status); }}
                  >
                    확정
                  </Button>
                  <Button size="sm" variant="outline-danger" className="fw-semibold px-3">
                    취소
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex justify-content-end gap-2 mb-4">
          <Button size="sm" variant="primary" className="fw-semibold px-3">일괄 확정</Button>
          <Button size="sm" variant="danger" className="fw-semibold px-3">일괄 취소</Button>
        </div>

        {/* ───────── 수강신청 완료 목록: 필터/검색 UI ───────── */}
        <Row className="g-2 mb-2 flex-wrap">
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="학과(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchMajor: value})) }}>
              <option value="">학과</option>
              {majorList.map((major)=>(
                <option key={major.id} value={major.id}>{major.name}</option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="이수구분(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchCompletionDiv: value})) }}>
              <option value="">이수구분</option>
              <option value="MAJOR_REQUIRED">전공  필수</option>
              <option value="MAJOR_ELECTIVE">전공 선택</option>
              <option value="LIBERAL_REQUIRED">교양 필수</option>
              <option value="LIBERAL_ELECTIVE">교양 선택</option>
              <option value="GENERAL_ELECTIVE">일반 선택</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="학년(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchLevel: value})) }}>
              <option value="">학년</option>
              <option value={1}>1학년</option>
              <option value={2}>2학년</option>
              <option value={3}>3학년</option>
              <option value={4}>4학년</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="학점(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchCredit: value})) }}>
              <option value="">학점</option>
              <option value={1}>1학점</option>
              <option value={2}>2학점</option>
              <option value={3}>3학점</option>
              <option value={4}>4학점</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={4} md={2}>
            <Form.Select size="sm" aria-label="검색조건(가능)"
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchMode: value})) }}>
              <option value="">전체 검색</option>
              <option value="name">강의명</option>
              <option value="professor">담당교수</option>
              <option value="major">학과</option>
            </Form.Select>
          </Col>
          <Col xs={6} sm={8} md={2}>
            <Form.Control size="sm" placeholder="검색어 입력" aria-label="검색어(가능)" 
              onChange={(e)=>{ const value = e.target.value; setPaging((previous)=>({...previous, searchKeyword: value})) }}/>
          </Col>
        </Row>

        {/* ───────── 신청 확정 목록 ───────── */}
        <Table bordered hover size="sm" className="align-middle shadow-sm rounded-3 mb-2">
          <colgroup>
            <col style={{ width: "3rem" }} />
            <col style={{ width: "16rem" }} />
            <col style={{ width: "12rem" }} />
            <col style={{ width: "10rem" }} />
            <col style={{ width: "6rem" }} />
            <col style={{ width: "10rem" }} />
            <col style={{ width: "10rem" }} />
            <col style={{ width: "12rem" }} /> {/* 수업 요일 */}
            <col style={{ width: "5rem" }} />
            <col style={{ width: "4rem" }} />
            <col style={{ width: "6rem" }} />
            <col style={{ width: "8rem" }} />
            <col style={{ width: "7.5rem" }} />
          </colgroup>

          <tbody>
            <tr className="table-secondary">
              <td colSpan={13} className="fw-bold py-2">신청 확정</td>
            </tr>
            <tr className="table-light">
              <th className="text-center text-nowrap py-2">체크</th>
              <th className="py-2">강의명</th>
              <th className="py-2">과이름</th>
              <th className="text-center text-nowrap py-2">이수 구분</th>
              <th className="text-center text-nowrap py-2">학년</th>
              <th className="text-nowrap py-2">담당교수</th>
              <th className="text-center text-nowrap py-2">학기</th>
              <th className="text-center text-nowrap py-2">수업 요일</th>
              <th className="text-center text-nowrap py-2">총원</th>
              <th className="text-center text-nowrap py-2">학점</th>
              <th className="text-center text-nowrap py-2">자료</th>
              <th className="text-center text-nowrap py-2">상태</th>
              <th className="text-center text-nowrap py-2">상세</th>
            </tr>

            {submitLecList.map((lec) => (
              <tr key={lec.id}>
                <td className="text-center text-nowrap">{/* <Form.Check type="checkbox" value={lec.id} /> */}</td>
                <td className="fw-semibold">
                  <span className="d-inline-block text-truncate w-100">{lec.name}</span>
                </td>
                <td>
                  <span className="d-inline-block text-truncate w-100">{lec.majorName}</span>
                </td>
                <td className="text-center text-nowrap">{typeMap2[lec.completionDiv]}</td>
                <td className="text-center text-nowrap">{lec.level}</td>
                <td className="text-nowrap">{lec.userName}</td>
                <td className="text-center text-nowrap">{splitStartDate(lec.startDate)}</td>
                <td className="text-center text-nowrap">
                  {(lec.lectureSchedules ?? []).map(s => typeMapDay[s.day]).join(', ')}
                </td>
                <td className="text-center text-nowrap">{lec.totalStudent}</td>
                <td className="text-center text-nowrap">{lec.credit}</td>
                <td className="text-center text-nowrap">
                  <Button
                    size="sm"
                    variant="outline-dark"
                    onClick={() => { setModalId(lec.id); setOpen(true); }}
                  >
                    상세
                  </Button>
                </td>
                <td className="text-center text-nowrap">{typeMap3[lec.status]}</td>
                <td className="text-center text-nowrap">
                  <Button size="sm" variant="outline-danger" className="fw-semibold px-3">
                    수강 취소
                  </Button>   
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="d-flex justify-content-end mb-4">
          <Button size="sm" variant="danger" className="fw-semibold px-3">
            일괄 취소
          </Button>
        </div>

      </div>

      {/* ───────── 상세 모달 ───────── */}
            <Modal
        show={open}
        onHide={() => setOpen(false)}
        centered
        backdrop="static"
        aria-labelledby="lecture-detail-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="lecture-detail-title" className="fs-5">
            {modalLec.name}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* 상세 시간표 */}
          <div className="mb-3">
            <div className="text-muted small mb-2">상세 시간표</div>
            <div className="table-responsive">
              <Table size="sm" bordered hover className="align-middle mb-0" style={{ fontSize: "0.9rem" }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "6rem" }} className="text-center">요일</th>
                    <th style={{ width: "7rem" }} className="text-center">시작</th>
                    <th style={{ width: "7rem" }} className="text-center">종료</th>
                    <th>시간</th>
                  </tr>
                </thead>
                <tbody>
                  {(modalLec?.lectureSchedules ?? []).map((s, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{typeMapDay[s.day] ?? s.day}</td>
                      <td className="text-center">{typeMapStart[s.startTime] ?? s.startTime}</td>
                      <td className="text-center">{typeMapEnd[s.endTime] ?? s.endTime}</td>
                      <td className="text-nowrap">{s.startTime}~{s.endTime}</td>
                    </tr>
                  ))}
                  {(modalLec?.lectureSchedules ?? []).length === 0 && (
                    <tr><td colSpan={4} className="text-center text-muted">시간표 없음</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          {/* 강의설명 */}
          <div className="mb-3">
            <div className="text-muted small mb-2">강의설명</div>
            <div className="border rounded p-3 bg-body-tertiary" style={{ whiteSpace: "pre-wrap" }}>
              {modalLec.description}
            </div>
          </div>

<<<<<<< HEAD
=======
          {/* 점수 산출 비율 */}
          <div className="mb-3">
            <div className="text-muted small mb-2">점수 산출 비율</div>
            <div className="table-responsive">
              <Table size="sm" bordered hover className="align-middle mb-0" style={{ fontSize: "0.9rem" }}>
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: "6rem" }}>출석</th>
                    <th className="text-center" style={{ width: "6rem" }}>과제</th>
                    <th className="text-center" style={{ width: "6rem" }}>중간</th>
                    <th className="text-center" style={{ width: "6rem" }}>기말</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/* 값은 사용자가 채울 예정 */}
                    <td className="text-center">{modalLec?.weightsDto?.attendanceScore ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.assignmentScore ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.midtermExam ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.finalExam ?? "-"}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>

>>>>>>> develop
          {/* 첨부파일 */}
          <div>
            <div className="text-muted small mb-2">첨부파일</div>
            <div className="d-flex align-items-center justify-content-between">
              <div className="text-muted w-100">
                <ul className="mb-0 w-100">
                  {modalLec?.attachmentDtos?.length > 0 ? (
                    modalLec.attachmentDtos.map((lecFile) => (
                      <li key={lecFile.id} className="mb-1">
                        <div className="d-flex align-items-center w-100">
                          <span className="text-truncate me-2 flex-grow-1">{lecFile.name}</span>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="ms-auto flex-shrink-0"
                            onClick={() => downloadClick(lecFile.id)}
                          >
                            다운로드
                          </Button>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted">첨부된 파일이 없습니다.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-end">
<<<<<<< HEAD
          <Button variant="secondary" onClick={() => setOpen(false)}>닫기</Button>
=======
          <Button variant="secondary" onClick={() => setOpen(false)}>
            닫기
          </Button>
>>>>>>> develop
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default App;
