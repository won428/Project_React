import React, { useEffect, useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
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
    const { userId } = useParams(); // 학생 ID
    const [studentInfo, setStudentInfo] = useState({
        academicStatus: '',
        leaveDate: '',
        reinstateDate: '',
        graduateDate: '',
        failedDate: '',
        expelledDate: ''
    });

    const [selectedStatus, setSelectedStatus] = useState('');
    const [dates, setDates] = useState({
        leaveDate: '',
        reinstateDate: '',
        graduateDate: '',
        failedDate: '',
        expelledDate: ''
    });

    // 학생 정보 로딩
    useEffect(() => {
        if (!userId) return;
        axios.get(`${API_BASE_URL}/students/${userId}`)
            .then(res => {
                setStudentInfo(res.data);
                setSelectedStatus(res.data.academicStatus || '');
                setDates({
                    leaveDate: res.data.leaveDate || '',
                    reinstateDate: res.data.reinstateDate || '',
                    graduateDate: res.data.graduateDate || '',
                    failedDate: res.data.failedDate || '',
                    expelledDate: res.data.expelledDate || ''
                });
            })
            .catch(err => console.error(err));
    }, [userId]);

    const updateStatus = () => {
        // 관리자가 학생 학적 상태 및 날짜 수정
        const payload = {
            academicStatus: selectedStatus,
            ...dates
        };
        axios.put(`${API_BASE_URL}/students/${userId}/status`, payload)
            .then(() => alert('학적 정보가 저장되었습니다.'))
            .catch(err => alert('저장 실패: ' + err.message));
    };

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>학생 학적 관리</h3>

            <Form.Label>학적 상태</Form.Label>
            <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
            >
                {statusOptions.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </Form.Select>

            <Form.Label style={{ marginTop: 12 }}>휴학일</Form.Label>
            <Form.Control
                type="date"
                value={dates.leaveDate}
                onChange={(e) => setDates({ ...dates, leaveDate: e.target.value })}
            />

            <Form.Label style={{ marginTop: 12 }}>복학일</Form.Label>
            <Form.Control
                type="date"
                value={dates.reinstateDate}
                onChange={(e) => setDates({ ...dates, reinstateDate: e.target.value })}
            />

            <Form.Label style={{ marginTop: 12 }}>졸업일</Form.Label>
            <Form.Control
                type="date"
                value={dates.graduateDate}
                onChange={(e) => setDates({ ...dates, graduateDate: e.target.value })}
            />

            <Form.Label style={{ marginTop: 12 }}>유급일</Form.Label>
            <Form.Control
                type="date"
                value={dates.failedDate}
                onChange={(e) => setDates({ ...dates, failedDate: e.target.value })}
            />

            <Form.Label style={{ marginTop: 12 }}>퇴학일</Form.Label>
            <Form.Control
                type="date"
                value={dates.expelledDate}
                onChange={(e) => setDates({ ...dates, expelledDate: e.target.value })}
            />

            <Button style={{ marginTop: 16 }} onClick={updateStatus}>
                학적 정보 저장
            </Button>
        </Container>
    );
}

export default StatusManage;
