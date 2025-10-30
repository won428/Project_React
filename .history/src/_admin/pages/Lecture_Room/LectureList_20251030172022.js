import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function App() {
    const [lectureList, setLectureList] = useState();
    const [inprogressLec, setInprogressLec] = useState([]);
    const [completedLec, setCompletedLec] = useState([]);
    const [rejectedLec, setRejectedLec] = useState([]);

    useEffect(()=>{
        const url = `${API_BASE_URL}/lecture/list`;
        axios
            .get(url)
            .then((response)=>{
                setLectureList(response.data)
                console.log(response.data)
            })
            .catch((error)=>{
                setLectureList([]);
                console.error("status:", error.response?.status);
                console.error("data:", error.response?.data); // ★ 서버의 에러 메시지/스택이 JSON으로 오면 여기 찍힘
            })
    },
    []);

    useEffect(()=>{
        if (!Array.isArray(lectureList)) return;
        
        setInprogressLec(lectureList.filter(lec=>lec.status === 'INPROGRESS'));
        setCompletedLec(lectureList.filter(lec=>lec.status === 'COMPLETED'));
        setRejectedLec(lectureList.filter(lec=>lec.status === 'REJECTED'));

    },[lectureList]);

    const typeMap = {
    PENDING : "처리중",
    APPROVED: "승인",  
    REJECTED : "거부",  
    INPROGRESS : "개강", 
    COMPLETED:"종강"  
  };

  // 년도 4자리에서 뒤에 2자리 잘라서 사용하는 로직
  const splitStartDate = (date) => {
    const [yyyy, mm] = date.split("-")
    const yaer = yyyy.slice(-2);
    let splitMonth = (Number(mm))
    let splitDate = '';
    if(splitMonth >= 1 && splitMonth <= 2 ){
      splitDate = `${yaer}년도 겨울 계절학기`
    }else if(splitMonth >= 3  && splitMonth <= 6){
      splitDate = `${yaer}년도 1학기`
    }else if(splitMonth >= 7 && splitMonth <= 8){
      splitDate = `${yaer}년도 여름 계절학기`
    }else if(splitMonth >= 9 && splitMonth <= 12){
      splitDate = `${yaer}년도 2학기`
    }
    
    return splitDate;
}



    
    return (
        <>
<div className="table-responsive">
      <Table bordered hover size="sm" className="align-middle">
        <colgroup>
          <col style={{ width: "16rem" }} /> {/* 강의명 */}
          <col style={{ width: "12rem" }} /> {/* 과이름 */}
          <col style={{ width: "10rem" }} /> {/* 담당교수 */}
          <col style={{ width: "8rem" }} />  {/* 학기 */}
          <col style={{ width: "9rem" }} />  {/* 개강일 */}
          <col style={{ width: "9rem" }} />  {/* 종강일 */}
          <col style={{ width: "6rem" }} />  {/* 총원 */}
          <col style={{ width: "6rem" }} />  {/* 학점 */}
          <col style={{ width: "5rem" }} />  {/* 자료(빈칸) */}
          <col style={{ width: "9rem" }} />  {/* 상태 */}
        </colgroup>

        <tbody>
          

          {/* ───────── 수강중 섹션 ───────── */}
          <tr className="table-secondary">
            <td colSpan={10} className="fw-bold">개강 목록</td>
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
          </tr>
            {inprogressLec.map((lec)=>(
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
            </tr>
            ))}
             
          
          {/* ───────── 종강 섹션 ───────── */}
          <tr className="table-secondary">
            <td colSpan={10} className="fw-bold">종강 목록</td>
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
          </tr>
          {completedLec.map((lec)=>(
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
            </tr>
            ))}

            {/* ───────── 폐강 섹션 ───────── */}
          <tr className="table-secondary">
            <td colSpan={10} className="fw-bold">승인 거부 목록</td>
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
          </tr>
          {rejectedLec.map((lec)=>(
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
            </tr>
            ))}
        </tbody>

        
      </Table>
    </div>
        </>
    )
}
export default App;