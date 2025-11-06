import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';
import { useNavigate } from 'react-router-dom';

const APPEAL_TYPES = [
    { value: 'BE_LATE', label: '지각' },
    { value: 'ABSENT', label: '결석' }
];

function AttendanceAppeal() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const userId = user?.id;

    // 수강 강의 목록
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 선택된 강의 및 교수
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [professorName, setProfessorName] = useState('');

    // 폼 데이터
    const [appealForm, setAppealForm] = useState({
        lectureId: '',
        sendingId: userId || '',
        receiverId: '',    // 담당 교수
        appealType: 'BE_LATE',
        title: '',
        content: '',
        appealDate: new Date().toISOString().slice(0, 10),
        status: 'PENDING'
    });

    // 첨부파일
    const [file, setFile] = useState(null);

    // 학생 수강 강의 조회
    // useEffect(() => {
    //     axios.get(`${API_BASE_URL}/api/lecture/enrollments`, { params: { userId } })
    //         .then(res => {
    //             setLectures(res.data);
    //             setLoading(false);
    //         })
    //         .catch(err => {
    //             console.error(err);
    //             setError('수강 강의를 불러오는 데 실패했습니다.');
    //             setLoading(false);
    //         });
    // }, [userId]);

    // 강의 선택 시 담당 교수 정보 가져오기
    useEffect(() => {
        if (selectedLecture) {
            axios.get(`${API_BASE_URL}/api/lecture/${selectedLecture}`)
                .then(res => {
                    setProfessorName(res.data.userName);
                    setAppealForm(prev => ({
                        ...prev,
                        lectureId: selectedLecture,
                        receiverId: res.data.userId
                    }));
                })
                .catch(err => console.error(err));
        }
    }, [selectedLecture]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAppealForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!appealForm.lectureId) {
            alert('강의를 선택해주세요.');
            return;
        }

        const formData = new FormData();
        for (let key in appealForm) {
            formData.append(key, appealForm[key]);
        }
        if (file) {
            formData.append('file', file);
        }

        axios.post(`${API_BASE_URL}/api/lecture/attendanceAppeal`, formData, {
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

    if (loading) return <div>로딩중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <Container style={{ maxWidth: 720, marginTop: 24, marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>출결 이의제기 신청</h3>

            <Form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
                <Form.Group className="mb-3">
                    <Form.Label>강의 선택</Form.Label>
                    <Form.Select
                        value={selectedLecture || ''}
                        onChange={e => setSelectedLecture(e.target.value)}
                        required
                    >
                        <option value="">강의를 선택하세요</option>
                        {lectures.map(lec => (
                            <option key={lec.lectureId} value={lec.lectureId}>{lec.lecName}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>담당 교수</Form.Label>
                    <Form.Control type="text" readOnly value={professorName} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>이의제기 유형</Form.Label>
                    <Form.Select
                        name="appealType"
                        value={appealForm.appealType}
                        onChange={handleChange}
                        required
                    >
                        {APPEAL_TYPES.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </Form.Select>
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
