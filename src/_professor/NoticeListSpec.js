import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Form, Button, Table, CardTitle } from "react-bootstrap";
import { API_BASE_URL } from "../public/config/config";
import { useAuth } from "../public/context/UserContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function App() {
    const { user } = useAuth();
    // const { data } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const data = location?.state;
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
    console.log(user?.uid);
    console.log(resdata?.userid);

    return (
        <>
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
                            {user?.uid === resdata.userid && (
                                <>
                                    <Button variant="warning">수정</Button>
                                    <Button variant="danger">삭제</Button>
                                </>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </Container>
        </>
    )
}
export default App;