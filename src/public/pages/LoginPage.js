import { use, useContext, useEffect, useState } from "react";
import { Alert, Button, ButtonGroup, Card, CardBody, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import axios from "axios";
import { useAuth, UserContext } from "../../public/context/UserContext";
import API, { setToken } from "../config/api"
import { jwtDecode } from "jwt-decode";

function App() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    // const [loading, setLoading] = useState(false);
    // const [status, setStatus] = useState(true);
    const navigate = useNavigate();
    const { login, user } = useAuth();
    useEffect(() => {

        if (user?.roles.includes("ADMIN")) { navigate("/ha") }
        if (user?.roles.includes("STUDENT")) { navigate("/hs") }
        if (user?.roles.includes("PROFESSOR")) { navigate("/hp") }

    }, [user]);


    const LoginAction = async (evt) => {
        evt.preventDefault();
        try {
            const url = `${API_BASE_URL}/auth/login`
            const parameters = {
                username,
                password
            }
            // check
            const respone = await axios.post(
                url, parameters
            )
            const { accessToken, refreshToken } = respone.data;
            setToken(accessToken, refreshToken);

            alert("로그인 성공")


            login(accessToken);
            const decoded = jwtDecode(accessToken);
            const userRole = decoded.role;
            console.log(userRole);


            switch (userRole) {
                case 'ADMIN':
                    navigate('/ha')
                    break;
                case 'STUDENT':
                    navigate('/hs')
                    break;
                case 'PROFESSOR':
                    navigate('/hp')
                    break;
                default:
                    navigate('/Unauthorizedpage')
            }

        } catch (error) {
            console.log(error.message);
            setError("ID/PW incorrect")
            alert("서버 오류 " + error.response?.data || error.message);

        }


    }

    // context로 기능 이전
    // const logout = async () => {
    //     try {
    //         const url = `${API_BASE_URL}/auth/logout`
    //         await axios.post(url, {
    //             email: sessionStorage.getItem("email")
    //         });
    //     }
    //     finally {
    //         sessionStorage.clear();
    //         navigate("/")
    //     }
    // }



    return (
        <>
            <Container
                fluid
                className="d-flex justify-content-center align-items-center vh-100"
                style={{
                    backgroundImage: `url('/loginbackground.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <Row className="w-100 justify-content-center">
                    <Col xs={12} md={6} lg={4}>
                        <Card
                            className="shadow rounded"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: 'none'
                            }}
                        >
                            <CardBody className="p-4">
                                <h3 className="text-center mb-4 fw-bold">로그인</h3>

                                {error && (
                                    <Alert variant="danger" className="text-center py-2">
                                        {error}
                                    </Alert>
                                )}

                                <Form onSubmit={LoginAction}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold">학번</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="학번을 입력하세요"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            style={{ fontSize: '0.95rem' }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">비밀번호</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="비밀번호를 입력하세요"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            style={{ fontSize: '0.95rem' }}
                                        />
                                    </Form.Group>

                                    <Row className="g-2">
                                        <Col xs={6}>
                                            <Button type="submit" variant="primary" className="w-100">
                                                로그인
                                            </Button>
                                        </Col>
                                        <Col xs={6}>
                                            <Button variant="outline-secondary" className="w-100" onClick={() => navigate("/findPw")}>
                                                비밀번호 재설정
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>


        </>
    )
}
export default App;