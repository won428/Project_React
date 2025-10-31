import { useState } from "react";
import { Card, CardBody, Col, Container, Row, Form, Button } from "react-bootstrap";
import { API_BASE_URL } from "../public/config/config";
import { useAuth } from "../public/context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function App() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();


    const PostNotice = async (evt) => {
        evt.preventDefault();
        console.log(title);
        console.log(content);

        const url = `${API_BASE_URL}/notice/insert`
        const parameter = {
            email: user.email,
            title,
            content,
        };
        console.log(parameter);

        const respone = await axios.post(url, parameter);

        if (respone.status === 200) {
            alert("등록에 성공하였습니다.");
        } else {


            alert(respone.statusText)
        }

    }
    return (
        <>
            <Container style={{ maxWidth: '600px', margin: '2rem auto' }} >
                <Row>
                    <Col>
                        <Card>
                            <CardBody>
                                <Form>
                                    <Form.Group className="mb-3" onSubmit={PostNotice}>
                                        <Form.Label>
                                            제목
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="제목을 입력하세요"
                                            value={title}
                                            onChange={(evt) => setTitle(evt.target.value)}
                                        />

                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            내용
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            row={10}
                                            placeholder="내용을 입력하세요"
                                            value={content}
                                            onChange={(evt) => setContent(evt.target.value)}
                                        />
                                    </Form.Group>
                                </Form>
                            </CardBody>

                            <div className="d-flex justify-content-end mt-3 ">
                                <Button
                                    type="button"
                                    onClick={PostNotice}

                                >
                                    등록
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => (navigate("/hp"))}
                                >
                                    취소
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default App;