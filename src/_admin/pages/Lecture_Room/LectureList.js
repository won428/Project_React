import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Form, Modal, Table, Tab, Tabs, Pagination } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const YEAR_START = 1990;

function App() {
  const [lectureList, setLectureList] = useState();
  const [approvedLec, setApprovedLec] = useState([]);
  const [rejectedLec, setRejectedLec] = useState([]);
  const [pendingLec, setPendingLec] = useState([]);

  // ▼▼ 개강/종강 탭에서 쓰는 상태 (필요한 부분만 추가)
  const [inprogressLec, setInprogressLec] = useState([]);
  const [completedLec, setCompletedLec] = useState([]);
  const [compleSelected, setCompleSelected] = useState([]);
  const [rejecSelected, setrejecSelected] = useState([]);
  // ▲▲

  const [inproSelected, setInproSelected] = useState([]);   // 승인목록 → 개강용 선택
  const [approveSelected, setApproveSelected] = useState([]); // 승인대기 → 일괄승인용
  const [rejectedSelected, setRejectedSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [modalId, setModalId] = useState('');
  const [modalLec, setModalLec] = useState({});
  const [majorList, setMajorList] = useState([]);
  const [userList, setUserList] = useState([]);

  // ★ 현재 탭 상태(추가)
  const [tabKey, setTabKey] = useState('pending');
  const tabToStatus = {
    pending: 'PENDING',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    inprogress: 'INPROGRESS',
    completed: 'COMPLETED',
  };

  const [paging, setPaging] = useState({
    totalElements : 0,
    pageSize : 10,
    totalPages : 0,
    pageNumber : 0,
    pageCount : 10,
    beginPage : 0,
    endPage : 0,
    searchCompletionDiv: '',
    searchMajor: '',
    searchCredit: '',
    searchStartDate: '',
    searchMode: 'all',
    searchKeyword:'',
    searchSchedule:'',
    searchYear:'',
    searchLevel:'',
    searchUser:'',

    // ★ 탭별 독립 페이징 필드(추가)
    totalElements_pending: 0,
    totalPages_pending: 0,
    pageNumber_pending: 0,
    beginPage_pending: 0,
    endPage_pending: 0,

    totalElements_approved: 0,
    totalPages_approved: 0,
    pageNumber_approved: 0,
    beginPage_approved: 0,
    endPage_approved: 0,

    totalElements_rejected: 0,
    totalPages_rejected: 0,
    pageNumber_rejected: 0,
    beginPage_rejected: 0,
    endPage_rejected: 0,

    totalElements_inprogress: 0,
    totalPages_inprogress: 0,
    pageNumber_inprogress: 0,
    beginPage_inprogress: 0,
    endPage_inprogress: 0,

    totalElements_completed: 0,
    totalPages_completed: 0,
    pageNumber_completed: 0,
    beginPage_completed: 0,
    endPage_completed: 0,
  });

  const years = useMemo(() => {
    const end = new Date().getFullYear() + 1;
    return Array.from({ length: end - YEAR_START + 1 }, (_, i) => YEAR_START + i);
  }, []);
  const yearsDesc = years.slice().reverse();

  useEffect(() => {
    if (!modalId) return;
    const url = `${API_BASE_URL}/lecture/info`;
    axios
      .get(url, { params: { modalId: Number(modalId) } })
      .then((res) => setModalLec(res.data))
      .catch((err) => {
        console.error(err.response?.data);
        alert('오류');
      });
  }, [modalId]);

  const fetchLectures = useCallback(async () => {
    const url = `${API_BASE_URL}/lecture/pageList`;

    // ★ 현재 탭의 상태/페이지번호 선택
    const statusParam = tabToStatus[tabKey];
    const currentPageNumber = paging[`pageNumber_${tabKey}`] ?? 0;

    const params = {
      pageNumber: currentPageNumber,              // ★ 탭별 pageNumber 사용
      pageSize: paging.pageSize,
      searchStatus: statusParam,                  // ★ 탭별 상태 파라미터 추가
      searchCompletionDiv: paging.searchCompletionDiv || undefined,
      searchMajor: paging.searchMajor || undefined,
      searchCredit: paging.searchCredit || undefined,
      searchStartDate: paging.searchStartDate || undefined,
      searchMode: paging.searchMode || undefined,
      searchKeyword: (paging.searchKeyword || '').trim() || undefined,
      searchSchedule:paging.searchSchedule || undefined,
      searchYear:paging.searchYear || undefined,
      searchLevel:paging.searchLevel || undefined,
      searchUser:paging.searchUser || undefined,
    };

    axios
      .get(url, { params })
      .then((response) => {
        setLectureList(response.data.content || []);
        setPaging((previous)=>{
          const totalElements = response.data.totalElements;
          const totalPages = response.data.totalPages;
          const pageNumber = response.data.pageable.pageNumber;
          const pageSize = response.data.pageable.pageSize;

          const beginPage = Math.floor(pageNumber / previous.pageCount) * previous.pageCount;
          const endPage = Math.min(beginPage + previous.pageCount - 1, totalPages - 1);

          return {
            ...previous,

            // ★ 탭별 독립 페이징 갱신
            [`totalElements_${tabKey}`]: totalElements,
            [`totalPages_${tabKey}`]: totalPages,
            [`pageNumber_${tabKey}`]: pageNumber,
            [`beginPage_${tabKey}`]: beginPage,
            [`endPage_${tabKey}`]: endPage,

            // 기존 공용 필드는 그대로 유지(미사용이지만 건드리지 않음)
            totalElements,
            totalPages,
            pageNumber,
            pageSize,
            beginPage,
            endPage,
          };
        });
      })
      .catch((error) => {
        console.log(error?.response?.data || error);
      });

  }, [
    tabKey,                                   // ★ 탭 변경 시 재호출
    paging.searchCompletionDiv,
    paging.searchMajor,
    paging.searchCredit,
    paging.searchStartDate,
    paging.searchMode,
    paging.searchKeyword,
    paging.searchSchedule,
    paging.searchYear,
    paging.searchLevel,
    paging.searchUser,

    // ★ 탭별 pageNumber 변화를 모두 의존성에 포함
    paging.pageNumber_pending,
    paging.pageNumber_approved,
    paging.pageNumber_rejected,
    paging.pageNumber_inprogress,
    paging.pageNumber_completed,
  ]);

  useEffect(()=>{
    const url = `${API_BASE_URL}/major/listForLecturePage`;
    axios
      .get(url)
      .then((response)=>{
        setMajorList(response.data)
        console.log(response.data)
      })
      .catch((err)=>{
        console.log(err)
      })
  },[])

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  useEffect(() => {
    if (!Array.isArray(lectureList)) return;
    setApprovedLec(lectureList.filter((lec) => lec.status === "APPROVED"));
    setRejectedLec(lectureList.filter((lec) => lec.status === "REJECTED"));
    setPendingLec(lectureList.filter((lec) => lec.status === "PENDING"));
  }, [lectureList]);

  // ▼▼ 개강/종강 분류 (필요한 부분만 추가)
  useEffect(() => {
    if (!Array.isArray(lectureList)) return;
    setInprogressLec(lectureList.filter((lec) => lec.status === "INPROGRESS"));
    setCompletedLec(lectureList.filter((lec) => lec.status === "COMPLETED"));
  }, [lectureList]);
  // ▲▲

  useEffect(() => {
    // 선택한 학과의 교수 목록 세팅
    const m = (majorList ?? []).find(v => String(v.id) === String(paging.searchMajor));
    setUserList(m?.userList ?? []);

    // 학과가 바뀌면 교수 선택 초기화 (이미 ''이면 상태 변경 안 함)
    setPaging(prev =>
      prev.searchUser !== '' ? { ...prev, searchUser: '' } : prev
    );
  }, [paging.searchMajor, majorList]);

  const typeMap = {
    PENDING: "처리중",
    APPROVED: "승인",
    REJECTED: "거부",
    INPROGRESS: "개강",
    COMPLETED: "종강",
  };

  const typeMap2 = {
    MAJOR_REQUIRED: "전공 필수",
    MAJOR_ELECTIVE: "전공 선택",
    LIBERAL_REQUIRED: "교양 필수",
    LIBERAL_ELECTIVE: "교양 선택",
    GENERAL_ELECTIVE: " 일반 선택",
  };

  const typeMap3 = {
    MONDAY: "월",
    TUESDAY: "화",
    WEDNESDAY: "수",
    THURSDAY: "목",
    FRIDAY: "금",
  };


  const splitStartDate = (date) => {
    const [yyyy, mm] = date.split("-");
    const yaer = yyyy.slice(-2);
    let splitMonth = Number(mm);
    let splitDate = "";
    if (splitMonth === 12) {
      splitDate = `${yaer}년도 겨울 계절학기`;
    } else if (splitMonth === 3) {
      splitDate = `${yaer}년도 1학기`;
    } else if (splitMonth === 6) {
      splitDate = `${yaer}년도 여름 계절학기`;
    } else if (splitMonth === 9) {
      splitDate = `${yaer}년도 2학기`;
    }
    return splitDate;
  };

  const stautsRequest = async (id, status) => {
    const url = `${API_BASE_URL}/lecture/request`;
    try {
      const response = await axios.put(url, null, {
        params: { status: status, id: id },
      });
      if (response.status === 200) {
        alert("처리 완료");
        await fetchLectures();
      }
    } catch (error) {
      const err = error.response;
      if (!err) {
        alert("네트워크 오류가 발생하였습니다");
        return;
      }
      const message = err.data?.message ?? "오류 발생";
      alert(message);
    }
  };

  const addInproSelect = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    setInproSelected((prev) =>
      checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value)
    );
  };
  const addAproSelect = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    setApproveSelected((prev) =>
      checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value)
    );
  };
  const addRejecSelect = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    setRejectedSelected((prev) =>
      checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value)
    );
  };

  const lectureInprogress = async (e) => {
    e.preventDefault();
    try {
      const url = `${API_BASE_URL}/lecture/inprogress`;
      const response = await axios.patch(url, inproSelected, {
        params: { status: "INPROGRESS" },
      });
      if (response.status === 200) {
        alert("선택하신 강의를 개강하였습니다.");
        setInproSelected([]);
        await fetchLectures();
      }
    } catch (error) {
      const err = error.response;
      if (!err) {
        alert("네트워크 오류가 발생하였습니다");
        return;
      }
      const message = err.data?.message ?? "오류 발생";
      alert(message);
    }
  };

  const lectureApproved = async (e, selected) => {
    e.preventDefault();
    try {
      const url = `${API_BASE_URL}/lecture/status/admin`;
      const response = await axios.patch(url, selected, {
        params: { status: "APPROVED" },
      });
    if (response.status === 200) {
        alert("선택하신 강의를 승인하였습니다.");
        setApproveSelected([]);
        await fetchLectures();
      }
    } catch (error) {
      const err = error.response;
      if (!err) {
        alert("네트워크 오류가 발생하였습니다");
        return;
      }
      const message = err.data?.message ?? "오류 발생";
      alert(message);
    }
  };

  const lectureRejected = async (e, selected) => {
    e.preventDefault();
    try {
      const url = `${API_BASE_URL}/lecture/status/admin`;
      const response = await axios.patch(url, selected, {
        params: { status: "REJECTED" },
      });
      if (response.status === 200) {
        alert("선택하신 강의를 거부하였습니다.");
        setApproveSelected([]);
        setInproSelected([]);
        await fetchLectures();
      }
    } catch (error) {
      const err = error.response;
      if (!err) {
        alert("네트워크 오류가 발생하였습니다");
        return;
      }
      const message = err.data?.message ?? "오류 발생";
      alert(message);
    }
  };

  const downloadClick = (id) => {
    const url = `${API_BASE_URL}/attachment/download/${id}`
    axios
      .get(url, { responseType: 'blob' })
      .then((response) => {
        console.log(response.headers)
        const cd = response.headers['content-disposition'] || '';
        const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cd)?.[1];
        const quoted = /filename="([^"]+)"/i.exec(cd)?.[1];
        const filename = (utf8 && decodeURIComponent(utf8)) || quoted || `file-${id}`;

        const blob = new Blob(
          [response.data],
          {
            type: response.headers['content-type'] || 'application/octet-stream',
          }
        );

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => {
        console.error(err.response?.data);
        alert('오류');
      })
  }

  const typeMapDay = {
    MONDAY: "월",
    TUESDAY: "화",
    WEDNESDAY: "수",
    THURSDAY: "목",
    FRIDAY: "금",
  };
  const typeMapStart = {
    "9:00": "1교시",
    "10:00": "2교시",
    "11:00": "3교시",
    "12:00": "4교시",
    "13:00": "5교시",
    "14:00": "6교시",
    "15:00": "7교시",
    "16:00": "8교시",
    "17:00": "9교시",
  };
  const typeMapEnd = {
    "10:00": "1교시",
    "11:00": "2교시",
    "12:00": "3교시",
    "13:00": "4교시",
    "14:00": "5교시",
    "15:00": "6교시",
    "16:00": "7교시",
    "17:00": "8교시",
    "18:00": "9교시",
  };

  // ▼▼ 개강/종강 탭에서 쓰는 선택 핸들러 & 액션 (필요한 부분만 추가)
  const addCompleSelect = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    setCompleSelected((prev) =>
      checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value)
    );
  };
  const addRejectSelect = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    setrejecSelected((prev) =>
      checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value)
    );
  };

  const lectureCompleted = async (e) => {
    e.preventDefault();
    try {
      const url = `${API_BASE_URL}/lecture/status/admin`;
      const response = await axios.patch(url, compleSelected, {
        params: { status: "COMPLETED" },
      });
      if (response.status === 200) {
        alert("선택하신 강의를 종강하였습니다.");
        setCompleSelected([]);
        await fetchLectures();
      }
    } catch (error) {
      const err = error.response;
      if (!err) {
        alert("네트워크 오류가 발생하였습니다");
        return;
      }
      const message = err.data?.message ?? "오류 발생";
      alert(message);
    }
  };

  const reInprogress = async (e, selected) => {
    e.preventDefault();
    try {
      const url = `${API_BASE_URL}/lecture/reinprogress`;
      const response = await axios.patch(url, selected, {
        params: { status: "INPROGRESS" },
      });
      if (response.status === 200) {
        alert("선택하신 강의를 개강하였습니다.");
        setCompleSelected([]);
        setrejecSelected([]);
        await fetchLectures();
      }
    } catch (error) {
      const err = error.response;
      if (!err) {
        alert("네트워크 오류가 발생하였습니다");
        return;
      }
      const message = err.data?.message ?? "오류 발생";
      alert(message);
    }
  };

  const restart = async (id, status) => {
    const url = `${API_BASE_URL}/lecture/restart`;
    try {
      const response = await axios.put(url, null, {
        params: { status: status, id: id },
      });
      if (response.status === 200) {
        alert("처리 완료");
        await fetchLectures();
      }
    } catch (error) {
      const err = error.response;
      if (!err) {
        alert("네트워크 오류가 발생하였습니다");
        return;
      }
      const message = err.data?.message ?? "오류 발생";
      alert(message);
    }
  };
  // ▲▲

  // ★ 현재 탭 전용 페이징 값 계산(렌더링에서 사용)
  const curBegin = paging[`beginPage_${tabKey}`] ?? 0;
  const curEnd = paging[`endPage_${tabKey}`] ?? -1;
  const curPage = paging[`pageNumber_${tabKey}`] ?? 0;
  const curTotalPages = paging[`totalPages_${tabKey}`] ?? 0;

  return (
    <>
      <div className="d-flex align-items-center flex-nowrap gap-2 mb-3">
        <h4 className="mb-0 me-3 flex-shrink-0">강의 목록</h4>

        {/* 년도 */}
        <Form.Select id="filterYear" size="sm" className="w-auto"
          value={paging.searchYear}
          onChange={(e)=>{
            const value = e.target.value;
            setPaging((pre)=>({...pre, searchYear : value}))
          }}
        >
          <option value="">년도</option>
          {yearsDesc.map(y => <option key={y} value={y}>{y}</option>)}
        </Form.Select>

        {/* 학기 */}
        <Form.Select
          id="filterSemester"
          aria-label="학기"
          size="sm"
          className="w-auto flex-shrink-0"
          style={{ minWidth: 120 }}
          value={paging.searchStartDate}
          onChange={(e)=>{
            const value = e.target.value;
            setPaging((pre)=>({...pre, searchStartDate : value}))
          }}
        >
          <option value="">학기</option>
          {/* TODO: 백엔드 정의에 맞춰 value 조정 */}
          <option value="3">1학기</option>
          <option value="9">2학기</option>
          <option value="6">여름 계절</option>
          <option value="12">겨울 계절</option>
        </Form.Select>

        {/* 이수구분 */}
        <Form.Select
          id="filterCompletionDiv"
          aria-label="이수구분"
          size="sm"
          className="w-auto flex-shrink-0"
          style={{ minWidth: 160 }}
          value={paging.searchCompletionDiv}
          onChange={(e)=>{
            const value = e.target.value;
            setPaging((pre)=>({...pre, searchCompletionDiv : value}))
          }}
        >
          <option value="">이수구분</option>
          <option value="MAJOR_REQUIRED">전공필수</option>
          <option value="MAJOR_ELECTIVE">전공선택</option>
          <option value="LIBERAL_REQUIRED">교양필수</option>
          <option value="LIBERAL_ELECTIVE">교양선택</option>
          <option value="GENERAL_ELECTIVE">일반선택</option>
        </Form.Select>

        {/* 학년 */}
        <Form.Select
          id="filterLevel"
          aria-label="학년"
          size="sm"
          className="w-auto flex-shrink-0"
          style={{ minWidth: 120 }}
          value={paging.searchLevel}
          onChange={(e)=>{
            const value = e.target.value;
            setPaging((pre)=>({...pre, searchLevel : value}))
          }}
        >
          <option value="0">학년</option>
          <option value="1">1학년</option>
          <option value="2">2학년</option>
          <option value="3">3학년</option>
          <option value="4">4학년</option>
        </Form.Select>

        {/* 소속학과 */}
        <Form.Select
          id="filterMajor"
          aria-label="소속학과"
          size="sm"
          className="w-auto flex-shrink-0"
          style={{ minWidth: 180 }}
          value={paging.searchMajor}
          onChange={(e)=>{
            const value = e.target.value;
            setPaging((pre)=>({...pre, searchMajor : value}))
          }}
        >
          <option value="">소속학과</option>
          {majorList.map((major)=>(
            <option key={major.id} value={major.id}>{major.name}</option>
          ))}
        </Form.Select>

        {/* 담당교수 */}
        <Form.Select
          id="filterProfessor"
          aria-label="담당교수"
          size="sm"
          className="w-auto flex-shrink-0"
          style={{ minWidth: 150 }}
          value={paging.searchUser}
          onChange={(e)=>{
            const value = e.target.value;
            setPaging((pre)=>({...pre, searchUser : value}))
          }}
        >
          <option value="">담당교수</option>
          {userList.map((user)=>(
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
          {/* TODO: 옵션 추가 */}
        </Form.Select>

        {/* 수업 요일 */}
        <Form.Select
          id="filterDay"
          aria-label="수업 요일"
          size="sm"
          className="w-auto flex-shrink-0"
          style={{ minWidth: 140 }}
          value={paging.searchSchedule}
          onChange={(e)=>{
            const value = e.target.value;
            setPaging((pre)=>({...pre, searchSchedule : value}))
          }}
        >
          <option value="">수업 요일</option>
          <option value="MONDAY">월요일</option>
          <option value="TUESDAY">화요일</option>
          <option value="WEDNESDAY">수요일</option>
          <option value="THURSDAY">목요일</option>
          <option value="FRIDAY">금요일</option>
        </Form.Select>

        {/* 학점 */}
        <Form.Select
          id="filterCredit"
          aria-label="학점"
          size="sm"
          className="w-auto flex-shrink-0"
          style={{ minWidth: 120 }}
          value={paging.searchCredit}
          onChange={(e)=>{
            const value = e.target.value;
            setPaging((pre)=>({...pre, searchCredit : value}))
          }}
        >
          <option value="0">학점</option>
          <option value="1">1학점</option>
          <option value="2">2학점</option>
          <option value="3">3학점</option>
          <option value="4">4학점</option>
        </Form.Select>

        <Button
          variant="outline-secondary"
          size="sm"
          className="ms-auto w-auto flex-shrink-0"
          onClick={() => navigate(-1)}
        >
          돌아가기
        </Button>
      </div>

      <div className="position-relative">
        <div
          className="position-absolute end-0 d-flex align-items-center gap-2 pe-2"
          style={{ top: 6, zIndex: 10, pointerEvents: "none" }}
        >
          <Form.Select
            id="tabSearchMode"
            size="sm"
            className="w-auto"
            style={{ minWidth: 110, pointerEvents: "auto" }}
            value={paging.searchMode}
            onChange={(e) => {
              const value = e.target.value;
              setPaging((prev) => ({ ...prev, searchMode: value, pageNumber: 0 }));
            }}
          >
            {/* TODO: 백엔드 searchMode 값에 맞게 조정 */}
            <option value="all">전체</option>
            <option value="name">강의명</option>
            <option value="professor">교수명</option>
            <option value="major">학과</option>
          </Form.Select>

          <Form.Control
            id="tabSearchKeyword"
            size="sm"
            className="w-auto"
            style={{ width: 220, pointerEvents: "auto" }}
            placeholder="검색어"
            value={paging.searchKeyword}
            onChange={(e) => {
              const value = e.target.value;
              setPaging((prev) => ({ ...prev, searchKeyword: value, pageNumber: 0 }));
            }}
          />
        </div>

        {/* 상단 탭 네비게이션 */}
        <Tabs
          id="lecture-tabs"
          activeKey={tabKey}                   // ★ 탭 제어
          onSelect={(k) => setTabKey(k || 'pending')}
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
          {/* ───────── 승인 대기 목록 탭 ───────── */}
          <Tab eventKey="pending" title={`승인 대기 `}>
            {/* ───────── 승인 대기 목록 ───────── */}
            <div className="mb-4">
              <div className="fw-bold mb-2">승인 대기 목록</div>
              <div className="table-responsive">
                <Table
                  bordered
                  hover
                  size="sm"
                  className="align-middle table-sm small mb-0"
                  style={{ fontSize: "0.875rem" }}
                >
                  <colgroup>
                    <col style={{ width: "3rem" }} />
                    <col style={{ width: "16rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "3rem" }} />
                    <col style={{ width: "12rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "13rem" }} />
                    <col style={{ width: "9rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "4rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "6rem" }} />
                    <col style={{ width: "6rem" }} />
                    <col style={{ width: "6rem" }} />
                  </colgroup>
                  <thead className="table-light text-center">
                    <tr>
                      <th>체크</th>
                      <th className="text-start">강의명</th>
                      <th>이수구분</th>
                      <th>학년</th>
                      <th className="text-start">과이름</th>
                      <th>담당교수</th>
                      <th>학기</th>
                      <th>수업 요일</th>
                      <th>총원</th>
                      <th>현재원</th>
                      <th>학점</th>
                      <th>상세보기</th>
                      <th>상태</th>
                      <th>수정</th>
                      <th colSpan={2}>기능</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLec.map((lec) => (
                      <tr key={lec.id}>
                        <td className="text-center text-nowrap">
                          <Form.Check type="checkbox" value={lec.id} onChange={addAproSelect} />
                        </td>
                        <td className="text-start">{lec.name}</td>
                        <td className="text-center">{typeMap2[lec.completionDiv]}</td>
                        <td className="text-center">{lec.level}</td>
                        <td className="text-start">{lec.majorName}</td>
                        <td className="text-center">{lec.userName}</td>
                        <td className="text-center">{splitStartDate(lec.startDate)}</td>
                        <td className="text-center">
                          {(lec.lectureSchedules ?? []) 
                            .map((s) => typeMap3[s.day] ?? s.day)
                            .join(", ")}
                        </td>
                        <td className="text-center">{lec.totalStudent}</td>
                        <td className="text-center">{lec.nowStudent}</td>
                        <td className="text-center">{lec.credit}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-dark"
                            onClick={() => {
                              setModalId(lec.id);
                              setOpen(true);
                            }}
                          >
                            상세
                          </Button>
                        </td>
                        <td className="text-center">{typeMap[lec.status]}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => {
                              navigate(`/lecupdateAd/${lec.id}`);
                            }}
                          >
                            수정
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              const status = "APPROVED";
                              stautsRequest(lec.id, status);
                            }}
                          >
                            승인
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              const status = "REJECTED";
                              stautsRequest(lec.id, status);
                            }}
                          >
                            거부
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="d-flex justify-content-end gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => {
                      lectureApproved(e, approveSelected);
                    }}
                  >
                    일괄승인
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => {
                      lectureRejected(e, approveSelected);
                    }}
                  >
                    일괄거부
                  </Button>
                </div>
              </div>
            </div>
          </Tab>

          {/* ───────── 승인 목록 탭 ───────── */}
          <Tab eventKey="approved" title={`승인`}>
            {/* ───────── 승인 목록 ───────── */}
            <div className="mb-4">
              <div className="fw-bold mb-2">승인 목록</div>
              <div className="table-responsive">
                <Table
                  bordered
                  hover
                  size="sm"
                  className="align-middle table-sm small mb-0"
                  style={{ fontSize: "0.875rem" }}
                >
                  <colgroup>
                    <col style={{ width: "3rem" }} />
                    <col style={{ width: "16rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "3rem" }} />
                    <col style={{ width: "12rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "13rem" }} />
                    <col style={{ width: "9rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "4rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "6rem" }} />
                    <col style={{ width: "6rem" }} />
                    <col style={{ width: "6rem" }} />
                  </colgroup>
                  <thead className="table-light text-center">
                    <tr>
                      <th>체크</th>
                      <th className="text-start">강의명</th>
                      <th>이수구분</th>
                      <th>학년</th>
                      <th className="text-start">과이름</th>
                      <th>담당교수</th>
                      <th>학기</th>
                      <th>수업 요일</th>
                      <th>총원</th>
                      <th>현재원</th>
                      <th>학점</th>
                      <th>상세보기</th>
                      <th>상태</th>
                      <th>수정</th>
                      <th colSpan={2}>기능</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedLec.map((lec) => (
                      <tr key={lec.id}>
                        <td className="text-center text-nowrap">
                          <Form.Check type="checkbox" value={lec.id} onChange={addInproSelect} />
                        </td>
                        <td className="text-start">{lec.name}</td>
                        <td className="text-center">{typeMap2[lec.completionDiv]}</td>
                        <td className="text-center">{lec.level}</td>
                        <td className="text-start">{lec.majorName}</td>
                        <td className="text-center">{lec.userName}</td>
                        <td className="text-center">{splitStartDate(lec.startDate)}</td>
                        <td className="text-center">
                          {(lec.lectureSchedules ?? [])
                            .map((s) => typeMap3[s.day] ?? s.day)
                            .join(", ")}
                        </td>
                        <td className="text-center">{lec.totalStudent}</td>
                        <td className="text-center">{lec.nowStudent}</td>
                        <td className="text-center">{lec.credit}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-dark"
                            onClick={() => {
                              setModalId(lec.id);
                              setOpen(true);
                            }}
                          >
                            상세
                          </Button>
                        </td>
                        <td className="text-center">{typeMap[lec.status]}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => {
                              navigate(`/lecupdateAd/${lec.id}`);
                            }}
                          >
                            수정
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              stautsRequest(lec.id, "INPROGRESS");
                            }}
                          >
                            개강
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              const status = "REJECTED";
                              stautsRequest(lec.id, status);
                            }}
                          >
                            폐강
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="d-flex justify-content-end gap-2 mt-2">
                  <Button size="sm" variant="primary" onClick={lectureInprogress}>
                    일괄 개강
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => {
                      lectureRejected(e, inproSelected);
                    }}
                  >
                    일괄거부
                  </Button>
                </div>
              </div>
            </div>
          </Tab>

          {/* ───────── 승인 거부 목록 탭 ───────── */}
          <Tab eventKey="rejected" title={`거부`}>
            {/* ───────── 승인 거부 목록 ───────── */}
            <div className="mb-4">
              <div className="fw-bold mb-2">승인 거부 목록</div>
              <div className="table-responsive">
                <Table
                  bordered
                  hover
                  size="sm"
                  className="align-middle table-sm small mb-0"
                  style={{ fontSize: "0.875rem" }}
                >
                  <colgroup>
                    <col style={{ width: "3rem" }} />
                    <col style={{ width: "16rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "3rem" }} />
                    <col style={{ width: "12rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "13rem" }} />
                    <col style={{ width: "9rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "4rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "6rem" }} />
                    <col style={{ width: "6rem" }} />
                    <col style={{ width: "6rem" }} />
                  </colgroup>
                  <thead className="table-light text-center">
                    <tr>
                      <th>체크</th>
                      <th className="text-start">강의명</th>
                      <th>이수구분</th>
                      <th>학년</th>
                      <th className="text-start">과이름</th>
                      <th>담당교수</th>
                      <th>학기</th>
                      <th>수업 요일</th>
                      <th>총원</th>
                      <th>현재원</th>
                      <th>학점</th>
                      <th>상세보기</th>
                      <th>상태</th>
                      <th>수정</th>
                      <th colSpan={2}>기능</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedLec.map((lec) => (
                      <tr key={lec.id}>
                        <td className="text-center text-nowrap">
                          <Form.Check type="checkbox" value={lec.id} onChange={addRejecSelect} />
                        </td>
                        <td className="text-start">{lec.name}</td>
                        <td className="text-center">{typeMap2[lec.completionDiv]}</td>
                        <td className="text-center">{lec.level}</td>
                        <td className="text-start">{lec.majorName}</td>
                        <td className="text-center">{lec.userName}</td>
                        <td className="text-center">{splitStartDate(lec.startDate)}</td>
                        <td className="text-center">
                          {(lec.lectureSchedules ?? [])
                            .map((s) => typeMap3[s.day] ?? s.day)
                            .join(", ")}
                        </td>
                        <td className="text-center">{lec.totalStudent}</td>
                        <td className="text-center">{lec.nowStudent}</td>
                        <td className="text-center">{lec.credit}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-dark"
                            onClick={() => {
                              setModalId(lec.id);
                              setOpen(true);
                            }}
                          >
                            상세
                          </Button>
                        </td>
                        <td className="text-center">{typeMap[lec.status]}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => {
                              navigate(`/lecupdateAd/${lec.id}`);
                            }}
                          >
                            수정
                          </Button>
                        </td>
                        <td className="text-center" colSpan={2}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              stautsRequest(lec.id, "APPROVED");
                            }}
                          >
                            재승인
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="d-flex justify-content-end gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => {
                      lectureApproved(e, rejectedSelected);
                    }}
                  >
                    일괄 재승인
                  </Button>
                </div>
              </div>
            </div>
          </Tab>

          {/* ───────── 개강 목록 탭 ───────── */}
          <Tab eventKey="inprogress" title={`개강`}>
            <div className="mb-4">
              <div className="fw-bold mb-2">개강 목록</div>
              <div className="table-responsive">
                <Table
                  bordered
                  hover
                  size="sm"
                  className="align-middle table-sm small mb-0"
                  style={{ fontSize: "0.875rem" }}
                >
                  <colgroup>
                    <col style={{ width: "3rem" }} />
                    <col style={{ width: "16rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "3rem" }} />
                    <col style={{ width: "12rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "15rem" }} />
                    <col style={{ width: "9rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "4rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "6rem" }} />
                    <col style={{ width: "6rem" }} />
                  </colgroup>
                  <thead className="table-light text-center">
                    <tr>
                      <th>체크</th>
                      <th className="text-start">강의명</th>
                      <th>이수구분</th>
                      <th>학년</th>
                      <th className="text-start">과이름</th>
                      <th>담당교수</th>
                      <th>학기</th>
                      <th>수업 요일</th>
                      <th>총원</th>
                      <th>현재원</th>
                      <th>학점</th>
                      <th>상세보기</th>
                      <th>상태</th>
                      <th>수정</th>
                      <th>기능</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inprogressLec.map((lec) => (
                      <tr key={lec.id}>
                        <td className="text-center text-nowrap">
                          <Form.Check type="checkbox" value={lec.id} onChange={addCompleSelect} />
                        </td>
                        <td className="text-start">{lec.name}</td>
                        <td className="text-center">{typeMap2[lec.completionDiv]}</td>
                        <td className="text-center">{lec.level}</td>
                        <td className="text-start">{lec.majorName}</td>
                        <td className="text-center">{lec.userName}</td>
                        <td className="text-center">{splitStartDate(lec.startDate)}</td>
                        <td className="text-center">
                          {(lec.lectureSchedules ?? [])
                            .map((s) => typeMap3[s.day] ?? s.day)
                            .join(", ")}
                        </td>
                        <td className="text-center">{lec.totalStudent}</td>
                        <td className="text-center">{lec.nowStudent}</td>
                        <td className="text-center">{lec.credit}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-dark"
                            onClick={() => {
                              setModalId(lec.id);
                              setOpen(true);
                            }}
                          >
                            상세
                          </Button>
                        </td>
                        <td className="text-center">{typeMap[lec.status]}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => {
                              navigate(`/lecupdateAd/${lec.id}`);
                            }}
                          >
                            수정
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              stautsRequest(lec.id, "COMPLETED");
                            }}
                          >
                            종강
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="d-flex justify-content-end gap-2 mt-2">
                  <Button size="sm" variant="danger" onClick={lectureCompleted}>
                    일괄종강
                  </Button>
                </div>
              </div>
            </div>
          </Tab>

          {/* ───────── 종강 목록 탭 ───────── */}
          <Tab eventKey="completed" title={`종강`}>
            <div className="mb-4">
              <div className="fw-bold mb-2">종강 목록</div>
              <div className="table-responsive">
                <Table
                  bordered
                  hover
                  size="sm"
                  className="align-middle table-sm small mb-0"
                  style={{ fontSize: "0.875rem" }}
                >
                  <colgroup>
                    <col style={{ width: "3rem" }} />
                    <col style={{ width: "16rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "3rem" }} />
                    <col style={{ width: "12rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "15rem" }} />
                    <col style={{ width: "9rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "4rem" }} />
                    <col style={{ width: "7rem" }} />
                    <col style={{ width: "5rem" }} />
                    <col style={{ width: "6rem" }} />
                    <col style={{ width: "6rem" }} />
                  </colgroup>
                  <thead className="table-light text-center">
                    <tr>
                      <th>체크</th>
                      <th className="text-start">강의명</th>
                      <th>이수구분</th>
                      <th>학년</th>
                      <th className="text-start">과이름</th>
                      <th>담당교수</th>
                      <th>학기</th>
                      <th>수업 요일</th>
                      <th>총원</th>
                      <th>현재원</th>
                      <th>학점</th>
                      <th>상세보기</th>
                      <th>상태</th>
                      <th>수정</th>
                      <th>기능</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedLec.map((lec) => (
                      <tr key={lec.id}>
                        <td className="text-center text-nowrap">
                          <Form.Check type="checkbox" value={lec.id} onChange={addRejectSelect} />
                        </td>
                        <td className="text-start">{lec.name}</td>
                        <td className="text-center">{typeMap2[lec.completionDiv]}</td>
                        <td className="text-center">{lec.level}</td>
                        <td className="text-start">{lec.majorName}</td>
                        <td className="text-center">{lec.userName}</td>
                        <td className="text-center">{splitStartDate(lec.startDate)}</td>
                        <td className="text-center">
                          {(lec.lectureSchedules ?? [])
                            .map((s) => typeMap3[s.day] ?? s.day)
                            .join(", ")}
                        </td>
                        <td className="text-center">{lec.totalStudent}</td>
                        <td className="text-center">{lec.nowStudent}</td>
                        <td className="text-center">{lec.credit}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-dark"
                            onClick={() => {
                              setModalId(lec.id);
                              setOpen(true);
                            }}
                          >
                            상세
                          </Button>
                        </td>
                        <td className="text-center">{typeMap[lec.status]}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => {
                              navigate(`/lecupdateAd/${lec.id}`);
                            }}
                          >
                            수정
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              restart(lec.id, "INPROGRESS");
                            }}
                          >
                            재개강
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-end gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={(e) => {
                      reInprogress(e, rejecSelected);
                    }}
                  >
                    일괄 재개강
                  </Button>
                </div>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* ▼▼▼ 탭별 독립 페이지 버튼 ▼▼▼ */}
      <Pagination className="justify-content-center mt-4">
        <Pagination.First
          onClick={() => setPaging(prev => ({ ...prev, [`pageNumber_${tabKey}`]: 0 }))}
          disabled={curPage === 0 || curTotalPages === 0}
          as="button"
        >
          맨처음
        </Pagination.First>

        <Pagination.Prev
          onClick={() => {
            const gotoPage = Math.max(0, curBegin - 1);
            setPaging(prev => ({ ...prev, [`pageNumber_${tabKey}`]: gotoPage }));
          }}
          disabled={curBegin === 0 || curTotalPages === 0}
          as="button"
        >
          이전
        </Pagination.Prev>

        {[...Array(Math.max(0, curEnd - curBegin + 1))].map((_, idx) => {
          const pageIndex = curBegin + idx; // 0-based
          return (
            <Pagination.Item
              key={pageIndex}
              active={curPage === pageIndex}
              onClick={() => setPaging(prev => ({ ...prev, [`pageNumber_${tabKey}`]: pageIndex }))}
            >
              {pageIndex + 1}
            </Pagination.Item>
          );
        })}

        <Pagination.Next
          onClick={() => {
            const gotoPage = Math.min(Math.max(0, curTotalPages - 1), curEnd + 1);
            setPaging(prev => ({ ...prev, [`pageNumber_${tabKey}`]: gotoPage }));
          }}
          disabled={curEnd >= (curTotalPages - 1) || curTotalPages === 0}
          as="button"
        >
          다음
        </Pagination.Next>

        <Pagination.Last
          onClick={() => setPaging(prev => ({ ...prev, [`pageNumber_${tabKey}`]: Math.max(0, curTotalPages - 1) }))}
          disabled={curPage >= (curTotalPages - 1) || curTotalPages === 0}
          as="button"
        >
          맨끝
        </Pagination.Last>
      </Pagination>
      {/* ▲▲▲ 페이지 버튼 끝 ▲▲▲ */}

      {/* ───────── 상세 모달 UI (변경 없음) ───────── */}
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

          <div className="mb-3">
            <div className="text-muted small mb-2">강의설명</div>
            <div className="border rounded p-3 bg-body-tertiary" style={{ whiteSpace: "pre-wrap" }}>
              {modalLec.description}
            </div>
          </div>

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
                    <td className="text-center">{modalLec?.weightsDto?.attendanceScore ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.assignmentScore ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.midtermExam ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.finalExam ?? "-"}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>

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
          <Button variant="secondary" onClick={() => setOpen(false)}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default App;
