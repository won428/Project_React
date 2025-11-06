import React, { useEffect, useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';
import { useNavigate, useParams } from 'react-router-dom';

const APPEAL_TYPES = [
    { value: 'BE_LATE', label: '지각' },
    { value: 'ABSENT', label: '결석' }
];

const ATTENDANCE_DETAILS = [
    { value: 'MEDICAL_PROBLEM', label: '병원 방문' },
    { value: 'MILITARY_PROBLEM', label: '예비군 훈련' },
];

function AttendanceAppeal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { lectureId } = useParams(); // URL에서 lectureId 받음
    const userId = user?.id;

    const [enrollments, setEnrollments] = useState([]);
    const [lectureName, setLectureName] = useState('');
    const [professorId, setProfessorId] = useState('');
    const [professorName, setProfessorName] = useState('');

    const [appealForm, setAppealForm] = useState({
        lectureId: Number(lectureId || ''),
        sendingId: userId || '',
        receiverId: professorId || '',    // 담당 교수
        appealType: 'ATTENDANCE',
        attendanceDetail: '',
        title: '',
        content: '',
        appealDate: new Date().toISOString().slice(0, 10),
        status: 'PENDING'
    });

    const [file, setFile] = useState(null);

    useEffect(() => {
        if (!userId) return;
        axios.get(`${API_BASE_URL}/lecture/enrollments`, {
            params: { userId }
        })
            .then(res => setEnrollments(res.data))
            .catch(err => console.error(err));
    }, [userId]);

    // 강의 정보 가져오기
    useEffect(() => {
        if (!lectureId) return;

        axios.get(`${API_BASE_URL}/lecture/${lectureId}`)
            .then(res => {
                setLectureName(res.data.lecName);
                setProfessorId(res.data.userId);
                setProfessorName(res.data.userName);
                setAppealForm(prev => ({
                    ...prev,
                    lectureId: Number(lectureId),
                    receiverId: res.data.userId
                }));
            })
            .catch(err => console.error(err));
    }, [lectureId]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setAppealForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!appealForm.lectureId) return alert('강의 정보가 없습니다.');

        const formData = new FormData();
        formData.append('lectureId', appealForm.lectureId);
        formData.append('sendingId', appealForm.sendingId);
        formData.append('receiverId', appealForm.receiverId);
        formData.append('appealType', appealForm.appealType);
        formData.append('title', appealForm.title);
        formData.append('attendanceDetail', appealForm.attendanceDetail);
        formData.append('content', `[${appealForm.attendanceDetail}] ${appealForm.content}`);

        if (file) formData.append('file', file);

        axios.post(`${API_BASE_URL}/lecture/attendanceAppeal`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(() => {
                alert('출결 이의제기 신청이 완료되었습니다.');
                navigate('/AttendanceAppealList');
            })
            .catch(err => {
                console.error(err);
                alert('신청 제출 중 오류가 발생했습니다.');
            });
    };

    return (
        <Container style={{ maxWidth: 720, marginTop: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>출결 이의제기 신청</h3>

            {/* 선택된 강의 정보 */}
            <div style={{ marginBottom: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
                <Form.Group className="mb-2">
                    <Form.Label>강의</Form.Label>
                    <Form.Control type="text" readOnly value={lectureName} />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>담당 교수</Form.Label>
                    <Form.Control type="text" readOnly value={appealForm.receiverId} />
                </Form.Group>
            </div>

            {/* 이의제기 폼 */}
            <Form onSubmit={handleSubmit}>
                {/* 이의제기 유형 */}
                <Form.Group className="mb-3">
                    <Form.Label>이의제기 유형</Form.Label>
                    <Form.Select
                        name="appealType"
                        value={appealForm.appealType}
                        onChange={handleChange}
                        required
                    >
                        {APPEAL_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {/* 출결 세부 */}
                {(appealForm.appealType === 'BE_LATE' || appealForm.appealType === 'ABSENT') && (
                    <Form.Group className="mb-3">
                        <Form.Label>출결 세부 선택</Form.Label>
                        <Form.Select
                            name="attendanceDetail"
                            value={appealForm.attendanceDetail || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">선택하세요</option>
                            {ATTENDANCE_DETAILS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                )}

                {/* 제목 */}
                <Form.Group className="mb-3">
                    <Form.Label>제목</Form.Label>
                    <Form.Control
                        name="title"
                        value={appealForm.title}
                        onChange={handleChange}
                        placeholder="제목을 입력하세요"
                        required
                    />
                </Form.Group>

                {/* 내용 */}
                <Form.Group className="mb-3">
                    <Form.Label>내용</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        name="content"
                        value={appealForm.content}
                        onChange={handleChange}
                        placeholder="이의제기 내용을 입력하세요"
                        required
                    />
                </Form.Group>

                {/* 첨부파일 */}
                <Form.Group className="mb-3">
                    <Form.Label>증빙 파일 첨부 (예: 진료내역, 예비군 필증)</Form.Label>
                    <Form.Control type="file" onChange={handleFileChange} />
                </Form.Group>

                <Button type="submit" variant="primary" style={{ marginRight: 8 }}>신청 제출</Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>취소</Button>
            </Form>
        </Container>

    );

}

export default AttendanceAppeal;
