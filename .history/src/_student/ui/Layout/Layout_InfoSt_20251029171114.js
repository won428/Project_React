import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";

const LayoutStInfost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goStudentInfo = () => navigate("/InfoHome");
  const goThisCredit = () => navigate("/This_Credit");
  const goEntireCredit = () => navigate("/etrcdt");

  // useAuth에서 가져온 user.id를 바로 활용해서 이동
  const goChangeStatus = () => {
    const userId = user?.id ?? user?.userId ?? user?.userid ?? null;

    if (!userId) {
      alert("학생 정보를 확인할 수 없습니다. 다시 로그인해 주세요.");
      navigate("/login");
      return;
    }

    navigate("/Change_Status", { state: { userId } });
  };

  return (
    <Row className="min-vh-100">
      <Col xs={2} className="bg-dark text-white p-3">
        <Container>
          <Nav className="flex-column">
            <Nav.Link onClick={goStudentInfo} className="text-white">학적 홈</Nav.Link>
            <Nav.Link onClick={goThisCredit} className="text-white">당학기 성적</Nav.Link>
            <Nav.Link onClick={goEntireCredit} className="text-white">전체 성적</Nav.Link>
            <Nav.Link onClick={goChangeStatus} className="text-white">학적 변경</Nav.Link>
          </Nav>
        </Container>
      </Col>

      <Col xs={10} className="p-4">
        <Container>
          <Outlet />
        </Container>
      </Col>
    </Row>
  );
};

export default LayoutStInfost;
