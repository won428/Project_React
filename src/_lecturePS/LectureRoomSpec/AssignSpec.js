import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Container, Form, Button, Table, CardTitle } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import { useAuth } from "../../public/context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLectureStore } from "./store/lectureStore";

function App() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const data = location?.state;
    const { lectureId } = useLectureStore();
    const [mod, setMod] = useState(false);
    const [resdata, setResData] = useState({});
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [subfiles, setSubfiles] = useState([]);
    const fileRef = useRef();

    // 📦 과제 상세 데이터 로드
    useEffect(() => {
        const url = `${API_BASE_URL}/assign/specific`;
        axios.get(url, { params: { id: data, email: user.email } })
            .then(res => {
                setResData(res.data)
                const submittedFiles = res.data.attachmentSubmittedDto || [];
                if (res.data?.submittedOne) {
                    setTitle(res.data.submittedOne.title);
                    setContent(res.data.submittedOne.content);
                }

                setSubfiles(
                    submittedFiles?.map(file => ({
                        name: file.name,
                        url: `${API_BASE_URL}/notice/files/download/${file.storedKey}`,
                        type: file.contentType,
                        size: file.sizeBytes,
                    })));



            })
            .catch(console.error);




    }, [data, user.email]);
    console.log(subfiles);

    // 📤 과제 제출
    const SubmitAssign = async () => {
        const url = `${API_BASE_URL}/assign/submit`;
        const formData = new FormData();
        formData.append("email", user.email);
        formData.append("lectureId", lectureId);
        formData.append("assignId", resdata.id);
        formData.append("title", title);
        formData.append("content", content);
        subfiles.forEach(f => formData.append("files", f.file));


        try {
            const response = await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
            alert("등록에 성공하였습니다.");
            navigate("/asnlst");
        } catch (err) {
            alert("등록 실패");
            console.error(err);
        }
    };

    console.log(resdata);

    const SubmitMod = async () => {
        const url = `${API_BASE_URL}/assign/submit`;
        const formData = new FormData();
        formData.append("email", user.email);
        formData.append("lectureId", lectureId);
        formData.append("assignId", resdata.id);
        formData.append("title", title);
        formData.append("content", content);
        subfiles.forEach(f => formData.append("files", f.file));

        try {
            const response = await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
            alert("등록에 성공하였습니다.");
            setMod(false);
            navigate("/asnlst");
        } catch (err) {
            alert("등록 실패");
            console.error(err);
        }
    };
    // 📂 파일 선택 및 미리보기 관리
    const Fileselect = e => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 3) {
            alert("3개까지만 첨부할 수 있습니다.");
            fileRef.current.value = "";
            return;
        }
        const newFiles = (selectedFiles.map(file => ({
            file,
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file)
        })));
        setSubfiles(newFiles);
    };

    const removeFile = name => {
        const fileToRemove = subfiles.find(f => f.name === name);
        if (fileToRemove) URL.revokeObjectURL(fileToRemove.url);
        setSubfiles(prev => prev.filter(f => f.name !== name));
        fileRef.current.value = "";
    };

    // 🎓 교수용 제출 목록
    const ProfessorSubmitTable = () => (
        <Card className="mt-4">
            <CardBody>
                <Table bordered hover responsive>
                    <thead className="table-light">
                        <tr>
                            <th>ID</th><th>이름</th><th>제목</th><th>내용</th><th>작성날짜</th><th>파일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resdata.submitAsgmtDto?.length > 0 ? (
                            resdata.submitAsgmtDto.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.id}</td>
                                    <td>{item.username}</td>
                                    <td>{item.title.length > 10 ? item.title.slice(0, 10) + "..." : item.title}</td>
                                    <td>{item.content.length > 30 ? item.content.slice(0, 30) + "..." : item.content}</td>
                                    <td>{new Date(item.updateAt).toLocaleString("ko-KR")}</td>
                                    <td>
                                        {resdata.attachmentSubmittedDto?.length ? (
                                            <ul className="mt-2 mb-0">
                                                {resdata.attachmentSubmittedDto.map((file, j) => (
                                                    <li key={j}>
                                                        <a href={`${API_BASE_URL}/notice/files/download/${file.storedKey}`} target="_blank" rel="noopener noreferrer">{file.name}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <span className="text-muted">첨부 없음</span>}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center text-muted">제출 내역이 없습니다.</td></tr>
                        )}
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    );

    // 🧑 학생 제출 폼
    const StudentSubmitForm = () => (
        <Card>
            <CardBody>
                <Form onSubmit={e => { e.preventDefault(); SubmitAssign(); }}>
                    <Form.Group className="mb-3">
                        <Form.Label>제목</Form.Label>
                        <Form.Control value={title} onChange={e => setTitle(e.target.value)} placeholder="과제 제목" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>내용</Form.Label>
                        <Form.Control as="textarea" rows={10} value={content} onChange={(evt) => setContent(evt.target.value)} placeholder="과제 내용" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>파일 첨부</Form.Label>
                        <Form.Control type="file" multiple ref={fileRef} onChange={Fileselect} />
                    </Form.Group>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                        {subfiles.map((f, i) => (
                            <div key={i} style={{ position: "relative", width: "100px", textAlign: "center" }}>
                                {(f.type || "").startsWith("image/") ? <img src={f.url} alt="preview" width="100%" /> : <div>{f.name}</div>}
                                <Button variant="danger" size="sm" style={{ position: 'absolute', top: '0', right: '0', borderRadius: '50%' }} onClick={() => removeFile(f.name)}>X</Button>
                            </div>
                        ))}
                    </div>
                    <div className="d-flex justify-content-end mt-3 gap-2">
                        <Button type="submit">등록</Button>
                        <Button variant="secondary" onClick={() => navigate("/asnlst")}>취소</Button>
                    </div>
                </Form>
            </CardBody>
        </Card>
    );

    // 🧾 학생 제출 내역
    const StudentSubmitTable = () => {

        if (resdata.submittedOne == null) {
            alert("이미 제출한 내용이 존재합니다.")
            navigate("/asnlst");
        } else {

        }

        return (
            <>
                {mod ?
                    (
                        <>
                            <Card>
                                <CardBody>
                                    <Form onSubmit={(e) => {
                                        e.preventDefault();
                                        SubmitMod();
                                    }}>
                                        <Form.Group>
                                            <Form.Label >
                                                ID
                                            </Form.Label>
                                            <Form.Control
                                                value={resdata.id}
                                                readOnly
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>
                                                이름
                                            </Form.Label>
                                            <Form.Control
                                                value={resdata.username}
                                                readOnly
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>
                                                제목
                                            </Form.Label>
                                            <Form.Control
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>
                                                내용
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>
                                                작성날짜
                                            </Form.Label>
                                            <Form.Control
                                                value={resdata.updateAt}
                                                readOnly
                                            />
                                        </Form.Group>
                                        <Form.Group>
                                            <Form.Label>파일 첨부</Form.Label>
                                            <Form.Control type="file" multiple ref={fileRef} onChange={Fileselect} />
                                        </Form.Group>
                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                            {subfiles.map((f, i) => (
                                                <div
                                                    key={i}
                                                    style={{ position: "relative", width: "100px", textAlign: "center" }}
                                                >
                                                    {(f.type || "").startsWith("image/")
                                                        ? <img src={f.url} alt="preview" width="100%" />
                                                        : <div>{f.name}</div>}

                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        style={{ position: 'absolute', top: 0, right: 0, borderRadius: '50%' }}
                                                        onClick={() => removeFile(f.name)}
                                                    >
                                                        X
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </Form>
                                </CardBody>
                            </Card>
                        </>
                    )
                    :
                    (<Card className="mt-4">
                        <CardBody>
                            <Table bordered hover responsive>
                                <thead className="table-light">
                                    <tr><th>ID</th><th>이름</th><th>제목</th><th>내용</th><th>작성날짜</th><th>파일</th></tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{resdata.submittedOne.id}</td>
                                        <td>{resdata.submittedOne.username}</td>
                                        <td>{resdata.submittedOne.title.length > 10 ? resdata.submittedOne.title.slice(0, 10) + "..." : resdata.submittedOne.title.length}</td>
                                        <td>{resdata.submittedOne.content.length > 20 ? resdata.submittedOne.content.slice(0, 20) + "..." : resdata.submittedOne.content.length}</td>
                                        <td>{new Date(resdata.submittedOne.updateAt).toLocaleString("ko-KR")}</td>
                                        <td>
                                            {resdata.attachmentSubmittedDto?.length ? (
                                                resdata.attachmentSubmittedDto.map((f, i) => (
                                                    <a key={i} href={`${API_BASE_URL}/notice/files/download/${f.storedKey}`} target="_blank" rel="noreferrer">{f.name}</a>
                                                ))
                                            ) : <span className="text-muted">첨부 없음</span>}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                            <div className="d-flex justify-content-end mt-3 gap-2">
                                <Button
                                    onClick={() => setMod(true)}
                                >
                                    수정
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                    )}
            </>
        )
    }


    //수정 페이지




    // 🧩 메인 렌더링
    return (
        <Container style={{ maxWidth: "1000px", marginTop: "2rem" }}>
            {/* 과제 상세 */}
            <Card>
                <CardBody>
                    <CardTitle>
                        <h3 className="fw-bold mb-3">{resdata.title}</h3>
                        <div className="text-muted mb-3" style={{ fontSize: "14px" }}>
                            작성자: {resdata.username} | 등록일: {new Date(resdata.createAt).toLocaleString()}
                        </div>
                    </CardTitle>
                    <div className="p-3 border rounded mb-4" style={{ whiteSpace: "pre-wrap", minHeight: "200px" }}>
                        {resdata.content}
                    </div>
                    {resdata.attachmentDto?.length > 0 && (
                        <div className="mb-4">
                            <strong>📎 첨부파일</strong>
                            <ul className="mt-2">
                                {resdata.attachmentDto.map((file, i) => (
                                    <li key={i}>
                                        <a href={`${API_BASE_URL}/notice/files/download/${file.storedKey}`} target="_blank" rel="noopener noreferrer">
                                            {file.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* 역할별 화면 */}
            {user.roles.includes("STUDENT") && (
                resdata.submittedOne ? <StudentSubmitTable /> : <StudentSubmitForm />
            )}
            {user.roles.includes("PROFESSOR") && <ProfessorSubmitTable />}
        </Container>
    );
}

export default App;
