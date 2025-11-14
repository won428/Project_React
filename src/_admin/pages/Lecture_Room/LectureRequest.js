import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [lectureList, setLectureList] = useState();
  const [pendingLec, setPendingLec] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
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
    if (!Array.isArray(lectureList)) return;
    setPendingLec(lectureList.filter((lec) => lec.status === "PENDING"));
  }, [lectureList]);

  const typeMap = {
    PENDING: "처리중",
    APPROVED: "승인",
    REJECTED: "거부",
    INPROGRESS: "개강",
    COMPLETED: "종강",
  };

  const splitStartDate = (date = "") => {
    const parts = String(date).split("-");
    if (parts.length < 2) return "";
    const [yyyy, mm] = parts;
    const year = yyyy.slice(-2);
    const month = Number(mm);
    if (month >= 1 && month <= 2) return `${year}년도 겨울 계절학기`;
    if (month >= 3 && month <= 6) return `${year}년도 1학기`;
    if (month >= 7 && month <= 8) return `${year}년도 여름 계절학기`;
    if (month >= 9 && month <= 12) return `${year}년도 2학기`;
    return "";
  };

  const approveRequest = async (e) => {
    const url = `${API_BASE_URL}/lecture/request`;
    const id = Number(e.target.value);

    try {
      e.preventDefault();
      const response = await axios.put(
        url,
        null,
        { params: { status: "INPROGRESS", id } }
      );
      if (response.status === 200) {
        alert("승인 완료");
        navigate("/lectureList");
      }
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const rejectRequest = async (e) => {
    const url = `${API_BASE_URL}/lecture/request`;
    const id = Number(e.target.value);

    try {
      e.preventDefault();
      const response = await axios.put(
        url,
        null,
        { params: { status: "REJECTED", id } }
      );
      if (response.status === 200) {
        alert("거절 완료");
        navigate("/lectureList");
      }
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  return (
    <>
      <div className="table-responsive">
        <Table bordered hover size="sm" className="align-middle">
          <colgroup>
            <col style={{ width: "16rem" }} />
            <col style={{ width: "12rem" }} />
            <col style={{ width: "10rem" }} />
            <col style={{ width: "8rem" }} />
            <col style={{ width: "9rem" }} />
            <col style={{ width: "9rem" }} />
            <col style={{ width: "6rem" }} />
            <col style={{ width: "6rem" }} />
            <col style={{ width: "5rem" }} />
            <col style={{ width: "5rem" }} />
            <col style={{ width: "9rem" }} />
          </colgroup>

          <tbody>
            <tr className="table-secondary">
              <td colSpan={11} className="fw-bold">신청목록</td>
            </tr>
            <tr className="table-light">
              <th>강의명</th>
              <th>과이름</th>
              <th>담당교수</th>
              <th>학기</th>
              <th>개강일</th>
              <th>종강일</th>
              <th>총원</th>
              <th>학점</th>
              <th>자료</th>
              <th>상태</th>
              <th>처리</th>
            </tr>

            {pendingLec.map((lec) => (
              <tr key={lec.id}>
                <td>{lec.name}</td>
                <td>{lec.majorName}</td>
                <td>{lec.userName}</td>
                <td>{splitStartDate(lec.startDate)}</td>
                <td>{lec.startDate}</td>
                <td>{lec.endDate}</td>
                <td>{lec.totalStudent}</td>
                <td>{lec.credit}</td>
                <td>자료</td>
                <td>{typeMap[lec.status]}</td>
                <td>
                  <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                    <Button
                      variant="primary"
                      size="sm"
                      value={lec.id}
                      onClick={approveRequest}
                    >
                      승인
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      value={lec.id}
                      onClick={rejectRequest}
                    >
                      거절
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
export default App;
