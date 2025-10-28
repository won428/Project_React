import { useEffect, useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function App() {
    
    const [lectureList, setLectureList] = useState([]);
    const [lectureListSt, setLectureListSt] = useState([]);
    const [myLectureList, setMyLectureList] = useState([]);
    const navigate = useNavigate();
    const {user} = useAuth();
    const [selected, setSelected] = useState([]);


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
        const url = `${API_BASE_URL}/lecture/mylist`;

        axios
            .get(url, {
                params:{
                    userId : user.id
                }
            })
            .then((response)=>{
                
                setMyLectureList(response.data)
                
            })
            .catch((error)=>{
                const err = error.response;
           if(!err){
            alert('네트워크 오류가 발생하였습니다')
            return;
                }
            })
    },[]);


    useEffect(()=>{
            if (!Array.isArray(lectureList)) return;
            
            setLectureListSt(lectureList.filter(lec=>lec.status === 'APPROVED'));
    
        },[lectureList]);
    
       
    

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

    const typeMap = {
    PENDING : "처리중",
    APPROVED: "신청 가능",  
    REJECTED : "거부",  
    INPROGRESS : "개강", 
    COMPLETED:"종강"  
  };


  const addSelect = (e) =>{
    const value = e.target.value;
    const checked = e.target.checked;

    setSelected(prev => 
        checked ?
            (prev.includes(value)?prev : [...prev, value])
            : prev.filter(prev => prev !== value));
  }


  useEffect(()=>{
    console.log(selected)
  },[selected])

    const apply = async () =>{
        
        const url = `${API_BASE_URL}/lecture/apply`;

        try {
             const response = await axios.post(url, selected ,
                {params :
                    {id : user.id}
                })
            if (response.data.success) {
                alert('등록 성공');
                navigate('/LHome')
            }else{
                alert('등록 성공');
                navigate('/LHome')
            }
        } catch (error) {
           const err = error.response;
           if(!err){
            alert('네트워크 오류가 발생하였습니다')
            return;
           }

           const httpStatus = err.status;
           const errData = err.data;

           const message = errData?.message??'오류 발생'

           alert(message)
           
        }
       
    }

    return (
        <>
<div className="table-responsive">
      <Table bordered hover size="sm" className="align-middle">
        <colgroup>
          <col style={{ width: "3rem" }} /> {/* 체크박스 */}
          <col style={{ width: "16rem" }} /> {/* 강의명 */}
          <col style={{ width: "12rem" }} /> {/* 과이름 */}
          <col style={{ width: "10rem" }} /> {/* 담당교수 */}
          <col style={{ width: "15rem" }} />  {/* 학기 */}
          <col style={{ width: "9rem" }} />  {/* 개강일 */}
          <col style={{ width: "9rem" }} />  {/* 종강일 */}
          <col style={{ width: "4rem" }} />  {/* 총원 */}
          <col style={{ width: "3rem" }} />  {/* 학점 */}
          <col style={{ width: "5rem" }} />  {/* 자료(빈칸) */}
          <col style={{ width: "9rem" }} />  {/* 상태 */}
          <col style={{ width: "9rem" }} />  {/* 액션 */}
        </colgroup>

        <tbody>
          

          {/* ───────── 수강중 섹션 ───────── */}
            <tr className="table-secondary">
                <td colSpan={12} className="fw-bold">수강신청 가능 목록</td>
            </tr>
            <tr className="table-light">
                <th>체크</th>
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
                <th>상세</th>
            </tr>
                {lectureListSt.map((lec)=>(
            <tr key={lec.id}>
                <td>
                    <Form.Check
                        type="checkbox"
                        value={lec.id}
                        onChange={addSelect}
                    />
                </td> 
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
                    <Button>
                    수강 신청
                    </Button>
                 </td>
            </tr>
            ))} 
           <tr>
                <td colSpan={12} className="text-end">
                    <Button className="mt-2"
                     onClick={apply}
                    >
                        일괄 신청
                    </Button>
                </td>
            </tr>
               
             
          
          
        </tbody>
    </Table>
    <Table bordered hover size="sm" className="align-middle">
        <colgroup>
          
          <col style={{ width: "16rem" }} /> {/* 강의명 */}
          <col style={{ width: "12rem" }} /> {/* 과이름 */}
          <col style={{ width: "10rem" }} /> {/* 담당교수 */}
          <col style={{ width: "15rem" }} />  {/* 학기 */}
          <col style={{ width: "9rem" }} />  {/* 개강일 */}
          <col style={{ width: "9rem" }} />  {/* 종강일 */}
          <col style={{ width: "6rem" }} />  {/* 총원 */}
          <col style={{ width: "6rem" }} />  {/* 학점 */}
          <col style={{ width: "5rem" }} />  {/* 자료(빈칸) */}
          <col style={{ width: "6rem" }} /> {/* 상태 */}
        </colgroup>

        <tbody>
            <tr className="table-secondary">
                <td colSpan={10} className="fw-bold">수강신청 완료 목록</td>
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
                {myLectureList.map((lec)=>(
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