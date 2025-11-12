import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, FormGroup, Row } from "react-bootstrap";
import { API_BASE_URL } from "../../config/config";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state;

    const [post, setPost] = useState({
        title: '',
        description: '',
        calStartDate: null,
        eneDate: null // 
    });


    useEffect(() => {
        const url = `${API_BASE_URL}/calendar/one/${data}`
        axios.get(url)
            .then((res) => {
                // [수정] 
                // 서버에서 받은 '문자열' 날짜를 'Date 객체'로 변환해야
                // DatePicker가 올바르게 인식합니다.
                const fetchedData = res.data;
                setPost({
                    ...fetchedData,
                    calStartDate: new Date(fetchedData.calStartDate),
                    eneDate: new Date(fetchedData.eneDate)
                });
            })
            .catch((e) => {
                console.log(e);
            })

    }, [data])



    const handleUpdateSubmit = async (e) => {
        e.preventDefault(); // 폼 기본 동작 방지

        // 서버가 /calendar/update/{id} 엔드포인트를 사용한다고 가정
        const updateUrl = `${API_BASE_URL}/calendar/put/${data}`;
        try {
            const formattedPost = {
                ...post,
                calStartDate: format(post.calStartDate, "yyyy-MM-dd"),
                eneDate: format(post.eneDate, "yyyy-MM-dd"),
                id: data
            }
            console.log(formattedPost);

            // PUT 요청으로 'post' 객체 전체를 전송
            await axios.put(updateUrl, formattedPost);

            alert("일정 변경이 성공적으로 수정되었습니다.");
            navigate("/acschemod"); // 수정 완료 후 목록 페이지로 이동

        } catch (error) {
            console.error("수정 중 오류 발생:", error);
            alert("수정에 실패했습니다.");
        }
    };

    const handeldata = (e) => {
        const { name, value } = e.target
        setPost((prev) => (({ ...prev, [name]: value })))

    }
    const handleStartDateChange = (date) => {

        setPost((prev) => ({
            ...prev,
            calStartDate: date
        }));
    };

    const handleEndDateChange = (date) => {
        setPost((prev) => ({
            ...prev,
            eneDate: date
        }));
    };

    return (
        <Container className="mt-3 bg-light p-4 rounded-3 shadow-sm">
            <h2 className="text-center mb-4 text-primary">학사일정 관리</h2>
            <Row className="mb-3 justify-content-center">
                <Col md={3}>

                </Col>
            </Row>

            <Row>
                <Form
                    onSubmit={handleUpdateSubmit}>
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
                                        value={post.title}
                                        name='title'
                                        onChange={handeldata}
                                        style={{ width: '700px' }}
                                    />
                                </FormGroup>
                                <br />
                                <FormGroup>
                                    <Form.Control
                                        placeholder="상세 내용"
                                        style={{ width: '700px' }}
                                        value={post.description}
                                        name='description'
                                        onChange={handeldata}
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
                                                    selected={post.calStartDate}
                                                    onChange={handleStartDateChange}
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
                                                    selected={post.eneDate}
                                                    onChange={handleEndDateChange}
                                                    dateFormat="yyyy-MM-dd"
                                                    placeholderText="종료일을 선택하세요"
                                                    minDate={post.calStartDate}
                                                    isClearable
                                                    className="form-control"
                                                    wrapperClassName="datePicker" // ✅ wrapper 커스텀도 가능
                                                    style={{ width: "150px" }}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                </Form.Group>
                                <div className="d-flex align-items-end">
                                    <Button
                                        type="submit"

                                    >
                                        일정 수정
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