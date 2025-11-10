import { useCallback, useEffect, useState } from "react";
import { Button, Table, Modal } from "react-bootstrap";
import { useAuth } from "../../../public/context/UserContext";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function App() {
  const [lectureList, setLectureList] = useState([]);
  const [myLectureList, setMyLectureList] = useState([]);
  const [submitLecList, setSubmitlecList] = useState([]);
  const { user } = useAuth();

  // ───────── 상세 모달 상태 ─────────
  const [open, setOpen] = useState(false);
  const [modalId, setModalId] = useState("");
  const [modalLec, setModalLec] = useState({});

  const fetchLectures = useCallback(() => {
    const url = `${API_BASE_URL}/lecture/apply/list`;
    axios
      .get(url, { params: { id: user.id } })
      .then((response) => {
        setLectureList(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        setLectureList([]);
        console.error("status:", error.response?.status);
        console.error("data:", error.response?.data);
      });
  }, [user?.id]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  useEffect(() => {
    const url = `${API_BASE_URL}/lecture/mylist/completed`;
    axios
      .get(url, { params: { userId: user.id } })
      .then((response) => {
        setMyLectureList(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        const err = error.response;
        if (!err) {
          alert("네트워크 오류가 발생하였습니다");
          return;
        }
      });
  }, [lectureList, user?.id]);

  useEffect(() => {
    if (!Array.isArray(myLectureList)) return;
    setSubmitlecList(myLectureList.filter((lec) => lec.lecStatus !== "APPROVED"));
  }, [myLectureList]);

  // ───────── 헬퍼들 ─────────
  const splitStartDate = (date) => {
    const [yyyy, mm] = date.split("-");
    const yaer = yyyy.slice(-2);
    const m = Number(mm);
    if (m >= 1 && m <= 2) return `${yaer}년도 겨울 계절학기`;
    if (m >= 3 && m <= 6) return `${yaer}년도 1학기`;
    if (m >= 7 && m <= 8) return `${yaer}년도 여름 계절학기`;
    return `${yaer}년도 2학기`;
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

  // ───────── 요일/교시 표기 ─────────
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

  // ───────── 모달 데이터 로딩 ─────────
  useEffect(() => {
    if (!modalId) return;
    const url = `${API_BASE_URL}/lecture/info`;
    axios
      .get(url, { params: { modalId: Number(modalId) } })
      .then((res) => setModalLec(res.data))
      .catch((err) => {
        console.error(err.response?.data || err.message);
        alert("오류");
      });
  }, [modalId]);

  // ───────── 파일 다운로드 ─────────
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

  return (
    <>
      <div className="table-responsive" style={{ overflowX: "hidden" }}>
        {/* ───────── ✅ 신청 확정 리스트만 표시 ───────── */}
        <Table bordered hover size="sm" className="align-middle shadow-sm rounded-3 mb-2">
          <colgroup>
            <col style={{ width: "16rem" }} />
            <col style={{ width: "12rem" }} />
            <col style={{ width: "10rem" }} />
            <col style={{ width: "6rem" }} />
            <col style={{ width: "10rem" }} />
            <col style={{ width: "10rem" }} />
            {/* ▼ 날짜 2칸 → '수업 요일' 1칸으로 통합 */}
            <col style={{ width: "12rem" }} /> {/* 수업 요일 */}
            <col style={{ width: "5rem" }} />
            <col style={{ width: "4rem" }} />
            <col style={{ width: "9rem" }} /> {/* 자료 */}
            <col style={{ width: "8rem" }} />
            <col style={{ width: "7.5rem" }} />
          </colgroup>

          <tbody>
            <tr className="table-secondary">
              <td colSpan={12} className="fw-bold py-2">
                수강신청 이력
              </td>
            </tr>
            <tr className="table-light">
              <th className="py-2">강의명</th>
              <th className="py-2">과이름</th>
              <th className="text-center text-nowrap py-2">이수 구분</th>
              <th className="text-center text-nowrap py-2">학년</th>
              <th className="text-nowrap py-2">담당교수</th>
              <th className="text-center text-nowrap py-2">학기</th>
              {/* ▼ 날짜 대신 수업 요일 */}
              <th className="text-center text-nowrap py-2">수업 요일</th>
              <th className="text-center text-nowrap py-2">총원</th>
              <th className="text-center text-nowrap py-2">학점</th>
              <th className="text-center text-nowrap py-2">자료</th>
              <th className="text-center text-nowrap py-2">상태</th>
              <th className="text-center text-nowrap py-2">상세</th>
            </tr>

            {submitLecList.map((lec) => (
              <tr key={lec.id}>
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
                {/* ▼ 날짜(개강/종강) → 요일 목록 */}
                <td className="text-center text-nowrap">
                  {(lec.lectureSchedules ?? []).map((s) => typeMapDay[s.day]).join(", ")}
                </td>
                <td className="text-center text-nowrap">{lec.totalStudent}</td>
                <td className="text-center text-nowrap">{lec.credit}</td>
                {/* ▼ 자료 버튼: 모달 오픈 */}
                <td className="text-center text-nowrap">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    className="fw-semibold px-3"
                    onClick={() => {
                      setModalId(lec.id);
                      setOpen(true);
                    }}
                  >
                    자료
                  </Button>
                </td>
                <td className="text-center text-nowrap">{typeMap3[lec.lecStatus]}</td>
                <td className="text-center text-nowrap">
                  <Button size="sm" variant="outline-dark" className="fw-semibold px-3">
                    상세
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* ───────── 상세 모달 (첨부/시간표/설명) ───────── */}
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
                    <td className="text-center">{modalLec?.weightsDto?.attendance ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.assignment ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.midtermExam ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.finalExam ?? "-"}</td>
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
