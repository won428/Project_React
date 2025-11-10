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

// 관리자용 학적 상태 옵션
const statusOptions = [
    { value: 'ON_LEAVE', label: '휴학' },
    { value: 'REINSTATED', label: '복학' },
    { value: 'EXPELLED', label: '제적' },
    { value: 'GRADUATED', label: '졸업' }
];

function StatusManage() {
    const { recordId } = useParams();
    const [record, setRecord] = useState(null); // 학적변경신청(학생신청) 정보
    const [userId, setUserId] = useState();
    const [studentInfo, setStudentInfo] = useState({
        academicStatus: '',
        leaveDate: '',
        returnDate: '',
        statusDate: ''
    });
    const [isNew, setIsNew] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // 신청 내역(학생 작성) 불러오기
    useEffect(() => {
        if (!recordId) return;
        axios.get(`${API_BASE_URL}/api/student/record/${recordId}`)
            .then(res => {
                setRecord(res.data);
                setUserId(res.data.userId);
            })
            .catch(() => setRecord(null));
    }, [recordId]);

    // 학생 학적 상태 불러오기
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

    // 입력 필드 변경 핸들러
    const handleChange = (field, value) => {
        setStudentInfo(prev => ({ ...prev, [field]: value }));
    };

    // 학적 상태 저장
    const saveStatus = () => {
        if (!userId) {
            alert('학생 정보가 없습니다.');
            return;
        }
        const payload = {
            studentStatus: studentInfo.academicStatus,
            leaveDate: studentInfo.leaveDate || null,
            returnDate: studentInfo.returnDate || null,
            retentionDate: studentInfo.academicStatus === 'EXPELLED' ? studentInfo.statusDate : null,
            graduationDate: studentInfo.academicStatus === 'GRADUATED' ? studentInfo.statusDate : null
        };
        const request = isNew
            ? axios.post(`${API_BASE_URL}/user/${userId}/status`, payload)
            : axios.put(`${API_BASE_URL}/user/${userId}/status`, payload);
        request
            .then(() => {
                alert(isNew ? '학적 정보가 생성되었습니다.' : '학적 정보가 저장되었습니다.');
                setIsNew(false);
            })
            .catch(err => alert('저장 실패: ' + err.message));
    };

    // 학적 상태 삭제
    const deleteStatus = () => {
        if (!window.confirm('정말 이 학생의 학적 정보를 삭제하시겠습니까?')) return;
        axios.delete(`${API_BASE_URL}/user/${userId}/status`)
            .then(() => {
                alert('학적 정보가 삭제되었습니다.');
                setStudentInfo({
                    academicStatus: '',
                    leaveDate: '',
                    returnDate: '',
                    statusDate: ''
                });
                setIsNew(true);
            })
            .catch(err => alert('삭제 실패: ' + err.message));
    };

    return (
        <Container style={{ marginTop: 24, maxWidth: 720 }}>
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

            {/* 학적 상태 변경(관리자) 폼 */}
            <h5>학적 상태 직접 처리</h5>
            {loadError && (
                <p style={{ color: 'red' }}>학생 정보를 불러오는데 실패했습니다. 기본 폼으로 입력하세요.</p>
            )}
            <Form.Label>학적 상태</Form.Label>
            <Form.Select
                value={studentInfo.academicStatus}
                onChange={(e) => handleChange('academicStatus', e.target.value)}
            >
                <option value="">선택</option>
                {statusOptions.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </Form.Select>

            {studentInfo.academicStatus === 'ON_LEAVE' && (
                <>
                    <Form.Label style={{ marginTop: 12 }}>휴학일</Form.Label>
                    <Form.Control
                        type="date"
                        value={studentInfo.leaveDate || ''}
                        onChange={(e) => handleChange('leaveDate', e.target.value)}
                    />
                </>
            )}

            {studentInfo.academicStatus === 'REINSTATED' && (
                <>
                    <Form.Label style={{ marginTop: 12 }}>복학일</Form.Label>
                    <Form.Control
                        type="date"
                        value={studentInfo.returnDate || ''}
                        onChange={(e) => handleChange('returnDate', e.target.value)}
                    />
                </>
            )}

            {['GRADUATED', 'EXPELLED'].includes(studentInfo.academicStatus) && (
                <>
                    <Form.Label style={{ marginTop: 12 }}>
                        {studentInfo.academicStatus === 'GRADUATED' ? '졸업일' : '제적일'}
                    </Form.Label>
                    <Form.Control
                        type="date"
                        value={studentInfo.statusDate || ''}
                        onChange={(e) => handleChange('statusDate', e.target.value)}
                    />
                </>
            )}

            <Row style={{ marginTop: 16 }}>
                <Col>
                    <Button variant="primary" onClick={saveStatus}>
                        {isNew ? '학적 정보 생성' : '학적 정보 저장'}
                    </Button>
                </Col>
                {!isNew && (
                    <Col>
                        <Button variant="danger" onClick={deleteStatus}>
                            학적 정보 삭제
                        </Button>
                    </Col>
                )}
            </Row>
        </Container>
    );
}

export default StatusManage;
