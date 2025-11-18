import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../public/context/UserContext";
import { API_BASE_URL } from "../../public/config/config";

import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  ListGroup,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

const getCompletionDivLabel = (code) => {
  if (!code) return "-";
  const map = {
    MAJOR_REQUIRED: "전공필수",
    MAJOR_ELECTIVE: "전공선택",
    LIBERAL_REQUIRED: "교양필수",
    LIBERAL_ELECTIVE: "교양선택",
  };
  return map[code] || code;
};

// 상태 한글 + 뱃지 색
const getStatusInfo = (status) => {
  if (!status) return { label: "-", variant: "secondary" };
  const map = {
    PENDING: { label: "승인대기", variant: "warning" },
    APPROVED: { label: "승인완료", variant: "success" },
    INPROGRESS: { label: "진행중", variant: "primary" },
    COMPLETED: { label: "종료", variant: "secondary" },
    REJECTED: { label: "반려", variant: "danger" },
  };
  return map[status] || { label: status, variant: "secondary" };
};

// 요일 한글 변환
const getDayLabel = (day) => {
  if (!day) return "-";
  const map = {
    MONDAY: "월요일",
    TUESDAY: "화요일",
    WEDNESDAY: "수요일",
    THURSDAY: "목요일",
    FRIDAY: "금요일",
    SATURDAY: "토요일",
    SUNDAY: "일요일",
  };
  return map[day] || day;
};

function App() {
  const { id } = useParams(); // /lecture/detail/:id
  const navigate = useNavigate();

  // 요청한 변수명 유지
  const [lecture, setLecture] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [percent, setPercent] = useState(null);
  const [college, setCollege] = useState(null);
  const [major, setMajor] = useState(null);
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const url = `${API_BASE_URL}/lecture/findOne/${id}`;
    axios
      .get(url)
      .then((response) => {
        console.log(response.data);

        setSchedule(response.data.lectureSchedules || []);
        setLecture(response.data);
        setPercent(response.data.weightsDto || null);
        setCollege(response.data.college);
        setMajor(response.data.major);
        setFiles(response.data.attachmentDtos || []);
      })
      .catch((error) => {
        console.error("status:", error.response?.status);
        console.error("data:", error.response?.data);
        setError("강의 정보를 불러오지 못했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const downloadClick = (id) => {
    const url = `${API_BASE_URL}/attachment/download/${id}`;
    axios
      .get(url, { responseType: "blob" })
      .then((response) => {
        console.log(response.headers);
        const cd = response.headers["content-disposition"] || "";
        const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cd)?.[1];
        const quoted = /filename="([^"]+)"/i.exec(cd)?.[1];
        const filename =
          (utf8 && decodeURIComponent(utf8)) || quoted || `file-${id}`;

        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => {
        console.error(err.response?.data);
        alert("오류");
      });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" role="status" className="me-2" />
        <span>강의 정보를 불러오는 중입니다...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          뒤로가기
        </Button>
      </Container>
    );
  }

  if (!lecture) {
    return (
      <Container className="py-4">
        <Alert variant="warning">강의 정보가 없습니다.</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          뒤로가기
        </Button>
      </Container>
    );
  }

  const { label: statusLabel, variant: statusVariant } = getStatusInfo(
    lecture.status
  );

return (
  // flex 빼고, 높이만 살짝 유지하고 싶으면 min-vh-100 정도만 남겨도 됨
  <Container className="py-4 min-vh-100">
    <Card className="shadow-sm">
      <Card.Body>
        {/* 헤더 영역 */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <Card.Title className="h4 mb-1">{lecture.name}</Card.Title>
            <div className="text-muted small">
              {lecture.majorName} · {lecture.level}학년 · {lecture.credit}학점
            </div>
            <div className="text-muted small">
              담당 교수: <strong>{lecture.userName}</strong> (교수 ID:{" "}
              {lecture.user})
            </div>
          </div>
          <div className="text-end">
            <div className="mb-1">
              <Badge bg="info" pill className="me-1">
                {getCompletionDivLabel(lecture.completionDiv)}
              </Badge>
              <Badge bg={statusVariant} pill>
                {statusLabel}
              </Badge>
            </div>
            <div className="small text-muted">
              수강인원: {lecture.nowStudent} / {lecture.totalStudent}명
            </div>
            <div className="small text-muted">강의 ID: {lecture.id}</div>
          </div>
        </div>

        <hr />

        {/* 기본 정보 */}
        <Row className="mb-3">
          <Col md={6}>
            <h6 className="fw-bold mb-2">기본 정보</h6>
            <dl className="row mb-0 small">
              <dt className="col-4 text-muted">개설 대학 코드</dt>
              <dd className="col-8">{college ?? "-"}</dd>

              <dt className="col-4 text-muted">전공 코드</dt>
              <dd className="col-8">{major ?? "-"}</dd>

              <dt className="col-4 text-muted">강의 기간</dt>
              <dd className="col-8">
                {lecture.startDate} ~ {lecture.endDate}
              </dd>

              <dt className="col-4 text-muted">상태</dt>
              <dd className="col-8">{statusLabel}</dd>
            </dl>
          </Col>

          {/* 평가 비율 */}
          <Col md={6}>
            <h6 className="fw-bold mb-2">성적 평가 비율</h6>
            {percent ? (
              <Table striped bordered size="sm" className="mb-0 small">
                <thead className="table-light">
                  <tr className="text-center">
                    <th>출석</th>
                    <th>과제</th>
                    <th>중간고사</th>
                    <th>기말고사</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center">
                    <td>{percent.attendanceScore}%</td>
                    <td>{percent.assignmentScore}%</td>
                    <td>{percent.midtermExam}%</td>
                    <td>{percent.finalExam}%</td>
                  </tr>
                </tbody>
              </Table>
            ) : (
              <div className="text-muted small">
                등록된 평가 비율 정보가 없습니다.
              </div>
            )}
          </Col>
        </Row>

        {/* 시간표 */}
        <Row className="mb-3">
          <Col>
            <h6 className="fw-bold mb-2">강의 시간표</h6>
            {schedule && schedule.length > 0 ? (
              <Table striped bordered hover size="sm" className="small">
                <thead className="table-light">
                  <tr className="text-center">
                    <th style={{ width: "20%" }}>요일</th>
                    <th style={{ width: "40%" }}>시간</th>
                    <th style={{ width: "40%" }}>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item) => (
                    <tr key={item.id} className="text-center">
                      <td>{getDayLabel(item.day || item.dayOfWeek)}</td>
                      <td>
                        {item.startTime} ~ {item.endTime}
                      </td>
                      <td>-</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-muted small">
                등록된 시간표가 없습니다.
              </div>
            )}
          </Col>
        </Row>

        {/* 강의 설명 */}
        <Row className="mb-3">
          <Col>
            <h6 className="fw-bold mb-2">강의 소개</h6>
            <Card className="border-0 bg-light">
              <Card.Body className="small">
                {lecture.description && lecture.description.trim() !== ""
                  ? lecture.description
                  : "등록된 강의 소개가 없습니다."}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* 첨부파일 */}
        <Row className="mb-3">
          <Col>
            <h6 className="fw-bold mb-2">첨부파일</h6>
            {files && files.length > 0 ? (
              <ListGroup className="small">
                {files.map((file, index) => (
                  <ListGroup.Item
                    key={file.id || index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>
                      {file.originalName ||
                        file.name ||
                        `첨부파일 ${index + 1}`}
                    </span>

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => downloadClick(file.id)}
                    >
                      다운로드
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-muted small">첨부파일이 없습니다.</div>
            )}
          </Col>
        </Row>

        {/* 목록 버튼 – 줄/고정 높이 없이 바로 아래에 위치 */}
        <div className="d-flex justify-content-end mt-3">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate(-1)}
          >
            목록
          </Button>
        </div>
      </Card.Body>
    </Card>
  </Container>
);
}

export default App;
