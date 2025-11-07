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
        // 모든 학생(user.role === STUDENT) 조회
        axios.get(`${API_BASE_URL}/user/managelist`)
            .then(res => {
                // 서버에서 role 필드를 확인하고 학생만 필터링
                const studentList = res.data.filter(user => user.u_type === 'STUDENT');
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
                    {students.map(student => (
                        <tr key={student.id}>
                            <td>{student.user_code}</td>
                            <td>{student.u_name}</td>
                            <td>{student.majorName || student.major}</td> {/* majorName이 없으면 id 표시 */}
                            <td>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate(`/statusmanage/${student.id}`)}
                                >
                                    학적 변경
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default StudentListPage;
