// src/_student/pages/Integrated_Info/ChangeStatusPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';

const STUDENT_STATUS_OPTIONS = [
    { value: 'ON_LEAVE', label: '휴학 신청' },
    { value: 'RETURNED', label: '복학 신청' },
    { value: 'GRADUATED', label: '졸업 처리 요청' },
    { value: 'ENROLLED', label: '재학 상태 유지' },
    { value: 'MILITARY_LEAVE', label: '군 휴학' },
    { value: 'MEDICAL_LEAVE', label: '입원 출석 인정' }
];

export default function ChangeStatusPage() {
    const navigate = useNavigate();
    const location = useLocation(); // StudentInfo에서 전달된 state 접근

    const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
    const [form, setForm] = useState({
        userId: null,            // 추가: 전달받은 userId 저장
        studentStatus: 'ON_LEAVE',
        title: '',
        content: '',
        appliedDate: today
    });
    const [loading, setLoading] = useState(false);
    const [submittedKey, setSubmittedKey] = useState('');

    // 진입 시 라우팅 state로 넘어온 userId를 폼에 주입
    useEffect(() => {

        const incomingUserId = location?.state?.userId ?? null;
        if (!incomingUserId) {
            alert('학생 정보가 없습니다. 내 정보 페이지에서 다시 시도하세요.');
            navigate('/StudentInfo'); // 학생 정보 페이지 경로로 적절히 변경
            return;
        }
        setForm(s => ({ ...s, userId: incomingUserId }));
    }, [location, navigate]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(s => ({ ...s, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!form.userId) {
            alert('학생 ID가 없습니다. 다시 시도해 주세요.');
            return;
        }

        setLoading(true);
        const token = sessionStorage.getItem('accessToken');

        // 프론트 주도 방식: userId를 포함하여 서버로 전송
        const body = {
            recordId: null,
            userId: form.userId,               // 핵심: userId 포함
            studentStatus: form.studentStatus,
            title: form.title,
            content: form.content,
            appliedDate: today,
            processedDate: null,
            status: 'PENDING',
            attachmentId: null
        };
        console.log(body);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/student/record`, body, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            const createdId = res.data?.recordId || res.data?.id;
            setSubmittedKey(String(createdId ?? Date.now()));
            setForm(s => ({ ...s, title: '', content: '' }));
        } catch (err) {
            console.error(err);
            alert('신청 제출 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container style={{ maxWidth: 800, marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>학적 변경 신청</h2>

            {submittedKey && (
                <Alert variant="success" onClose={() => setSubmittedKey('')} dismissible>
                    신청이 접수되었습니다. 접수번호: {submittedKey}
                </Alert>
            )}

            <Form onSubmit={onSubmit}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label>신청 목적(Student_status)</Form.Label>
                        <Form.Select name="studentStatus" value={form.studentStatus} onChange={onChange}>
                            {STUDENT_STATUS_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={6}>
                        <Form.Label>신청일</Form.Label>
                        <Form.Control type="date" name="appliedDate" value={form.appliedDate} readOnly />
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>제목</Form.Label>
                    <Form.Control name="title" value={form.title} onChange={onChange} placeholder="제목을 입력하세요" />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>내용</Form.Label>
                    <Form.Control as="textarea" rows={5} name="content" value={form.content} onChange={onChange} placeholder="신청 내용을 입력하세요" />
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