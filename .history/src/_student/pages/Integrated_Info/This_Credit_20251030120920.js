import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Tab, Nav, Table, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';

function App() {
    const { user } = useAuth();
    const userId = user?.id;

    const [lectures, setLectures] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [assignmentGrades, setAssignmentGrades] = useState([]);
    const [examGrades, setExamGrades] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/semester/lectures`, { params: { userId } })
            .then(res => {
                setLectures(res.data);
                setSelectedLecture(null);
                setError(null);
            })
            .catch(() => {
                setError('수강 강의를 불러오는 데 실패했습니다.');
            });
    }, [userId]);

    const handleLectureCheck = (lectureId) => {
        setSelectedLecture(prev => (prev === lectureId ? null : lectureId));
    };

    useEffect(() => {
        if (!selectedLecture) {
            setAssignmentGrades([]);
            setExamGrades([]);
            return;
        }

        useEffect(() => {
            axios
                .get(`${API_BASE_URL}/api/grades/assignments`, {
                    params: { userId, lectureIds: [selectedLecture] }
                })
                .then(res => {
                    setAssignmentGrades(res.data);
                })
                .catch(() => {
                    setError('과제 성적을 불러오는 데 실패했습니다.');
                });
        }, [userId, selectedLecture]);

        useEffect(() => {
            axios
                .get(`${API_BASE_URL}/api/grades/exams`, {
                    params: { userId, lectureIds: [selectedLecture] }
                })
                .then(res => {
                    setExamGrades(res.data);
                })
                .catch(() => {
                    setError('시험 성적을 불러오는 데 실패했습니다.');
                });
        }, [userId, selectedLecture]);

        return (
            <Container style={{ marginTop: 24 }}>
                <h3>당학기 성적 조회</h3>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <Row>
                    <Col md={3} style={{ maxHeight: '60vh', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
                        <h5>수강 강의</h5>
                        <Form>
                            {lectures.map(lecture => (
                                <Form.Check
                                    key={lecture.id}
                                    type="radio"
                                    name="lectureRadio"
                                    label={lecture.name}
                                    checked={selectedLecture === lecture.id}
                                    onChange={() => handleLectureCheck(lecture.id)}
                                />
                            ))}
                        </Form>
                    </Col>
                    <Col md={9}>
                        <Tab.Container defaultActiveKey="assignment">
                            <Nav variant="tabs">
                                <Nav.Item>
                                    <Nav.Link eventKey="assignment">과제 성적</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="exam">시험 성적</Nav.Link>
                                </Nav.Item>
                            </Nav>
                            <Tab.Content style={{ marginTop: 12 }}>
                                <Tab.Pane eventKey="assignment">
                                    {assignmentGrades.length === 0 ? (
                                        <div>선택한 강의의 과제 성적이 없습니다.</div>
                                    ) : (
                                        <Table bordered hover size="sm">
                                            <thead>
                                                <tr>
                                                    <th>강의명</th>
                                                    <th>과제명</th>
                                                    <th>점수</th>
                                                    <th>제출일</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assignmentGrades.map((item, idx) => (
                                                    <tr key={item.id || idx}>
                                                        <td>{item.lectureName}</td>
                                                        <td>{item.assignmentName}</td>
                                                        <td>{item.score}</td>
                                                        <td>{item.submittedDate}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </Tab.Pane>
                                <Tab.Pane eventKey="exam">
                                    {examGrades.length === 0 ? (
                                        <div>선택한 강의의 시험 성적이 없습니다.</div>
                                    ) : (
                                        <Table bordered hover size="sm">
                                            <thead>
                                                <tr>
                                                    <th>강의명</th>
                                                    <th>시험명</th>
                                                    <th>점수</th>
                                                    <th>시험일</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {examGrades.map((item, idx) => (
                                                    <tr key={item.id || idx}>
                                                        <td>{item.lectureName}</td>
                                                        <td>{item.examName}</td>
                                                        <td>{item.score}</td>
                                                        <td>{item.examDate}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </Col>
                </Row>
            </Container>
        );
    }
},
export default App;
