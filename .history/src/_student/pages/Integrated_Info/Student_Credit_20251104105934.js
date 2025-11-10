import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';
import { useNavigate } from 'react-router-dom';

function App() {
    const { user } = useAuth();
    console.log
    const userId = user?.id;

    const navigate = useNavigate();

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState(null);

    // 강의 및 성적 상태
    const [lectures, setLectures] = useState([]);
    const [gradesByGradeId, setGradesByGradeId] = useState({});
    const [years, setYears] = useState([]);
    const [error, setError] = useState(null);

    const metrics = [
        { key: 'aScore', label: '출석점수' },
        { key: 'asScore', label: '과제점수' },
        { key: 'tScore', label: '중간고사' },
        { key: 'ftScore', label: '기말고사' },
        { key: 'totalScore', label: '총점' },
        { key: 'lectureGrade', label: '학점' }
    ];

    const getGradeValue = (grade, key) => {
        if (!grade) return '-';
        return grade[key] ?? grade[key.toLowerCase()] ?? '-';
    };


    const extractYear = (dateString) => {
        if (!dateString) return '';
        const fullYear = new Date(dateString).getFullYear().toString();
        return fullYear;
    };

    const determineSemesterByMonth = (dateString) => {
        if (!dateString) return null;
        const month = new Date(dateString).getMonth() + 1;

        if (month >= 3 && month <= 6) return 1;      // 1학기
        if (month >= 9 && month <= 12) return 2;     // 2학기
        if (month >= 1 && month <= 2) return 3;      // 계절학기 1
        if (month >= 7 && month <= 8) return 4;      // 계절학기 2

        return null;
    };


    const groupLecturesByYear = (lectureList) => {
        const grouped = lectureList.reduce((acc, lecture) => {
            const year = extractYear(lecture.startDate);
            if (!acc[year]) acc[year] = [];
            acc[year].push({
                ...lecture,
                semester: determineSemesterByMonth(lecture.startDate)
            });
            return acc;
        }, {});
        return grouped;
    };

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/grades/semester/lectures`, { params: { userId } })
            .then(res => {
                const groupedLectures = groupLecturesByYear(res.data);
                const yearList = Object.keys(groupedLectures).sort();
                setYears(yearList);
                if (yearList.length > 0) {
                    setSelectedYear(yearList[0]);
                    const firstYearLectures = groupedLectures[yearList[0]];
                    const semestersInYear = [...new Set(firstYearLectures.map(l => l.semester).filter(Boolean))];
                    setSelectedSemester(semestersInYear.length > 0 ? semestersInYear[0] : null);
                    setLectures(firstYearLectures.filter(l => l.semester === semestersInYear[0]));
                }
                setError(null);
            })
            .catch(() => {
                setError('수강 강의를 불러오는 데 실패했습니다.');
                setLectures([]);
                setYears([]);
                setSelectedYear('');
                setSelectedSemester(null);
            });
    }, [userId]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/grades/semester/lectures`, { params: { userId } })
            .then(res => {
                const groupedLectures = groupLecturesByYear(res.data);
                const filtered = (groupedLectures[selectedYear] || []).filter(l => l.semester === selectedSemester);
                setLectures(filtered);
                setError(null);
            })
            .catch(() => {
                setError('강의 목록을 불러오는 데 실패했습니다.');
                setLectures([]);
            });
    }, [userId, selectedYear, selectedSemester]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/grades/all`, {
            params: { userId, year: selectedYear, semester: selectedSemester }
        })
            .then(res => {
                const map = {};
                res.data.forEach(item => {
                    map[item.id] = item;  // DTO의 id는 gradeId
                });
                setGradesByGradeId(map);
                setError(null);
            })
            .catch(() => {
                setError('성적 정보를 불러오는 데 실패했습니다.');
                setGradesByGradeId({});
            });
    }, [userId, selectedYear, selectedSemester]);

    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
        axios.get(`${API_BASE_URL}/api/grades/semester/lectures`, { params: { userId } })
            .then(res => {
                const groupedLectures = groupLecturesByYear(res.data);
                const yearLectures = groupedLectures[e.target.value] || [];
                const semestersInYear = [...new Set(yearLectures.map(l => l.semester).filter(Boolean))];
                if (semestersInYear.length > 0) {
                    setSelectedSemester(semestersInYear[0]);
                    setLectures(yearLectures.filter(l => l.semester === semestersInYear[0]));
                } else {
                    setSelectedSemester(null);
                    setLectures([]);
                }
            });
    };

    const handleSemesterChange = (e) => {
        setSelectedSemester(parseInt(e.target.value, 10));
        if (!selectedYear) return;
        axios.get(`${API_BASE_URL}/api/grades/semester/lectures`, { params: { userId } })
            .then(res => {
                const groupedLectures = groupLecturesByYear(res.data);
                const yearLectures = groupedLectures[selectedYear] || [];
                setLectures(yearLectures.filter(l => l.semester === parseInt(e.target.value, 10)));
            });
    };

    return (
        <Container style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>성적 조회</h3>
                <Button
                    variant="primary"
                    style={{ marginLeft: 16 }} // 제목과 버튼 사이 간격    
                    onClick={() => navigate('/CreditAppeal')}
                >
                    이의제기 신청
                </Button>
            </div>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <Row>
                <Col md={3} style={{ maxHeight: '60vh', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
                    <Form>
                        <Form.Select name="year" value={selectedYear} onChange={handleYearChange}>
                            <option value="" disabled>년도 선택</option>
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year.slice(-2)}년
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Select name="semester" value={selectedSemester || ''} onChange={handleSemesterChange} style={{ marginTop: 8 }}>
                            <option value="" disabled>학기 선택</option>
                            <option value={1}>1학기 (3~6월)</option>
                            <option value={2}>2학기 (9~12월)</option>
                            <option value={3}>계절학기 1 (1~2월)</option>
                            <option value={4}>계절학기 2 (7~8월)</option>
                        </Form.Select>
                    </Form>
                </Col>
            </Row>

            <Row style={{ marginTop: 24 }}>
                <Col md={12} style={{ overflowX: 'auto' }}>
                    {lectures.length === 0 ? (
                        <div>선택한 학기에 수강한 강의가 없습니다.</div>
                    ) : (
                        <Table bordered hover size="sm" style={{ minWidth: 700 }}>
                            <thead>
                                <tr>
                                    <th>강의명</th>
                                    {metrics.map(metric => (
                                        <th key={metric.key}>{metric.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lectures.map(lecture => {
                                    let gradeId = null;
                                    Object.values(gradesByGradeId).some(grade => {
                                        if (grade.lectureId === lecture.lectureId) {
                                            gradeId = grade.id;
                                            return true;
                                        }
                                        return false;
                                    });
                                    const grade = gradesByGradeId[gradeId] || {};

                                    const scoreKeys = ['aScore', 'asScore', 'tScore', 'ftScore'];
                                    const scores = scoreKeys.map(k => {
                                        const val = grade[k] ?? grade[k.toLowerCase()] ?? '0';
                                        return parseFloat(val);
                                    });
                                    const total = scores.reduce((sum, val) => sum + val, 0);
                                    const average = (total / scores.length).toFixed(2);

                                    return (
                                        <tr key={lecture.id}>
                                            <td>{lecture.lecName}</td>
                                            {metrics.map(metric => {
                                                let value;
                                                if (metric.key === 'totalScore') {
                                                    value = total.toFixed(2);
                                                } else if (metric.key === 'lectureGrade') {
                                                    value = average;
                                                } else {
                                                    value = getGradeValue(grade, metric.key);
                                                    if (typeof value === 'number') value = value.toFixed(2);
                                                }
                                                return <td key={metric.key}>{value}</td>;
                                            })}
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
