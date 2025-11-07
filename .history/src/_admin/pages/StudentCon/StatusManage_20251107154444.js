import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';

const statusOptions = [
    { value: 'ON_LEAVE', label: '휴학' },
    { value: 'REINSTATED', label: '복학' },
    { value: 'EXPELLED', label: '제적' },
    { value: 'GRADUATED', label: '졸업' }
];

function StatusManage() {
    const userId = 8; // 테스트용 고정
    // const {userId} = 

    const [studentInfo, setStudentInfo] = useState({
        academicStatus: '',
        leaveDate: '',
        returnDate: '',
        statusDate: '' // 졸업/제적용 단일 날짜
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/user/${userId}/status`)
            .then(res => {
                if (res.data && Object.keys(res.data).length > 0) {
                    setStudentInfo({
                        academicStatus: res.data.academicStatus || '',
                        leaveDate: res.data.leaveDate || '',
                        returnDate: res.data.returnDate || '',
                        statusDate: res.data.graduationDate || res.data.expelledDate || ''
                    });
                    setIsNew(false);
                } else {
                    setIsNew(true);
                }
            })
            .catch(err => {
                console.error(err);
                alert('학생 정보를 불러오는데 실패했습니다.');
            })
            .finally(() => setIsLoading(false));
    }, [userId]);

    const handleChange = (field, value) => {
        setStudentInfo(prev => ({ ...prev, [field]: value }));
    };

    const saveStatus = () => {
        const payload = {
            ...studentInfo,
            graduationDate: studentInfo.academicStatus === 'GRADUATED' ? studentInfo.statusDate : null,
            expelledDate: studentInfo.academicStatus === 'EXPELLED' ? studentInfo.statusDate : null
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

    if (isLoading) return <p>Loading...</p>;

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>학생 학적 관리</h3>

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

            {/* 휴학/복학 선택 시 휴학일/복학일 입력 */}
            {['ON_LEAVE', 'REINSTATED'].includes(studentInfo.academicStatus) && (
                <>
                    <Form.Label style={{ marginTop: 12 }}>휴학일</Form.Label>
                    <Form.Control
                        type="date"
                        value={studentInfo.leaveDate || ''}
                        onChange={(e) => handleChange('leaveDate', e.target.value)}
                    />
                    <Form.Label style={{ marginTop: 12 }}>복학일</Form.Label>
                    <Form.Control
                        type="date"
                        value={studentInfo.returnDate || ''}
                        onChange={(e) => handleChange('returnDate', e.target.value)}
                    />
                </>
            )}

            {/* 졸업/제적 선택 시 단일 날짜 입력 */}
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
