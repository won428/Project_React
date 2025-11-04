import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';
import { useNavigate, useLocation } from 'react-router-dom';

const APPEAL_TYPES = [
    { value: 'ATTENDANCE', label: '출결 이의제기' },
    { value: 'ASSIGNMENT', label: '과제 이의제기' },
    { value: 'GRADE', label: '성적 이의제기' }
];

function CreditAppeal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userId = user?.id;
    const today = new Date().toISOString().slice(0, 10);

    // query param으로 detail/edit 모드 구분
    const query = new URLSearchParams(location.search);
    const appealId = query.get('appealId');
    const readonly = query.get('readonly') === "true";

    const [appealForm, setAppealForm] = useState({
        sendingId: userId || '',
        receiverId: '',
        enrollmentId: '',
        title: '',
        content: '',
        appealDate: today,
        status: 'PENDING',
        appealType: 'GRADE'
    });

    const [lectures, setLectures] = useState([]);
    const [error, setError] = useState(null);

    // 수강 강의 조회
    useEffect(() => {
        if (!userId) return;
        axios.get(`${API_BASE_URL}/api/appeals/enrollments`, { params: { userId } })
            .then(res => setLectures(res.data))
            .catch(err => {
                console.error(err);
                setError('수강 강의를 불러오는 데 실패했습니다.');
            });
    }, [userId]);

    // 기존 신청 불러오기 (수정/조회 모드)
    useEffect(() => {
        if (!appealId) return;
        axios.get(`${API_BASE_URL}/api/appeals/${appealId}`)
            .then(res => {
                const data = res.data;
                setAppealForm({
                    sendingId: data.sendingId || userId,
                    receiverId: data.receiverId || '',
                    enrollmentId: data.enrollmentId || '',
                    title: data.title || '',
                    content: data.content || '',
                    appealDate: data.appealDate ? data.appealDate.slice(0, 10) : today,
                    status: data.status || 'PENDING',
                    appealType: data.appealType || 'GRADE'
                });
            })
            .catch(err => {
                console.error(err);
                window.alert('기존 신청 정보를 불러오는 데 실패했습니다.');
                navigate(-1);
            });
    }, [appealId, userId, navigate, today]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAppealForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!appealForm.sendingId) return;

        const apiCall = appealId
            ? axios.put(`${API_BASE_URL}/api/appeals/${appealId}`, appealForm)
            : axios.post(`${API_BASE_URL}/api/appeals/myappeal`, appealForm);

        apiCall
            .then(res => {
                window.alert(appealId ? '신청이 수정되었습니다.' : '이의제기 신청이 완료되었습니다.');
                navigate('/CreditAppealList');
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

            <Button variant="secondary" onClick={() => navigate('/CreditAppealList')}>나의 이의신청 목록 보기</Button>

            <Form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label>강의 선택</Form.Label>
                        <Form.Select
                            name="enrollmentId"
                            value={appealForm.enrollmentId}
                            onChange={handleChange}
                            required
                            disabled={readonly}
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
                            disabled={readonly}
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
                        disabled={readonly}
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
                        disabled={readonly}
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

                {!readonly && <Button type="submit" variant="primary" style={{ marginRight: 8 }}>
                    {appealId ? '수정 제출' : '신청 제출'}
                </Button>}
                <Button variant="secondary" onClick={() => navigate(-1)}>취소</Button>
            </Form>
        </Container>
    );
}

export default CreditAppeal;
