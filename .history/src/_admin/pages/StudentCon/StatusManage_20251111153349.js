import React, { useEffect, useState } from 'react';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';

// 학생 신청 목적 옵션
const REQUEST_OPTIONS = [
    { value: 'ON_LEAVE', label: '휴학 신청' },
    { value: 'REINSTATED', label: '복학 신청' },
    { value: 'GRADUATED', label: '졸업 처리 요청' },
    { value: 'ENROLLED', label: '재학 상태 유지' },
    { value: 'MILITARY_LEAVE', label: '군 휴학' },
    { value: 'MEDICAL_LEAVE', label: '입원 출석 인정' }
];

function StatusManage() {
    const { recordId } = useParams();
    const [record, setRecord] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

    // 학생 신청 정보 불러오기
    useEffect(() => {
        if (!recordId) return;
        axios.get(`${API_BASE_URL}/api/student/record/${recordId}`)
            .then(res => {
                const data = res.data;
                console.log('API 응답 전체:', data);

                setRecord({
                    ...data,
                    startDate: data.startDate ? data.startDate.slice(0, 10) : '',
                    endDate: data.endDate ? data.endDate.slice(0, 10) : ''
                });
            })
            .catch(() => setRecord(null));
    }, [recordId]);

    useEffect(() => {
        if (record?.studentStatus) {
            const CALENDAR_REQUIRED = ['ON_LEAVE', 'REINSTATED', 'MILITARY_LEAVE', 'MEDICAL_LEAVE'];
            setShowCalendar(CALENDAR_REQUIRED.includes(record.studentStatus));
        }
    }, [record]);

    const handleApproveReject = (result) => {
        axios.put(`${API_BASE_URL}/user/status/${recordId}`, { status: result })
            .then(() => alert(result === 'APPROVED' ? '승인 처리되었습니다.' : '거부 처리되었습니다.'))
            .catch(err => alert('처리 실패: ' + err.message));
    };

    return (
        <Container style={{ marginTop: 24, maxWidth: 720 }}>
            <h3>학생 학적 변경 신청 정보</h3>

            <div style={{ border: '1px solid #dee2e6', borderRadius: 6, background: '#f8f9fa', padding: 24, marginBottom: 32 }}>
                <h5 style={{ marginBottom: 16 }}>신청 내역</h5>

                {record ? (
                    <Form>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Label>신청 목적</Form.Label>
                                <Form.Select value={record.studentStatus} disabled>
                                    {REQUEST_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </Form.Select>
                            </Col>

                            <Col md={6}>
                                <Form.Label>신청일</Form.Label>
                                <Form.Control type="date" value={record.appliedDate?.slice(0, 10) || ''} readOnly />
                            </Col>
                        </Row>

                        {showCalendar && (
                            <Row className="mb-3">
                                {(record.studentStatus === 'MILITARY_LEAVE' || record.studentStatus === 'MEDICAL_LEAVE') && (
                                    <>
                                        <Col md={6}>
                                            <Form.Label>시작일 (학생 신청)</Form.Label>
                                            <Form.Control type="date" value={record.startDate || ''} disabled />
                                        </Col>
                                        <Col md={6}>
                                            <Form.Label>종료일 (학생 신청)</Form.Label>
                                            <Form.Control type="date" value={record.endDate || ''} disabled />
                                        </Col>
                                    </>
                                )}

                                {record.studentStatus === 'ON_LEAVE' && (
                                    <Col md={6}>
                                        <Form.Label>휴학일</Form.Label>
                                        <Form.Control type="date" value={record.endDate || ''} disabled />
                                    </Col>
                                )}

                                {record.studentStatus === 'REINSTATED' && (
                                    <Col md={6}>
                                        <Form.Label>복학일</Form.Label>
                                        <Form.Control type="date" value={record.endDate || ''} disabled />
                                    </Col>
                                )}
                            </Row>
                        )}


                        <Form.Group className="mb-3">
                            <Form.Label>제목</Form.Label>
                            <Form.Control value={record.title || ''} disabled />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>내용</Form.Label>
                            <Form.Control as="textarea" rows={5} value={record.content || ''} disabled />
                        </Form.Group>
                    </Form>
                ) : (
                    <span style={{ color: '#888' }}>신청 정보를 불러올 수 없습니다.</span>
                )}

                {/* 승인/거부 버튼 */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Button variant="success" onClick={() => handleApproveReject('APPROVED')}>승인</Button>
                    <Button variant="danger" onClick={() => handleApproveReject('REJECTED')}>거부</Button>
                </div>
            </div>
        </Container>
    );
}

export default StatusManage;
