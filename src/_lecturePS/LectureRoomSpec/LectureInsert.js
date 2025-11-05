import { useEffect, useRef, useState } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { useAuth } from "../../public/context/UserContext";
import { useLectureStore } from "./store/lectureStore";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";


function App() {
    const { user } = useAuth();
    const [title, setTitle] = useState();
    const [content, setContent] = useState();
    const [subfiles, setSubfiles] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
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

    console.log("RENDERING?");

    const SubmitOnlineLec = async (evt) => {
        const url = `${API_BASE_URL}/online/insert`
        const formData = new FormData();
        formData.append("email", user?.email);
        formData.append("lectureId", lectureId)
        formData.append("title", title);
        formData.append("startDate", format(startDate, "yyyy-MM-dd"));
        formData.append("endDate", format(endDate, "yyyy-MM-dd"));
        subfiles.forEach(file => {
            formData.append("files", file.file)
        })




        const respone = await axios.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        if (respone.status === 200) {
            alert("등록에 성공하였습니다.");
            navigate("/asnlst");
        } else {
            alert(respone.statusText)
        }
    }

    const Fileselect = (evt) => {
        const { files } = evt.target;
        const selectedFiles = Array.from(files);
        const totalCount = selectedFiles.length;
        if (totalCount > 3) {
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
    console.log(subfiles);

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
            <Container style={{ maxWidth: "800px", marginTop: "2rem" }}>
                <Card>
                    <Card.Body>
                        <Form onSubmit={(e) => {
                            e.preventDefault();
                            SubmitOnlineLec();
                        }}>
                            <Form.Group>
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
                                        <Form.Label>시작일 선택 :</Form.Label>
                                        <div style={{ display: "inline-block" }}>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                                dateFormat="yyyy-MM-dd"
                                                placeholderText="시작일을 선택하세요"
                                                minDate={new Date()}
                                                isClearable
                                                className="form-control"
                                                wrapperClassName="datePicker" // ✅ wrapper 커스텀도 가능
                                                style={{ width: "150px" }}
                                            />
                                        </div>
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
                        </Form>
                        <div className="d-flex justify-content-end mt-3 gap-2">
                            <Button
                                type="submit"
                                onClick={(e) => {
                                    e.preventDefault();
                                    SubmitOnlineLec();
                                }}
                            >
                                등록
                            </Button>
                            <Button>
                                취소
                            </Button>
                        </div>
                    </Card.Body>

                </Card>
            </Container >
        </>
    )
}
export default App;