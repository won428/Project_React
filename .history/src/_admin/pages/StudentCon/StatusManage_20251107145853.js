import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';

const statusOptions = [
    { value: 'ENROLLED', label: '재학' },
    { value: 'ON_LEAVE', label: '휴학' },
    { value: 'REINSTATED', label: '복학' },
    { value: 'EXPELLED', label: '제적' },
    { value: 'GRADUATED', label: '졸업' }
];

function StatusManage() {
    const { userId } = useParams();

    const [studentInfo, setStudentInfo] = useState({
        academicStatus: '',
        leaveDate: '',
        retentionDate: '',
        returnDate: '',
        graduationDate: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        if (!userId) return;

        axios.get(`${API_BASE_URL}/user/${userId}/status`)
            .then(res => {
                if (res.data && Object.keys(res.data).length > 0) {
                    setStudentInfo(res.data);
                    setIsNew(false);
                } else {
                    setStudentInfo({
                        academicStatus: '',
                        leaveDate: '',
                        retentionDate: '',
                        returnDate: '',
                        graduationDate: ''
                    });
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
        if (isNew) {
            axios.post(`${API_BASE_URL}/user/${userId}/status`, studentInfo)
                .then(() => {
                    alert('학적 정보가 생성되었습니다.');
                    setIsNew(false);
                })
                .catch(err => alert('생성 실패: ' + err.message));
        } else {
            axios.put(`${API_BASE_URL}/user/${userId}/status`, studentInfo)
                .then(() => alert('학적 정보가 저장되었습니다.'))
                .catch(err => alert('저장 실패: ' + err.message));
        }
    };

    const deleteStatus = () => {
        if (!window.confirm('정말 이 학생의 학적 정보를 삭제하시겠습니까?')) return;

        axios.delete(`${API_BASE_URL}/user/${userId}/status`)
            .then(() => {
                alert('학적 정보가 삭제되었습니다.');
                setStudentInfo({
                    academicStatus: '',
                    leaveDate: '',
                    retentionDate: '',
                    returnDate: '',
                    graduationDate: ''
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

            {/* ENROLLED는 날짜 입력 불필요, 다른 상태만 표시 */}
            {studentInfo.academicStatus !== 'ENROLLED' && (
                <>
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

                    {studentInfo.academicStatus === 'GRADUATED' && (
                        <>
                            <Form.Label style={{ marginTop: 12 }}>졸업일</Form.Label>
                            <Form.Control
                                type="date"
                                value={studentInfo.graduationDate || ''}
                                onChange={(e) => handleChange('graduationDate', e.target.value)}
                            />
                        </>
                    )}
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
