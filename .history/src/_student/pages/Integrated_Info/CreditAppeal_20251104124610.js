import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';
import { useNavigate } from 'react-router-dom';

const APPEAL_TYPES = [
    { value: 'ATTENDANCE', label: '출결 이의제기' },
    { value: 'ASSIGNMENT', label: '과제 이의제기' },
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

    // 기본 신청 상태
    const [appealForm, setAppealForm] = useState({
        sendingId: userId || '',
        receiverId: '',           // 담당 교수/관리자 ID
        enrollmentId: '',       // 선택 강의 ID
        title: '',
        content: '',
        appealDate: new Date().toISOString().slice(0, 10),
        status: 'PENDING',
        appealType: 'GRADE'
    });

    // 수강 강의 목록
    const [lectures, setLectures] = useState([]);
    const [error, setError] = useState(null);

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

    const handleSubmit = () => {
        axios.post(`${API_BASE_URL}/api/appeals`, appealForm)
            .then(res => {
                window.alert('이의제기 신청이 완료되었습니다.');
                navigate(-1);
            })
            .catch(err => {
                console.error(err);
                window.alert('신청 제출 중 오류가 발생했습니다.');
            });
    };

    return (
        <Container style={{ maxWidth: 720, marginTop: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>성적 이의제기 신청</h3>

            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <Button variant="secondary" onClick={() => navigate('/CreditAppealList')}>
                나의 이의신청 목록 보기
            </Button>
            <Form onSubmit={handleSubmit} style={{marginTop: 24}}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label>강의 선택</Form.Label>
                        <Form.Select
                            name="enrollmentId"
                            value={appealForm.enrollmentId}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>강의를 선택하세요</option>
                            {lectures.map(lec => (
                                <option key={lec.lectureId} value={lec.lectureId}>{lec.lectureName}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={6}>
                        <Form.Label>이의제기 유형</Form.Label>
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

                <Form.Group className="mb-3">
                    <Form.Label>신청일</Form.Label>
                    <Form.Control
                        type="date"
                        name="appealDate"
                        value={appealForm.appealDate}
                        readOnly
                    />
                </Form.Group>

                <Button type="submit" variant="primary" style={{ marginRight: 8 }}>신청 제출</Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>취소</Button>
            </Form>
        </Container>
    );
}

export default CreditAppeal;
