import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";
import { requestTokenRefresh } from "../../config/api";
import { useSessionTimer } from "../../context/useSessionTimer";
function MenuEn() {
    const { user, logout } = useAuth();

    const navigate = useNavigate();
    const { formattedTime, refreshTimer } = useSessionTimer();

    const logoutAction = () => {
        logout();
        navigate("login")
    }

    const handelRefresh = async () => {
        try {
            console.log("refresh");
            const newToken = await requestTokenRefresh();
            refreshTimer(newToken);
            console.log(' refresh success:');
        } catch (e) {
            console.log('토큰 갱신 실패');
        }


    }

    return (
        <Row>
            <Col>
                <Navbar bg="dark" data-bs-theme="dark">
                    <Container>
                        <Navbar.Brand onClick={() => navigate(`/`)} > Home </Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => navigate(`/EnNotList`)}>
                                전체 공지
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/acsche`)}>
                                학사일정
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/inquiryBoard`)}>
                                1:1 Inquiry
                            </Nav.Link>


                        </Nav>
                        <Nav>
                            <Navbar.Text className="text-white">
                                {user.name} 님 &nbsp;
                            </Navbar.Text>
                            <Navbar.Text className="text-white">
                                {formattedTime}
                            </Navbar.Text>
                            <Button size="sm" variant="link" className="mx-2" onClick={handelRefresh} >⟳</Button>
                        </Nav>
                        <Button size="sm" onClick={logoutAction} >Logout</Button>

                    </Container>
                </Navbar>
            </Col>
        </Row>
    )
}
export default MenuEn;