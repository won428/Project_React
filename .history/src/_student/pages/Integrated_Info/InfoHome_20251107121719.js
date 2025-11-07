import { Form, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext'; // 임포트 경로를 실제에 맞게 조정하세요
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

  // 사용자 유형 한글 맵핑
  const userTypeMap = {
    STUDENT: '학생',
    PROFESSOR: '교수',
    ADMIN: '관리자'
  };

  // 학적 상태 한글 맵핑
  const studentStatusMap = {
    ENROLLED: '재학중',
    ON_LEAVE: '휴학',
    REINSTATED: '복학',
    GRADUATED: '졸업',
    EXPELLED: '퇴학'
  };

  // ✅ 이미지 업로드 상태
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);

  // 에러 및 로딩 상태
  const [error, setError] = useState(null);

  // 인증 상태 및 네비게이트 훅
  const { user } = useAuth();
  const navigate = useNavigate();

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
      })

  }, [user, navigate]);

  if (error) {
    return (
      <Container><div style={{ color: 'red' }}>{error}</div></Container>
    );
  }

  // 1) 버튼 핸들러 추가
  const handleGoChangeStatus = () => {
    console.log('navigate userId', studentInfo?.userid);
    if (!studentInfo?.userid) {
      alert('학생 ID를 찾을 수 없습니다. 내 정보 페이지를 새로고침 후 다시 시도하세요.');
      return;
    }
    navigate('/Change_Status', { state: { userId: studentInfo.userid } });
  };

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


  // 기존 디자인 유지하며 화면 렌더링
  return (
    <Container>
      <h2>학생 기본 정보</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '25%' }} />
          <col style={{ width: '75%' }} />
        </colgroup>
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
        <Button
          variant="primary"
          size="sm"
          onClick={handleGoChangeStatus}
          style={{ marginLeft: 12 }}
        >
          학적 변경 신청
        </Button>
      </div>

      {/* ✅ 증명사진 업로드 & 미리보기 UI 삽입 */}
      <h4 style={{ marginTop: '1.5rem' }}>증명사진 업로드</h4>

      <Form.Group className="mb-3">
        <Form.Label>이미지 선택</Form.Label>
        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
      </Form.Group>

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

      {/* ✅ 학적 정보 테이블 기존 유지 */}
      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '1rem', tableLayout: 'fixed' }}>
        <tbody>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>학적 상태 ID</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.statusid}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>학적상태</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentStatusMap[statusRecords.studentStatus]}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>입학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.admissionDate}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>휴학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.leaveDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>복학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.returnDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>졸업일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.graduationDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>유급일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.retentionDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>퇴학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.expelledDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>전공 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.majorCredit}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>교양 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.generalCredit}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>총 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.totalCredit}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px' }}>이번 학기 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.currentCredit}</td></tr>
        </tbody>
      </table>
    </Container>
  );
}

export default App;