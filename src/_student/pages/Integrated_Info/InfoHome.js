import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Tabs,
  Tab,
  Form,
} from "react-bootstrap";
import { useAuth } from "../../../public/context/UserContext";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { type } from "@testing-library/user-event/dist/type";

export default function StudentDetailPage() {
    const {user} = useAuth();
    const [student, setStudent] = useState({
    userCode: "",
    name: "",
    birthDate: "",
    gender: "",
    email: "",
    phone: "",
    college: {
      id: null,
      office: "",
      type: "",
    },
    major: {
      id: null,
      name: "",
      office: "",
      collegeId: null,
    },
    admissionDate: "",
    totalCredit: 0,
    majorCredit: 0,
    generalCredit: 0,
    lectureGrade: 0,
    studentRecordList: [],
    gradeInfoList: [],
  });

    useEffect(()=>{
       if (!user?.id) return;
        const id = user.id;
        const url = `${API_BASE_URL}/user/detailAll/${id}`;
        axios
            .get(url)
            .then((res)=>{
                console.log(res.data);
                setStudent(res.data)
            })
            .catch((error)=>{
              console.error('status:', error.response?.status);
              console.error('data:', error.response?.data); // 여기 메시지/스택트레이스 들어올 수 있음
            })
    },[])

   const typeMap = {
    PENDING: "처리중",
    APPROVED: "완료",
    REJECTED: "거부",
    INPROGRESS: "개강",
    COMPLETED: "종강",
  };

   const typeMap2 = {
     ENROLLED: '재학',
    ON_LEAVE:'휴학',
    REINSTATED:'복학',
    EXPELLED:'퇴학',
    GRADUATED:'졸업',
    MILITARY_LEAVE:'군 휴학',
    MEDICAL_LEAVE:'질병'
  };
  const typeMap3 = {
    PENDING: "대기",
    APPROVED: "신청중",
    REJECTED: "거부",
    INPROGRESS: "개강",
    COMPLETED: "종강",
  };


 return (
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
                {/* 사진 영역: 위/아래 8행 합친 셀 */}
                <td
                  rowSpan={8}
                  className="text-center align-top"
                  style={{ width: "180px" }}
                >
                  {/* 여기서 img 태그로 교체해서 사용하면 됨 */}
                  <div
                    className="border bg-light d-inline-flex align-items-center justify-content-center"
                    style={{ width: 140, height: 180 }}
                  >
                    <span className="text-muted small">사진</span>
                  </div>
                </td>
                <th className="bg-light" style={{ width: "15%" }}>
                  학번
                </th>
                <td>
                  {student.userCode}
                </td>
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
          <Tabs
            defaultActiveKey="status"
            id="student-detail-tabs"
            style={{
              "--bs-nav-link-color": "#6c757d",
              "--bs-nav-link-hover-color": "#495057",
              "--bs-nav-tabs-link-active-color": "#212529",
              "--bs-nav-tabs-link-active-bg": "#f1f3f5",
              "--bs-nav-tabs-link-active-border-color": "#dee2e6",
              "--bs-nav-tabs-border-color": "#dee2e6",
            }}
          >
            {/* === 학적 탭 === */}
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

            {/* === 학적변경이력 탭 === */}
            <Tab eventKey="history" title="학적변경이력">
              <div className="pt-3">
                <Table
                  bordered
                  hover
                  size="sm"
                  className="mb-0 align-middle"
                  responsive
                >
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
                    
                    {student.studentRecordList.map(record => (
                      <tr key={record.id}>
                        <td>{record.id}</td>
                        <td>{typeMap2[record.applyStatus]}</td>
                        <td>{record.appliedDate}</td>
                        <td>{record.processedDate || '-'}</td>
                        <td>{typeMap[record.status]}</td>
                      </tr>
                    ))}
                   
                  </tbody>
                </Table>
              </div>
            </Tab>

            {/* === 성적 탭 === */}
            <Tab eventKey="grades" title="성적">
              <div className="pt-3">
                {/* 학기 콤보박스 */}
                <Row className="mb-3 g-2 align-items-center">
                  <Col xs={12} md={3}>
                    <Form.Select aria-label="학기 선택">
                      <option value="">학기 선택</option>
                      {/* TODO: 학기 옵션 추가 */}
                    </Form.Select>
                  </Col>
                </Row>

                <Table
                  bordered
                  hover
                  size="sm"
                  className="mb-0 align-middle"
                  responsive
                >
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
                      {/* ▼ 추가: 상세 / 기능 컬럼 */}
                      <th style={{ width: "8%" }}>상세</th>
                      <th style={{ width: "8%" }}>기능</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.gradeInfoList.map(grade => (
                      <tr key={grade.lecId}>
                        <td>{grade.startDate}</td>
                        <td>{grade.name}</td>
                        <td>{grade.ascore}</td>
                        <td>{grade.asScore}</td>
                        <td>{grade.tscore}</td>
                        <td>{grade.ftScore}</td>
                        <td>{grade.totalScore}</td>
                        <td>{typeMap3[grade.status]}</td>
                        <td>-</td>
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
  );
}






