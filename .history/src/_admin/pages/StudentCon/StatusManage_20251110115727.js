import React, { useEffect, useState } from 'react';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';

// 학생 신청 목적 옵션 (학생 폼 옵션과 동일!)
const REQUEST_OPTIONS = [
    { value: 'ON_LEAVE', label: '휴학 신청' },
    { value: 'RETURNED', label: '복학 신청' },
    { value: 'GRADUATED', label: '졸업 처리 요청' },
    { value: 'ENROLLED', label: '재학 상태 유지' },
    { value: 'MILITARY_LEAVE', label: '군 휴학' },
    { value: 'MEDICAL_LEAVE', label: '입원 출석 인정' }
];

// 관리자용 학적 상태 옵션(실제 상태 값은 자유 조정)
const statusOptions = [
    { value: 'ON_LEAVE', label: '휴학' },
    { value: 'REINSTATED', label: '복학' },
    { value: 'EXPELLED', label: '제적' },
    { value: 'GRADUATED', label: '졸업' }
];

function StatusManage() {
    const { recordId } = useParams();
    const [record, setRecord] = useState(null); // 학적변경신청(학생신청) 정보
    const [userId, setUserId] = useState(); // 학생 Id
    const [studentInfo, setStudentInfo] = useState({
        academicStatus: '',
        leaveDate: '',
        returnDate: '',
        statusDate: ''
    });
    const [isNew, setIsNew] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // 1. 신청 정보 가져오기
    useEffect(() => {
        if (!recordId) return;
        axios.get(`${API_BASE_URL}/api/student/record/${recordId}`)
            .then(res => {
                setRecord(res.data);
                setUserId(res.data.userId); // 신청서에서 userId 추출
            })
            .catch(() => setRecord(null));
    }, [recordId]);

    // 2. 학생 학적 상태 정보 가져오기 (record.userId 있어야)
    useEffect(() => {
        if (!userId) return;
        axios.get(`${API_BASE_URL}/user/${userId}/status`)
            .then(res => {
                if (res.data && Object.keys(res.data).length > 0) {
                    setStudentInfo({
                        academicStatus: res.data.studentStatus || '',
                        leaveDate: res.data.leaveDate || '',
                        returnDate: res.data.returnDate || '',
                        statusDate: res.data.graduationDate || res.data.retentionDate || ''
                    });
                    setIsNew(false);
                } else {
                    setIsNew(true);
                }
            })
            .catch(() => setLoadError(true));
    }, [userId]);

    // 관리자가 쓰는 상태 변경 핸들러 등은 이전과 동일 생략 가능

    // (필요에 따라) 관리자용 저장/삭제 기능 등 추가...

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>학생 학적 변경 신청 정보</h3>

            {/* 신청서 폼 - 읽기 전용 */}
            <div style={{
                border: '1px solid #dee2e6',
                borderRadius: 6,
                background: '#f8f9fa',
                padding: 24,
                marginBottom: 32
            }}>
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
            </div>

            {/* 아래에 관리자 학적 상태 직접 변경 폼 (이전 답변 참고) */}
            {/* ...기존 학적 상태 관리 폼 등... */}
        </Container>
    );
}

export default StatusManage;
