import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';
import { useAuth } from '../../../public/context/UserContext';

// 나중에 성적 이의제기용 옵션 필요하면 수정
const CREDIT_OPTIONS = [
    { value: 'GRADE_ERROR', label: '성적 오류' },
    { value: 'ATTENDANCE_ISSUE', label: '출석 관련' },
    { value: 'OTHER', label: '기타' }
];

function CreditAppeal() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const today = new Date().toISOString().slice(0, 10);

    // 쿼리 파라미터에서 id 추출 (수정 모드 구분)
    const query = new URLSearchParams(location.search);
    const appealId = query.get('appealId');
    const readonly = query.get('readonly') === "true";

    const [form, setForm] = useState({
        userId: null,
        appealType: 'GRADE_ERROR',
        title: '',
        content: '',
        appliedDate: today
    });

    useEffect(() => {
        if (!user?.id) {
            navigate(-1, { replace: true });
            return;
        }
        setForm(s => ({ ...s, userId: user.id }));
    }, [user, navigate]);

    // 수정 모드: 기존 신청 데이터 불러오기
    useEffect(() => {
        if (!appealId) return;
        axios.get(`${API_BASE_URL}/api/credit/appeal/${appealId}`)
            .then(res => {
                const data = res.data;
                setForm({
                    userId: data.userId || user.id,
                    appealType: data.appealType || 'GRADE_ERROR',
                    title: data.title || '',
                    content: data.content || '',
                    appliedDate: data.appliedDate ? data.appliedDate.slice(0, 10) : today
                });
            })
            .catch(err => {
                console.error('기존 신청 데이터 불러오기 실패:', err);
                window.alert('기존 신청 정보를 불러오는 데 실패했습니다.');
                navigate(-1);
            });
    }, [appealId, user, navigate, today]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(s => ({ ...s, [name]: value }));
    };

    const newSubmit = () => {
        const body = {
            userId: form.userId,
            appealType: form.appealType,
            title: form.title,
            content: form.content,
            appliedDate: form.appliedDate,
            status: 'PENDING'
        };

        axios.post(`${API_BASE_URL}/api/credit/appeal`, body)
            .then(res => {
                const id = res.data?.id ?? '';
                window.alert(id ? `신청이 접수되었습니다. 접수번호: ${id}` : '신청이 접수되었습니다.');
                setForm(s => ({ ...s, title: '', content: '' }));
            })
            .catch(err => {
                console.error(err);
                window.alert('신청 제출 중 오류가 발생했습니다.');
            });
    };

    const updateSubmit = () => {
        const body = {
            userId: form.userId,
            appealType: form.appealType,
            title: form.title,
            content: form.content,
            appliedDate: form.appliedDate,
            status: 'PENDING'
        };
        axios.put(`${API_BASE_URL}/api/credit/appeal/${appealId}`, body)
            .then(() => {
                window.alert('신청이 수정되었습니다.');
                navigate('/CreditAppealList');
            })
            .catch(err => {
                console.error(err);
                window.alert('신청 수정 중 오류가 발생했습니다.');
            });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!form.userId) return;

        if (appealId) {
            updateSubmit();
        } else {
            newSubmit();
        }
    };

    return (
        <Container style={{ maxWidth: 720, marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>성적 이의제기 신청</h3>

            <Form onSubmit={onSubmit}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label>신청 유형</Form.Label>
                        <Form.Select
                            name="appealType"
                            value={form.appealType}
                            onChange={onChange}
                            required
                            disabled={readonly}
                        >
                            {CREDIT_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={6}>
                        <Form.Label>신청일</Form.Label>
                        <Form.Control
                            type="date"
                            name="appliedDate"
                            value={form.appliedDate}
                            readOnly
                        />
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>제목</Form.Label>
                    <Form.Control
                        name="title"
                        value={form.title}
                        onChange={onChange}
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
                        value={form.content}
                        onChange={onChange}
                        placeholder="이의제기 내용을 입력하세요"
                        required
                        disabled={readonly}
                    />
                </Form.Group>

                <div style={{ display: 'flex', gap: 8 }}>
                    {!readonly && (
                        <Button type="submit" variant="primary">신청 접수</Button>
                    )}
                    <Button type="button" variant="secondary" onClick={() => navigate(-1)}>이전</Button>
                    <Button type="button" variant="outline-secondary" onClick={() => navigate('/CreditAppealList')}>내 신청내역 보기</Button>
                </div>
            </Form>
        </Container>
    );
}

export default CreditAppeal;
