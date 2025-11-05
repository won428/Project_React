import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Container, Form, Button, Table, CardTitle } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import { useAuth } from "../../public/context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLectureStore } from "./store/lectureStore";
import { el } from "date-fns/locale";

/**
 * 4. (교수용) 학생 제출물 목록 테이블
 */
const ProfessorSubmitTable = ({ resdata, API_BASE_URL }) => (
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
                                    {/* [!] 잠재적 버그 알림:
                                      이 로직은 모든 학생의 제출물(item)에 대해
                                      '전체' 첨부파일(resdata.attachmentSubmittedDto)을 순회합니다.
                                      만약 `item` 안에 해당 학생의 파일 목록(예: item.attachments)이 따로 있다면
                                      그것을 순회(item.attachments.map(...))해야 합니다.
                                    */}
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






/**
 * 5. (학생용) 신규 과제 제출 폼
 */
const StudentSubmitForm = ({
    SubmitAssign, title, setTitle, content, setContent,
    fileRef, Fileselect, subfiles, removeFile, navigate
}) => (
    <Card>
        <CardBody>
            {/* ✅ FIX 1: e.preventDefault()를 추가하여 등록 시 새로고침 방지 */}
            <Form onSubmit={e => {
                e.preventDefault();
                SubmitAssign();
            }}>
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

/**
 * 7. (학생용) 과제 수정 폼 (mod === true)
 */
const ModisTrue = ({
    resdata, title, setTitle, content, setContent,
    fileRef, Fileselect, subfiles, removeFile,
    SubmitMod, setMod
}) => {
    return (
        <Card>
            <CardBody>
                {/* ✅ FIX 2: 수정 완료 버튼을 위해 Form에 onSubmit과 e.preventDefault() 추가 */}
                <Form onSubmit={e => {
                    e.preventDefault();
                    SubmitMod();
                }}>
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
                        <Form.Control value={resdata.updateAt} readOnly />
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
                        <Button variant="secondary" onClick={() => setMod(false)}>취소</Button>
                    </div>
                </Form>
            </CardBody>
        </Card>
    );
}

/**
 * 8. (학생용) 제출 내역 조회 (mod === false)
 */
const ModisFailure = ({ resdata, API_BASE_URL, handleEdit }) => {
    return (
        <Card className="mt-4">
            <CardBody>
                <Table bordered hover responsive>
                    <thead className="table-light">
                        <tr><th>ID</th><th>이름</th><th>제목</th><th>내용</th><th>작성날짜</th><th>파일</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{resdata.submittedOne.id}</td>
                            <td>{resdata.submittedOne.username}</td>
                            <td>{resdata.submittedOne.title.length > 10 ? resdata.submittedOne.title.slice(0, 10) + "..." : resdata.submittedOne.title}</td>
                            <td>{resdata.submittedOne.content.length > 20 ? resdata.submittedOne.content.slice(0, 20) + "..." : resdata.submittedOne.content}</td>
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
                    <Button onClick={() => handleEdit()}>
                        수정
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}

/**
 * 9. (학생용) 조회/수정 모드 전환 컨테이너
 */
const StudentSubmitTable = (props) => {
    return (
        <>
            {props.mod
                // `ModisTrue`에 필요한 모든 props 전달
                ? <ModisTrue
                    resdata={props.resdata}
                    title={props.title}
                    setTitle={props.setTitle}
                    content={props.content}
                    setContent={props.setContent}
                    fileRef={props.fileRef}
                    Fileselect={props.Fileselect}
                    subfiles={props.subfiles}
                    removeFile={props.removeFile}
                    SubmitMod={props.SubmitMod}
                    setMod={props.setMod}
                />
                // `ModisFailure`에 필요한 모든 props 전달
                : <ModisFailure
                    resdata={props.resdata}
                    API_BASE_URL={props.API_BASE_URL}
                    handleEdit={props.handleEdit}
                />
            }
        </>
    )
}

// 메인 App 컴포넌트

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
    console.log("APP 랜더링");

    // 📦 과제 상세 데이터 로드
    useEffect(() => {
        if (!data || !user?.email) { return; }
        const url = `${API_BASE_URL}/assign/specific`;
        axios.get(url, { params: { id: data, email: user.email } })
            .then(res => {
                setResData(res.data);
                console.log(res.data);
            })
            .catch(console.error);
    }, [data, user?.email]);



    // 1. 신규 제출 로직
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
            await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
            setSubfiles([]);
            alert("등록에 성공하였습니다.");
            navigate("/asnlst");
        } catch (err) {
            alert("등록 실패");
            console.error(err);
        }
    };

    // 2. 학생 제출 내역 수정 로직
    const SubmitMod = async () => {
        const url = `${API_BASE_URL}/assign/update/${resdata.id}`;

        const formData = new FormData();
        formData.append("email", user.email);
        formData.append("lectureId", lectureId);
        formData.append("title", title);
        formData.append("content", content);

        if (subfiles && subfiles.length > 0) {
            subfiles.forEach(f => {
                if (f.file) formData.append("files", f.file);
            });
        }

        try {
            const res = await axios.put(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
            console.log(url);
            if (res.status === 200) {
                alert("수정에 성공하였습니다.");
                setMod(false);
                navigate("/asnlst");
            }
        } catch (err) {
            alert("수정 실패");

            console.error(err);
        }
    };

    // 교수 과제 공지 내역 수정
    const NoticeMod = async () => {

        const url = `${API_BASE_URL}/assign/assignupdate/${resdata.id}`;
        const formData = new FormData();
        formData.append("email", user.email);
        formData.append("lectureId", lectureId);
        formData.append("assignId", resdata.id);
        formData.append("title", title);
        formData.append("content", content);

        // 🚨 현재 로직: f.file이 없는 기존 파일은 'undefined'로 전송되어 누락됨

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
        try {
            const res = await axios.put(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
            if (res.status === 200) {
                alert("수정에 성공하였습니다.");
                setMod(false);
                navigate("/asnlst");
            }
        } catch (err) {
            alert("수정 실패");
            console.error(err);
        }
    };

    // 3. 파일 선택 핸들러
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

    // 4. 파일 삭제 핸들러
    const removeFile = name => {
        const fileToRemove = subfiles.find(f => f.name === name);
        if (fileToRemove && fileToRemove.file) URL.revokeObjectURL(fileToRemove.url);
        setSubfiles(prev => prev.filter(f => f.name !== name));
        if (fileRef.current) { // (fileRef.current가 null일 수 있으니 체크)
            fileRef.current.value = "";
        }

    };
    console.log("subfiles:", subfiles);
    // 6. 수정 모드 진입 핸들러
    const handleEdit = (e) => {
        if (resdata?.submittedOne) {
            setTitle(resdata.submittedOne.title);
            setContent(resdata.submittedOne.content);
            const submittedFiles = resdata.attachmentSubmittedDto || [];

            // 기존 파일은 { file } 객체 없이 메타데이터만 저장
            setSubfiles(submittedFiles.map(file => ({
                name: file.name,
                url: `${API_BASE_URL}/notice/files/download/${file.storedKey}`,
                type: file.contentType,
                size: file.sizeBytes,
                storedKey: file.storedKey
                // 'file' 속성이 없음! -> SubmitMod에서 문제 발생
            })));
        }
        console.log("subfiles:", subfiles);

        setMod(true);
    };
    const handlePro = (e) => {
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



    const deleteAssign = async (e) => {
        const url = `${API_BASE_URL}/assign/delete/${resdata.id}`
        const res = await axios.delete(url);

        if (res.status === 200) {
            alert("삭제 성공.")
            setMod(false);
            navigate("/asnlst");
        } else {
            alert("삭제에 실패하였습니다.")
            return;
        }

    }
    console.log(subfiles);

    // 🧩 메인 렌더링
    return (
        <Container style={{ maxWidth: "1000px", marginTop: "2rem" }}>
            {/* 과제 상세 */}
            {mod
                ?
                <Card>
                    <CardBody>
                        <Form onSubmit={e => {
                            e.preventDefault();
                            NoticeMod();
                        }}>
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
                                <Form.Control value={resdata.updateAt} readOnly />
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
                        </Form>
                    </CardBody>
                </Card>
                :
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
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => navigate(-1)}>
                                목록으로
                            </Button>
                            {user?.id === resdata.userId && (
                                <>
                                    <Button
                                        type="submit"
                                        variant="warning"
                                        onClick={(e) => {
                                            handlePro()
                                        }}
                                    >수정</Button>
                                    <Button
                                        variant="danger"
                                        onClick={(e) => {
                                            deleteAssign()
                                        }}
                                    >삭제</Button>
                                </>
                            )}
                        </div>
                    </CardBody>
                </Card>}

            {/* 역할별 화면 */}
            {/* ✅ FIX: 컴포넌트를 호출하고 props를 전달하는 방식으로 변경 */}
            {user.roles.includes("STUDENT") && (
                resdata.submittedOne
                    ? <StudentSubmitTable
                        // `StudentSubmitTable` 및 그 자식들(`ModisTrue`, `ModisFailure`)에 필요한 모든 props
                        mod={mod}
                        setMod={setMod}
                        resdata={resdata}
                        API_BASE_URL={API_BASE_URL}
                        handleEdit={handleEdit}
                        title={title}
                        setTitle={setTitle}
                        content={content}
                        setContent={setContent}
                        fileRef={fileRef}
                        Fileselect={Fileselect}
                        subfiles={subfiles}
                        removeFile={removeFile}
                        SubmitMod={SubmitMod}
                    />
                    : <StudentSubmitForm
                        // `StudentSubmitForm`에 필요한 모든 props
                        SubmitAssign={SubmitAssign}
                        title={title}
                        setTitle={setTitle}
                        content={content}
                        setContent={setContent}
                        fileRef={fileRef}
                        Fileselect={Fileselect}
                        subfiles={subfiles}
                        removeFile={removeFile}
                        navigate={navigate}
                    />
            )}
            {user.roles.includes("PROFESSOR") && (
                <ProfessorSubmitTable
                    resdata={resdata}
                    API_BASE_URL={API_BASE_URL}
                />
            )}
        </Container>
    );
}

export default App;