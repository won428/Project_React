import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
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
    const { userId } = useParams(); // 학생 ID
    const navigate = useNavigate();

    const [studentInfo, setStudentInfo] = useState({
        academicStatus: '',
        leaveDate: '',
        reinstateDate: '',
        graduateDate: '',
        failedDate: '',
        expelledDate: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isNew, setIsNew] = useState(false); // 학적 정보가 없으면 true

    // 학생 정보 로딩
    useEffect(() => {
        if (!userId) return;

        axios.get(`${API_BASE_URL}/user/${userId}/status`)
            .then(res => {
                if (res.data && Object.keys(res.data).length > 0) {
                    setStudentInfo(res.data);
                    setIsNew(false);
                } else {
                    // 학적 정보가 없는 경우 신규 입력
                    setStudentInfo({
                        academicStatus: '',
                        leaveDate: '',
                        reinstateDate: '',
                        graduateDate: '',
                        failedDate: '',
                        expelledDate: ''
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

    // 학적 정보 저장 (수정/신규 동일)
    const saveStatus = () => {
        if (isNew) {
            // POST 요청: 신규 학적 정보 생성
            axios.post(`${API_BASE_URL}/user/${userId}/status`, studentInfo)
                .then(() => {
                    alert('학적 정보가 생성되었습니다.');
                    setIsNew(false);
                })
                .catch(err => alert('생성 실패: ' + err.message));
        } else {
            // PUT 요청: 기존 학적 정보 수정
            axios.put(`${API_BASE_URL}/users/${userId}/status`, studentInfo)
                .then(() => alert('학적 정보가 저장되었습니다.'))
                .catch(err => alert('저장 실패: ' + err.message));
        }
    };

    // 학적 정보 삭제
    const deleteStatus = () => {
        if (!window.confirm('정말 이 학생의 학적 정보를 삭제하시겠습니까?')) return;

        axios.delete(`${API_BASE_URL}/user/${userId}/status`)
            .then(() => {
                alert('학적 정보가 삭제되었습니다.');
                // 삭제 후 페이지 초기화 혹은 목록 페이지로 이동
                setStudentInfo({
                    academicStatus: '',
                    leaveDate: '',
                    reinstateDate: '',
                    graduateDate: '',
                    failedDate: '',
                    expelledDate: ''
                });
                setIsNew(true);
                // navigate('/students'); // 필요 시 학생 목록 페이지로 이동
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

            <Form.Label style={{ marginTop: 12 }}>휴학일</Form.Label>
            <Form.Control
                type="date"
                value={studentInfo.leaveDate || ''}
                onChange={(e) => handleChange('leaveDate', e.target.value)}
            />

            <Form.Label style={{ marginTop: 12 }}>복학일</Form.Label>
            <Form.Control
                type="date"
                value={studentInfo.reinstateDate || ''}
                onChange={(e) => handleChange('reinstateDate', e.target.value)}
            />

            <Form.Label style={{ marginTop: 12 }}>졸업일</Form.Label>
            <Form.Control
                type="date"
                value={studentInfo.graduateDate || ''}
                onChange={(e) => handleChange('graduateDate', e.target.value)}
            />

            <Form.Label style={{ marginTop: 12 }}>유급일</Form.Label>
            <Form.Control
                type="date"
                value={studentInfo.failedDate || ''}
                onChange={(e) => handleChange('failedDate', e.target.value)}
            />

            <Form.Label style={{ marginTop: 12 }}>퇴학일</Form.Label>
            <Form.Control
                type="date"
                value={studentInfo.expelledDate || ''}
                onChange={(e) => handleChange('expelledDate', e.target.value)}
            />

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
