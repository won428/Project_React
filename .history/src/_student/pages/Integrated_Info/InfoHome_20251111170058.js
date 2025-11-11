import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from "../../../public/config/config";

function App() {
  const [studentInfo, setStudentInfo] = useState(null);
  const [statusRecords, setStatusRecords] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const userTypeMap = { STUDENT: '학생', PROFESSOR: '교수', ADMIN: '관리자' };
  const studentStatusMap = { ENROLLED: '재학중', ON_LEAVE: '휴학', REINSTATED: '복학', GRADUATED: '졸업', EXPELLED: '퇴학' };

  // 1. 페이지 로드 시 학생 정보 가져오기
  useEffect(() => {
    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/');
      return;
    }

    axios.get(`${API_BASE_URL}/student/info`, { params: { userId: user.id } })
      .then(res => {
        if (res.data.type === 'STUDENT') {
          setStudentInfo(res.data.studentInfo);
          setStatusRecords(res.data.statusRecords);
          setPreviewURL(res.data.statusRecords.studentImage ? `${API_BASE_URL}/images/${res.data.statusRecords.studentImage}` : null);
          setError(null);
        } else {
          setStudentInfo(null);
          setStatusRecords(null);
          setError('학생 정보만 조회할 수 있습니다.');
        }
      })
      .catch(err => {
        console.error(err);
        setStudentInfo(null);
        setStatusRecords(null);
        setError('데이터 불러오기에 실패했습니다.');
      });
  }, [user, navigate]);

  if (error) return <Container><div style={{ color: 'red' }}>{error}</div></Container>;
  if (!studentInfo || !statusRecords) return <Container>Loading...</Container>;

  // 2. 학적 변경 신청
  const handleGoChangeStatus = () => {
    if (!studentInfo.userid) return alert('학생 ID를 찾을 수 없습니다.');
    navigate('/Change_Status');
  };

  // 3. 이미지 선택 + 업로드
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewURL(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('userId', studentInfo.userid);
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/student/status/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 200) {
        // 서버에서 저장된 실제 파일 이름을 받아서 미리보기 유지
        setPreviewURL(`${API_BASE_URL}/images/${res.data.studentImage}`);
        alert('이미지 업로드 성공');
      }
    } catch (err) {
      console.error(err);
      alert('이미지 업로드 중 오류 발생');
    }
  };

  return (
    <Container>
      <h2>학생 기본 정보</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr><th>학번</th><td>{studentInfo.userCode}</td></tr>
          <tr><th>이름</th><td>{studentInfo.name}</td></tr>
          <tr><th>이메일</th><td>{studentInfo.email}</td></tr>
          <tr><th>전화번호</th><td>{studentInfo.phone}</td></tr>
          <tr><th>생년월일</th><td>{studentInfo.birthDate}</td></tr>
          <tr><th>성별</th><td>{studentInfo.gender}</td></tr>
          <tr><th>학과</th><td>{studentInfo.major}</td></tr>
          <tr><th>사용자 유형</th><td>{userTypeMap[studentInfo.type]}</td></tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: '2rem' }}>
        <h2 style={{ margin: 0 }}>학적 상태</h2>
        <Button variant="primary" size="sm" onClick={handleGoChangeStatus} style={{ marginLeft: 12 }}>학적 변경 신청</Button>
      </div>

      <h4 style={{ marginTop: '1.5rem' }}>증명사진</h4>
      <div
        onClick={() => document.getElementById('studentImageInput').click()}
        style={{
          width: '105px', height: '135px', border: '1px solid #bbb',
          borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backgroundColor: '#fafafa', marginBottom: '1rem'
        }}
      >
        {previewURL ? (
          <img src={previewURL} alt="증명사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : <span style={{ fontSize: 12, color: '#888' }}>클릭하여 등록</span>}
      </div>

      <input
        id="studentImageInput"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <tbody>
          <tr><th>학적상태</th><td>{studentStatusMap[statusRecords.studentStatus]}</td></tr>
          <tr><th>입학일</th><td>{statusRecords.admissionDate}</td></tr>
          <tr><th>휴학일</th><td>{statusRecords.leaveDate || '-'}</td></tr>
          <tr><th>복학일</th><td>{statusRecords.returnDate || '-'}</td></tr>
          <tr><th>졸업일</th><td>{statusRecords.graduationDate || '-'}</td></tr>
          <tr><th>유급일</th><td>{statusRecords.retentionDate || '-'}</td></tr>
          <tr><th>퇴학일</th><td>{statusRecords.expelledDate || '-'}</td></tr>
          <tr><th>전공 학점</th><td>{statusRecords.majorCredit}</td></tr>
          <tr><th>교양 학점</th><td>{statusRecords.generalCredit}</td></tr>
          <tr><th>총 학점</th><td>{statusRecords.totalCredit}</td></tr>
          <tr><th>이번 학기 학점</th><td>{statusRecords.currentCredit}</td></tr>
        </tbody>
      </table>
    </Container>
  );
}

export default App;
