import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Tab, Nav, Table, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';

function App() {
    const { user } = useAuth();
    const userId = user?.id;

    const years = [2023, 2024, 2025];
    const semesters = [
        { value: 1, label: '1학기' },
        { value: 2, label: '2학기' }
    ];

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');

    const [lectures, setLectures] = useState([]);
    const [gradesByLecture, setGradesByLecture] = useState({});

    const [error, setError] = useState(null);

    const metrics = [
        { key: 'aScore', label: '출석점수' },
        { key: 'asScore', label: '과제점수' },
        { key: 'tScore', label: '중간고사' },
        { key: 'ftScore', label: '기말고사' },
        { key: 'totalScore', label: '총점' },
        { key: 'lectureGrade', label: '학점' }
    ];

    const handleYearSemesterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'year') {
            setSelectedYear(value);
        } else if (name === 'semester') {
            setSelectedSemester(value);
        }
    };

    // 학기별 강의 조회 useEffect
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/semester/lectures`, {
            params: { userId, year: selectedYear, semester: selectedSemester }
        })
            .then(res => {
                setLectures(res.data);
                setError(null);
            })
            .catch(() => {
                setError('수강 강의를 불러오는 데 실패했습니다.');
                setLectures([]);
            });
    }, [userId, selectedYear, selectedSemester]);

    // 학기별 성적 조회 useEffect
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/grades/all`, {
            params: { userId, year: selectedYear, semester: selectedSemester }
        })
            .then(res => {
                const gradeMap = {};
                res.data.forEach(item => {
                    gradeMap[item.lectureId] = item;
                });
                setGradesByLecture(gradeMap);
                setError(null);
            })
            .catch(() => {
                setError('성적 정보를 불러오는 데 실패했습니다.');
                setGradesByLecture({});
            });
    }, [userId, selectedYear, selectedSemester]);

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>성적 조회</h3>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <Row>
                <Col md={3} style={{ maxHeight: '60vh', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
                    <Form>
                        <Form.Select
                            name="year"
                            value={selectedYear}
                            onChange={handleYearSemesterChange}
                        >
                            <option value="" disabled>년도 선택</option>
                            {years.map((year) => (
                                <option key={year} value={year}>{year}년</option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            name="semester"
                            value={selectedSemester}
                            onChange={handleYearSemesterChange}
                            style={{ marginTop: 8 }}
                        >
                            <option value="" disabled>학기 선택</option>
                            {semesters.map((sem) => (
                                <option key={sem.value} value={sem.value}>{sem.label}</option>
                            ))}
                        </Form.Select>
                    </Form>
                </Col>

                <Col md={9} style={{ overflowX: 'auto' }}>
                    {lectures.length === 0 ? (
                        <div>선택한 학기에 수강한 강의가 없습니다.</div>
                    ) : (
                        <Table bordered hover size="sm" style={{ minWidth: 700 }}>
                            <thead>
                                <tr>
                                    <th>점수구분</th>
                                    {lectures.map(lecture => (
                                        <th key={lecture.id}>{lecture.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.map(metric => (
                                    <tr key={metric.key}>
                                        <td>{metric.label}</td>
                                        {lectures.map(lecture => {
                                            const grade = gradesByLecture[lecture.id];
                                            let value = grade ? grade[metric.key] : null;
                                            if (value === null || value === undefined) value = '-';

                                            if (typeof value === 'number') value = value.toFixed(2);
                                            else if (typeof value === 'object' && value !== null && value.toString) {
                                                value = value.toString();
                                            }

                                            return <td key={lecture.id}>{value}</td>;
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default App;
