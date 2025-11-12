import React, { useEffect, useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// 출결 유형 (DB 저장 X, 단순 표시용)
const ATTENDANCE_TYPES = [
    { value: 'PRESENT', label: '출석' },
    { value: 'LATE', label: '지각' },
    { value: 'ABSENT', label: '결석' },
    { value: 'EARLY_LEAVE', label: '조퇴' },
    { value: 'EXCUSED', label: '공결' }
];

// 출결 세부 사유 (프론트 전용)
const ATTENDANCE_DETAILS = [
    { value: 'MEDICAL_PROBLEM', label: '병원 방문' },
    { value: 'MILITARY_PROBLEM', label: '예비군 훈련' },
    { value: 'FAMILY_REASON', label: '집안 사정' },
    { value: 'OTHER', label: '기타' }
];

function AttendanceAppeal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { lectureId } = useParams();
    const userId = user?.id;
    const { state } = useLocation(); // CheckAttendance 모달에서 전달된 값
    const attendanceFromModal = state?.attendanceType || 'ABSENT';; // "BE_LATE" or "ABSENT" 등
    const lectureDateFromCheck = state?.sessions?.[0]?.attendanceDate || ''; // 모달에서 전달된 강의일

    const [lectureName, setLectureName] = useState('');
    const [professorId, setProfessorId] = useState('');
    const [professorName, setProfessorName] = useState('');
    const [file, setFile] = useState(null);

    const [appealForm, setAppealForm] = useState({
        lectureId: Number(lectureId || ''),
        sendingId: userId || '',
        receiverId: '',
        appealType: 'ATTENDANCE',
        attendanceType: attendanceFromModal || 'BE_LATE',
        attendanceDetail: '',
        lectureDate: lectureDateFromCheck, // 모달에서 전달받은 날짜
        title: '',
        content: '',
        appealDate: new Date().toISOString().slice(0, 10),
        status: 'PENDING'
    });

    // 강의 정보 조회
    useEffect(() => {
        if (!lectureId) return;

        axios.get(`${API_BASE_URL}/lecture/${lectureId}`)
            .then(res => {
                setLectureName(res.data.lecName);
                setProfessorId(res.data.userId);
                setProfessorName(res.data.userName);
                setAppealForm(prev => ({
                    ...prev,
                    receiverId: res.data.userId
                }));
            })
            .catch(err => console.error(err));
    }, [lectureId]);

    // 모달에서 넘어온 출결 상태 반영
    useEffect(() => {
        if (attendanceFromModal) {
            setAppealForm(prev => ({
                ...prev,
                attendanceType: attendanceFromModal
            }));
        }
    }, [attendanceFromModal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAppealForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (readOnly) return;

        const formData = new FormData();
        formData.append('lectureId', appealForm.lectureId);
        formData.append('sendingId', appealForm.sendingId);
        formData.append('receiverId', appealForm.receiverId);
        formData.append('appealType', 'ATTENDANCE');
        formData.append('lectureDate', appealForm.lectureDate);
        formData.append('title', appealForm.title);
        formData.append('attendanceDetail', appealForm.attendanceDetail);
        formData.append('content', `[${appealForm.attendanceType}] [${appealForm.attendanceDetail}] ${appealForm.content}`);

        if (file) formData.append('file', file);

        axios.post(`${API_BASE_URL}/lecture/attendanceAppeal`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(() => {
                alert('출결 이의제기 신청이 완료되었습니다.');
                navigate(-1);
            })
            .catch(err => {
                console.error(err);
                alert('신청 제출 중 오류가 발생했습니다.');
            });
    };

    return (
        <Container style={{ maxWidth: 720, marginTop: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>출결 이의제기 신청</h3>

            <div style={{ marginBottom: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
                <Form.Group className="mb-2">
                    <Form.Label>강의</Form.Label>
                    <Form.Control type="text" readOnly value={lectureName} />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>담당 교수</Form.Label>
                    <Form.Control type="text" readOnly value={professorName} />
                </Form.Group>
            </div>

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>출결 유형</Form.Label>
                    <Form.Select
                        name="attendanceType"
                        value={appealForm.attendanceType}
                        onChange={handleChange}
                        disabled
                        required
                    >
                        {ATTENDANCE_TYPES.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>출결 사유 선택</Form.Label>
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

                {/* 강의일 표시 (읽기용) */}
                <Form.Group className="mb-3">
                    <Form.Label>강의일</Form.Label>
                    <Form.Control type="text" readOnly value={lectureDateFromCheck} />
                </Form.Group>

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

                <Form.Group className="mb-3">
                    <Form.Label>증빙 파일 첨부 (선택)</Form.Label>
                    <Form.Control type="file" onChange={handleFileChange} />
                </Form.Group>

                <Button type="submit" variant="primary" style={{ marginRight: 8 }}>신청 제출</Button>
                <Button variant="secondary" onClick={() => navigate(-1)}>취소</Button>
            </Form>
        </Container>
    );
}

export default AttendanceAppeal;
