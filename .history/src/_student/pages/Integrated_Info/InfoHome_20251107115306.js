import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, Container, Form  } from 'react-bootstrap';
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
          onClick={handleGoChangeStatus}   // 여기에서 참조
          style={{ marginLeft: 12 }}
        >
          학적 변경 신청
        </Button>
      </div>

      <table style={{ borderCollapse: 'collapse', marginBottom: '1rem', width: 'auto' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '105px', height: '135px' }}>
              {statusRecords.studentImage
                ? <img
                  src={statusRecords.studentImage}
                  alt="증명사진"
                  style={{ width: '105px', height: '135px', objectFit: 'cover', display: 'block' }}
                />
                : '-'}
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '1rem', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '25%' }} />
          <col style={{ width: '75%' }} />
        </colgroup>
        <tbody>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>학적 상태 ID</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.statusid}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>학적상태</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentStatusMap[statusRecords.studentStatus] || statusRecords.studentStatus}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>입학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.admissionDate}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>휴학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.leaveDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>복학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.returnDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>졸업일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.graduationDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>유급일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.retentionDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>퇴학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.expelledDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>전공 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.majorCredit}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>교양 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.generalCredit}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>총 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.totalCredit}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>이번 학기 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.currentCredit}</td></tr>
        </tbody>
      </table>
    </Container>
  );
}

export default App;