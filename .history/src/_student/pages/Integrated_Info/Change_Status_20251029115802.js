import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
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

export default function App() {
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
        try {
            // 전역 인터셉터가 없다면 아래 두 줄 중 하나 사용:
            const token = sessionStorage.getItem('accessToken');
            const res = await axios.post(`${API_BASE_URL}/api/student/record`, {
                studentStatus: form.studentStatus,
                title: form.title,
                content: form.content,
                appliedDate: form.appliedDate,
                status: 'PENDING'
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            const id = res.data?.recordId ?? res.data?.id ?? '';
            window.alert(id ? `신청이 접수되었습니다. 접수번호: ${id}` : '신청이 접수되었습니다.');
            setForm(s => ({ ...s, title: '', content: '' }));
        } catch (err) {
            window.alert('신청 제출 중 오류가 발생했습니다.');
            // 콘솔 로깅은 개발 중에만
            // console.log(err);
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
                </div>
            </Form>
        </Container>
    );
}
