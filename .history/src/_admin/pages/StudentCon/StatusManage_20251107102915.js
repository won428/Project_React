import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from "../../../public/config/config";

// 학적 상태 선택 옵션
const statusOptions = [
  { value: 'ENROLLED', label: '재학' },
  { value: 'ON_LEAVE', label: '휴학' },
  { value: 'REINSTATED', label: '복학' },
  { value: 'EXPELLED', label: '퇴학' },
  { value: 'GRADUATED', label: '졸업' },
];

// 사용자 유형 한글 매핑
const userTypeMap = {
  STUDENT: '학생',
  PROFESSOR: '교수',
  ADMIN: '관리자'
};

function StatusManage() {

  const [studentInfo, setStudentInfo] = useState(null);
  const [statusRecords, setStatusRecords] = useState(null);
  const [lectures, setLectures] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();

  // 학점 계산 함수
  const calculateCredits = () => {
    if (!lectures.length) return;

    const avg = (arr) =>
      arr.length ? arr.reduce((sum, l) => sum + l.score, 0) / arr.length : 0;

    const majorAvg = avg(lectures.filter(l => l.completionDiv.startsWith("MAJOR")));
    const liberalAvg = avg(lectures.filter(l => l.completionDiv.startsWith("LIBERAL")));
    const totalAvg = avg(lectures);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentSemester = now.getMonth() < 7 ? 1 : 2;

    const semesterAvg = avg(
      lectures.filter(l =>
        new Date(l.startDate).getFullYear() === currentYear &&
        l.semester === currentSemester
      )
    );

    setStatusRecords(prev => ({
      ...prev,
      majorCredit: majorAvg,
      generalCredit: liberalAvg,
      totalCredit: totalAvg,
      currentCredit: semesterAvg
    }));
  };

  // 최초 로딩 시 학생 정보 조회
  useEffect(() => {
    if (!user) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/');
      return;
    }

    axios.get(`${API_BASE_URL}/api/student/${user.id}`)
      .then(res => {
        setStudentInfo(res.data.studentInfo);
        setStatusRecords(res.data.statusRecords);
        setLectures(res.data.lectures || []);
      })
      .catch(() => alert("데이터 조회 실패"));
  }, [user, navigate]);

  // 성적 변경될 경우 학점 재계산
  useEffect(() => calculateCredits(), [lectures]);

  // 저장 처리 (관리자 수정 가능)
  const handleSaveStatus = () => {
    axios.put(`${API_BASE_URL}/api/student/${user.id}/status`, statusRecords)
      .then(() => alert("학적 상태가 저장되었습니다."))
      .catch(() => alert("저장 실패"));
  };

  if (!studentInfo || !statusRecords) return <div>⏳ 불러오는 중...</div>;

  return (
    <Container style={{ marginTop: '1rem' }}>
      <h2>학생 기본 정보</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
        <tbody>
          <tr><th>학번</th><td>{studentInfo.userCode}</td></tr>
          <tr><th>이름</th><td>{studentInfo.name}</td></tr>
          <tr><th>이메일</th><td>{studentInfo.email}</td></tr>
          <tr><th>전화번호</th><td>{studentInfo.phone}</td></tr>
          <tr><th>성별</th><td>{studentInfo.gender}</td></tr>
          <tr><th>소속학과</th><td>{studentInfo.major}</td></tr>
          <tr><th>유형</th><td>{userTypeMap[studentInfo.type]}</td></tr>
        </tbody>
      </table>

      <h2 style={{ marginTop: '2rem' }}>학적 상태 관리</h2>
      <Form>
        <Form.Group className="mb-2">
          <Form.Label>학적 상태</Form.Label>
          <Form.Select
            value={statusRecords.studentStatus}
            onChange={(e) =>
              setStatusRecords(prev => ({ ...prev, studentStatus: e.target.value }))
            }
          >
            {statusOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Form.Select>
        </Form.Group>

        {['admissionDate', 'leaveDate', 'returnDate', 'graduationDate', 'retentionDate', 'expelledDate'].map(field => (
          <Form.Group className="mb-2" key={field}>
            <Form.Label>{field}</Form.Label>
            <Form.Control
              type="date"
              value={statusRecords[field] || ''}
              onChange={(e) => setStatusRecords(prev => ({ ...prev, [field]: e.target.value }))}
            />
          </Form.Group>
        ))}

        <Button onClick={handleSaveStatus} variant="primary">학적 상태 저장</Button>
      </Form>

      <h2 style={{ marginTop: '2rem' }}>학점 정보</h2>
      <table style={{ borderCollapse: 'collapse', width: '50%' }}>
        <tbody>
          <tr><th>전공 평균</th><td>{statusRecords.majorCredit.toFixed(2)}</td></tr>
          <tr><th>교양 평균</th><td>{statusRecords.generalCredit.toFixed(2)}</td></tr>
          <tr><th>전체 평균</th><td>{statusRecords.totalCredit.toFixed(2)}</td></tr>
          <tr><th>이번 학기 평균</th><td>{statusRecords.currentCredit.toFixed(2)}</td></tr>
        </tbody>
      </table>

      {statusRecords.studentImage && (
        <div style={{ marginTop: '2rem' }}>
          <img
            src={statusRecords.studentImage}
            alt="증명사진"
            style={{ width: '105px', height: '135px', objectFit: 'cover' }}
          />
        </div>
      )}
    </Container>
  );
}

export default StatusManage;
