import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Tabs,
  Tab,
  Form,
  Button,
  Modal,
} from "react-bootstrap";
import { useAuth } from "../../../public/context/UserContext";
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

export default function StudentDetailPage() {
  const { user } = useAuth();

  const [student, setStudent] = useState({
    userCode: "",
    name: "",
    birthDate: "",
    gender: "",
    email: "",
    phone: "",
    college: { id: null, office: "", type: "" },
    major: { id: null, name: "", office: "", collegeId: null },
    admissionDate: "",
    totalCredit: 0,
    majorCredit: 0,
    generalCredit: 0,
    lectureGrade: 0,
    studentRecordList: [],
    gradeInfoList: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 0,
    },
  });

  // -------------------------------
  // 📌 사진 업로드 관련 상태
  // -------------------------------
  const [previewURL, setPreviewURL] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // -------------------------------
  // 📌 파일 업로드 실행 함수
  // -------------------------------
  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/student/status/upload-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const uploadedImagePath = response.data.startsWith("http")
        ? response.data
        : `${API_BASE_URL}${response.data}`;

      setPreviewURL(uploadedImagePath);
    } catch (err) {
      console.error(err);
      alert("이미지 업로드 중 오류 발생");
    }
  };

  const [yearStart, setYearStart] = useState(0);
  const [page, setPage] = useState({ year: "2025", semester: "" });

  const [open, setOpen] = useState(false);
  const [modalId, setModalId] = useState(null);
  const [modalLec, setModalLec] = useState({});

  const typeMapDay = {
    MONDAY: "월",
    TUESDAY: "화",
    WEDNESDAY: "수",
    THURSDAY: "목",
    FRIDAY: "금",
  };
  const typeMapStart = {
    "9:00": "1교시",
    "10:00": "2교시",
    "11:00": "3교시",
    "12:00": "4교시",
    "13:00": "5교시",
    "14:00": "6교시",
    "15:00": "7교시",
    "16:00": "8교시",
    "17:00": "9교시",
  };
  const typeMapEnd = {
    "10:00": "1교시",
    "11:00": "2교시",
    "12:00": "3교시",
    "13:00": "4교시",
    "14:00": "5교시",
    "15:00": "6교시",
    "16:00": "7교시",
    "17:00": "8교시",
    "18:00": "9교시",
  };

  const downloadClick = (id) => {
    const url = `${API_BASE_URL}/attachment/download/${id}`;
    axios
      .get(url, { responseType: "blob" })
      .then((response) => {
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

  const years = useMemo(() => {
    const end = new Date().getFullYear() + 1;
    return Array.from({ length: end - yearStart + 1 }, (_, i) => yearStart + i);
  }, [yearStart]);

  useEffect(() => {
    if (!user?.id) return;
    const id = user.id;

    axios
      .get(`${API_BASE_URL}/user/detailAll/${id}`, {
        params: { year: page.year, semester: page.semester },
      })
      .then((res) => {
        setStudent(res.data);

        const admission = res.data.admissionDate;
        const sliceYear = String(admission).slice(0, 4);
        setYearStart(Number(sliceYear));

        // 기존 저장된 사진 URL 있을 경우 가져오기
        if (res.data.imagePath) {
          setPreviewURL(`${API_BASE_URL}${res.data.imagePath}`);
        }
      })
      .catch((error) => {
        console.error("status:", error.response?.status);
        console.error("data:", error.response?.data);
      });
  }, [page.semester, page.year, user?.id]);

  useEffect(() => {
    if (!modalId) return;

    axios
      .get(`${API_BASE_URL}/lecture/info`, {
        params: { modalId: Number(modalId) },
      })
      .then((res) => setModalLec(res.data))
      .catch((err) => {
        console.error(err.response?.data);
        alert("오류");
      });
  }, [modalId]);

  const typeMap = {
    PENDING: "처리중",
    APPROVED: "완료",
    REJECTED: "거부",
    INPROGRESS: "개강",
    COMPLETED: "종강",
  };

  const typeMap2 = {
    ENROLLED: "재학",
    ON_LEAVE: "휴학",
    REINSTATED: "복학",
    EXPELLED: "퇴학",
    GRADUATED: "졸업",
    MILITARY_LEAVE: "군 휴학",
    MEDICAL_LEAVE: "질병",
  };

  const typeMap3 = {
    PENDING: "대기",
    APPROVED: "신청중",
    REJECTED: "거부",
    INPROGRESS: "개강",
    COMPLETED: "종강",
  };

  return (
    <>
      <Container className="py-4">
        {/* ====== 학생 기본 정보 ====== */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">학생 기본 정보</h5>
          </Card.Header>

          <Card.Body>
            <Table bordered className="mb-0 align-middle">
              <tbody>
                <tr>
                  <td
                    rowSpan={8}
                    className="text-center align-top"
                    style={{ width: "180px" }}
                  >
                    {/* ===========================
                        📌 사진 업로드 UI 적용됨
                       =========================== */}
                    <div
                      className="border bg-light d-inline-flex align-items-center justify-content-center position-relative"
                      style={{
                        width: 140,
                        height: 180,
                        cursor: "pointer",
                        overflow: "hidden",
                      }}
                      onClick={() => document.getElementById("studentFile").click()}
                    >
                      {previewURL ? (
                        <img
                          src={previewURL}
                          alt="student"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span className="text-muted small">사진 등록</span>
                      )}

                      <input
                        id="studentFile"
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleFileInputChange}
                      />
                    </div>
                  </td>

                  <th className="bg-light">학번</th>
                  <td>{student.userCode}</td>
                </tr>

                <tr>
                  <th className="bg-light">이름</th>
                  <td>{student.name}</td>
                </tr>

                <tr>
                  <th className="bg-light">생년월일</th>
                  <td>{student.birthDate}</td>
                </tr>

                <tr>
                  <th className="bg-light">성별</th>
                  <td>{student.gender}</td>
                </tr>

                <tr>
                  <th className="bg-light">이메일</th>
                  <td>{student.email}</td>
                </tr>

                <tr>
                  <th className="bg-light">전화번호</th>
                  <td>{student.phone}</td>
                </tr>

                <tr>
                  <th className="bg-light">소속 대학</th>
                  <td>{student.college.type}</td>
                </tr>

                <tr>
                  <th className="bg-light">소속 학과</th>
                  <td>{student.major.name}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* ====== 하단 탭 영역 ====== */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">학생 정보</h5>
          </Card.Header>
          <Card.Body>
            <Tabs defaultActiveKey="status" id="student-detail-tabs">
              <Tab eventKey="status" title="학적">
                <div className="pt-3">
                  <Table bordered className="mb-0">
                    <tbody>
                      <tr>
                        <th className="bg-light" style={{ width: "20%" }}>
                          입학일
                        </th>
                        <td>{student.admissionDate}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">전공학점</th>
                        <td>{student.majorCredit}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">교양학점</th>
                        <td>{student.generalCredit}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">총 이수학점</th>
                        <td>{student.totalCredit}</td>
                      </tr>
                      <tr>
                        <th className="bg-light">총 학점</th>
                        <td>{student.lectureGrade}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Tab>

              <Tab eventKey="history" title="학적변경이력">
                <div className="pt-3">
                  <Table bordered hover size="sm" className="mb-0 align-middle" responsive>
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "10%" }}>신청번호</th>
                        <th style={{ width: "35%" }}>신청사유</th>
                        <th style={{ width: "15%" }}>신청일</th>
                        <th style={{ width: "15%" }}>처리일</th>
                        <th style={{ width: "15%" }}>처리상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.studentRecordList.map((record) => (
                        <tr key={record.id}>
                          <td>{record.id}</td>
                          <td>{typeMap2[record.applyStatus]}</td>
                          <td>{record.appliedDate}</td>
                          <td>{record.processedDate || "-"}</td>
                          <td>{typeMap[record.status]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Tab>

              <Tab eventKey="grades" title="성적">
                <div className="pt-3">
                  {/* 학기 콤보박스 */}
                  <Row className="mb-3 g-2 align-items-center">
                    <Col xs={12} md={3}>
                      <Form.Select
                        aria-label="년도"
                        size="sm"
                        className="w-100"
                        style={{ minWidth: 120 }}
                        onChange={(e) => {
                          setPage((pre) => ({ ...pre, year: e.target.value }));
                        }}
                      >
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>

                    <Col xs={12} md={3}>
                      <Form.Select
                        id="filterSemester"
                        aria-label="학기"
                        size="sm"
                        className="w-100"
                        style={{ minWidth: 120 }}
                        value={page.semester}
                        onChange={(e) => {
                          setPage((pre) => ({ ...pre, semester: e.target.value }));
                        }}
                      >
                        <option value="">학기</option>
                        <option value="3">1학기</option>
                        <option value="9">2학기</option>
                        <option value="6">여름 계절</option>
                        <option value="12">겨울 계절</option>
                      </Form.Select>
                    </Col>
                  </Row>

                  <Table bordered hover size="sm" className="mb-0 align-middle" responsive>
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "10%" }}>개설일</th>
                        <th style={{ width: "20%" }}>강의명</th>
                        <th style={{ width: "8%" }}>출결</th>
                        <th style={{ width: "8%" }}>과제</th>
                        <th style={{ width: "8%" }}>중간</th>
                        <th style={{ width: "8%" }}>기말</th>
                        <th style={{ width: "10%" }}>총학점</th>
                        <th style={{ width: "8%" }}>상태</th>
                        <th style={{ width: "8%" }}>상세</th>
                        <th style={{ width: "8%" }}>기능</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.gradeInfoList.content.map((grade) => (
                        <tr key={grade.lecId}>
                          <td>{grade.startDate}</td>
                          <td>{grade.name}</td>
                          <td>{grade.ascore}</td>
                          <td>{grade.asScore}</td>
                          <td>{grade.tscore}</td>
                          <td>{grade.ftScore}</td>
                          <td>{grade.totalScore}</td>
                          <td>{typeMap3[grade.status]}</td>
                          <td className="text-center">
                            <Button
                              size="sm"
                              variant="outline-dark"
                              onClick={() => {
                                setModalId(grade.lecId);
                                setOpen(true);
                              }}
                            >
                              상세
                            </Button>
                          </td>
                          <td>-</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>

      <Modal
        show={open}
        onHide={() => setOpen(false)}
        centered
        backdrop="static"
        aria-labelledby="lecture-detail-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="lecture-detail-title" className="fs-5">
            {modalLec.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* 상세 시간표 */}
          <div className="mb-3">
            <div className="text-muted small mb-2">상세 시간표</div>
            <div className="table-responsive">
              <Table size="sm" bordered hover className="align-middle mb-0" style={{ fontSize: "0.9rem" }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "6rem" }} className="text-center">요일</th>
                    <th style={{ width: "7rem" }} className="text-center">시작</th>
                    <th style={{ width: "7rem" }} className="text-center">종료</th>
                    <th>시간</th>
                  </tr>
                </thead>
                <tbody>
                  {(modalLec?.lectureSchedules ?? []).map((s, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{typeMapDay[s.day] ?? s.day}</td>
                      <td className="text-center">{typeMapStart[s.startTime] ?? s.startTime}</td>
                      <td className="text-center">{typeMapEnd[s.endTime] ?? s.endTime}</td>
                      <td className="text-nowrap">{s.startTime}~{s.endTime}</td>
                    </tr>
                  ))}
                  {(modalLec?.lectureSchedules ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">시간표 없음</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>

          {/* 강의 설명 */}
          <div className="mb-3">
            <div className="text-muted small mb-2">강의설명</div>
            <div className="border rounded p-3 bg-body-tertiary" style={{ whiteSpace: "pre-wrap" }}>
              {modalLec.description}
            </div>
          </div>

          {/* 점수 산출 비율 */}
          <div className="mb-3">
            <div className="text-muted small mb-2">점수 산출 비율</div>
            <div className="table-responsive">
              <Table size="sm" bordered hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>출결</th>
                    <th>과제</th>
                    <th>중간</th>
                    <th>기말</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{modalLec.ascore ?? "-"}</td>
                    <td>{modalLec.asScore ?? "-"}</td>
                    <td>{modalLec.tscore ?? "-"}</td>
                    <td>{modalLec.ftScore ?? "-"}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>닫기</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
