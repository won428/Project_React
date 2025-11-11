import { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
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

// 캘린더 표시가 필요한 신청 상태
const CALENDAR_REQUIRED = ['ON_LEAVE', 'RETURNED', 'MILITARY_LEAVE', 'MEDICAL_LEAVE'];

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const today = new Date().toISOString().slice(0, 10);

    const query = new URLSearchParams(location.search);
    const recordId = query.get('recordId');
    const readonly = query.get('readonly') === "true";

    const [form, setForm] = useState({
        userId: null,
        studentStatus: 'ON_LEAVE',
        title: '',
        content: '',
        appliedDate: today,
        targetStartDate: today, // 🔥 시작일
        targetEndDate: today    // 🔥 종료일 (입원 출석 인정용)
    });

    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        if (!user?.id) {
            navigate(-1, { replace: true });
            return;
        }
        setForm(s => ({ ...s, userId: user.id }));
    }, [user, navigate]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(s => ({ ...s, [name]: value }));

        if (name === 'studentStatus') {
            setShowCalendar(CALENDAR_REQUIRED.includes(value));
        }
    };

    useEffect(() => {
        if (!recordId) return;
        axios.get(`${API_BASE_URL}/api/student/record/${recordId}`)
            .then(res => {
                const data = res.data;
                setForm({
                    userId: data.userId || user.id,
                    studentStatus: data.studentStatus || 'ON_LEAVE',
                    title: data.title || '',
                    content: data.content || '',
                    appliedDate: data.appliedDate ? data.appliedDate.slice(0, 10) : today,
                    targetStartDate: data.targetStartDate ? data.targetStartDate.slice(0, 10) : today,
                    targetEndDate: data.targetEndDate ? data.targetEndDate.slice(0, 10) : today
                });
                setShowCalendar(CALENDAR_REQUIRED.includes(data.studentStatus));
            })
            .catch(err => {
                console.error('기존 신청 데이터 불러오기 실패:', err);
                window.alert('기존 신청 정보를 불러오는 데 실패했습니다.');
                navigate(-1);
            });
    }, [recordId, user, navigate, today]);

    const submitForm = () => {
        const body = {
            userId: form.userId,
            studentStatus: form.studentStatus,
            title: form.title,
            content: form.content,
            appliedDate: form.appliedDate,
            targetStartDate: showCalendar ? form.targetStartDate : null,
            targetEndDate: showCalendar && form.studentStatus === 'MEDICAL_LEAVE' ? form.targetEndDate : null,
            status: 'PENDING'
        };

        const request = recordId
            ? axios.put(`${API_BASE_URL}/api/student/record/${recordId}`, body)
            : axios.post(`${API_BASE_URL}/api/student/record`, body);

        request
            .then(res => {
                const id = res.data?.recordId ?? res.data?.id ?? '';
                window.alert(id ? `신청이 접수되었습니다. 접수번호: ${id}` : '신청이 접수되었습니다.');
                if (!recordId) setForm(s => ({ ...s, title: '', content: '' }));
                else navigate('/Change_Status');
            })
            .catch(err => {
                console.error(err);
                window.alert('신청 제출 중 오류가 발생했습니다.');
            });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!form.userId) return;
        submitForm();
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
                            disabled={readonly}
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

                {/* 🔥 조건부 캘린더 */}
                {showCalendar && (
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>처리 기간</Form.Label>
                            <Form.Control
                                type="date"
                                name="targetStartDate"
                                value={form.targetStartDate}
                                onChange={onChange}
                                required
                                disabled={readonly}
                            />
                        </Col>
                        {form.studentStatus === 'MEDICAL_LEAVE' && (
                            <Col md={6}>
                                <Form.Label>종료일</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="targetEndDate"
                                    value={form.targetEndDate}
                                    onChange={onChange}
                                    required
                                    disabled={readonly}
                                />
                            </Col>
                        )}
                    </Row>
                )}

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
                        placeholder="신청 내용을 입력하세요"
                        required
                        disabled={readonly}
                    />
                </Form.Group>

                <div style={{ display: 'flex', gap: 8 }}>
                    {!readonly && (
                        <Button type="submit" variant="primary">신청 접수</Button>
                    )}
                    <Button type="button" variant="secondary" onClick={() => navigate(-1)}>이전</Button>
                    <Button type="button" variant="outline-secondary" onClick={() => navigate('/ChangeStatusList')}>내 신청내역 보기</Button>
                </div>
            </Form>
        </Container>
    );
}

export default App;
