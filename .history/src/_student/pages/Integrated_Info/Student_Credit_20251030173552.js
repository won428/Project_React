import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';

function StudentCredit() {
    const { user } = useAuth();
    const userId = user?.id;

    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [lectures, setLectures] = useState([]);
    const [gradesByLecture, setGradesByLecture] = useState({});

    const metrics = [
        { key: 'aScore', label: '출석점수' },
        { key: 'asScore', label: '과제점수' },
        { key: 'tScore', label: '중간고사' },
        { key: 'ftScore', label: '기말고사' },
        { key: 'totalScore', label: '총점' },
        { key: 'lectureGrade', label: '학점' }
    ];

    const extractYear = (dateString) => dateString ? new Date(dateString).getFullYear().toString() : '';
    const determineSemesterByMonth = (dateString) => {
        if (!dateString) return null;
        const month = new Date(dateString).getMonth() + 1;
        if (month >= 3 && month <= 6) return 1;
        if (month >= 9 && month <= 12) return 2;
        return null;
    }
    const groupLecturesByYear = (lectureList) => {
        return lectureList.reduce((acc, lecture) => {
            const year = extractYear(lecture.startDate);
            if (!acc[year]) acc[year] = [];
            acc[year].push({ ...lecture, semester: determineSemesterByMonth(lecture.startDate) });
            return acc;
        }, {});
    }

    const [years, setYears] = useState([]);

    // 초기사 데이터 로드 및 초기 셋팅
    useEffect(() => {
        if (!userId) return;
        axios.get(`${API_BASE_URL}/api/semester/lectures`, { params: { userId } })
            .then(res => {
                const grouped = groupLecturesByYear(res.data);
                const yearList = Object.keys(grouped).sort();
                setYears(yearList);

                if (yearList.length > 0) {
                    setSelectedYear(yearList[0]);
                    const semestersInYear = [...new Set(grouped[yearList[0]].map(l => l.semester).filter(Boolean))];
                    setSelectedSemester(semestersInYear[0] || null);
                    setLectures(grouped[yearList[0]].filter(l => l.semester === semestersInYear[0]));
                }
            });
    }, [userId]);

    // 선택된 연도, 학기 변경 시 강의 리스트 필터링
    useEffect(() => {

        axios.get(`${API_BASE_URL}/api/semester/lectures`, { params: { userId } })
            .then(res => {
                const grouped = groupLecturesByYear(res.data);
                const filtered = (grouped[selectedYear] || []).filter(l => l.semester === selectedSemester);
                setLectures(filtered);
            });
    }, [userId, selectedYear, selectedSemester]);

    // 성적 데이터 조회
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/grades/all`, {
            params: { userId, year: selectedYear, semester: selectedSemester }
        }).then(res => {
            const gradeMap = {};
            res.data.forEach(item => {
                gradeMap[item.lectureId] = item;
            });
            setGradesByLecture(gradeMap);
        });
    }, [userId, selectedYear, selectedSemester]);

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>성적 조회</h3>
            <Row>
                <Col md={3} style={{ maxHeight: '60vh', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
                    <Form>
                        <Form.Select name="year" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                            <option value="" disabled>년도 선택</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}년</option>
                            ))}
                        </Form.Select>
                        <Form.Select
                            name="semester"
                            value={selectedSemester || ''}
                            onChange={e => setSelectedSemester(parseInt(e.target.value, 10))}
                            style={{ marginTop: 8 }}
                        >
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
                                    {metrics.map(metric => (
                                        <th key={metric.key}>{metric.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lectures.map(lecture => {
                                    const grade = gradesByLecture[lecture.id] || {};
                                    return (
                                        <tr key={lecture.id}>
                                            <td>{lecture.name}</td>
                                            {metrics.map(metric => {
                                                let value = grade[metric.key];
                                                if (value === null || value === undefined) return <td key={metric.key}>-</td>;
                                                if (typeof value === 'number') value = value.toFixed(2);
                                                else if (typeof value === 'object' && value !== null && value.toString) {
                                                    value = value.toString();
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

export default StudentCredit;
