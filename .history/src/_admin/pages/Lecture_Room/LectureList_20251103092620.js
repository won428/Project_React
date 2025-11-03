import { useCallback, useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [lectureList, setLectureList] = useState();
  const [inprogressLec, setInprogressLec] = useState([]);
  const [completedLec, setCompletedLec] = useState([]);
  const [rejectedLec, setRejectedLec] = useState([]);
  const [approvedLec, setApprovedLec] = useState([]);
  const [pendingLec, setPendingLec] = useState([]);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

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
    setRejectedLec(lectureList.filter((lec) => lec.status === "REJECTED"));
    setApprovedLec(lectureList.filter((lec) => lec.status === "APPROVED"));
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

  // 년도 4자리에서 뒤에 2자리 잘라서 사용하는 로직
  const splitStartDate = (date) => {
<<<<<<< HEAD
    const [yyyy, mm] = date.split("-")
    const year = yyyy.slice(-2);
    let splitMonth = (Number(mm))
    let splitDate = '';
    if(splitMonth >= 1 && splitMonth <= 2 ){
      splitDate = `${year}년도 겨울 계절학기`
    }else if(splitMonth >= 3  && splitMonth <= 6){
      splitDate = `${year}년도 1학기`
    }else if(splitMonth >= 7 && splitMonth <= 8){
      splitDate = `${year}년도 여름 계절학기`
    }else if(splitMonth >= 9 && splitMonth <= 12){
      splitDate = `${year}년도 2학기`
=======
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
>>>>>>> origin/develop
    }

    return splitDate;
  };

  const stautsRequest = async (id, status) => {
    const url = `${API_BASE_URL}/lecture/request`;
    try {
      const response = await axios.put(url, null, {
        params: {
          status: status,
          id: id,
        },
      });
      if (response.status === 200) {
        alert("처리 완료");
        await fetchLectures();
      }
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const addSelect = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;

    setSelected((prev) =>
      checked ? (prev.includes(value) ? prev : [...prev, value]) : prev.filter((v) => v !== value)
    );
  };

  const lectureInprogress = async (e) => {
    e.preventDefault();
    try {
      const url = `${API_BASE_URL}/lecture/inprogress`;
      const response = await axios.patch(url, selected, {
        params: {
          status: "INPROGRESS",
        },
      });
      if (response.status === 200) {
        alert("선택하신 강의를 개강하였습니다.");
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

  return (
    <>
      {/* ───────────────────── 목록별 테이블 (UI 전용) ───────────────────── */}

      {/* 승인 대기 목록 */}
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
              <col style={{ width: "3rem" }} />  {/* 체크박스 */}
              <col style={{ width: "16rem" }} /> {/* 강의명 */}
              <col style={{ width: "7rem" }} />  {/* 이수구분 */}
              <col style={{ width: "4rem" }} />  {/* 학년 */}
              <col style={{ width: "12rem" }} /> {/* 과이름 */}
              <col style={{ width: "8rem" }} />  {/* 담당교수 */}
              <col style={{ width: "10rem" }} /> {/* 학기 */}
              <col style={{ width: "8rem" }} />  {/* 개강일 */}
              <col style={{ width: "8rem" }} />  {/* 종강일 */}
              <col style={{ width: "5rem" }} />  {/* 총원 */}
              <col style={{ width: "5rem" }} />  {/* 현재원 */}
              <col style={{ width: "5rem" }} />  {/* 학점 */}
              <col style={{ width: "5rem" }} />  {/* 자료 */}
              <col style={{ width: "7rem" }} />  {/* 상태 */}
              <col style={{ width: "6rem" }} />  {/* 기능(승인) */}
              <col style={{ width: "6rem" }} />  {/* 기능(거부) */}
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
                <th>개강일</th>
                <th>종강일</th>
                <th>총원</th>
                <th>현재원</th>
                <th>학점</th>
                <th>자료</th>
                <th>상태</th>
                <th colSpan={2}>기능</th>
              </tr>
            </thead>
            <tbody>
              {pendingLec.map((lec) => (
                <tr key={lec.id}>
                  <td className="text-center text-nowrap">
                    <Form.Check type="checkbox" value={lec.id} onChange={addSelect} />
                  </td>
                  <td className="text-start">{lec.name}</td>
                  <td className="text-center">{typeMap2[lec.completionDiv]}</td>
                  <td className="text-center">{lec.level}</td>
                  <td className="text-start">{lec.majorName}</td>
                  <td className="text-center">{lec.userName}</td>
                  <td className="text-center">{splitStartDate(lec.startDate)}</td>
                  <td className="text-center">{lec.startDate}</td>
                  <td className="text-center">{lec.endDate}</td>
                  <td className="text-center">{lec.totalStudent}</td>
                  <td className="text-center">{lec.nowStudent}</td>
                  <td className="text-center">{lec.credit}</td>
                  <td className="text-center">자료</td>
                  <td className="text-center">{typeMap[lec.status]}</td>
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

          {/* 하단 버튼: 표 아래 오른쪽 정렬, 간격/여백 통일 */}
          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button size="sm" variant="primary">일괄수락</Button>
            <Button size="sm" variant="danger">일괄거부</Button>
          </div>
        </div>
      </div>

      {/* 승인 목록 */}
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
              <col style={{ width: "3rem" }} />  {/* 체크박스 */}
              <col style={{ width: "16rem" }} /> {/* 강의명 */}
              <col style={{ width: "7rem" }} />  {/* 이수구분 */}
              <col style={{ width: "3rem" }} />  {/* 학년 */}
              <col style={{ width: "12rem" }} /> {/* 과이름 */}
              <col style={{ width: "7rem" }} />  {/* 담당교수 */}
              <col style={{ width: "13rem" }} /> {/* 학기 */}
              <col style={{ width: "8rem" }} />  {/* 개강일 */}
              <col style={{ width: "8rem" }} />  {/* 종강일 */}
              <col style={{ width: "5rem" }} />  {/* 총원 */}
              <col style={{ width: "5rem" }} />  {/* 현재원 */}
              <col style={{ width: "4rem" }} />  {/* 학점 */}
              <col style={{ width: "5rem" }} />  {/* 자료 */}
              <col style={{ width: "4rem" }} />  {/* 상태 */}
              <col style={{ width: "6rem" }} />  {/* 기능(개강) */}
              <col style={{ width: "6rem" }} />  {/* 기능(폐강) */}
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
                <th>개강일</th>
                <th>종강일</th>
                <th>총원</th>
                <th>현재원</th>
                <th>학점</th>
                <th>자료</th>
                <th>상태</th>
                <th colSpan={2}>기능</th>
              </tr>
            </thead>
            <tbody>
              {approvedLec.map((lec) => (
                <tr key={lec.id}>
                  <td className="text-center text-nowrap">
                    <Form.Check type="checkbox" value={lec.id} onChange={addSelect} />
                  </td>
                  <td className="text-start">{lec.name}</td>
                  <td className="text-center">{typeMap2[lec.completionDiv]}</td>
                  <td className="text-center">{lec.level}</td>
                  <td className="text-start">{lec.majorName}</td>
                  <td className="text-center">{lec.userName}</td>
                  <td className="text-center">{splitStartDate(lec.startDate)}</td>
                  <td className="text-center">{lec.startDate}</td>
                  <td className="text-center">{lec.endDate}</td>
                  <td className="text-center">{lec.totalStudent}</td>
                  <td className="text-center">{lec.nowStudent}</td>
                  <td className="text-center">{lec.credit}</td>
                  <td className="text-center">자료</td>
                  <td className="text-center">{typeMap[lec.status]}</td>
                  <td className="text-center">
                    <Button variant="outline-primary" size="sm">
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
            <Button size="sm" variant="danger">일괄거부</Button>
          </div>
        </div>
      </div>

      {/* 개강 목록 */}
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
              <col style={{ width: "3rem" }} />  {/* 체크박스 */}
              <col style={{ width: "16rem" }} /> {/* 강의명 */}
              <col style={{ width: "7rem" }} />  {/* 이수구분 */}
              <col style={{ width: "3rem" }} />  {/* 학년 */}
              <col style={{ width: "12rem" }} /> {/* 과이름 */}
              <col style={{ width: "7rem" }} />  {/* 담당교수 */}
              <col style={{ width: "15rem" }} /> {/* 학기 */}
              <col style={{ width: "8rem" }} />  {/* 개강일 */}
              <col style={{ width: "8rem" }} />  {/* 종강일 */}
              <col style={{ width: "5rem" }} />  {/* 총원 */}
              <col style={{ width: "5rem" }} />  {/* 현재원 */}
              <col style={{ width: "4rem" }} />  {/* 학점 */}
              <col style={{ width: "5rem" }} />  {/* 자료 */}
              <col style={{ width: "5rem" }} />  {/* 상태 */}
              <col style={{ width: "6rem" }} />  {/* 기능(개강) */}
              <col style={{ width: "6rem" }} />  {/* 기능(폐강) */}
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
                <th>개강일</th>
                <th>종강일</th>
                <th>총원</th>
                <th>현재원</th>
                <th>학점</th>
                <th>자료</th>
                <th>상태</th>
                <th colSpan={2}>기능</th>
              </tr>
            </thead>
            <tbody>
              {inprogressLec.map((lec) => (
                <tr key={lec.id}>
                  <td className="text-center text-nowrap">
                    <Form.Check type="checkbox" value={lec.id} onChange={addSelect} />
                  </td>
                  <td className="text-start">{lec.name}</td>
                  <td className="text-center">{typeMap2[lec.completionDiv]}</td>
                  <td className="text-center">{lec.level}</td>
                  <td className="text-start">{lec.majorName}</td>
                  <td className="text-center">{lec.userName}</td>
                  <td className="text-center">{splitStartDate(lec.startDate)}</td>
                  <td className="text-center">{lec.startDate}</td>
                  <td className="text-center">{lec.endDate}</td>
                  <td className="text-center">{lec.totalStudent}</td>
                  <td className="text-center">{lec.nowStudent}</td>
                  <td className="text-center">{lec.credit}</td>
                  <td className="text-center">자료</td>
                  <td className="text-center">{typeMap[lec.status]}</td>
                  <td className="text-center">
                    <Button variant="outline-primary" size="sm">
                      개강
                    </Button>
                  </td>
                  <td className="text-center">
                    <Button variant="outline-danger" size="sm">
                      폐강
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-end gap-2 mt-2">
            <Button size="sm" variant="primary">일괄수락</Button>
            <Button size="sm" variant="danger">일괄거부</Button>
          </div>
        </div>
      </div>

      {/* 종강 목록 */}
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
              <col style={{ width: "3rem" }} />  {/* 체크박스 */}
              <col style={{ width: "16rem" }} /> {/* 강의명 */}
              <col style={{ width: "7rem" }} />  {/* 이수구분 */}
              <col style={{ width: "3rem" }} />  {/* 학년 */}
              <col style={{ width: "12rem" }} /> {/* 과이름 */}
              <col style={{ width: "7rem" }} />  {/* 담당교수 */}
              <col style={{ width: "15rem" }} /> {/* 학기 */}
              <col style={{ width: "8rem" }} />  {/* 개강일 */}
              <col style={{ width: "8rem" }} />  {/* 종강일 */}
              <col style={{ width: "5rem" }} />  {/* 총원 */}
              <col style={{ width: "5rem" }} />  {/* 현재원 */}
              <col style={{ width: "4rem" }} />  {/* 학점 */}
              <col style={{ width: "5rem" }} />  {/* 자료 */}
              <col style={{ width: "5rem" }} />  {/* 상태 */}
              <col style={{ width: "6rem" }} />  {/* 기능(개강) */}
              <col style={{ width: "6rem" }} />  {/* 기능(폐강) */}
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
                <th>개강일</th>
                <th>종강일</th>
                <th>총원</th>
                <th>현재원</th>
                <th>학점</th>
                <th>자료</th>
                <th>상태</th>
                <th colSpan={2}>기능</th>
              </tr>
            </thead>
            <tbody>
              {completedLec.map((lec) => (
                <tr key={lec.id}>
                  <td className="text-center text-nowrap"></td>
                  <td className="text-start">{lec.name}</td>
                  <td className="text-center">{typeMap2[lec.completionDiv]}</td>
                  <td className="text-center">{lec.level}</td>
                  <td className="text-start">{lec.majorName}</td>
                  <td className="text-center">{lec.userName}</td>
                  <td className="text-center">{splitStartDate(lec.startDate)}</td>
                  <td className="text-center">{lec.startDate}</td>
                  <td className="text-center">{lec.endDate}</td>
                  <td className="text-center">{lec.totalStudent}</td>
                  <td className="text-center">{lec.nowStudent}</td>
                  <td className="text-center">{lec.credit}</td>
                  <td className="text-center">자료</td>
                  <td className="text-center">{typeMap[lec.status]}</td>
                  <td className="text-center">
                    <Button variant="outline-primary" size="sm">
                      개강
                    </Button>
                  </td>
                  <td className="text-center">
                    <Button variant="outline-danger" size="sm">
                      폐강
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* 승인 거부 목록 */}
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
              <col style={{ width: "3rem" }} />  {/* 체크박스 */}
              <col style={{ width: "16rem" }} /> {/* 강의명 */}
              <col style={{ width: "7rem" }} />  {/* 이수구분 */}
              <col style={{ width: "3rem" }} />  {/* 학년 */}
              <col style={{ width: "12rem" }} /> {/* 과이름 */}
              <col style={{ width: "7rem" }} />  {/* 담당교수 */}
              <col style={{ width: "15rem" }} /> {/* 학기 */}
              <col style={{ width: "8rem" }} />  {/* 개강일 */}
              <col style={{ width: "8rem" }} />  {/* 종강일 */}
              <col style={{ width: "5rem" }} />  {/* 총원 */}
              <col style={{ width: "5rem" }} />  {/* 현재원 */}
              <col style={{ width: "4rem" }} />  {/* 학점 */}
              <col style={{ width: "5rem" }} />  {/* 자료 */}
              <col style={{ width: "5rem" }} />  {/* 상태 */}
              <col style={{ width: "6rem" }} />  {/* 기능(개강) */}
              <col style={{ width: "6rem" }} />  {/* 기능(폐강) */}
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
                <th>개강일</th>
                <th>종강일</th>
                <th>총원</th>
                <th>현재원</th>
                <th>학점</th>
                <th>자료</th>
                <th>상태</th>
                <th colSpan={2}>기능</th>
              </tr>
            </thead>
            <tbody>
              {rejectedLec.map((lec) => (
                <tr key={lec.id}>
                  <td className="text-center text-nowrap"></td>
                  <td className="text-start">{lec.name}</td>
                  <td className="text-center">{typeMap2[lec.completionDiv]}</td>
                  <td className="text-center">{lec.level}</td>
                  <td className="text-start">{lec.majorName}</td>
                  <td className="text-center">{lec.userName}</td>
                  <td className="text-center">{splitStartDate(lec.startDate)}</td>
                  <td className="text-center">{lec.startDate}</td>
                  <td className="text-center">{lec.endDate}</td>
                  <td className="text-center">{lec.totalStudent}</td>
                  <td className="text-center">{lec.nowStudent}</td>
                  <td className="text-center">{lec.credit}</td>
                  <td className="text-center">자료</td>
                  <td className="text-center">{typeMap[lec.status]}</td>
                  {/* ✅ td 중첩 제거, 두 칸으로 분리 */}
                  <td className="text-center">
                    <Button variant="outline-primary" size="sm">
                      개강
                    </Button>
                  </td>
                  <td className="text-center">
                    <Button variant="outline-danger" size="sm">
                      폐강
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
}
export default App;
