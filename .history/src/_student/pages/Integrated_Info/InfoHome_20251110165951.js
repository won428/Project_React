import { Form, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from "../../../public/config/config";

function App() {
  // 학생 기본 정보 상태
  const [studentInfo, setStudentInfo] = useState({
    userid: null,
    userCode: '',
    name: '',
    password: '',
    birthDate: '',
    email: '',
    phone: '',
    gender: '',
    major: '',
    type: '',
  });

  // 학생 학적 상태 정보 상태
  const [statusRecords, setStatusRecords] = useState({
    statusid: null,
    studentStatus: 'ENROLLED',
    admissionDate: '',
    leaveDate: '',
    returnDate: '',
    graduationDate: '',
    retentionDate: '',
    expelledDate: '',
    majorCredit: 0,
    generalCredit: 0.0,
    totalCredit: 0.0,
    currentCredit: 0.0,
    studentImage: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const userTypeMap = { STUDENT: '학생', PROFESSOR: '교수', ADMIN: '관리자' };
  const studentStatusMap = { ENROLLED: '재학중', ON_LEAVE: '휴학', REINSTATED: '복학', GRADUATED: '졸업', EXPELLED: '퇴학' };

  useEffect(() => {
    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/');
      return;
    }

    axios.get(`${API_BASE_URL}/student/info`, { params: { userId: user?.id } })
      .then(res => {
        if (res.data.type === 'STUDENT') {
          setStudentInfo(res.data.studentInfo);
          setStatusRecords(res.data.statusRecords);

          // 서버에서 가져온 이미지가 있으면 previewURL로 세팅
          if (res.data.statusRecords.studentImage) {
            setPreviewURL(res.data.statusRecords.studentImage);
          }

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
        alert('데이터 불러오는 중 오류가 발생했습니다.');
        setError('데이터 불러오기에 실패했습니다.');
      });
  }, [user, navigate]);

  if (error) return <Container><div style={{ color: 'red' }}>{error}</div></Container>;

  // 학적 변경 신청 버튼
  const handleGoChangeStatus = () => {
    if (!studentInfo?.userid) {
      alert('학생 ID를 찾을 수 없습니다. 내 정보 페이지를 새로고침 후 다시 시도하세요.');
      
    }

    // 파일 선택 핸들러
    const handleFileInputChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file));

      // 서버 업로드
      const formData = new FormData();
      formData.append("userId", studentInfo.userid);
      formData.append("file", file);

      try {
        await axios.post(`${API_BASE_URL}/student/status/upload-image`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } catch (err) {
        console.error(err);
        alert("이미지 업로드 중 오류 발생");
      }
    };

    // 화면 렌더링용 변수
    const displayedImage = previewURL || statusRecords.studentImage || null;

    return (
      <Container>
        <h2>학생 기본 정보</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
          <colgroup><col style={{ width: '25%' }} /><col style={{ width: '75%' }} /></colgroup>
          <tbody>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>아이디</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.userid}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>학번</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.userCode}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>이름</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.name}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>이메일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.email}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>전화번호</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.phone}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>생년월일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.birthDate}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>성별</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.gender}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>소속학과</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.major || ''}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>사용자 유형</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{userTypeMap[studentInfo.type] || studentInfo.type}</td></tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '3rem' }}>
          <h2 style={{ margin: 0 }}>학적 상태</h2>
          <Button variant="primary" size="sm" onClick={handleGoChangeStatus} style={{ marginLeft: 12 }}>
            학적 변경 신청
          </Button>
        </div>

        <h4 style={{ marginTop: '1.5rem' }}>증명사진</h4>
        <div
          onClick={() => document.getElementById("studentImageInput").click()}
          style={{
            width: '105px',
            height: '135px',
            border: '1px solid #bbb',
            borderRadius: '4px',
            overflow: 'hidden',
            cursor: 'pointer',
            backgroundColor: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          {displayedImage ? (
            <img src={displayedImage} alt="증명사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '12px', color: '#888' }}>클릭하여 등록</span>
          )}
        </div>

        <input
          id="studentImageInput"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />

        <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '1rem', tableLayout: 'fixed' }}>
          <tbody>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>학적 상태 ID</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.statusid}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>학적상태</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentStatusMap[statusRecords.studentStatus]}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>입학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.admissionDate}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>휴학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.leaveDate || '-'}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>복학일</th><td style={{ border: '1px solid #ddd' }}>{statusRecords.returnDate || '-'}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>졸업일</th><td style={{ border: '1px solid #ddd' }}>{statusRecords.graduationDate || '-'}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>유급일</th><td style={{ border: '1px solid #ddd' }}>{statusRecords.retentionDate || '-'}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>퇴학일</th><td style={{ border: '1px solid #ddd' }}>{statusRecords.expelledDate || '-'}</td></tr>
            <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>전공 학점</th><td style={{ border: '1px solid #ddd' }}>{statusRecords.majorCredit}</td></tr>
            <tr><th style={{ border: '1px solid #ddd' }}>교양 학점</th><td style={{ border: '1px solid #ddd' }}>{statusRecords.generalCredit}</td></tr>
            <tr><th style={{ border: '1px solid #ddd' }}>총 학점</th><td style={{ border: '1px solid #ddd' }}>{statusRecords.totalCredit}</td></tr>
            <tr><th style={{ border: '1px solid #ddd' }}>이번 학기 학점</th><td style={{ border: '1px solid #ddd' }}>{statusRecords.currentCredit}</td></tr>
          </tbody>
        </table>
      </Container>
    );
  }
}

export default App;
