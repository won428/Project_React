import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';
import { useNavigate, useParams } from 'react-router-dom';

const APPEAL_TYPES = [
    { value: 'ASSIGNMENTSCORE', label: '과제 이의제기' },
    { value: '', label: '성적 이의제기' },
    { value: 'GRADE', label: '성적 이의제기' }
];

const STATUS_OPTIONS = [
    { value: 'PENDING', label: '대기' },
    { value: 'APPROVED', label: '승인' },
    { value: 'REJECTED', label: '반려' }
];



function CreditAppeal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const userId = user?.id;
    const { lectureId } = useParams();

    const [lectureName, setLectureName] = useState('');
    const [professorId, setProfessorId] = useState('');
    const [professorName, setProfessorName] = useState('');

    // 기본 신청 상태
    const [appealForm, setAppealForm] = useState({
        lectureId: Number(''),
        sendingId: userId || '',
        receiverId: professorId || '',           // 담당 교수/관리자 ID
        title: '',
        content: '',
        appealDate: new Date().toISOString().slice(0, 10),
        status: 'PENDING',
        appealType: 'GRADE'
    });

    // 수강 강의 목록
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState([]);
    const [error, setError] = useState(null);

    // 강의 정보 조회 -> professorId + lectureName 가져오기
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/appeals/lectures/${lectureId}`)
            .then(res => {
                setLectureName(res.data.lecName);
                setProfessorId(res.data.userId); // 강의 담당 교수의 userId
                setProfessorName(res.data.userName);
                setAppealForm(prev => ({
                    ...prev,
                    lectureId: lectureId,   // ★ 강의ID
                    receiverId: res.data.userId // 교수ID
                }));
            })
            .catch(err => console.error(err));
    }, [lectureId]);


    useEffect(() => {
        if (professorId) {
            axios.get(`${API_BASE_URL}/api/appeals/users/${professorId}`)
                .then(res => setProfessorName(res.data.name))
                .catch(err => console.error(err));
        }
    }, [professorId]);


    useEffect(() => {
        // 해당 학생 수강 강의 조회
        axios.get(`${API_BASE_URL}/api/appeals/enrollments`, { params: { userId } })
            .then(res => {
                setLectures(res.data);
            })
            .catch(err => {
                console.error(err);
                setError('수강 강의를 불러오는 데 실패했습니다.');
            });
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAppealForm(prev => ({ ...prev, [name]: value }));
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_BASE_URL}/api/appeals/myappeal`, appealForm)
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
                                    {APPEAL_TYPES.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
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

                <Button type="submit" variant="primary" style={{ marginRight: 8 }}>신청 제출</Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>취소</Button>
            </Form>
        </Container>
    );
}

export default CreditAppeal;
