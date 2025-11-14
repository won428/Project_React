import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';
import { useNavigate, useParams } from 'react-router-dom';

function CreditAppeal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const userId = user?.id;
    const { lectureId } = useParams();

    const [lectureName, setLectureName] = useState('');
    const [professorId, setProfessorId] = useState('');
    const [professorName, setProfessorName] = useState('');
    const [grade, setGrade] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [files, setFiles] = useState([]); // 🔹 여러 파일 상태

    const numLecId = Number(lectureId);

    const [appealForm, setAppealForm] = useState({
        lectureId: numLecId,
        sendingId: userId || '',
        receiverId: professorId || '',
        title: '',
        content: '',
        appealType: 'ASSIGNMENT',
        attachmentDtos: []
    });

    const metrics = [
        { key: 'ascore', label: '출석' },
        { key: 'asScore', label: '과제' },
        { key: 'tscore', label: '중간고사' },
        { key: 'ftScore', label: '기말고사' },
        { key: 'totalScore', label: '총점' },
        { key: 'lectureGrade', label: '학점' }
    ];

    // 강의 정보 가져오기
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/appeals/lectures/${lectureId}`)
            .then(res => {
                setLectureName(res.data.lecName);
                setProfessorId(res.data.userId);
                setProfessorName(res.data.userName);
                setAppealForm(prev => ({
                    ...prev,
                    lectureId: Number(lectureId),
                    receiverId: res.data.userId
                }));
            })
            .catch(err => console.error(err));
    }, [lectureId]);

    // 교수 이름 조회
    useEffect(() => {
        if (professorId) {
            axios.get(`${API_BASE_URL}/api/appeals/users/${professorId}`)
                .then(res => setProfessorName(res.data.name))
                .catch(err => console.error(err));
        }
    }, [professorId]);

    // 성적 조회
    useEffect(() => {
        if (!userId || !lectureId) return;
        axios.get(`${API_BASE_URL}/api/appeals/grades/one`, {
            params: { userId: userId, lectureId: lectureId }
        })
            .then(res => setGrade(res.data))
            .catch(err => console.error("성적 불러오기 실패:", err));
    }, [userId, lectureId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAppealForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files)); // 🔹 여러 파일 선택 가능
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('lectureId', appealForm.lectureId);
        formData.append('sendingId', appealForm.sendingId);
        formData.append('receiverId', appealForm.receiverId);
        formData.append('appealType', appealForm.appealType);
        formData.append('title', appealForm.title);
        formData.append('content', appealForm.content);

        // 🔹 여러 파일 전송
        files.forEach((file, idx) => {
            formData.append('files', file); // 서버에서 files[]로 받도록 설계 필요
        });

        axios.post(`${API_BASE_URL}/api/appeals/myappeal`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(() => {
                alert('이의제기 신청이 완료되었습니다.');
                navigate('/CreditAppealList');
            })
            .catch(err => {
                console.error(err);
                alert('신청 제출 중 오류가 발생했습니다.');
            });
    };

    return (
        <Container style={{ maxWidth: 720, marginTop: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>성적 이의제기 신청</h3>

            <Button variant="secondary" onClick={() => navigate('/CreditAppealList')}>
                나의 이의신청 목록 보기
            </Button>

            <Form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>강의명</Form.Label>
                            <Col sm={9}>
                                <Form.Control type="text" readOnly value={lectureName} />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>담당 교수</Form.Label>
                            <Col sm={9}>
                                <Form.Control type="text" readOnly value={professorName} />
                            </Col>
                        </Form.Group>

                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setShowModal(true)}
                            disabled={!grade}
                        >
                            나의 성적 보기
                        </Button>
                    </Col>

                    <Col md={6}>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>이의제기 유형</Form.Label>
                            <Col sm={9}>
                                <Form.Select
                                    name="appealType"
                                    value={appealForm.appealType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value={'ASSIGNMENT'}>과제</option>
                                    <option value={'MIDTERMEXAM'}>중간고사</option>
                                    <option value={'FINALEXAM'}>기말고사</option>
                                </Form.Select>
                            </Col>
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>제목</Form.Label>
                    <Form.Control
                        name="title"
                        value={appealForm.title}
                        onChange={handleChange}
                        placeholder="제목을 입력하세요"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>내용</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        name="content"
                        value={appealForm.content}
                        onChange={handleChange}
                        placeholder="이의제기 내용을 입력하세요"
                        required
                    />
                </Form.Group>

                {/* 🔹 여러 파일 선택 가능 */}
                <Form.Group className="mb-3">
                    <Form.Label>증빙 파일 첨부 (여러 개 가능)</Form.Label>
                    <Form.Control type="file" multiple onChange={handleFileChange} />
                </Form.Group>

                <Button type="submit" variant="primary" style={{ marginRight: 8 }}>
                    신청 제출
                </Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>취소</Button>
            </Form>

            {/* 나의 성적 Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>나의 성적</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {grade ? (
                        <Table bordered size="sm">
                            <thead>
                                <tr>
                                    {metrics.map(metric => (
                                        <th key={metric.key}>{metric.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {metrics.map(metric => (
                                        <td key={metric.key}>{grade[metric.key]}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </Table>
                    ) : (
                        <p>성적 정보를 불러오는 중...</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>닫기</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default CreditAppeal;
