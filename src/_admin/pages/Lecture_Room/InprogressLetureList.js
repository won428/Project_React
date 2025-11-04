import { useCallback, useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [lectureList, setLectureList] = useState();
  const [inprogressLec, setInprogressLec] = useState([]);
  const [completedLec, setCompletedLec] = useState([]);
  const [compleSelected, setCompleSelected] = useState([]); // 개강 목록 → 종강용
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

  return (
    <>
      {/* ───────── 개강 목록 ───────── */}
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
              <col style={{ width: "3rem" }} />   {/* 체크박스 */}
              <col style={{ width: "16rem" }} />  {/* 강의명 */}
              <col style={{ width: "7rem" }} />   {/* 이수구분 */}
              <col style={{ width: "3rem" }} />   {/* 학년 */}
              <col style={{ width: "12rem" }} />  {/* 과이름 */}
              <col style={{ width: "7rem" }} />   {/* 담당교수 */}
              <col style={{ width: "15rem" }} />  {/* 학기 */}
              <col style={{ width: "9rem" }} />   {/* 수업 요일 */}
              <col style={{ width: "5rem" }} />   {/* 총원 */}
              <col style={{ width: "5rem" }} />   {/* 현재원 */}
              <col style={{ width: "4rem" }} />   {/* 학점 */}
              <col style={{ width: "7rem" }} />   {/* 상세보기 */}
              <col style={{ width: "5rem" }} />   {/* 상태 */}
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
                <th colSpan={2}>기능</th>
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
                  <td className="text-center"></td> {/* 수업 요일 */}
                  <td className="text-center">{lec.totalStudent}</td>
                  <td className="text-center">{lec.nowStudent}</td>
                  <td className="text-center">{lec.credit}</td>
                  <td className="text-center"></td> {/* 상세보기 */}
                  <td className="text-center">{typeMap[lec.status]}</td>
                  <td className="text-center" colSpan={2}>
                    <Button variant="outline-danger" size="sm">
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

      {/* ───────── 종강 목록 ───────── */}
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
              <col style={{ width: "3rem" }} />   {/* 체크박스 */}
              <col style={{ width: "16rem" }} />  {/* 강의명 */}
              <col style={{ width: "7rem" }} />   {/* 이수구분 */}
              <col style={{ width: "3rem" }} />   {/* 학년 */}
              <col style={{ width: "12rem" }} />  {/* 과이름 */}
              <col style={{ width: "7rem" }} />   {/* 담당교수 */}
              <col style={{ width: "15rem" }} />  {/* 학기 */}
              <col style={{ width: "9rem" }} />   {/* 수업 요일 */}
              <col style={{ width: "5rem" }} />   {/* 총원 */}
              <col style={{ width: "5rem" }} />   {/* 현재원 */}
              <col style={{ width: "4rem" }} />   {/* 학점 */}
              <col style={{ width: "7rem" }} />   {/* 상세보기 */}
              <col style={{ width: "5rem" }} />   {/* 상태 */}
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
                  <td className="text-center"></td> {/* 수업 요일 */}
                  <td className="text-center">{lec.totalStudent}</td>
                  <td className="text-center">{lec.nowStudent}</td>
                  <td className="text-center">{lec.credit}</td>
                  <td className="text-center"></td> {/* 상세보기 */}
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
    </>
  );
}

export default App;
