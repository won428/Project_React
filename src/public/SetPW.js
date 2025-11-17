import axios from "axios";
import { useState } from "react";
import { Alert, Button, Card, CardBody, Col, Container, Form, Row } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../public/config/config";

function SetPW() {
    const navigate = useNavigate();
    const location = useLocation();
    const username = location?.state?.username;

    if (!username) {
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

        const url = `${API_BASE_URL}/auth/SetPw`;
        const parameter = { username, newPassword: pw, newPasswordConfirm: vpw };

        try {
            const response = await axios.post(url, parameter);
            alert("변경이 완료되었습니다.");
            navigate("/");
        } catch (error) {
            if (error.response && error.response.status === 400) {
                if (Array.isArray(error.response.data?.errors)) {
                    const errorMessages = error.response.data.errors.map(err => err.defaultMessage);
                    alert(errorMessages.join("\n"));
                } else {
                    alert("입력값이 올바르지 않습니다.");
                }
            } else if (error.response?.status === 406) {
                alert("이미 사용 중인 Pw입니다.");
            } else {
                alert("오류가 발생했습니다.");
            }
        }
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <Row className="w-100 justify-content-center">
                <Col xs={12} md={6} lg={4}>
                    <Card className="shadow rounded">
                        <CardBody>
                            <h3 className="mb-4 text-center">비밀번호 재설정</h3>

                            {error && <Alert variant="danger">{error}</Alert>}

                            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                                특수문자 [<code>@$!%*#?&</code>] 를 포함한 8~20자 이내로 설정해주세요.
                            </p>

                            <Form onSubmit={validatePw}>
                                <Form.Group className="mb-3">
                                    <Form.Label>새 비밀번호</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        value={pw}
                                        onChange={(e) => setPw(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>비밀번호 확인</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password Again"
                                        value={vpw}
                                        onChange={(e) => setVpw(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <div className="d-flex justify-content-between mt-4">
                                    <Button type="submit" className="w-50">
                                        Submit
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

export default SetPW;
