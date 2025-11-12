import { Button, Card, Col, Container, Form, FormGroup, Row } from "react-bootstrap";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";



function App() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(() => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7); // ✅ 7일 뒤로 설정
        return nextWeek;
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const navigate = useNavigate();

    const handleFiles = () => {



    }



    const submitEvent = async () => {

        const url = `${API_BASE_URL}/calendar/insert`;
        const formData = new FormData();

        formData.append("title", title);
        formData.append("description", content);
        formData.append("calStartDate", format(startDate, "yyyy-MM-dd"));
        formData.append("eneDate", format(endDate, "yyyy-MM-dd"));
        if (selectedFile) {
            formData.append("excelFile", selectedFile);
        }
        try {
            const respone = await axios.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            console.log(respone);

            if (respone.status === 200) {
                alert("등록 성공")
                navigate(`/acschemod`);
            } else {
                alert("등록 실패")
            }
        } catch {
            alert("서버 오류")
        }
    }


    return (
        <Container className="mt-3 bg-light p-4 rounded-3 shadow-sm">
            <h2 className="text-center mb-3 text-primary">학사일정 생성</h2>
            <Row className="mb-3 justify-content-center">
                <Col md={3} />
            </Row>

            <Row>
                <Form onSubmit={(e) => {
                    e.preventDefault();
                    submitEvent();
                }
                }>
                    <Col>
                        <Card className="shadow-sm" >
                            <Card.Header className="bg-white py-3">
                            </Card.Header>
                            <Card.Body
                                style={{ minHeight: '300px' }}
                                className="d-flex flex-column align-items-center mt-4"
                            >
                                <FormGroup>
                                    <Form.Control
                                        placeholder="일정"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        style={{ width: '700px' }}
                                    />
                                </FormGroup>
                                <br />
                                <FormGroup>
                                    <Form.Control
                                        placeholder="상세 내용"
                                        style={{ width: '700px' }}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </FormGroup>
                                <br />
                                <Form.Group>
                                    <Row className="align-items-center mb-2">
                                        <Col xs="auto">
                                            <Form.Label>시작일 선택 :</Form.Label>
                                        </Col>
                                        <Col xs="auto">
                                            <div style={{ display: "inline-block" }}>
                                                <DatePicker
                                                    selected={startDate}
                                                    onChange={(date) => setStartDate(date)}
                                                    dateFormat="yyyy-MM-dd"
                                                    placeholderText="종료일을 선택하세요"
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
                                </Form.Group>
                                <Form.Group style={{ width: '700px' }} className="mt-3">
                                    <Form.Label>일정 일괄 등록</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept=".xls, .xlsx"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        max={1}
                                    />
                                    <p>  .xls,.xlsx 파일만 가능</p>
                                </Form.Group>
                                <div className="d-flex align-items-end">
                                    <Button
                                        type="submit"

                                    >
                                        일정 등록
                                    </Button>
                                    &nbsp;
                                    <Button
                                        type="button"
                                        onClick={() => navigate("/acschemod")}
                                    >
                                        취소
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                    </Col>

                </Form>
            </Row>
        </Container>
    )
}
export default App;