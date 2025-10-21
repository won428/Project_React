import { useContext, useEffect, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import axios from "axios";
import { useAuth, UserContext } from "../context/UserContext";
import API, { setToken } from "../config/api"

function App() {




    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { loadUserFromToken, roles, user } = useAuth();

    useEffect(() => {
        console.log("Context 마운트 시점 실행");
        loadUserFromToken();
    }, []);





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

            sessionStorage.setItem("email", email);

            loadUserFromToken();

            alert("로그인 성공");


            if (loading) {
                if (user.length === 0) {
                    setLoading(false);
                }
            }
            if (roles?.includes("ADMIN")) return navigate("/");
            if (roles?.includes("PROFESSOR")) return navigate("/LHome");
            if (roles?.includes("STUDENT")) return navigate("/");
            navigate("/Unauthorizedpage");




        } catch (error) {
            alert("로그인 실패 " + error.response?.data || error.message);
            console.log(setToken.newAccess);

        }


    }

    const logout = async () => {
        try {
            const url = `${API_BASE_URL}/logout`
            await axios.post(url, {
                email: sessionStorage.getItem("email")
            });
        }
        finally {
            sessionStorage.clear();
            navigate("/login")
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