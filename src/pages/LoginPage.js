import { useContext, useEffect, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import axios from "axios";
import { useAuth, UserContext } from "../context/UserContext";
import API, { setToken } from "../config/api"
import { jwtDecode } from "jwt-decode";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    // const [loading, setLoading] = useState(false);
    // const [status, setStatus] = useState(true);
    const navigate = useNavigate();
    const { login, user } = useAuth();

    const LoginAction = async (evt) => {
        evt.preventDefault();
        try {
            const url = `${API_BASE_URL}/auth/login`
            console.log(url);
            const parameters = {
                email,
                password
            }
            // check
            const respone = await axios.post(
                url, parameters
            )
            const { accessToken, refreshToken } = respone.data;
            setToken(accessToken, refreshToken);
            console.log("로그인 성공");


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
            alert("로그인 실패 " + error.response?.data || error.message);

        }


    }


    const logout = async () => {
        try {
            const url = `${API_BASE_URL}/auth/logout`
            await axios.post(url, {
                email: sessionStorage.getItem("email")
            });
        }
        finally {
            sessionStorage.clear();
            navigate("/")
        }
    }

    return (
        <>
            <Container className="d-flex justify-content-center align-items-center">
                <Row className="w-100 justify-content-center mt-5">
                    <Col md={6} >
                        <Card  >
                            <CardBody onSubmit={LoginAction}>
                                <h3>Login</h3>
                                {error && <Alert variant="danger">{error}</Alert>}
                                <Form>
                                    <Form.Group>
                                        <Form.Label>
                                            Email or 학번
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Email을 입력하세요"
                                            value={email}
                                            onChange={(evt) => setEmail(evt.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>
                                            Password
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="password를 입력하세요"
                                            value={password}
                                            onChange={(evt) => setPassword(evt.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Row >
                                        <Col className="align-item-end">
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                className="w-100"

                                            >Login</Button>
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