import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/UserContext";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";
import { Button, Card, CardBody, CardTitle, Container, Form } from "react-bootstrap";

function App() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const data = location?.state;
    const [mod, setMod] = useState(false);
    const [resdata, setResData] = useState({});
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [subfiles, setSubfiles] = useState([]);
    const fileRef = useRef();


    useEffect(() => {
        const url = `${API_BASE_URL}/Entire/Specific`
        const parameter = { params: { id: data } }
        axios.get(url, parameter)
            .then((res) => {
                console.log(res.data)
                setResData(res.data)

            })
            .catch((e) => console.log(e))
    }, [data])
    console.log(resdata);
    console.log(user);
    console.log(resdata?.userid);

    const submitMod = async () => {
        const url = `${API_BASE_URL}/Entire/update/${resdata.id}`
        const formData = new FormData();
        formData.append("email", user.email)
        formData.append("title", resdata.title)
        formData.append("content", resdata.content)

        if (subfiles != null && subfiles.length > 0) {
            subfiles.forEach(f => {
                if (f.file) {
                    // (A) "새로 추가된 파일" (File 객체)
                    formData.append("files", f.file);
                } else if (f.storedKey) {
                    // (B) "유지해야 할 기존 파일" (고유 키)
                    formData.append("existingFileKeys", f.storedKey);
                }
            });
        }

        const res = await axios.put(url, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })

        if (res.status === 200) {
            alert("수정을 완료했습니다.")
            setMod(false);
            navigate("/EnNotList");
        } else {
            alert("수정에 실패하였습니다.")
            return;
        }


    }


    const Fileselect = e => {
        const selectedFiles = Array.from(e.target.files);
        const totalFiles = subfiles.length + selectedFiles.length;
        if (totalFiles > 3) {
            alert("3개까지만 첨부할 수 있습니다.");
            fileRef.current.value = "";
            return;
        }
        const newFiles = (selectedFiles.map(file => ({
            file,
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file),
        })));
        if (newFiles) {
            setSubfiles(prev => [...prev, ...newFiles]);
        }
    };


    const handleChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target

        setResData({ ...resdata, [name]: value });

    }

    const deleteFile = async (e) => {
        e.preventDefault();
        const url = `${API_BASE_URL}/Entire/delete/${resdata.id}`;
        const res = await axios.delete(url);
        if (res.status === 200) {
            alert("삭제 성공");
            navigate("/EnNotList")
        }

    }
    const removeFile = name => {
        const fileToRemove = subfiles.find(f => f.name === name);
        if (fileToRemove) URL.revokeObjectURL(fileToRemove.url);
        setSubfiles(prev => prev.filter(f => f.name !== name));
        fileRef.current.value = "";

    };


    const handleEdit = (e) => {
        if (resdata) {
            setTitle(resdata.title);
            setContent(resdata.content);
        }
        if (subfiles.length === 0 && resdata.attachmentDto) {
            const submittedFiles = resdata.attachmentDto || [];
            setSubfiles(submittedFiles.map(file => ({
                name: file.name,
                url: `${API_BASE_URL}/notice/files/download/${file.storedKey}`,
                type: file.contentType,
                size: file.sizeBytes,
                storedKey: file.storedKey

            })))
        }
        setMod(true)
    }


    return (
        <>
            {mod ?
                <Container style={{ maxWidth: '800px', marginTop: '2rem' }}>
                    <Card >
                        <CardBody>
                            <Form onSubmit={(e) => {
                                e.preventDefault();
                                submitMod()
                            }}>
                                <CardTitle>
                                    <Form.Group>
                                        <Form.Label>ID</Form.Label>
                                        <Form.Control value={resdata.id} readOnly />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>이름</Form.Label>
                                        <Form.Control value={resdata.username} readOnly />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>제목</Form.Label>
                                        <Form.Control
                                            value={title}
                                            type="text"
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>내용</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            type="text"
                                            rows={5}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>작성날짜</Form.Label>
                                        <Form.Control value={resdata.updatedAt.toLocaleString()} readOnly />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>파일 첨부</Form.Label>
                                        <Form.Control type="file" multiple ref={fileRef} onChange={Fileselect} />
                                    </Form.Group>
                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                        {subfiles.map((f, i) => (
                                            <div key={i} style={{ position: "relative", width: "100px", textAlign: "center" }}>
                                                {(f.type || "").startsWith("image/") ? <img src={f.url} alt="preview" width="100%" /> : <div>{f.name}</div>}
                                                <Button variant="danger" size="sm" style={{ position: 'absolute', top: 0, right: 0, borderRadius: '50%' }} onClick={() => removeFile(f.name)}>X</Button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ✅ FIX 2: 누락되었던 "수정 완료" 및 "취소" 버튼 추가 */}
                                    <div className="d-flex justify-content-end mt-3 gap-2">
                                        <Button type="submit">수정 완료</Button>
                                        <Button variant="secondary" onClick={() => navigate(-1)}>취소</Button>
                                    </div>
                                </CardTitle>
                            </Form>
                        </CardBody>
                    </Card>
                    {/* <div className="d-flex justify-content-end gap-2">
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


                    </div> */}
                </Container>
                :
                <Container style={{ maxWidth: '800px', marginTop: '2rem' }}>
                    <Card className="shadow-sm">
                        <CardBody>
                            <CardTitle>
                                <h3 className="fw-bold mb-3">{resdata.title}</h3>
                                <div className="text-muted mb-3" style={{ fontSize: "14px" }}>
                                    작성자: {resdata.username} |
                                    등록일: {new Date(resdata.createdAt).toLocaleDateString()}
                                </div>
                            </CardTitle>
                            <div className="p-3 border rounded mb-4"
                                style={{ whiteSpace: 'pre-wrap', height: '450px',overflowY: 'auto' }}>
                                {resdata.content}
                            </div>
                            {resdata.attachmentDto && resdata.attachmentDto.length > 0 && (
                                <div className="mb-4">
                                    <strong>📎 첨부파일</strong>
                                    <ul className="mt-2">
                                        {resdata.attachmentDto.map((file, index) => (
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
                                            onClick={() => { handleEdit() }}
                                        >수정</Button>
                                        <Button
                                            variant="danger"
                                            onClick={deleteFile}
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