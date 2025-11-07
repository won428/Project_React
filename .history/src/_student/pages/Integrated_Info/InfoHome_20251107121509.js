import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from "../../../public/config/config";

function App() {
  // ... 기존 코드 유지

  // ✅ 이미지 업로드 상태
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);

  // ✅ 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1) 파일 상태 저장
    setSelectedFile(file);

    // 2) 미리보기 URL 생성
    const fileURL = URL.createObjectURL(file);
    setPreviewURL(fileURL);
  };

  // ✅ 서버로 이미지 업로드
  const handleUploadImage = async () => {
    if (!selectedFile || !studentInfo?.userid) {
      alert("학생정보 또는 파일이 유효하지 않습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", studentInfo.userid);
    formData.append("file", selectedFile);

    try {
      await axios.post(`${API_BASE_URL}/student/status/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("이미지가 성공적으로 변경되었습니다.");
      window.location.reload(); // 또는 setStatusRecords 업데이트
    } catch (error) {
      console.error(error);
      alert("이미지 업로드 실패");
    }
  };

  return (
    <Container>

      {/* ✅ 이미지 업로드 UI 추가 */}
      <h3 style={{ marginTop: '2rem' }}>증명사진 업로드</h3>

      <Form.Group className="mb-3">
        <Form.Label>이미지 선택</Form.Label>
        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
      </Form.Group>

      {/* ✅ 미리보기 */}
      <div style={{ width: '105px', height: '135px', border: '1px solid #ccc', marginBottom: '1rem' }}>
        {previewURL ? (
          <img src={previewURL} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          statusRecords.studentImage ? (
            <img src={statusRecords.studentImage} alt="기존 증명사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '12px', color: '#888' }}>이미지 없음</span>
          )
        )}
      </div>

      <Button variant="success" onClick={handleUploadImage}>
        증명사진 저장
      </Button>

      {/* ✅ 아래부터 기존 화면 그대로 유지 */}
      {/* ... (기존 코드 전체 유지) */}

    </Container>
  );
}

export default App;
