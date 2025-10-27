import { Badge, Button, Card, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useAuth } from "../../public/context/UserContext";
import { useState } from "react";
function App() {
  
  const [props, setProps] = useState({});
  const {user} = useAuth;






    
 return (
    <Container className="py-4">
      {/* 상단: 최소 정보만 */}
      <Card className="mb-3">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h3 className="mb-2">{props.title ?? "강의명"}</h3>
              <div className="text-muted">
                학과: {props.majorName ?? "학과명"} · 소속: {props.collegeName ?? "소속대학"} · 담당교수: {props.professorName ?? "담당교수"} · 총원: {props.capacity ?? 0}
              </div>
            </Col>
            <Col xs="auto">
              <Button variant="outline-secondary" size="sm" onClick={props.onBack ?? (() => {})}>돌아가기</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 목록: 간단 표기 */}
      <Card>
        <Card.Header className="d-flex justify-content-between">
          <span>수강생 목록</span>
          <span>{(props.studentCount ?? 0) + "/" + (props.capacity ?? 0)}</span>
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
              {props.showEmpty ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">표시할 학생이 없습니다.</td>
                </tr>
              ) : (
                props.children
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );

}
export default App;