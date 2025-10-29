// ChangeStatusPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';
import { useAuth } from '../../../public/context/UserContext';

const OPTIONS = [
    { value: 'ON_LEAVE', label: '휴학 신청' },
    { value: 'RETURNED', label: '복학 신청' },
    { value: 'GRADUATED', label: '졸업 처리 요청' },
    { value: 'ENROLLED', label: '재학 상태 유지' },
    { value: 'MILITARY_LEAVE', label: '군 휴학' },
    { value: 'MEDICAL_LEAVE', label: '입원 출석 인정' }
];

export default function App() {
    const navigate = useNavigate();
    const { user } = useAuth(); // ← 컨텍스트에서 사용자
    const today = new Date().toLocaleDateString('sv');

    const [form, setForm] = useState({
        studentStatus: 'ON_LEAVE',
        title: '',
        content: '',
        appliedDate: today
    });

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(s => ({ ...s, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id) {
            window.alert('로그인이 필요합니다.');
            return;
        }

        // 백엔드가 토큰으로 사용자 식별한다면 userId는 생략
        const body = {
            // userId: user.id, // ← 백엔드 계약상 필요할 때만 포함
            studentStatus: form.studentStatus,
            title: form.title,
            content: form.content,
            appliedDate: form.appliedDate,
            status: 'PENDING'
        };

        try {
            const token = sessionStorage.getItem('accessToken'); // 인터셉터가 있다면 생략 가능
            const res = await axios.post(`${API_BASE_URL}/api/student/record`, body, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const id = res.data?.recordId ?? res.data?.id ?? '';
            window.alert(id ? `신청이 접수되었습니다. 접수번호: ${id}` : '신청이 접수되었습니다.');
            setForm(s => ({ ...s, title: '', content: '' }));
        } catch (err) {
            console.log(err);
            window.alert('신청 제출 중 오류가 발생했습니다.');
        }
    };

    return (
        <Container style={{ maxWidth: 720, marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>학적 변경 신청</h3>

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
                    <Button type="submit" variant="primary">신청 접수</Button>
                    <Button type="button" variant="secondary" onClick={() => navigate(-1)}>이전</Button>
                    <Button type="button" variant="outline-secondary" onClick={() => navigate('/ChangeStatusList')}>
                        내 신청내역 보기
                    </Button>
                </div>
            </Form>
        </Container>
    );
}
