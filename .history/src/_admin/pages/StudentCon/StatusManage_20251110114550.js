import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../../public/config/config';

const statusOptions = [
    { value: 'ON_LEAVE', label: '휴학' },
    { value: 'REINSTATED', label: '복학' },
    { value: 'EXPELLED', label: '제적' },
    { value: 'GRADUATED', label: '졸업' }
];

function StatusManage() {
    const { userId } = useParams(); // URL에서 userId 가져오기
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const recordId = query.get('recordId'); // 학생 신청 고유번호
    const [studentInfo, setStudentInfo] = useState({
        academicStatus: '',
        leaveDate: '',
        returnDate: '',
        statusDate: ''
    });
    const [studentApply, setStudentApply] = useState(null); // 신청 내역
    const [isNew, setIsNew] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // 1️⃣ 학생 학적 정보 불러오기
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
            .catch(err => {
                console.error(err);
                setLoadError(true);
                setIsNew(true);
            });
    }, [userId]);

    // 2️⃣ 학생 신청 내역 불러오기 (읽기 전용 폼)
    useEffect(() => {
        if (!recordId) return;

        axios.get(`${API_BASE_URL}/api/student/record/${recordId}`)
            .then(res => {
                setStudentApply(res.data);
            })
            .catch(err => {
                console.error('신청 데이터 로드 실패:', err);
            });
    }, [recordId]);

    const handleChange = (field, value) => {
        setStudentInfo(prev => ({ ...prev, [field]: value }));
    };

    const saveStatus = () => {
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
        <Container style={{ marginTop: 24 }}>
            <h3>학생 학적 관리</h3>

            {/* 0️⃣ 로드 에러 안내 */}
            {loadError && (
                <p style={{ color: 'red' }}>학생 정보를 불러오는데 실패했습니다. 기본 폼으로 입력하세요.</p>
            )}

            {/* 1️⃣ 학생 신청 폼 (읽기 전용, disabled) */}
            {studentApply && (
                <div style={{ marginBottom: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8, backgroundColor: '#f9f9f9' }}>
                    <h5>학생 신청 내역 (읽기 전용)</h5>
                    <Form.Group className="mb-2">
                        <Form.Label>신청 상태</Form.Label>
                        <Form.Control type="text" value={studentApply.studentStatus} disabled />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>제목</Form.Label>
                        <Form.Control type="text" value={studentApply.title} disabled />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label>내용</Form.Label>
                        <Form.Control as="textarea" rows={3} value={studentApply.content} disabled />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>신청일</Form.Label>
                        <Form.Control type="date" value={studentApply.appliedDate?.slice(0, 10)} disabled />
                    </Form.Group>
                </div>
            )}

            {/* 2️⃣ 학적 상태 수정 폼 */}
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
