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

export default function StudentDetailPage() {
    const {user} = useAuth();
    const [student, setStudent] = useState({});

    useEffect(()=>{
        const id = user.id;
        const url = `${API_BASE_URL}/user/detailAll/${id}`;
        axios
            .get(url)
            .then((res)=>{
                console.log(res.data);
                setStudent(res.data)
            })
            .catch((err)=>{
                console.log(err)
            })
    },[])


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
                  {/* 학번 */}
                </td>
              </tr>
              <tr>
                <th className="bg-light">이름</th>
                <td>{/* 이름 */}</td>
              </tr>
              <tr>
                <th className="bg-light">생년월일</th>
                <td>{/* 생년월일 */}</td>
              </tr>
              <tr>
                <th className="bg-light">성별</th>
                <td>{/* 성별 */}</td>
              </tr>
              <tr>
                <th className="bg-light">이메일</th>
                <td>{/* 이메일 */}</td>
              </tr>
              <tr>
                <th className="bg-light">전화번호</th>
                <td>{/* 전화번호 */}</td>
              </tr>
              <tr>
                <th className="bg-light">소속 대학</th>
                <td>{/* 소속 대학 */}</td>
              </tr>
              <tr>
                <th className="bg-light">소속 학과</th>
                <td>{/* 학과 */}</td>
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
                      <td>{/* 입학일 */}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">총 이수학점</th>
                      <td>{/* 총 이수학점 */}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">전공학점</th>
                      <td>{/* 전공학점 */}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">교양학점</th>
                      <td>{/* 교양학점 */}</td>
                    </tr>
                    <tr>
                      <th className="bg-light">총 학점</th>
                      <td>{/* 총 학점 */}</td>
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
                    {/*
                    TODO: 학적변경이력 리스트 map으로 렌더링
                    {historyList.map(item => (
                      <tr key={item.id}>
                        <td>{item.requestNo}</td>
                        ...
                      </tr>
                    ))}
                    */}
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
                      <th style={{ width: "30%" }}>강의명</th>
                      <th style={{ width: "8%" }}>출결</th>
                      <th style={{ width: "8%" }}>과제</th>
                      <th style={{ width: "8%" }}>중간</th>
                      <th style={{ width: "8%" }}>기말</th>
                      <th style={{ width: "10%" }}>총학점</th>
                      {/* ▼ 추가: 상세 / 기능 컬럼 */}
                      <th style={{ width: "8%" }}>상세</th>
                      <th style={{ width: "8%" }}>기능</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/*
                    TODO: 성적 리스트 map으로 렌더링
                    {gradeList.map(grade => (
                      <tr key={grade.id}>
                        <td>{grade.openDate}</td>
                        <td>{grade.lectureName}</td>
                        <td>{grade.attendance}</td>
                        <td>{grade.assignment}</td>
                        <td>{grade.midterm}</td>
                        <td>{grade.final}</td>
                        <td>{grade.totalScore}</td>
                        <td>{/* 상세 버튼 자리 *-/}</td>
                        <td>{/* 기능(수정/삭제 등) 버튼 자리 *-/}</td>
                      </tr>
                    ))}
                    */}
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






