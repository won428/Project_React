import { useCallback, useEffect, useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [lectureList, setLectureList] = useState();
  const [approvedLec, setApprovedLec] = useState([]);
  const [rejectedLec, setRejectedLec] = useState([]);
  const [pendingLec, setPendingLec] = useState([]);
  const [inproSelected, setInproSelected] = useState([]);   // 승인목록 → 개강용 선택
  const [approveSelected, setApproveSelected] = useState([]); // 승인대기 → 일괄승인용
  const [rejectedSelected, setRejectedSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [modalId, setModalId] = useState('');
  const [modalLec, setModalLec] = useState({});

  useEffect(() => {
    if (!modalId) return;
    const url = `${API_BASE_URL}/lecture/info`;
    axios
      .get(url, { params: { modalId: Number(modalId) } })
      .then((res) => setModalLec(res.data))
      .catch((err) => {
        console.error(err.response.data);
        alert('오류');
      });
  }, [modalId]);

  const fetchLectures = useCallback(async () => {
    const url = `${API_BASE_URL}/lecture/list`;
    axios
      .get(url)
      .then((response) => {
        setLectureList(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        setLectureList([]);
        console.error("status:", error.response?.status);
        console.error("data:", error.response?.data);
      });
  }, []);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  useEffect(() => {
    if (!Array.isArray(lectureList)) return;

    setApprovedLec(lectureList.filter((lec) => lec.status === "APPROVED"));
    setRejectedLec(lectureList.filter((lec) => lec.status === "REJECTED"));
    setPendingLec(lectureList.filter((lec) => lec.status === "PENDING"));
  }, [lectureList]);

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

  const typeMap4 = { // 시작교시
    '9:00': "1교시",
    '10:00': "2교시",
    '11:00': "3교시",
    '12:00': "4교시",
    '13:00': "5교시",
    '14:00': "6교시",
    '15:00': "7교시",
    '16:00': "8교시",
    '17:00': "9교시"
  };

  const typeMap5 = { // 종료교시
    '10:00': "1교시",
    '11:00': "2교시",
    '12:00': "3교시",
    '13:00': "4교시",
    '14:00': "5교시",
    '15:00': "6교시",
    '16:00': "7교시",
    '17:00': "8교시",
    '18:00': "9교시"
  };

  const splitStartDate = (date) => {
    const [yyyy, mm] = date.split("-");
    const yaer = yyyy.slice(-2);
    let splitMonth = Number(mm);
    let splitDate = "";
    if (splitMonth >= 1 && splitMonth <= 2) {
      splitDate = `${yaer}년도 겨울 계절학기`;
    } else if (splitMonth >= 3 && splitMonth <= 6) {
      splitDate = `${yaer}년도 1학기`;
    } else if (splitMonth >= 7 && splitMonth <= 8) {
      splitDate = `${yaer}년도 여름 계절학기`;
    } else if (splitMonth >= 9 && splitMonth <= 12) {
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
        navigate('/inprolecList');
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
        console.error(err.response.data);
        alert('오류');
      })
  }

  return (
    <>
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
              <col style={{ width: "3rem" }} />   {/* 체크박스 */}
              <col style={{ width: "16rem" }} />  {/* 강의명 */}
              <col style={{ width: "7rem" }} />   {/* 이수구분 */}
              <col style={{ width: "3rem" }} />   {/* 학년 */}
              <col style={{ width: "12rem" }} />  {/* 과이름 */}
              <col style={{ width: "7rem" }} />   {/* 담당교수 */}
              <col style={{ width: "13rem" }} />  {/* 학기 */}
              <col style={{ width: "9rem" }} />   {/* 수업 요일 */}
              <col style={{ width: "5rem" }} />   {/* 총원 */}
              <col style={{ width: "5rem" }} />   {/* 현재원 */}
              <col style={{ width: "4rem" }} />   {/* 학점 */}
              <col style={{ width: "7rem" }} />   {/* 상세보기 */}
              <col style={{ width: "5rem" }} />   {/* 상태 */}
              <col style={{ width: "6rem" }} />   {/* 수정 */}
              <col style={{ width: "6rem" }} />   {/* 기능(개강) */}
              <col style={{ width: "6rem" }} />   {/* 기능(폐강) */}
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
                  <td className="text-center">{lec.lectureSchedules.map(s => typeMap3[s.day])}</td> {/* 수업 요일 */}
                  <td className="text-center">{lec.totalStudent}</td>
                  <td className="text-center">{lec.nowStudent}</td>
                  <td className="text-center">{lec.credit}</td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      variant="outline-dark"
                      onClick={() => {
                        setModalId(lec.id)
                        setOpen(true)
                      }}
                    >
                      상세
                    </Button>
                  </td> {/* 상세보기 */}
                  <td className="text-center">{typeMap[lec.status]}</td>
                  <td className="text-center">
                    <Button size="sm" variant="outline-secondary" onClick={()=>{
                      navigate(`/lecupdateAd/${lec.id}`)
                    }}>
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
            <Button size="sm" variant="primary" onClick={(e) => {
              lectureApproved(e, approveSelected)
            }}>일괄승인</Button>
            <Button size="sm" variant="danger"
              onClick={(e) => {
                lectureRejected(e, approveSelected);
              }}
            >일괄거부</Button>
          </div>
        </div>
      </div>

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
              <col style={{ width: "3rem" }} />   {/* 체크박스 */}
              <col style={{ width: "16rem" }} />  {/* 강의명 */}
              <col style={{ width: "7rem" }} />   {/* 이수구분 */}
              <col style={{ width: "3rem" }} />   {/* 학년 */}
              <col style={{ width: "12rem" }} />  {/* 과이름 */}
              <col style={{ width: "7rem" }} />   {/* 담당교수 */}
              <col style={{ width: "13rem" }} />  {/* 학기 */}
              <col style={{ width: "9rem" }} />   {/* 수업 요일 */}
              <col style={{ width: "5rem" }} />   {/* 총원 */}
              <col style={{ width: "5rem" }} />   {/* 현재원 */}
              <col style={{ width: "4rem" }} />   {/* 학점 */}
              <col style={{ width: "7rem" }} />   {/* 상세보기 */}
              <col style={{ width: "5rem" }} />   {/* 상태 */}
              <col style={{ width: "6rem" }} />   {/* 수정 */}
              <col style={{ width: "6rem" }} />   {/* 기능(개강) */}
              <col style={{ width: "6rem" }} />   {/* 기능(폐강) */}
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
                  <td className="text-center">{lec.lectureSchedules.map(s => typeMap3[s.day])}</td>
                  <td className="text-center">{lec.totalStudent}</td>
                  <td className="text-center">{lec.nowStudent}</td>
                  <td className="text-center">{lec.credit}</td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      variant="outline-dark"
                      onClick={() => {
                        setModalId(lec.id)
                        setOpen(true)
                      }}
                    >
                      상세
                    </Button>
                  </td>
                  <td className="text-center">{typeMap[lec.status]}</td>
                  <td className="text-center">
                    <Button size="sm" variant="outline-secondary"onClick={()=>{
                      navigate(`/lecupdateAd/${lec.id}`)
                    }}>
                      수정
                    </Button>
                  </td>
                  <td className="text-center">
                    <Button variant="outline-primary" size="sm"
                      onClick={() => {
                        stautsRequest(lec.id, "INPROGRESS")
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
            <Button size="sm" variant="primary" onClick={lectureInprogress}>일괄 개강</Button>
            <Button size="sm" variant="danger"
              onClick={(e) => {
                lectureRejected(e, inproSelected)
              }}
            >일괄거부</Button>
          </div>
        </div>
      </div>

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
              <col style={{ width: "3rem" }} />   {/* 체크박스 */}
              <col style={{ width: "16rem" }} />  {/* 강의명 */}
              <col style={{ width: "7rem" }} />   {/* 이수구분 */}
              <col style={{ width: "3rem" }} />   {/* 학년 */}
              <col style={{ width: "12rem" }} />  {/* 과이름 */}
              <col style={{ width: "7rem" }} />   {/* 담당교수 */}
              <col style={{ width: "13rem" }} />  {/* 학기 */}
              <col style={{ width: "9rem" }} />   {/* 수업 요일 */}
              <col style={{ width: "5rem" }} />   {/* 총원 */}
              <col style={{ width: "5rem" }} />   {/* 현재원 */}
              <col style={{ width: "4rem" }} />   {/* 학점 */}
              <col style={{ width: "7rem" }} />   {/* 상세보기 */}
              <col style={{ width: "5rem" }} />   {/* 상태 */}
              <col style={{ width: "6rem" }} />   {/* 수정 */}
              <col style={{ width: "6rem" }} />   {/* 기능(개강) */}
              <col style={{ width: "6rem" }} />   {/* 기능(폐강) */}
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
<<<<<<< HEAD
                  <td className="text-center">{lec.lectureSchedules.map(s => typeMap3[s.day])}</td>
=======
                  <td className="text-center">{lec.lectureSchedules.map(s=>typeMap3[s.day].join(", "))}</td>
>>>>>>> 8eb8cbdddce7b93c11f6eadb9aedb12b77093043
                  <td className="text-center">{lec.totalStudent}</td>
                  <td className="text-center">{lec.nowStudent}</td>
                  <td className="text-center">{lec.credit}</td>
                  <td className="text-center">
                    <Button
                      size="sm"
                      variant="outline-dark"
                      onClick={() => {
                        setModalId(lec.id)
                        setOpen(true)
                      }}
                    >
                      상세
                    </Button>
                  </td>
                  <td className="text-center">{typeMap[lec.status]}</td>
                  <td className="text-center">
                    <Button size="sm" variant="outline-secondary" onClick={()=>{
                      navigate(`/lecupdateAd/${lec.id}`)
                    }}>
                      수정
                    </Button>
                  </td>
                  <td className="text-center" colSpan={2}>
                    <Button variant="outline-primary" size="sm"
                      onClick={() => {
                        stautsRequest(lec.id, "APPROVED")
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
            <Button size="sm" variant="primary" onClick={
              (e) => {
                lectureApproved(e, rejectedSelected)
              }}>
              일괄 재승인</Button>
          </div>

        </div>

      </div>

      {/* ───────── 상세 모달 UI ───────── */}
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
              <Table
                size="sm"
                bordered
                hover
                className="align-middle mb-0"
                style={{ fontSize: "0.9rem" }}
              >
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "6rem" }} className="text-center">요일</th>
                    <th style={{ width: "7rem" }} className="text-center">시작</th>
                    <th style={{ width: "7rem" }} className="text-center">종료</th>
                    <th>시간</th>
                  </tr>
                </thead>
                <tbody>
                  {(modalLec?.lectureSchedules ?? []).map((schedule, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{typeMap3[schedule.day] ?? schedule.day}</td>
                      <td className="text-center">{typeMap4[schedule.startTime] ?? schedule.startTime}</td>
                      <td className="text-center">{typeMap5[schedule.endTime] ?? schedule.endTime}</td>
                      <td className="text-nowrap">{schedule.startTime}~{schedule.endTime}</td>
                    </tr>
                  ))}
                  {(modalLec?.lectureSchedules ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">시간표 없음</td>
                    </tr>
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
                            disabled={!modalLec?.attachmentDtos?.length}
                            onClick={() => {
                              downloadClick(lecFile.id)
                              console.log(lecFile.id)
                            }}
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
          <Button variant="secondary" onClick={() => setOpen(false)}>닫기</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default App;
