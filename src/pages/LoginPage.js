import { useContext, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";
import axios from "axios";
import { UserContext } from "../UserContext";

function App() {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [error, setError] = useState();
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const LoginAction = async (evt) => {
        evt.preventDefault();
        try {
            const url = `${API_BASE_URL}/login`
            const parameters = new URLSearchParams();

            parameters.append('email', email)
            parameters.append('password', password)


            console.log(parameters);
            console.log(email);
            console.log(password);


            const respone = await axios.post(
                url, parameters, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
            )
            console.log(respone);

            const { msg, user, token } = respone.data;
            console.log(token);

            if (msg === 'success') {
                localStorage.setItem("accessToken", token);
                setUser(user);//전역 변수 설정으로 관리
                navigate(`/`)
            } else {
                setError(msg)
            }
        } catch (error) {
            if (error.response) {


                setError(error.response.data.message || 'Failed to login');
                console.log(error);
            } else {
                setError('Sever Error');
            }
        }


    }



    return (
        <>
            <Container className="d-flex justify-content-center align-items-center">
                <Row className="w-100 justify-content-center">
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