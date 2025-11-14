import { Col, FormControl, FormLabel, Row, Form, Card, CardBody, Container, Button } from "react-bootstrap";
import { API_BASE_URL } from "./config/config";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const ValidatePW = async (evt) => {
        console.log(username);


        evt.preventDefault();
        const url = `${API_BASE_URL}/auth/FindPW`;
        const parameter = { username };
        const respone = await axios.post(url, parameter);
        console.log(respone.status);

        if (respone.status === 400) {
            alert("존재하지 않는 Email입니다. 다시 입력해주세요.")
        } else {
            navigate("/setPw", { state: { username } })
        }

    }

    return (
        <Container fluid className="d-flex justify-content-center align-items-center vh-100">
            <Row className="w-100 justify-content-center">
                <Col xs={12} md={6} lg={4}>
                    <Card className="w-100">
                        <CardBody>
                            <Form onSubmit={ValidatePW}>
                                <Form.Group>
                                    <header>
                                        <h2>Password 찾기</h2>
                                    </header>
                                    <br />
                                    <FormLabel
                                        type="text"
                                    >
                                        학번을 입력해주세요.
                                    </FormLabel>
                                    <Form.Control
                                        type="text"
                                        placeholder="학번"
                                        value={username}
                                        onChange={(evt) => setUsername(evt.target.value)}
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
                                    <Button
                                        className="w-30 ms-2"
                                        variant="secondary"
                                        onClick={() => navigate("/")}
                                    >
                                        cancel
                                    </Button>
                                </div>
                            </Form>

                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container >
    )
}
export default App;