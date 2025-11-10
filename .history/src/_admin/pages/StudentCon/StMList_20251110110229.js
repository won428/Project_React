import React, { useEffect, useState } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../public/config/config';

function StudentListPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // 1) 전체 학생 조회
                const res = await axios.get(`${API_BASE_URL}/user/manageList`);
                const allStudents = res.data.filter(u => u.type === 'STUDENT');

                // 2) 학적변경 신청 목록 조회 (상태는 PENDING만)
                const applyRes = await axios.get(`${API_BASE_URL}/user/student/record/all`, {
                    params: { status: "PENDING" }
                });

                const pendingRecords = applyRes.data; // recordId, userId, status 등
                const pendingUserIds = new Set(pendingRecords.map(r => r.userId));

                // 3) 학적변경 신청한 학생만 필터링
                const filteredStudents = allStudents.filter(st => pendingUserIds.has(st.id));

                setStudents(filteredStudents);
            } catch (err) {
                console.error('학생 목록 로드 실패:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>학생 목록을 불러오는데 실패했습니다.</p>;

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>학적 변경 신청 학생 목록</h3>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>UserID</th>
                        <th>이름</th>
                        <th>학과</th>
                        <th>학적 변경 처리</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 ? (
                        students.map(student => (
                            <tr key={student.userId}>
                                <td>{student.userId}</td>
                                <td>{student.name}</td>
                                <td>{student.majorName || student.major?.name || '정보 없음'}</td>
                                <td>
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate(`/user/StatusManage/${student.userId}`)}
                                    >
                                        학적변경 처리
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>
                                학적 변경 신청한 학생이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
}

export default StudentListPage;
