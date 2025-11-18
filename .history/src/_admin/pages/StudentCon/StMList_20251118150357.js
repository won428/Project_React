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

                // 2) 신청 기록 조회
                const applyRes = await axios.get(`${API_BASE_URL}/user/student/record/all`, {
                    params: { status: "PENDING" }
                });

                console.log("🔥 백엔드에서 받은 applyRes.data =", applyRes.data);

                // 여기서 배열인지 체크
                const pendingRecords = Array.isArray(applyRes.data) ? applyRes.data : [];

                if (!Array.isArray(applyRes.data)) {
                    console.warn("⚠ applyRes.data가 배열이 아닙니다. 데이터:", applyRes.data);
                }

                // 3) 학생에 기록 매핑
                const studentsWithRecords = allStudents
                    .map(student => ({
                        ...student,
                        records: pendingRecords.filter(record =>
                            Number(record.userId) === Number(student.id)
                        )
                    }))
                    .filter(student => student.records.length > 0);

                setStudents(studentsWithRecords);

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
                        <th style={{ width: '90px' }}>신청번호</th>
                        <th style={{ width: '90px' }}>학생번호</th>
                        <th>이름</th>
                        <th>학과</th>
                        <th>학적 변경 처리</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 ? (
                        students.map(student =>
                            student.records.map(record => (
                                <tr key={record.recordId}>
                                    <td>{record.recordId}</td>
                                    <td>{student.id}</td>
                                    <td>{student.name}</td>
                                    <td>{student.majorName || student.major?.name || '정보 없음'}</td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            onClick={() => navigate(`/user/StatusManage/${record.recordId}`)}
                                        >
                                            학적변경 처리
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>
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