import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Form, Table, Modal, Tabs, Tab, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

const YEAR_START = 1990;
const MYLIST_FETCH_SIZE = 9999; // 내 수강신청 목록은 한 번에 많이 가져와서 프론트에서 페이징

function App() {
  const [lectureList, setLectureList] = useState([]);        // 신청 가능 목록 (원본)
  const [lectureListSt, setLectureListSt] = useState([]);    // 신청 가능 중 APPROVED 만

  const [myLectureList, setMyLectureList] = useState([]);    // 내 수강신청 목록 (장바구니/확정/이력 공용 원본)
  const [submitLecList, setSubmitlecList] = useState([]);    // 신청 확정
  const [approvedLecList, setApprovedLecList] = useState([]);// 장바구니
  const [historyLecList, setHistoryLecList] = useState([]);  // 수강신청 이력

  const [majorList, setMajorList] = useState([]);
  const [userList, setUserList] = useState([]);

  const navigate = useNavigate();
  const { user } = useAuth();

  // 선택 상태
  const [selected, setSelected] = useState([]);        // 신청 가능 탭 선택
  const [cancelSelected, setCancelSelected] = useState([]); // 장바구니 탭 선택
  const [backSelected, setBackSelected] = useState([]);     // 신청 확정 탭 선택

  // 탭 키
  const [tabKey, setTabKey] = useState("apply");

  // 탭별 페이징 상태
  const [paging, setPaging] = useState({
    pageSize: 5,  // 한 페이지에 보여줄 행 수
    pageCount: 10, // 페이징 버튼 한 묶음당 최대 개수

    // ─ 신청 가능 ─ (서버 페이징 사용)
    totalElements_apply: 0,
    totalPages_apply: 0,
    pageNumber_apply: 0,
    beginPage_apply: 0,
    endPage_apply: 0,

    // ─ 장바구니 ─ (프론트 페이징)
    totalElements_cart: 0,
    totalPages_cart: 0,
    pageNumber_cart: 0,
    beginPage_cart: 0,
    endPage_cart: 0,

    // ─ 신청 확정 ─ (프론트 페이징)
    totalElements_confirmed: 0,
    totalPages_confirmed: 0,
    pageNumber_confirmed: 0,
    beginPage_confirmed: 0,
    endPage_confirmed: 0,

    // ─ 수강신청 이력 ─ (프론트 페이징)
    totalElements_history: 0,
    totalPages_history: 0,
    pageNumber_history: 0,
    beginPage_history: 0,
    endPage_history: 0,

    // ─ 공통 검색조건 ─
    searchMajor: "",
    searchCompletionDiv: "",
    searchLevel: "",
    searchCredit: "",
    searchMode: "all",
    searchKeyword: "",
    searchYear: "",
    searchStartDate: "",
    searchUser: "",
    searchSchedule: "",
  });

  // ───────── 상세 모달 상태 ─────────
  const [open, setOpen] = useState(false);
  const [modalId, setModalId] = useState("");
  const [modalLec, setModalLec] = useState({});

  // 년도 셀렉트용
  const years = useMemo(() => {
    const end = new Date().getFullYear() + 1;
    return Array.from({ length: end - YEAR_START + 1 }, (_, i) => YEAR_START + i);
  }, []);
  const yearsDesc = years.slice().reverse();

  // 학과 목록 로딩
  useEffect(() => {
    const url = `${API_BASE_URL}/major/listForLecturePage`;
    axios
      .get(url)
      .then((res) => setMajorList(res.data))
      .catch((err) => console.error(err.response?.data || err));
  }, []);

  // ───────── 신청 가능 목록 (서버 페이징) ─────────
  const fetchLectures = useCallback(async () => {
    if (!user?.id) return;
    if (tabKey !== "apply") return;

    const url = `${API_BASE_URL}/lecture/apply/list`;

    const params = {
      id: user.id,
      pageNumber: paging.pageNumber_apply ?? 0,
      pageSize: paging.pageSize,
      searchCompletionDiv: paging.searchCompletionDiv || undefined,
      searchMajor: paging.searchMajor || undefined,
      searchCredit: paging.searchCredit || undefined,
      searchStartDate: paging.searchStartDate || undefined,
      searchMode: paging.searchMode || undefined,
      searchKeyword: (paging.searchKeyword || "").trim() || undefined,
      searchSchedule: paging.searchSchedule || undefined,
      searchYear: paging.searchYear || undefined,
      searchLevel: paging.searchLevel || undefined,
      searchUser: paging.searchUser || undefined,
    };

    try {
      const response = await axios.get(url, { params });
      const { content, totalElements, totalPages, pageable } = response.data;

      setLectureList(content || []);

      setPaging((prev) => {
        const pageNumber = pageable.pageNumber;
        const pageSize = pageable.pageSize;

        const beginPage = Math.floor(pageNumber / prev.pageCount) * prev.pageCount;
        const endPage = Math.min(beginPage + prev.pageCount - 1, totalPages - 1);

        return {
          ...prev,
          pageSize,
          totalElements_apply: totalElements,
          totalPages_apply: totalPages,
          pageNumber_apply: pageNumber,
          beginPage_apply: beginPage,
          endPage_apply: endPage,
        };
      });
    } catch (error) {
      console.error(error?.response?.data || error);
      setLectureList([]);
    }
  }, [
    tabKey,
    user?.id,
    paging.pageNumber_apply,
    paging.pageSize,
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
  ]);

  // ───────── 내 수강신청 목록 (장바구니/확정/이력) : 서버에서 한 번에 크게 가져옴 ─────────
  const fetchMyLectureList = useCallback(async () => {
    if (!user?.id) return;
    if (tabKey === "apply") return; // apply 탭일 땐 호출 안 함

    const url = `${API_BASE_URL}/lecture/mylist`;

    const params = {
      userId: user.id,
      pageNumber: 0,
      pageSize: MYLIST_FETCH_SIZE, // 전체를 가져와서 클라이언트에서 페이징
      searchCompletionDiv: paging.searchCompletionDiv || undefined,
      searchMajor: paging.searchMajor || undefined,
      searchCredit: paging.searchCredit || undefined,
      searchStartDate: paging.searchStartDate || undefined,
      searchMode: paging.searchMode || undefined,
      searchKeyword: (paging.searchKeyword || "").trim() || undefined,
      searchSchedule: paging.searchSchedule || undefined,
      searchYear: paging.searchYear || undefined,
      searchLevel: paging.searchLevel || undefined,
      searchUser: paging.searchUser || undefined,
    };

    try {
      const response = await axios.get(url, { params });
      const { content } = response.data;

      // 전체 myLectureList (모든 status 포함)
      setMyLectureList(content || []);
    } catch (error) {
      console.error(error?.response?.data || error);
      setMyLectureList([]);
    }
  }, [
    tabKey,
    user?.id,
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
  ]);

  // 탭/검색 변경 시 데이터 호출
  useEffect(() => {
    if (tabKey === "apply") {
      fetchLectures();
    } else {
      fetchMyLectureList();
    }
  }, [tabKey, fetchLectures, fetchMyLectureList]);

  // 신청 가능 중 APPROVED 강의만
  useEffect(() => {
    if (!Array.isArray(lectureList)) return;
    setLectureListSt(lectureList.filter((lec) => lec.status === "APPROVED"));
  }, [lectureList]);

  // 탭별 페이징 값 계산용 헬퍼 (장바구니/확정/이력 전용)
  const updatePagingForGroup = useCallback((group, totalElements) => {
    setPaging((prev) => {
      const pageSize = prev.pageSize || 10;
      const totalPages =
        totalElements === 0 ? 0 : Math.ceil(totalElements / pageSize);

      const pageNumberKey = `pageNumber_${group}`;
      let curPage = prev[pageNumberKey] ?? 0;
      if (curPage > Math.max(0, totalPages - 1)) {
        curPage = Math.max(0, totalPages - 1);
      }

      const beginPage =
        totalPages === 0 ? 0 : Math.floor(curPage / prev.pageCount) * prev.pageCount;
      const endPage =
        totalPages === 0
          ? -1
          : Math.min(beginPage + prev.pageCount - 1, totalPages - 1);

      return {
        ...prev,
        [`totalElements_${group}`]: totalElements,
        [`totalPages_${group}`]: totalPages,
        [`pageNumber_${group}`]: curPage,
        [`beginPage_${group}`]: beginPage,
        [`endPage_${group}`]: endPage,
      };
    });
  }, []);

  // myLectureList → 장바구니/확정/이력 분리 + 각 탭별 페이징 정보 계산
  useEffect(() => {
    if (!Array.isArray(myLectureList)) return;

    const cartList = myLectureList.filter((lec) => lec.status === "PENDING");
    const confirmedList = myLectureList.filter(
      (lec) => lec.status === "SUBMITTED" && lec.lecStatus === "APPROVED"
    );
    const historyList = myLectureList.filter((lec) =>
      ["INPROGRESS", "COMPLETED"].includes(lec.lecStatus)
    );

    setApprovedLecList(cartList);
    setSubmitlecList(confirmedList);
    setHistoryLecList(historyList);

    updatePagingForGroup("cart", cartList.length);
    updatePagingForGroup("confirmed", confirmedList.length);
    updatePagingForGroup("history", historyList.length);
  }, [myLectureList, updatePagingForGroup]);

  // 학과 변경 시 해당 학과 교수 목록
  useEffect(() => {
    const m = (majorList ?? []).find(
      (v) => String(v.id) === String(paging.searchMajor)
    );
    setUserList(m?.userList ?? []);
    setPaging((prev) =>
      prev.searchUser !== "" ? { ...prev, searchUser: "" } : prev
    );
  }, [paging.searchMajor, majorList]);

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

  const typeMap = {
    PENDING: "처리중",
    APPROVED: "신청 가능",
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
    APPROVED: "개강 대기",
    REJECTED: "거부",
    INPROGRESS: "개강",
    COMPLETED: "종강",
    SUBMITTED: "신청 완료",
  };

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

  // 선택 핸들러들
  const addSelect = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    setSelected((prev) =>
      checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value)
    );
  };

  const cancelSelect = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    setCancelSelected((prev) =>
      checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value)
    );
  };

  const backSelect = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    setBackSelected((prev) =>
      checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value)
    );
  };

  // 수강신청(여러 개)
  const apply = async () => {
    const url = `${API_BASE_URL}/lecture/apply`;
    try {
      const response = await axios.post(url, selected, { params: { id: user.id } });
      if (response.data.success) {
        alert("등록 성공");
      } else {
        alert("등록 성공");
      }
      setSelected([]);
      setBackSelected([]);
      setCancelSelected([]);
      fetchLectures();
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

  // 수강신청(단일)
  const applyOne = async (lecId) => {
    const url = `${API_BASE_URL}/lecture/applyOne`;
    try {
      const response = await axios.post(
        url,
        Number(lecId),
        { params: { id: user.id }, headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        alert("등록 성공");
      } else {
        alert("등록 성공");
      }
      setSelected([]);
      setBackSelected([]);
      setCancelSelected([]);
      fetchLectures();
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

  // status 일괄 변경 (장바구니/확정 탭에서 공용)
  const statusAll = async (selectedArr, status) => {
    const url = `${API_BASE_URL}/courseReg/statusAll`;
    const id = user.id;
    try {
      const response = await axios.patch(
        url,
        null,
        { params: { id, status, selected: selectedArr }, headers: { "Content-Type": "application/json" } }
      );
      if (response.data.success) {
        alert("등록 성공");
      } else {
        alert("등록 성공");
      }
      setSelected([]);
      setBackSelected([]);
      setCancelSelected([]);
      fetchMyLectureList();
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

  // 단건 status 변경
  const stautsRequest = async (lecId, status) => {
    const url = `${API_BASE_URL}/courseReg/applyStatus`;
    const id = user.id;
    try {
      const response = await axios.put(url, null, { params: { status, lecId, id } });
      if (response.status === 200) {
        alert("처리 완료");
        fetchMyLectureList();
        setSelected([]);
        setBackSelected([]);
        setCancelSelected([]);
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

  const deleteCoursReg = async (lecId) => {
    const url = `${API_BASE_URL}/courseReg/delete`;
    const id = user.id;
    try {
      const response = await axios.patch(url, null, { params: { lecId, id } });
      if (response.status === 200) {
        alert("처리 완료");
        fetchMyLectureList();
        setSelected([]);
        setBackSelected([]);
        setCancelSelected([]);
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

  const deleteCoursRegAll = async () => {
    const url = `${API_BASE_URL}/courseReg/delete/all`;
    const id = user.id;
    try {
      const response = await axios.patch(url, null, { params: { cancelSelected, id } });
      if (response.status === 200) {
        alert("처리 완료");
        fetchMyLectureList();
        setSelected([]);
        setBackSelected([]);
        setCancelSelected([]);
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

  // ───────── 모달 데이터 로딩 ─────────
  useEffect(() => {
    if (!modalId) return;
    const url = `${API_BASE_URL}/lecture/info`;
    axios
      .get(url, { params: { modalId: Number(modalId) } })
      .then((res) => {
        setModalLec(res.data);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        alert("오류");
      });
  }, [modalId]);

  const downloadClick = (id) => {
    const url = `${API_BASE_URL}/attachment/download/${id}`;
    axios
      .get(url, { responseType: "blob" })
      .then((response) => {
        const cd = response.headers["content-disposition"] || "";
        const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cd)?.[1];
        const quoted = /filename="([^"]+)"/i.exec(cd)?.[1];
        const filename = (utf8 && decodeURIComponent(utf8)) || quoted || `file-${id}`;

        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        alert("오류");
      });
  };

  // ★ 현재 탭 기준 페이징 키
  const currentPagingKey =
    tabKey === "apply"
      ? "apply"
      : tabKey === "cart"
      ? "cart"
      : tabKey === "confirmed"
      ? "confirmed"
      : "history";

  const curBegin = paging[`beginPage_${currentPagingKey}`] ?? 0;
  const curEnd = paging[`endPage_${currentPagingKey}`] ?? -1;
  const curPage = paging[`pageNumber_${currentPagingKey}`] ?? 0;
  const curTotalPages = paging[`totalPages_${currentPagingKey}`] ?? 0;
  const pageSize = paging.pageSize || 10;

  // ───────── 탭별 현재 페이지에 보여줄 데이터 슬라이스 (장바구니/확정/이력) ─────────
  const cartPageData = useMemo(() => {
    const start = (paging.pageNumber_cart ?? 0) * pageSize;
    const end = start + pageSize;
    return approvedLecList.slice(start, end);
  }, [approvedLecList, paging.pageNumber_cart, pageSize]);

  const confirmedPageData = useMemo(() => {
    const start = (paging.pageNumber_confirmed ?? 0) * pageSize;
    const end = start + pageSize;
    return submitLecList.slice(start, end);
  }, [submitLecList, paging.pageNumber_confirmed, pageSize]);

  const historyPageData = useMemo(() => {
    const start = (paging.pageNumber_history ?? 0) * pageSize;
    const end = start + pageSize;
    return historyLecList.slice(start, end);
  }, [historyLecList, paging.pageNumber_history, pageSize]);

  return (
    <>
      {/* ───────── 상단 필터 영역 ───────── */}
      <div className="d-flex align-items-center flex-nowrap gap-2 mb-3">
        <h4 className="mb-0 me-3 flex-shrink-0">강의 목록</h4>

        {/* 년도 */}
        <Form.Select
          id="filterYear"
          size="sm"
          className="w-auto"
          value={paging.searchYear}
          onChange={(e) => {
            const value = e.target.value;
            setPaging((pre) => ({
              ...pre,
              searchYear: value,
              pageNumber_apply: 0,
              pageNumber_cart: 0,
              pageNumber_confirmed: 0,
              pageNumber_history: 0,
            }));
          }}
        >
          <option value="">년도</option>
          {yearsDesc.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Form.Select>

        {/* 학기 */}
        <Form.Select
          id="filterSemester"
          aria-label="학기"
          size="sm"
          className="w-auto flex-shrink-0"
          style={{ minWidth: 120 }}
          value={paging.searchStartDate}
          onChange={(e) => {
            const value = e.target.value;
            setPaging((pre) => ({
              ...pre,
              searchStartDate: value,
              pageNumber_apply: 0,
              pageNumber_cart: 0,
              pageNumber_confirmed: 0,
              pageNumber_history: 0,
            }));
          }}
        >
          <option value="">학기</option>
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
          onChange={(e) => {
            const value = e.target.value;
            setPaging((pre) => ({
              ...pre,
              searchCompletionDiv: value,
              pageNumber_apply: 0,
              pageNumber_cart: 0,
              pageNumber_confirmed: 0,
              pageNumber_history: 0,
            }));
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
          onChange={(e) => {
            const value = e.target.value;
            setPaging((pre) => ({
              ...pre,
              searchLevel: value,
              pageNumber_apply: 0,
              pageNumber_cart: 0,
              pageNumber_confirmed: 0,
              pageNumber_history: 0,
            }));
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
          onChange={(e) => {
            const value = e.target.value;
            setPaging((pre) => ({
              ...pre,
              searchMajor: value,
              pageNumber_apply: 0,
              pageNumber_cart: 0,
              pageNumber_confirmed: 0,
              pageNumber_history: 0,
            }));
          }}
        >
          <option value="">소속학과</option>
          {majorList.map((major) => (
            <option key={major.id} value={major.id}>
              {major.name}
            </option>
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
          onChange={(e) => {
            const value = e.target.value;
            setPaging((pre) => ({
              ...pre,
              searchUser: value,
              pageNumber_apply: 0,
              pageNumber_cart: 0,
              pageNumber_confirmed: 0,
              pageNumber_history: 0,
            }));
          }}
        >
          <option value="">담당교수</option>
          {userList.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Form.Select>

        {/* 수업 요일 */}
        <Form.Select
          id="filterDay"
          aria-label="수업 요일"
          size="sm"
          className="w-auto flex-shrink-0"
          style={{ minWidth: 140 }}
          value={paging.searchSchedule}
          onChange={(e) => {
            const value = e.target.value;
            setPaging((pre) => ({
              ...pre,
              searchSchedule: value,
              pageNumber_apply: 0,
              pageNumber_cart: 0,
              pageNumber_confirmed: 0,
              pageNumber_history: 0,
            }));
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
          onChange={(e) => {
            const value = e.target.value;
            setPaging((pre) => ({
              ...pre,
              searchCredit: value,
              pageNumber_apply: 0,
              pageNumber_cart: 0,
              pageNumber_confirmed: 0,
              pageNumber_history: 0,
            }));
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

      {/* ───────── 검색 모드/검색어 + 탭 ───────── */}
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
              setPaging((prev) => ({
                ...prev,
                searchMode: value,
                pageNumber_apply: 0,
                pageNumber_cart: 0,
                pageNumber_confirmed: 0,
                pageNumber_history: 0,
              }));
            }}
          >
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
              setPaging((prev) => ({
                ...prev,
                searchKeyword: value,
                pageNumber_apply: 0,
                pageNumber_cart: 0,
                pageNumber_confirmed: 0,
                pageNumber_history: 0,
              }));
            }}
          />
        </div>

        <Tabs
          activeKey={tabKey}
          onSelect={(k) => setTabKey(k || "apply")}
          className="mb-3"
          mountOnEnter
          unmountOnExit={false}
          style={{
            "--bs-nav-link-color": "#6c757d",
            "--bs-nav-link-hover-color": "#495057",
            "--bs-nav-tabs-link-active-color": "#212529",
            "--bs-nav-tabs-link-active-bg": "#f1f3f5",
            "--bs-nav-tabs-link-active-border-color": "#dee2e6",
            "--bs-nav-tabs-border-color": "#dee2e6",
          }}
        >
          {/* ───────── 수강신청 가능 탭 ───────── */}
          <Tab eventKey="apply" title="수강신청 가능">
            <div className="mb-4">
              <div className="fw-bold mb-2">수강신청 가능 목록</div>

              <Table
                bordered
                hover
                size="sm"
                className="align-middle table-sm small shadow-sm rounded-3 mb-0"
                style={{ fontSize: "0.875rem" }}
              >
                <colgroup>
                  <col style={{ width: "3rem" }} />
                  <col style={{ width: "16rem" }} />
                  <col style={{ width: "12rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "3rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "13rem" }} />
                  <col style={{ width: "9rem" }} />
                  <col style={{ width: "5rem" }} />
                  <col style={{ width: "5rem" }} />
                  <col style={{ width: "4rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "6rem" }} />
                </colgroup>

                <thead className="table-light text-center">
                  <tr>
                    <th>체크</th>
                    <th className="text-start">강의명</th>
                    <th className="text-start">과이름</th>
                    <th>이수구분</th>
                    <th>학년</th>
                    <th>담당교수</th>
                    <th>학기</th>
                    <th>수업 요일</th>
                    <th>총원</th>
                    <th>현재원</th>
                    <th>학점</th>
                    <th>자료</th>
                    <th>상태</th>
                    <th>신청</th>
                  </tr>
                </thead>

                <tbody>
                  {lectureListSt.map((lec) => (
                    <tr key={lec.id}>
                      <td className="text-center">
                        <Form.Check
                          type="checkbox"
                          value={lec.id}
                          onChange={addSelect}
                        />
                      </td>
                      <td className="text-start">
                        <span className="d-inline-block text-truncate w-100">
                          {lec.name}
                        </span>
                      </td>
                      <td className="text-start">
                        <span className="d-inline-block text-truncate w-100">
                          {lec.majorName}
                        </span>
                      </td>
                      <td className="text-center">
                        {typeMap2[lec.completionDiv]}
                      </td>
                      <td className="text-center">{lec.level}</td>
                      <td className="text-center">{lec.userName}</td>
                      <td className="text-center">
                        {splitStartDate(lec.startDate)}
                      </td>
                      <td className="text-center">
                        {(lec.lectureSchedules ?? [])
                          .map((s) => typeMapDay[s.day])
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
                      <td className="text-center text-nowrap">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="px-3"
                          onClick={() => applyOne(Number(lec.id))}
                        >
                          수강 신청
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
                  className="px-3"
                  onClick={apply}
                  disabled={selected.length === 0}
                >
                  일괄 신청
                </Button>
              </div>
            </div>
          </Tab>

          {/* ───────── 장바구니 탭 ───────── */}
          <Tab eventKey="cart" title="장바구니">
            <div className="mb-4">
              <div className="fw-bold mb-2">장바구니</div>

              <Table
                bordered
                hover
                size="sm"
                className="align-middle table-sm small shadow-sm rounded-3 mb-0"
                style={{ fontSize: "0.875rem" }}
              >
                <colgroup>
                  <col style={{ width: "3rem" }} />
                  <col style={{ width: "16rem" }} />
                  <col style={{ width: "12rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "3rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "13rem" }} />
                  <col style={{ width: "9rem" }} />
                  <col style={{ width: "5rem" }} />
                  <col style={{ width: "5rem" }} />
                  <col style={{ width: "4rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "8rem" }} />
                </colgroup>

                <thead className="table-light text-center">
                  <tr>
                    <th>체크</th>
                    <th className="text-start">강의명</th>
                    <th className="text-start">과이름</th>
                    <th>이수구분</th>
                    <th>학년</th>
                    <th>담당교수</th>
                    <th>학기</th>
                    <th>수업 요일</th>
                    <th>총원</th>
                    <th>현재원</th>
                    <th>학점</th>
                    <th>자료</th>
                    <th>상태</th>
                    <th>기능</th>
                  </tr>
                </thead>

                <tbody>
                  {cartPageData.map((lec) => (
                    <tr key={lec.id}>
                      <td className="text-center">
                        <Form.Check
                          type="checkbox"
                          value={lec.id}
                          onChange={cancelSelect}
                        />
                      </td>
                      <td className="text-start">
                        <span className="d-inline-block text-truncate w-100">
                          {lec.name}
                        </span>
                      </td>
                      <td className="text-start">
                        <span className="d-inline-block text-truncate w-100">
                          {lec.majorName}
                        </span>
                      </td>
                      <td className="text-center">
                        {typeMap2[lec.completionDiv]}
                      </td>
                      <td className="text-center">{lec.level}</td>
                      <td className="text-center">{lec.userName}</td>
                      <td className="text-center">
                        {splitStartDate(lec.startDate)}
                      </td>
                      <td className="text-center">
                        {(lec.lectureSchedules ?? [])
                          .map((s) => typeMapDay[s.day])
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
                      <td className="text-center">
                        {typeMap3[lec.lecStatus]}
                      </td>
                      <td className="text-center text-nowrap">
                        <div className="d-inline-flex gap-1 flex-nowrap">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            className="px-2"
                            onClick={() => {
                              const status = "SUBMITTED";
                              stautsRequest(lec.id, status);
                            }}
                          >
                            확정
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            className="px-2"
                            onClick={() => deleteCoursReg(lec.id)}
                          >
                            취소
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-end gap-2 mt-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="px-3"
                  onClick={() => {
                    const status = "SUBMITTED";
                    statusAll(cancelSelected, status);
                  }}
                  disabled={cancelSelected.length === 0}
                >
                  일괄 확정
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  className="px-3"
                  onClick={deleteCoursRegAll}
                  disabled={cancelSelected.length === 0}
                >
                  일괄 취소
                </Button>
              </div>
            </div>
          </Tab>

          {/* ───────── 신청 확정 탭 ───────── */}
          <Tab eventKey="confirmed" title="신청 확정">
            <div className="mb-4">
              <div className="fw-bold mb-2">신청 확정</div>

              <Table
                bordered
                hover
                size="sm"
                className="align-middle table-sm small shadow-sm rounded-3 mb-0"
                style={{ fontSize: "0.875rem" }}
              >
                <colgroup>
                  <col style={{ width: "3rem" }} />
                  <col style={{ width: "16rem" }} />
                  <col style={{ width: "12rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "3rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "13rem" }} />
                  <col style={{ width: "9rem" }} />
                  <col style={{ width: "5rem" }} />
                  <col style={{ width: "5rem" }} />
                  <col style={{ width: "4rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "6rem" }} />
                </colgroup>

                <thead className="table-light text-center">
                  <tr>
                    <th>체크</th>
                    <th className="text-start">강의명</th>
                    <th className="text-start">과이름</th>
                    <th>이수구분</th>
                    <th>학년</th>
                    <th>담당교수</th>
                    <th>학기</th>
                    <th>수업 요일</th>
                    <th>총원</th>
                    <th>현재원</th>
                    <th>학점</th>
                    <th>자료</th>
                    <th>상태</th>
                    <th>상세</th>
                  </tr>
                </thead>

                <tbody>
                  {confirmedPageData.map((lec) => (
                    <tr key={lec.id}>
                      <td className="text-center">
                        <Form.Check
                          type="checkbox"
                          value={lec.id}
                          onChange={backSelect}
                        />
                      </td>
                      <td className="text-start">
                        <span className="d-inline-block text-truncate w-100">
                          {lec.name}
                        </span>
                      </td>
                      <td className="text-start">
                        <span className="d-inline-block text-truncate w-100">
                          {lec.majorName}
                        </span>
                      </td>
                      <td className="text-center">
                        {typeMap2[lec.completionDiv]}
                      </td>
                      <td className="text-center">{lec.level}</td>
                      <td className="text-center">{lec.userName}</td>
                      <td className="text-center">
                        {splitStartDate(lec.startDate)}
                      </td>
                      <td className="text-center">
                        {(lec.lectureSchedules ?? [])
                          .map((s) => typeMapDay[s.day])
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
                      <td className="text-center">
                        {typeMap3[lec.status]}
                      </td>
                      <td className="text-center text-nowrap">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="px-3"
                          onClick={() => {
                            stautsRequest(lec.id, "PENDING");
                          }}
                        >
                          확정 취소
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-end mt-2">
                <Button
                  size="sm"
                  variant="danger"
                  className="px-3"
                  onClick={() => {
                    const status = "PENDING";
                    statusAll(backSelected, status);
                  }}
                  disabled={backSelected.length === 0}
                >
                  일괄 취소
                </Button>
              </div>
            </div>
          </Tab>

          {/* ───────── 수강신청 이력 탭 ───────── */}
          <Tab eventKey="history" title="수강신청 이력">
            <div className="mb-4">
              <div className="fw-bold mb-2">수강신청 이력</div>

              <Table
                bordered
                hover
                size="sm"
                className="align-middle table-sm small shadow-sm rounded-3 mb-0"
                style={{ fontSize: "0.875rem" }}
              >
                <colgroup>
                  <col style={{ width: "16rem" }} />
                  <col style={{ width: "12rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "3rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "13rem" }} />
                  <col style={{ width: "9rem" }} />
                  <col style={{ width: "5rem" }} />
                  <col style={{ width: "5rem" }} />
                  <col style={{ width: "4rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "7rem" }} />
                  <col style={{ width: "6rem" }} />
                </colgroup>

                <thead className="table-light text-center">
                  <tr>
                    <th className="text-start">강의명</th>
                    <th className="text-start">과이름</th>
                    <th>이수구분</th>
                    <th>학년</th>
                    <th>담당교수</th>
                    <th>학기</th>
                    <th>수업 요일</th>
                    <th>총원</th>
                    <th>현재원</th>
                    <th>학점</th>
                    <th>자료</th>
                    <th>상태</th>
                    <th>상세</th>
                  </tr>
                </thead>

                <tbody>
                  {historyPageData.map((lec) => (
                    <tr key={lec.id}>
                      <td className="text-start">
                        <span className="d-inline-block text-truncate w-100">
                          {lec.name}
                        </span>
                      </td>
                      <td className="text-start">
                        <span className="d-inline-block text-truncate w-100">
                          {lec.majorName}
                        </span>
                      </td>
                      <td className="text-center">
                        {typeMap2[lec.completionDiv]}
                      </td>
                      <td className="text-center">{lec.level}</td>
                      <td className="text-center">{lec.userName}</td>
                      <td className="text-center">
                        {splitStartDate(lec.startDate)}
                      </td>
                      <td className="text-center">
                        {(lec.lectureSchedules ?? [])
                          .map((s) => typeMapDay[s.day])
                          .join(", ")}
                      </td>
                      <td className="text-center">{lec.totalStudent}</td>
                      <td className="text-center">{lec.nowStudent}</td>
                      <td className="text-center">{lec.credit}</td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="px-3"
                          onClick={() => {
                            setModalId(lec.id);
                            setOpen(true);
                          }}
                        >
                          자료
                        </Button>
                      </td>
                      <td className="text-center">
                        {typeMap3[lec.lecStatus]}
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-dark"
                          className="px-3"
                          onClick={() => {
                            setModalId(lec.id);
                            setOpen(true);
                          }}
                        >
                          상세
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* ───────── 공통 Pagination (탭별 페이징 상태 사용) ───────── */}
      <Pagination className="justify-content-center mt-4">
        <Pagination.First
          onClick={() =>
            setPaging((prev) => ({
              ...prev,
              [`pageNumber_${currentPagingKey}`]: 0,
            }))
          }
          disabled={curPage === 0 || curTotalPages === 0}
          as="button"
        >
          맨처음
        </Pagination.First>

        <Pagination.Prev
          onClick={() => {
            const gotoPage = Math.max(0, curBegin - 1);
            setPaging((prev) => ({
              ...prev,
              [`pageNumber_${currentPagingKey}`]: gotoPage,
            }));
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
              onClick={() =>
                setPaging((prev) => ({
                  ...prev,
                  [`pageNumber_${currentPagingKey}`]: pageIndex,
                }))
              }
            >
              {pageIndex + 1}
            </Pagination.Item>
          );
        })}

        <Pagination.Next
          onClick={() => {
            const gotoPage = Math.min(
              Math.max(0, curTotalPages - 1),
              curEnd + 1
            );
            setPaging((prev) => ({
              ...prev,
              [`pageNumber_${currentPagingKey}`]: gotoPage,
            }));
          }}
          disabled={curEnd >= curTotalPages - 1 || curTotalPages === 0}
          as="button"
        >
          다음
        </Pagination.Next>

        <Pagination.Last
          onClick={() =>
            setPaging((prev) => ({
              ...prev,
              [`pageNumber_${currentPagingKey}`]: Math.max(0, curTotalPages - 1),
            }))
          }
          disabled={curPage >= curTotalPages - 1 || curTotalPages === 0}
          as="button"
        >
          맨끝
        </Pagination.Last>
      </Pagination>

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
              <Table
                size="sm"
                bordered
                hover
                className="align-middle mb-0"
                style={{ fontSize: "0.9rem" }}
              >
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "6rem" }} className="text-center">
                      요일
                    </th>
                    <th style={{ width: "7rem" }} className="text-center">
                      시작
                    </th>
                    <th style={{ width: "7rem" }} className="text-center">
                      종료
                    </th>
                    <th>시간</th>
                  </tr>
                </thead>
                <tbody>
                  {(modalLec?.lectureSchedules ?? []).map((s, idx) => (
                    <tr key={idx}>
                      <td className="text-center">
                        {typeMapDay[s.day] ?? s.day}
                      </td>
                      <td className="text-center">
                        {typeMapStart[s.startTime] ?? s.startTime}
                      </td>
                      <td className="text-center">
                        {typeMapEnd[s.endTime] ?? s.endTime}
                      </td>
                      <td className="text-nowrap">
                        {s.startTime}~{s.endTime}
                      </td>
                    </tr>
                  ))}
                  {(modalLec?.lectureSchedules ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">
                        시간표 없음
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          {/* 강의설명 */}
          <div className="mb-3">
            <div className="text-muted small mb-2">강의설명</div>
            <div
              className="border rounded p-3 bg-body-tertiary"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {modalLec.description}
            </div>
          </div>

          {/* 점수 산출 비율 */}
          <div className="mb-3">
            <div className="text-muted small mb-2">점수 산출 비율</div>
            <div className="table-responsive">
              <Table
                size="sm"
                bordered
                hover
                className="align-middle mb-0"
                style={{ fontSize: "0.9rem" }}
              >
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: "6rem" }}>
                      출석
                    </th>
                    <th className="text-center" style={{ width: "6rem" }}>
                      과제
                    </th>
                    <th className="text-center" style={{ width: "6rem" }}>
                      중간
                    </th>
                    <th className="text-center" style={{ width: "6rem" }}>
                      기말
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-center">
                      {modalLec?.weightsDto?.attendanceScore ?? "-"}
                    </td>
                    <td className="text-center">
                      {modalLec?.weightsDto?.assignmentScore ?? "-"}
                    </td>
                    <td className="text-center">
                      {modalLec?.weightsDto?.midtermExam ?? "-"}
                    </td>
                    <td className="text-center">
                      {modalLec?.weightsDto?.finalExam ?? "-"}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>

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
                          <span className="text-truncate me-2 flex-grow-1">
                            {lecFile.name}
                          </span>
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
