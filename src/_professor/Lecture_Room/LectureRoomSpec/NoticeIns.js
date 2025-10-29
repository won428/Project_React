import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row, Form, Button } from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import { useAuth } from "../../../public/context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function App() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subfiles, setSubfiles] = useState([]);
    const fileRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            subfiles.forEach(f => URL.revokeObjectURL(f.url));
        };
    }, [subfiles]);

    const PostNotice = async (evt) => {
        evt.preventDefault();
        console.log(title);
        console.log(content);

        const url = `${API_BASE_URL}/notice/insert`
        const formData = new FormData();
        formData.append("email", user.email);
        formData.append("title", title);
        formData.append("content", content);
        subfiles.forEach(file => {
            console.log(file.file);
            formData.append("files", file.file)
        });
        const respone = await axios.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        if (respone.status === 200) {
            alert("등록에 성공하였습니다.");
            navigate("/notionlist");
        } else {
            alert(respone.statusText)
        }

    }

    const Fileselect = (evt) => {
        const { files } = evt.target;
        const selectedFiles = Array.from(files);
        const totalCount = selectedFiles.length;
        if (totalCount.length > 3) {
            alert("3개까지만 첨부할 수 있습니다.");
            fileRef.current.value = "";
            return;
        }

        const newfiles = selectedFiles.map(file => ({
            file,
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file)
        }));

        setSubfiles(newfiles);
    }
    const removeFile = (fileName) => {
        // 제거할 파일의 URL을 찾아서 해제합니다.
        const fileToRemove = subfiles.find(f => f.name === fileName);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.url);
        }

        // 해당 파일을 제외한 새 배열을 상태로 설정합니다.
        setSubfiles(prev => prev.filter(f => f.name !== fileName));

        // (중요) 파일 input의 값을 초기화해야 동일한 파일을 다시 선택할 수 있습니다.
        fileRef.current.value = "";
    };



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
                                    <Form.Group>
                                        <Form.Label>Files</Form.Label>
                                        <Form.Control
                                            type="file"
                                            name="file"
                                            multiple
                                            max={3}
                                            ref={fileRef}
                                            onChange={Fileselect}
                                        />
                                    </Form.Group>
                                    <div className="d-flex flex-wrap gap-2">
                                        {subfiles.map((f, i) => (
                                            <div key={i} style={{ width: "100px", textAlign: "center" }}>
                                                {(f.type || "").startsWith("image/") ? (
                                                    <img src={f.url} alt="preview" width="100%" />
                                                ) : (
                                                    <div style={{ fontSize: "13px" }}> {f.name}</div>
                                                )}
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    style={{ position: 'absolute', top: '0', right: '0', padding: '0.1rem 0.3rem', lineHeight: '1' }}
                                                    onClick={() => removeFile(f.name)}
                                                >
                                                    X
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
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