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

function AttendanceAppeal({ readOnly = false, appealData = null }) { // ✅ 추가
    const { user } = useAuth();
    const navigate = useNavigate();
    const { lectureId } = useParams();
    const userId = user?.id;
    const { state } = useLocation();

    // CheckAttendance 모달에서 넘어온 값
    const attendanceFromModal = state?.attendanceType || 'ABSENT';
    const lectureDateFromCheck = state?.sessions?.[0]?.attendanceDate || '';

    const [lectureName, setLectureName] = useState('');
    const [professorName, setProfessorName] = useState('');
    const [file, setFile] = useState(null);

    // ✅ 기본 폼 초기값 (학생용 or 교수용)
    const [appealForm, setAppealForm] = useState(
        appealData || {
            lectureId: Number(lectureId || ''),
            sendingId: userId || '',
            receiverId: '',
            appealType: 'ATTENDANCE',
            attendanceType: attendanceFromModal || 'BE_LATE',
            attendanceDetail: '',
            lectureDate: lectureDateFromCheck,
            title: '',
            content: '',
            appealDate: new Date().toISOString().slice(0, 10),
            status: 'PENDING'
        }
    );

    // ✅ 강의 정보 조회 (학생용만 수행)
    useEffect(() => {
        if (readOnly || !lectureId) return;
        axios
            .get(`${API_BASE_URL}/lecture/${lectureId}`)
            .then((res) => {
                setLectureName(res.data.lecName);
                setProfessorName(res.data.userName);
                setAppealForm((prev) => ({
                    ...prev,
                    receiverId: res.data.userId
                }));
            })
            .catch((err) => console.error(err));
    }, [lectureId, readOnly]);

    // 학생 본인 출결 이의제기 최신화
useEffect(() => {
    if (readOnly) return; // 교수/상세보기 모드에서는 실행 X
    if (!lectureId || !userId) return;

    axios.get(`${API_BASE_URL}/lecture/attendanceAppeal/myAppeal`, { 
        params: { lectureId, studentId: userId } 
    })
    .then(res => {
        if (res.data) setAppealForm(res.data);
    })
    .catch(err => console.error(err));
}, [lectureId, userId, readOnly]);

    // ✅ readOnly 모드일 경우 lectureName, professorName을 appealData에서 세팅
    useEffect(() => {
        if (readOnly && appealData) {
            setLectureName(appealData.lectureName || '');
            setProfessorName(appealData.professorName || '');
        }
    }, [readOnly, appealData]);

    const handleChange = (e) => {
        if (readOnly) return; // ✅ 수정 불가
        const { name, value } = e.target;
        setAppealForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (readOnly) return; // ✅ 파일 수정 불가
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (readOnly) return; // ✅ 교수 모드에서는 제출 X

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

        axios
            .post(`${API_BASE_URL}/lecture/attendanceAppeal`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            .then(() => {
                alert('출결 이의제기 신청이 완료되었습니다.');
                navigate(-1);
            })
            .catch((err) => {
                console.error(err);
                alert('신청 제출 중 오류가 발생했습니다.');
            });
    };

    return (
        <Container style={{ maxWidth: 720, marginTop: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>
                {readOnly ? '출결 이의제기 상세 보기' : '출결 이의제기 신청'}
            </h3>

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
                    >
                        {ATTENDANCE_TYPES.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>출결 사유 선택</Form.Label>
                    <Form.Select
                        name="attendanceDetail"
                        value={appealForm.attendanceDetail || ''}
                        onChange={handleChange}
                        disabled={readOnly}
                    >
                        <option value="">선택하세요</option>
                        {ATTENDANCE_DETAILS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>강의일</Form.Label>
                    <Form.Control type="text" readOnly value={appealForm.lectureDate || ''} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>제목</Form.Label>
                    <Form.Control
                        name="title"
                        value={appealForm.title}
                        onChange={handleChange}
                        placeholder="제목을 입력하세요"
                        readOnly={readOnly}
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
                        readOnly={readOnly}
                    />
                </Form.Group>

                {!readOnly && (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label>증빙 파일 첨부 (선택)</Form.Label>
                            <Form.Control type="file" onChange={handleFileChange} />
                        </Form.Group>

                        <Button type="submit" variant="primary" style={{ marginRight: 8 }}>
                            신청 제출
                        </Button>
                        <Button variant="secondary" onClick={() => navigate(-1)}>
                            취소
                        </Button>
                    </>
                )}
            </Form>
        </Container>
    );
}

export default AttendanceAppeal;
