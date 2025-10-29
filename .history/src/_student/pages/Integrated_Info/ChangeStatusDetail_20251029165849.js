import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function RecordDetail() {
  const { recordId } = useParams(); // URL에서 recordId 읽기
  const [record, setRecord] = useState(null);

  useEffect(() => {
    // 서버에서 상세 내용 요청
    axios.get(`${API_BASE_URL}/api/record/detail`, { params: { id: recordId } })
      .then(res => setRecord(res.data))
      .catch(() => alert("상세 내용을 불러오지 못했습니다."));
  }, [recordId]);

  if (!record) return <div>로딩 중...</div>;

  return (
    <div>
      <h2>상세 내용</h2>
      <p>제목: {record.title}</p>
      <p>신청일: {record.appliedDate}</p>
      <p>처리일: {record.processedDate}</p>
      <p>학적상태: {record.studentStatus}</p>
      <p>처리상태: {record.status}</p>
      {/* 상세 내용 더 넣기 */}
    </div>
  );
}

export default App;