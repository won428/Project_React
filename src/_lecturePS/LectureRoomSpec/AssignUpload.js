import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row, Form, Button } from "react-bootstrap";
import { useAuth } from "../../public/context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../public/config/config";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { useLectureStore } from "./store/lectureStore";

function App() {
    const { user } = useAuth();
    const [title, setTitle] = useState();
    const [content, setContent] = useState();
    const [subfiles, setSubfiles] = useState([]);
    const [startDate] = useState(new Date());
    const { lectureId } = useLectureStore();
    const [endDate, setEndDate] = useState(() => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7); // ✅ 7일 뒤로 설정
        return nextWeek;
    });
    const fileRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            subfiles.forEach(f => URL.revokeObjectURL(f.url))
        };


    }, [subfiles])

    console.log(lectureId);

    const SubmitAssign = async (evt) => {
        const url = `${API_BASE_URL}/assign/insert`
        const formData = new FormData();
        formData.append("email", user?.email);
        formData.append("lectureId", lectureId)
        formData.append("title", title);
        formData.append("content", content);
        formData.append("openAt", format(startDate, "yyyy-MM-dd"));
        formData.append("dueAt", format(endDate, "yyyy-MM-dd"));
        subfiles.forEach(file => {
            formData.append("files", file.file)
        })
        console.log(formData.get("email"));

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
                                    <Form.Group className="mb-3" onSubmit={() => SubmitAssign}>
                                        <Form.Label>
                                            제목
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="과제 제목"
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
                                            placeholder="과제 내용"
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
                                    <Form.Group>
                                        <div className="d-flex flex-wrap gap-2">
                                            {subfiles.map((f, i) => (
                                                <div key={i} style={{ width: "100px", textAlign: "center", position: "relative" }}>
                                                    {(f.type || "").startsWith("image/") ? (
                                                        <img src={f.url} alt="preview" width="100%" />
                                                    ) : (
                                                        <div style={{ fontSize: "13px" }}> {f.name}</div>
                                                    )}
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        style={{ position: 'absolute', top: '0', right: '0', padding: '0.1rem 0.3rem', lineHeight: '1', borderRadius: "50%", }}
                                                        onClick={() => removeFile(f.name)}
                                                    >
                                                        X
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </Form.Group>
                                    <br />
                                    <Form.Group>
                                        <Row className="align-items-center mb-2">
                                            <Col xs="auto">
                                                <Form.Label>작성 시각 :</Form.Label>
                                            </Col>
                                            <Col xs="auto">
                                                <Form.Control
                                                    type="text"
                                                    value={startDate.toLocaleDateString()}
                                                    readOnly
                                                    style={{ width: "150px" }}
                                                />
                                            </Col>

                                            <Col xs="auto">
                                                <Form.Label>종료일 선택 :</Form.Label>
                                                <div style={{ display: "inline-block" }}>
                                                    <DatePicker
                                                        selected={endDate}
                                                        onChange={(date) => setEndDate(date)}
                                                        dateFormat="yyyy-MM-dd"
                                                        placeholderText="종료일을 선택하세요"
                                                        minDate={startDate}
                                                        isClearable
                                                        className="form-control"
                                                        wrapperClassName="datePicker" // ✅ wrapper 커스텀도 가능
                                                        style={{ width: "150px" }}
                                                    />
                                                </div>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col>
                                                {endDate && (
                                                    <p style={{ marginTop: "10px" }}>
                                                        기간: {startDate.toLocaleDateString()} ~ {endDate.toLocaleDateString()}
                                                    </p>
                                                )}
                                            </Col>
                                        </Row>
                                    </Form.Group>

                                    <div className="d-flex justify-content-end mt-3 ">
                                        <Button
                                            type="button"
                                            onClick={SubmitAssign}

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
            </Container >
        </>
    )
}
export default App;