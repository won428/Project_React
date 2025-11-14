import { useEffect, useRef, useState } from "react";
import { useAuth, UserContext } from "../../context/UserContext";
import { Button, Card, CardBody, Col, Container, Row, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";

function App() {
    const { user, login, isLoading } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [subfiles, setSubfiles] = useState([]);
    const fileRef = useRef();



    useEffect(() => {
        // 아직 로딩 중이면 아무것도 하지 않음
        if (isLoading) return;


        // 로딩 끝났는데 user가 null이면 -> 로그인 안 된 상태니까 홈으로 이동
        if (!user) {
            navigate("/");
            return;
        }

        // user가 로드된 이후에만 role 체크
        if (!user.roles?.includes("ADMIN")) {
            navigate("/Unauthorizedpage");
        }
    }, [user, isLoading, navigate]);

    useEffect(() => {
        return () => {
            subfiles.forEach(f => {
                if (f.url) URL.revokeObjectURL(f.url);
            });
        };
    }, [subfiles]);

    if (isLoading) {
        return <div>⏳ 사용자 확인 중...</div>;
    }


    const PostNotice = async (evt) => {
        evt.preventDefault();
        console.log(title);
        console.log(content);

        const url = `${API_BASE_URL}/Entire/insert`
        const formData = new FormData();
        formData.append("username", user.username);
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
            navigate("/EnNotList");
        } else {
            alert(respone.statusText)
        }

    }


    const Fileselect = (evt) => {
        subfiles.forEach(f => URL.revokeObjectURL(f.url));

        const selectedFiles = Array.from(evt.target.files);
        if (selectedFiles.length > 3) {
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
    };
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
            <Container style={{ maxWidth: '800px', marginTop: '2rem' }}>
                <Row>
                    <Col>
                        <Card>
                            <CardBody>
                                <Form onSubmit={PostNotice}>
                                    <Form.Group className="mb-3" >
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
                                            onClick={() => navigate("/EnNotList")}
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