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

    // lecStartDate -> year (안전하게 처리)
    const extractYear = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return isNaN(d.getFullYear()) ? '' : d.getFullYear().toString();
    };

    // lecStartDate -> semester
    const determineSemesterByMonth = (dateString) => {
        if (!dateString) return null;
        const month = new Date(dateString).getMonth() + 1;
        if (month >= 3 && month <= 6) return 1;
        if (month >= 9 && month <= 12) return 2;
        return null;
    };

    // lectures 데이터를 year 기준으로 그룹화, semester 계산 포함
    const groupLecturesByYear = (lectureList) => {
        return lectureList.reduce((acc, lecture) => {
            // lecStartDate 필드 확인, camelCase / snake_case 대응
            const lecDate = lecture.lecStartDate || lecture.lec_start_date;
            const year = extractYear(lecDate);
            if (!year) return acc; // year 없으면 무시

            if (!acc[year]) acc[year] = [];
            acc[year].push({
                ...lecture,
                lecStartDate: lecDate,
                semester: determineSemesterByMonth(lecDate)
            });
            return acc;
        }, {});
    };

    useEffect(() => {
        if (!userId) return;

        axios.get(`${API_BASE_URL}/api/grades/semester/lectures`, { params: { userId } })
            .then(res => {
                // 필드 이름 맞춤
                const formattedData = res.data.map(l => ({
                    ...l,
                    lecStartDate: l.lecStartDate || l.lec_start_date
                }));

                const grouped = groupLecturesByYear(formattedData);
                const yearList = Object.keys(grouped).sort();
                setYears(yearList);

                if (yearList.length > 0) {
                    const firstYear = yearList[0];
                    const firstYearLectures = grouped[firstYear];
                    const semesters = [...new Set(firstYearLectures.map(l => l.semester).filter(Boolean))];

                    setSelectedYear(firstYear);
                    setSelectedSemester(semesters[0] || null);
                    setLectures(firstYearLectures.filter(l => l.semester === semesters[0]));
                }

                // 성적 맵 생성
                const map = {};
                formattedData.forEach(item => map[item.id] = item);
                setGradesByGradeId(map);
            });
    }, [userId]);

    // 선택된 연도/학기 변경 시 필터링
    useEffect(() => {
        if (!selectedYear || !selectedSemester) return;

        axios.get(`${API_BASE_URL}/api/grades/semester/lectures`, { params: { userId } })
            .then(res => {
                const formattedData = res.data.map(l => ({
                    ...l,
                    lecStartDate: l.lecStartDate || l.lec_start_date
                }));
                const grouped = groupLecturesByYear(formattedData);
                const filteredLectures = (grouped[selectedYear] || []).filter(l => l.semester === selectedSemester);
                setLectures(filteredLectures);
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
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year && year.length >= 2 ? year.slice(2) + '년' : year || '년도'}
                                </option>
                            ))}
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
                                            <td>{lecture.lecName}</td>
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
