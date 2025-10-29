import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext'; // 임포트 경로를 실제에 맞게 조정하세요
import { API_BASE_URL } from "../../../public/config/config";

function App() {
  // 학생 기본 정보 상태
  const [studentInfo, setStudentInfo] = useState({
    userid: null,
    userCode: null,
    name: '',
    password: '',
    birthDate: '',
    email: '',
    phone: '',
    gender: '',
    major: null,
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
    totalCredit: 0,
    currentCredit: 0.0,
    studentImage: '',
  });

  // 에러 및 로딩 상태
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 인증 상태 및 네비게이트 훅
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // user 객체가 아직 세팅 안됐거나 null일 때 처리
    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/'); // 로그인 페이지 경로로 이동 - 실제 로그인 경로로 바꿔주세요
      return;
    }

    // user.roles가 배열인지 확인하여 권한 체크 안전하게 처리
    if (!Array.isArray(user.roles)) {
      alert('사용자 권한 정보를 불러오는데 문제가 발생했습니다.');
      navigate('/'); // 권한 정보 없으면 로그인 페이지로 이동
      return;
    }

    // STUDENT 권한이 없으면 권한 경고 및 다른 페이지로 이동
    if (!user.roles.includes("STUDENT")) {
      alert('학생 권한이 필요합니다.');
      navigate('/Unauthorizedpage');
      return;
    }

   

    // 권한 검사 통과하면 학생정보 API 호출 함수
    const fetchStudentInfo = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/user/api/student/info`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` }
        });

        if (response.data.type === 'STUDENT') {
          setStudentInfo(response.data.studentInfo);
          setStatusRecords(response.data.statusRecords);
          setError(null);
        } else {
          setStudentInfo(null);
          setStatusRecords(null);
          setError('학생 정보만 조회할 수 있습니다.');
        }
      } catch (e) {
        console.error(e);
        if (e.response && e.response.status === 401) {
          alert('로그인이 필요한 서비스입니다.');
          navigate('/');
        } else {
          alert('데이터 불러오는 중 오류가 발생했습니다.');
          navigate(-1);
        }
        setError('데이터 불러오기에 실패했습니다.');
        setStudentInfo(null);
        setStatusRecords(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentInfo();

  }, [user, navigate]);

  if (loading) {
    return (
      <Container><div>Loading...</div></Container>
    );
  }

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
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>소속학과</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.major?.name || ''}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f9f9f9' }}>사용자 유형</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.type}</td></tr>
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
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>학적 상태</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.studentStatus}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>입학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.admissionDate}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>휴학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.leaveDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>복학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.returnDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>졸업일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.graduationDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>유급일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.retentionDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>퇴학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.expelledDate || '-'}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>총 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.totalCredit}</td></tr>
          <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>이번 학기 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.currentCredit}</td></tr>
        </tbody>
      </table>
    </Container>
  );
}

export default StudentInfo;