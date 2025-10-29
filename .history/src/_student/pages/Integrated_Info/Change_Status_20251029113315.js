// src/_student/pages/Integrated_Info/ChangeStatusPage.jsx
import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';

const OPTIONS = [
    { value: 'ON_LEAVE', label: '휴학 신청' },
    { value: 'RETURNED', label: '복학 신청' },
    { value: 'GRADUATED', label: '졸업 처리 요청' },
    { value: 'ENROLLED', label: '재학 상태 유지' },
    { value: 'MILITARY_LEAVE', label: '군 휴학' },
    { value: 'MEDICAL_LEAVE', label: '입원 출석 인정' }
];

 function App() {
    const navigate = useNavigate();
    const { state } = useLocation(); // 기대: state?.userId
    const today = new Date().toISOString().slice(0, 10);

    const [form, setForm] = useState({
        userId: null,
        studentStatus: 'ON_LEAVE',
        title: '',
        content: '',
        appliedDate: today
    });
    

    useEffect(() => {
        const incomingUserId = state?.userId ?? null;
        if (!incomingUserId) {
            navigate(-1, { replace: true });
            return;
        }
        setForm(s => ({ ...s, userId: incomingUserId }));
    }, [state, navigate]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(s => ({ ...s, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!form.userId) return;

        setLoading(true);
        const token = sessionStorage.getItem('accessToken');

        const body = {
            userId: form.userId,
            studentStatus: form.studentStatus,
            title: form.title,
            content: form.content,
            appliedDate: form.appliedDate,
            status: 'PENDING'
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/api/student/record`, body, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const id = res.data?.recordId ?? res.data?.id ?? '';
            setNotice(id ? `신청이 접수되었습니다. 접수번호: ${id}` : '신청이 접수되었습니다.');
            setForm(s => ({ ...s, title: '', content: '' }));
        } catch (err) {
            setNotice('신청 제출 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container style={{ maxWidth: 720, marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>학적 변경 신청</h3>

            {notice && (
                <Alert variant="secondary" onClose={() => setNotice('')} dismissible>
                    {notice}
                </Alert>
            )}

            <Form onSubmit={onSubmit}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label>신청 목적</Form.Label>
                        <Form.Select
                            name="studentStatus"
                            value={form.studentStatus}
                            onChange={onChange}
                            required
                        >
                            {OPTIONS.map(o => (
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
                        placeholder="신청 내용을 입력하세요"
                        required
                    />
                </Form.Group>

                <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? '제출 중...' : '신청 접수'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={loading}>
                        이전
                    </Button>
                    <Button type="button" variant="outline-secondary" onClick={() => navigate('/ChangeStatusList')} disabled={loading}>
                        내 신청내역 보기
                    </Button>
                </div>
            </Form>
        </Container>
    );
}
export default App;