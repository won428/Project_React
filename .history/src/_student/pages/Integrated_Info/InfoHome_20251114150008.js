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
  // 📌 사진 업로드 관련 상태 추가
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
    "16:00": "8교시",
    "17:00": "9교시",
    "18:00": "10교시",
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
                        📌 여기 사진 업로드 UI 적용됨
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

