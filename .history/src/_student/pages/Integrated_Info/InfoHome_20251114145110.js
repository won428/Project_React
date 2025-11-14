import {
  Container,
  Card,
  Table,
  Row,
  Col,
  Form,
  Button,
} from "react-bootstrap";
import { useAuth } from "../../../public/context/UserContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../public/config/config";
import { useNavigate } from "react-router-dom";

export default function StudentInfoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [studentInfo, setStudentInfo] = useState({
    userid: null,
    userCode: "",
    name: "",
    password: "",
    birthDate: "",
    email: "",
    phone: "",
    gender: "",
    major: "",
    type: "",
  });

  const [statusRecords, setStatusRecords] = useState({
    statusid: null,
    studentStatus: "ENROLLED",
    admissionDate: "",
    leaveDate: "",
    returnDate: "",
    graduationDate: "",
    retentionDate: "",
    expelledDate: "",
    majorCredit: 0,
    generalCredit: 0.0,
    totalCredit: 0.0,
    currentCredit: 0.0,
    studentImage: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [error, setError] = useState(null);

  const studentStatusMap = {
    ENROLLED: "재학중",
    ON_LEAVE: "휴학",
    REINSTATED: "복학",
    GRADUATED: "졸업",
    EXPELLED: "퇴학",
  };

  useEffect(() => {
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/");
      return;
    }

    axios
      .get(`${API_BASE_URL}/student/info`, {
        params: { userId: user?.id },
      })
      .then((res) => {
        if (res.data.type === "STUDENT") {
          setStudentInfo(res.data.studentInfo);

          const updatedStatusRecords = { ...res.data.statusRecords };
          if (updatedStatusRecords.studentImage) {
            updatedStatusRecords.studentImage =
              updatedStatusRecords.studentImage.startsWith("http")
                ? updatedStatusRecords.studentImage
                : `${API_BASE_URL}${updatedStatusRecords.studentImage}`;
          }

          setStatusRecords(updatedStatusRecords);
          setPreviewURL(updatedStatusRecords.studentImage);
          setError(null);
        } else {
          setError("학생 정보만 조회할 수 있습니다.");
        }
      })
      .catch(() => {
        setError("데이터 불러오기에 실패했습니다.");
      });
  }, [user]);

  if (error)
    return (
      <Container className="mt-4">
        <Card className="p-4 text-danger fw-bold">{error}</Card>
      </Container>
    );

  const handleGoChangeStatus = () => {
    if (!studentInfo?.userid) {
      alert("학생 ID를 찾을 수 없습니다.");
      return;
    }
    navigate("/Change_Status");
  };

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const formData = new FormData();
    formData.append("userId", studentInfo.userid);
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/student/status/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const uploadedURL = response.data.startsWith("http")
        ? response.data
        : `${API_BASE_URL}${response.data}`;

      setPreviewURL(uploadedURL);
    } catch {
      alert("이미지 업로드 중 오류 발생");
    }
  };

  const displayedImage =
    previewURL || statusRecords.studentImage || null;

  return (
    <Container className="py-4">
      {/* ===== 카드 영역 ===== */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">학생 기본 정보</h5>
        </Card.Header>

        <Card.Body>
          <Table bordered className="align-middle">
            <tbody>
              <tr>
                <td
                  rowSpan={8}
                  className="text-center align-top"
                  style={{ width: "180px" }}
                >
                  <div
                    className="border bg-light d-inline-flex align-items-center justify-content-center"
                    style={{ width: 140, height: 180 }}
                  >
                    {displayedImage ? (
                      <img
                        src={displayedImage}
                        alt="학생 사진"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span className="text-muted small">사진 없음</span>
                    )}
                  </div>

                  {/* 파일 업로드 */}
                  <Form.Group controlId="formFile" className="mt-3">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      size="sm"
                      onChange={handleFileInputChange}
                    />
                  </Form.Group>
                </td>

                <th className="bg-light" style={{ width: "15%" }}>
                  학번
                </th>
                <td>{studentInfo.userCode}</td>
              </tr>

              <tr>
                <th className="bg-light">이름</th>
                <td>{studentInfo.name}</td>
              </tr>

              <tr>
                <th className="bg-light">이메일</th>
                <td>{studentInfo.email}</td>
              </tr>

              <tr>
                <th className="bg-light">전화번호</th>
                <td>{studentInfo.phone}</td>
              </tr>

              <tr>
                <th className="bg-light">생년월일</th>
                <td>{studentInfo.birthDate}</td>
              </tr>

              <tr>
                <th className="bg-light">성별</th>
                <td>{studentInfo.gender}</td>
              </tr>

              <tr>
                <th className="bg-light">학과</th>
                <td>{studentInfo.major}</td>
              </tr>

              <tr>
                <th className="bg-light">학적 상태</th>
                <td>{studentStatusMap[statusRecords.studentStatus]}</td>
              </tr>
            </tbody>
          </Table>

          {/* 학적 변경 버튼 */}
          <div className="text-end mt-3">
            <Button variant="dark" onClick={handleGoChangeStatus}>
              학적 변경 신청
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
