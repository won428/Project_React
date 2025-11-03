import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';

function App() {
    const { user } = useAuth();
    const userId = user?.id;

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [lectures, setLectures] = useState([]);
    const [gradesByGradeId, setGradesByGradeId] = useState({});
    const [years, setYears] = useState([]);

    const metrics = [
        { key: 'aScore', label: '출석점수' },
        { key: 'asScore', label: '과제점수' },
        { key: 'tScore', label: '중간고사' },
        { key: 'ftScore', label: '기말고사' },
        { key: 'totalScore', label: '총점' },
        { key: 'lectureGrade', label: '학점' }
    ];

    // lecStartDate -> yyyy
    const extractYear = (dateString) => dateString ? new Date(dateString).getFullYear().toString() : '';

    // lecStartDate -> semester
    const determineSemesterByMonth = (dateString) => {
        if (!dateString) return null;
        const month = new Date(dateString).getMonth() + 1;
        if (month >= 3 && month <= 6) return 1;
        if (month >= 9 && month <= 12) return 2;
        return null;
    };

    const groupLecturesByYear = (lectureList) => {
        return lectureList.reduce((acc, lecture) => {
            const year = extractYear(lecture.lecStartDate);
            if (!acc[year]) acc[year] = [];
            acc[year].push({
                ...lecture,
                semester: determineSemesterByMonth(lecture.lecStartDate)
            });
            return acc;
        }, {});
    };

    useEffect(() => {
        if (!userId) return;

        axios.get(`${API_BASE_URL}/api/grades/semester/lectures`, { params: { userId } })
            .then(res => {
                const grouped = groupLecturesByYear(res.data);
                const yearList = Object.keys(grouped).sort();
                setYears(yearList);

                if (yearList.length > 0) {
                    setSelectedYear(yearList[0]);
                    const firstYearLectures = grouped[yearList[0]];
                    const semesters = [...new Set(firstYearLectures.map(l => l.semester).filter(Boolean))];
                    setSelectedSemester(semesters[0] || null);
                    setLectures(firstYearLectures.filter(l => l.semester === semesters[0]));
                }
            });
    }, [userId]);

    useEffect(() => {
        if (!userId || !selectedYear || !selectedSemester) return;

        axios.get(`${API_BASE_URL}/api/grades/all`, {
            params: { userId }
        }).then(res => {
            const grouped = groupLecturesByYear(res.data);
            const filteredLectures = (grouped[selectedYear] || []).filter(l => l.semester === selectedSemester);
            setLectures(filteredLectures);

            // 성적 맵핑
            const map = {};
            res.data.forEach(item => map[item.id] = item);
            setGradesByGradeId(map);
        });
    }, [userId, selectedYear, selectedSemester]);

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>성적 조회</h3>

            <Row>
                <Col md={3} style={{ maxHeight: '60vh', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
                    <Form>
                        <Form.Select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                            <option value="" disabled>년도 선택</option>
                            {years.map(year => <option key={year} value={year}>{year.slice(2)}년</option>)}
                        </Form.Select>

                        <Form.Select value={selectedSemester || ''} onChange={e => setSelectedSemester(parseInt(e.target.value, 10))} style={{ marginTop: 8 }}>
                            <option value="" disabled>학기 선택</option>
                            <option value={1}>1학기 (3~6월)</option>
                            <option value={2}>2학기 (9~12월)</option>
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
                                    <th>강의명</th>
                                    {metrics.map(metric => <th key={metric.key}>{metric.label}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {lectures.map(lecture => {
                                    const grade = Object.values(gradesByGradeId).find(g => g.lectureId === lecture.lectureId) || {};
                                    return (
                                        <tr key={lecture.lectureId}>
                                            <td>{lecture.lectureName}</td>
                                            {metrics.map(metric => <td key={metric.key}>{grade[metric.key] ?? '-'}</td>)}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default App;
