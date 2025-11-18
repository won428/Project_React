import {
    Col,
    Form,
    Row,
    Card,
    CardBody,
    Container,
    Button,
    Alert
} from "react-bootstrap";
import { API_BASE_URL } from "./config/config";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function FindPW() {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const ValidatePW = async (evt) => {
        evt.preventDefault();
        const url = `${API_BASE_URL}/auth/FindPW`;
        const parameter = { username };

        try {
            const response = await axios.post(url, parameter);
            navigate("/setPw", { state: { username } });
        } catch (err) {
            if (err.response?.status === 400) {
                setError("존재하지 않는 Email입니다. 다시 입력해주세요.");
            } else {
                setError("오류가 발생했습니다. 다시 시도해주세요.");
            }
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Row className="w-100 justify-content-center">
                <Col xs={12} md={6} lg={4}>
                    <Card className="shadow rounded">
                        <CardBody>
                            <Form onSubmit={ValidatePW}>
                                <h3 className="text-center mb-4">비밀번호 재설정</h3>

                                {error && <Alert variant="danger">{error}</Alert>}

                                <Form.Group className="mb-3">
                                    <Form.Label>학번을 입력해주세요</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="학번"
                                        value={username}
                                        onChange={(evt) => setUsername(evt.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <div className="d-flex justify-content-between mt-4">
                                    <Button type="submit" className="w-50">
                                        Submit
<<<<<<< HEAD
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-50 ms-2"
                                        onClick={() => navigate("/")}
                                    >
                                        Cancel
=======
>>>>>>> origin/won2
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-50 ms-2"
                                        onClick={() => navigate("/")}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default FindPW;
