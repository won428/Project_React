import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Form, Button, Table, CardTitle } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import { useAuth } from "../../../public/context/UserContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function App() {
    const { user } = useAuth();
    // const { data } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const data = location?.state;
    const [mod, setMod] = useState(false);
    const [resdata, setResData] = useState({});
    useEffect(() => {
        const url = `${API_BASE_URL}/notice/specific`
        const parameter = { params: { id: data } }
        axios.get(url, parameter)
            .then((res) => {
                console.log(res.data);
                setResData({
                    id: res.data.id,
                    name: res.data.username,
                    userid: res.data.userid,
                    title: res.data.title,
                    content: res.data.content,
                    createdAt: res.data.createdAt,
                    attach: res.data.attachmentDto,

                })

            })
            .catch((e) => console.log(e))
    }, [data])
    console.log(resdata);
    console.log(user);
    console.log(resdata?.userid);

    const submitMod = async () => {
        const url = `${API_BASE_URL}/notice/update/${resdata.id}`
        const formData = new FormData();
        formData.append("email", user.email)
        formData.append("title", resdata.title)
        formData.append("content", resdata.content)
        const res = await axios.put(url, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })

        if (res.status === 200) {
            alert("수정을 완료했습니다.")
            setMod(false);
            navigate("/notionlist");
        } else {
            alert("수정에 실패하였습니다.")
            return;
        }


    }


    const handleChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target

        setResData({ ...resdata, [name]: value });

    }
    return (
        <>
            {mod ?
                <Container style={{ maxWidth: '800px', marginTop: '2rem' }}>
                    <Card >
                        <CardBody>
                            <Form onSubmit={(e) => (submitMod)}>
                                <CardTitle>

                                    <Form.Group>
                                        <Form.Label>
                                            title
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="title"
                                            value={resdata.title}
                                            onChange={(e) => handleChange(e)}
                                        />
                                    </Form.Group>


                                </CardTitle>
                                <Form.Group>
                                    <Form.Label>
                                        작성자
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={resdata.name}
                                        readOnly
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>
                                        등록일
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={resdata.createdAt}
                                        readOnly
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>
                                        content
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="content"
                                        value={resdata.content}
                                        onChange={(e) => handleChange(e)}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>
                                        files
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={"~"}
                                        readOnly
                                    />
                                </Form.Group>
                            </Form>
                            {/* <div className="p-3 border rounded mb-4"
                                style={{ whiteSpace: 'pre-wrap', minHeight: '200px' }}>
                                {resdata.content}
                            </div>
                            {resdata.attach && resdata.attach.length > 0 && (
                                <div className="mb-4">
                                    <strong>📎 첨부파일</strong>
                                    <ul className="mt-2">
                                        {resdata.attach.map((file, index) => (
                                            <li key={index}>
                                                <a
                                                    href={`${API_BASE_URL}/notice/files/download/${file.storedKey}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {file.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )} */}

                            <br />

                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="secondary" onClick={() => navigate(-1)}>
                                    목록으로
                                </Button>
                                <Button
                                    variant="warning"
                                    onClick={() => submitMod()}
                                >수정 완료</Button>
                                <Button
                                    variant="danger"
                                    onClick={""}
                                >삭제</Button>


                            </div>
                        </CardBody>
                    </Card>
                </Container>
                :
                <Container style={{ maxWidth: '800px', marginTop: '2rem' }}>
                    <Card >
                        <CardBody>
                            <CardTitle>
                                <h3 className="fw-bold mb-3">title</h3>
                                <div className="text-muted mb-3" style={{ fontSize: "14px" }}>
                                    작성자: {resdata.name} |
                                    등록일: {new Date(resdata.createdAt).toLocaleDateString()}
                                </div>
                            </CardTitle>
                            <div className="p-3 border rounded mb-4"
                                style={{ whiteSpace: 'pre-wrap', minHeight: '200px' }}>
                                {resdata.content}
                            </div>
                            {resdata.attach && resdata.attach.length > 0 && (
                                <div className="mb-4">
                                    <strong>📎 첨부파일</strong>
                                    <ul className="mt-2">
                                        {resdata.attach.map((file, index) => (
                                            <li key={index}>
                                                <a
                                                    href={`${API_BASE_URL}/notice/files/download/${file.storedKey}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {file.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="d-flex justify-content-end gap-2">
                                <Button variant="secondary" onClick={() => navigate(-1)}>
                                    목록으로
                                </Button>
                                {user?.id === resdata.userid && (
                                    <>
                                        <Button
                                            type="submit"
                                            variant="warning"
                                            onClick={() => { setMod(true) }}
                                        >수정</Button>
                                        <Button
                                            variant="danger"
                                            onClick={""}
                                        >삭제</Button>
                                    </>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </Container>}
        </>
    )
}
export default App;