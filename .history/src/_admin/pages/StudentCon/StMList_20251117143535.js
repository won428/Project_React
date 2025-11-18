import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Pagination } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../public/config/config';

function StudentListPage() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);  // 현재 페이지 상태 추가
    const [totalPages, setTotalPages] = useState(1);     // 총 페이지 상태 추가
    const navigate = useNavigate();

    // 페이지 당 데이터 수
    const pageSize = 10;

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // 1) 학적변경 신청 목록 조회 (상태는 PENDING만)
                const applyRes = await axios.get(`${API_BASE_URL}/user/student/record/all`, {
                    params: {
                        status: "PENDING",
                        page: currentPage - 1,  // 백엔드에서 0-based index를 사용한다고 가정
                        size: pageSize
                    }
                });
                const pendingRecords = applyRes.data.content;

                // 2) 전체 학생 조회
                const res = await axios.get(`${API_BASE_URL}/user/manageList`);
                const allStudents = res.data.filter(u => u.type === 'STUDENT');

                // 3) 학생별 신청 기록 연결
                const studentsWithRecords = allStudents
                    .map(student => ({
                        ...student,
                        records: pendingRecords.filter(record => Number(record.userId) === Number(student.id))  // 타입 일치 확인
                    }))
                    // 신청 기록 없는 학생 제거
                    .filter(student => student.records.length > 0);

                // 4) 총 페이지 수를 백엔드에서 받아와 설정
                setTotalPages(applyRes.data.totalPages);  // totalPages로 접근

                setStudents(studentsWithRecords);

            } catch (err) {
                console.error('학생 목록 로드 실패:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [currentPage]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: 'red' }}>학생 목록을 불러오는데 실패했습니다.</p>;

    // 페이지 번호 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

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

            {/* 페이징 처리 */}
            <Pagination>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
                    </Pagination.Item>
                ))}
            </Pagination>
        </Container>
    );
}

export default StudentListPage;
