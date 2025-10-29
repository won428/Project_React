import { Badge, Button, Card, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useAuth } from "../../public/context/UserContext";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../public/config/config";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
function App() {

  const [lecture, setLecture] = useState({});
  const [props, setProps] = useState({});
  const [studentList, setStudentList] = useState([]);
  const { user } = useAuth;
  const { id } = useParams();

  const navigate = useNavigate();



  useEffect(() => {
    const url = `${API_BASE_URL}/lecture/detail/${id}`;
    axios
      .get(url)
      .then((response) => {
        setLecture(response.data)
      })
      .catch((error) => {
        const err = error.response;
        if (!err) {
          alert('네트워크 오류가 발생하였습니다')
          return;
        }
      })
  }, [])

  useEffect(() => {
    const url = `${API_BASE_URL}/lecture/detail/studentList/${id}`;
    axios
      .get(url)
      .then((response) => {
        setStudentList(response.data)
      })
      .catch((error) => {
        const err = error.response;
        if (!err) {
          alert('네트워크 오류가 발생하였습니다')
          return;
        }
      })

  }, [lecture]);




  return (
    <Container className="py-4">
      {/* 상단: 최소 정보만 */}
      <Card className="mb-3">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h3 className="mb-2">{lecture.name}</h3>
              <div className="text-muted">
                학과: {lecture.majorName} · 담당교수: {lecture.userName} · 총원: {lecture.totalStudent}
              </div>
            </Col>
            <Col xs="auto">
              <Button variant="outline-secondary" size="sm" onClick={() => navigate('/lectureListPro')}>돌아가기</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 목록: 간단 표기 */}
      <Card>
        <Card.Header className="d-flex justify-content-between">
          <span>수강생 목록</span>
          <span>{lecture.nowStudent + "/" + lecture.totalStudent}</span>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>학번</th>
                <th>이름</th>
                <th>학과</th>
                <th>학년</th>
                <th>이메일</th>
                <th>전화번호</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {studentList.map((student) => (
                <tr key={student.userCode}>
                  <td>{student.userCode}</td>
                  <td>{student.u_name}</td>
                  <td>{student.majorName}</td>
                  <td>추가예정</td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                  <td>예비</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );

}
export default App;