import axios from "axios";
import { useState } from "react";
import { Alert, Button, Card, CardBody, Col, Container, Form, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/config";

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location?.state.email;
    if (!email) {
        navigate('/findPW');
    }
    const [error, setError] = useState("");
    const [pw, setPw] = useState("");
    const [vpw, setVpw] = useState("");

    const validatePw = async (evt) => {
        evt.preventDefault();
        if (pw !== vpw) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        setError('');


        const url = `${API_BASE_URL}/auth/SetPw`
        const parameter = {
            email,
            newPassword: pw
        };
        const respone = await axios.post(url, parameter);

        if (respone !== 200) {
            navigate("/")
        } else {
            return;
        }



    }

    return (
        <>
            <Container fluid className="d-flex justify-content-center align-items-center vh-100">
                <Row className="w-100 justify-content-center">
                    <Col xs={12} md={6} lg={4} >
                        <Card className="w-100" >
                            <CardBody >
                                <h3>Set password</h3>
                                {error && <Alert variant="danger">{error}</Alert>}
                                <br />
                                <Form onSubmit={validatePw} >
                                    <Form.Group>
                                        <Form.Label>
                                            Password
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="password"
                                            value={pw}
                                            onChange={(evt) => {
                                                setPw(evt.target.value)
                                                console.log(pw);
                                            }


                                            }
                                            required
                                        />
                                        <Form.Label>
                                            Password Again
                                        </Form.Label>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Control
                                            type="password"
                                            placeholder="password"
                                            value={vpw}
                                            onChange={(evt) => {
                                                setVpw(evt.target.value)
                                                console.log(vpw);

                                            }
                                            }
                                            required
                                        />
                                    </Form.Group>
                                    <div className="d-flex justify-content-end mt-3">
                                        <Button
                                            className="w-30 "
                                            type="submit"
                                        >
                                            submit
                                        </Button>
                                    </div>

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