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
        // 모든 학생(user.type === STUDENT) 조회
        axios.get(`${API_BASE_URL}/user/manageList`)
            .then(res => {
                // 서버에서 반환된 DTO 필드명 확인 후 필터링
                const studentList = res.data.filter(user => user.type === 'STUDENT');
                setStudents(studentList);
            })
            .catch(err => {
                console.error(err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>학생 목록을 불러오는데 실패했습니다.</p>;

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>학생 목록</h3>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>UserID</th>
                        <th>이름</th>
                        <th>학과</th>
                        <th>학적 변경</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 ? (
                        students.map(student => (
                            <tr key={student.id}>
                                <td>{student.id || student.user_code}</td> {/* DTO id 혹은 user_code */}
                                <td>{student.name || student.u_name}</td> {/* DTO name 혹은 u_name */}
                                <td>{student.majorName || student.major?.name || '정보 없음'}</td>
                                <td>
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate(`/S/${student.id}`)}
                                    >
                                        학적 변경
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>
                                학생 정보가 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
}

export default StudentListPage;
