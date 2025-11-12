import { useCallback, useEffect, useState } from "react";
import { Button, Form, Modal, Table, Tabs, Tab } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [lectureList, setLectureList] = useState();
  const [inprogressLec, setInprogressLec] = useState([]);
  const [completedLec, setCompletedLec] = useState([]);
  const [compleSelected, setCompleSelected] = useState([]);
  const [rejecSelected, setrejecSelected] = useState([]);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [modalId, setModalId] = useState("");
  const [modalLec, setModalLec] = useState({});

  useEffect(() => {
    if (!modalId) return;
    const url = `${API_BASE_URL}/lecture/info`;
    axios
      .get(url, { params: { modalId: Number(modalId) } })
      .then((res) => setModalLec(res.data))
      .catch((err) => {
        console.error(err.response?.data);
        alert("오류");
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
    setInprogressLec(lectureList.filter((lec) => lec.status === "INPROGRESS"));
    setCompletedLec(lectureList.filter((lec) => lec.status === "COMPLETED"));
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

  const typeMap4 = {
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

  const typeMap5 = {
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

  const lectureInprogress = async (e, selected) => {
    e.preventDefault();
    try {
      const url = `${API_BASE_URL}/lecture/inprogress`;
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

 

  const downloadClick = (id) => {
    const url = `${API_BASE_URL}/attachment/download/${id}`;
    axios
      .get(url, { responseType: "blob" })
      .then((response) => {
        console.log(response.headers);
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
        console.error(err.response?.data);
        alert("오류");
      });
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

  return (
    <>
      <Tabs
        id="lecture-tabs-2"
        defaultActiveKey="inprogress"
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
        <Tab eventKey="inprogress" title={`개강 (${inprogressLec.length})`}>
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

        <Tab eventKey="completed" title={`종강 (${completedLec.length})`}>
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
<<<<<<< HEAD
                    {/* 값은 사용자가 채울 예정 */}
=======
>>>>>>> origin/develop
                    <td className="text-center">{modalLec?.weightsDto?.attendanceScore ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.assignmentScore ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.midtermExam ?? "-"}</td>
                    <td className="text-center">{modalLec?.weightsDto?.finalExam ?? "-"}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>

<<<<<<< HEAD
          {/* 첨부파일 */}
=======
>>>>>>> origin/develop
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
