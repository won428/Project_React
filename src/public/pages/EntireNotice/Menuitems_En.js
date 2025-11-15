import { Button, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";
import { requestTokenRefresh } from "../../config/api";
import { useSessionTimer } from "../../context/useSessionTimer";

function MenuEn() {
    const { user, logout } = useAuth();
    const { formattedTime, refreshTimer } = useSessionTimer();
    const navigate = useNavigate();

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
                <Navbar
                    expand="lg"
                    style={{ backgroundColor: "#d0e7fa" }}
                    className="shadow-sm"
                >
                    <Container>
                        <Navbar.Brand
                            onClick={() =>
                                user.roles.includes("STUDENT") ? navigate(`/hs`) : user.roles.includes("PROFESSOR") ? navigate(`/hp`) : navigate(`/`)
                            }
                            className="d-flex align-items-center"
                            style={{ cursor: "pointer", color: "#0d47a1", fontWeight: 600 }}
                        >
                            <div
                                className="me-2 d-flex align-items-center"
                                style={{
                                    padding: "0.25rem",
                                    backgroundColor: "transparent",
                                    borderRadius: "4px",
                                }}
                            >
                                <img src="/logo22.png" height="30" alt="LMS Logo" />
                            </div>
                        </Navbar.Brand>
                        <Nav className="me-auto">
                            <Nav.Link onClick={() => navigate(`/EnNotList`)}>
                                전체 공지
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/acsche`)}>
                                학사일정
                            </Nav.Link>
                            <Nav.Link onClick={() => navigate(`/inquiryBoard`)}>
                                1:1 문의
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