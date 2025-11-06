import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import axios from "axios";
import { useAuth } from "../context/UserContext";

function InquiryBoardUI() {
  const navigate = useNavigate();
  const [inquiryList, setInquiryList] = useState([]);
  const { user } = useAuth();
  

  const typeMap = {
    PENDING: "대기중",
    ANSWERED: "답변 완료",
    RESOLVED: "처리 완료",
  };

  const typeMap2 = {
    'LECTURE': "[강의]",
    'CALENDAR': "[학사]",
    "OTHERS": "[기타]",
  };

  useEffect(() => {
    const url = `${API_BASE_URL}/inquiry/myList`;
    const id = user.id;
    axios
      .get(url, { params: { id } })
      .then((res) =>{
        console.log(res.data)
        setInquiryList(res.data)
      })
        .catch((err) => console.log(err));
  }, []);

  const clickPost = async (e, id) =>{
    
    try {
      e.preventDefault();
      const url = `${API_BASE_URL}/inquiry/clickTitle`
      const response = await axios.patch(url, null, {
        params: {id : id},
        headers: { 'Content-Type': 'application/json' }
         }
      );
      
      if(response.status === 200){
        navigate(`/inquiryPage/${id}`)
      }
      
    } catch (error) {
             const err = error.response;
             console.log(error)
        if (!err) {
            alert('네트워크 오류가 발생하였습니다');
            return;
        }
        const message = err.data?.message ?? '오류 발생';
        alert(message);

        }
  }

  return (
    <div className="p-3" style={{ maxWidth: 980, margin: "0 auto" }}>
      <div className="d-flex align-items-center justify-content-between mb-5">
        <h5 className="mb-0">1:1 문의 게시판</h5>
        <Button size="sm" onClick={() => navigate("/createPost")}>
          글쓰기
        </Button>
      </div>

      {/* 목록 박스 상단 여백 증가 */}
      <div className="border rounded mt-4">
        <div style={{ maxHeight: "60vh", overflow: "auto" }}>
          <Table
            hover
            bordered
            size="sm"
            className="mb-0 align-middle small"
            style={{ lineHeight: 1.15 }}
          >
            <colgroup>
              <col style={{ width: 80 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 90 }} />
              <col />
              <col style={{ width: 110 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 70 }} />
            </colgroup>

            <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th className="text-center py-1">글머리</th>
                <th className="text-center py-1">글번호</th>
                <th className="text-center py-1">처리상태</th>
                <th className="text-center py-1">제목</th>
                <th className="text-center py-1">작성자</th>
                <th className="text-center py-1">작성일</th>
                <th className="text-center py-1">조회수</th>
              </tr>
            </thead>

            <tbody>
              {inquiryList.map((inquiry, idx) => (
                <tr key={idx}>
                  <td className="text-center py-1 px-2">{typeMap2[inquiry.tag]}</td>
                  <td className="text-center py-1 px-2">{inquiry.postNumber}</td>
                  <td className="text-center py-1 px-2">{typeMap[inquiry.status]}</td>
                  <td className="text-center py-1 px-2">
                    <span
                      className="d-inline-block text-truncate"
                      style={{ maxWidth: 520, cursor: "pointer" }}
                      role="button"
                      onClick={(e) => { clickPost(e, inquiry.postNumber)}}
                    >
                      {inquiry.title}
                    </span>
                  </td>
                  <td className="text-center py-1 px-2">{inquiry.userName}</td>
                  <td className="text-center py-1 px-2 text-nowrap">{inquiry.createdAt}</td>
                  <td className="text-center py-1 px-2">{inquiry.viewCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}
export default InquiryBoardUI;
