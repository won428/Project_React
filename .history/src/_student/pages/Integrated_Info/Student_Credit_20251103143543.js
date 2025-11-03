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

    const [lectures, setLectures] = useState([]);   // 강의 리스트
    const [years, setYears] = useState([]);         // 연도 리스트

    // 기존 방식: lectureId별 대표 성적 - 필요시 함께 관리
    const [gradesByLecture, setGradesByLecture] = useState({});

    // 신규: gradeId별 성적 데이터
    const [gradesByGradeId, setGradesByGradeId] = useState({});
    // 강의별 선택 gradeId
    const [selectedGradeIds, setSelectedGradeIds] = useState({});

    const [error, setError] = useState(null);

    const metrics = [
        { key: 'aScore', label: '출석점수' },
        { key: 'asScore', label: '과제점수' },
        { key: 'tScore', label: '중간고사' },
        { key: 'ftScore', label: '기말고사' },
        { key: 'totalScore', label: '총점' },
        { key: 'lectureGrade', label: '학점' }
    ];

    // 날짜/학기 관련 함수 (기존 그대로)
    const extractYear = (dateString) => {
        if (!dateString) return '';
        const fullYear = new Date(dateString).getFullYear().toString();
        return fullYear.slice(-2);
    };
    const determineSemesterByMonth = (dateString) => {
        if (!dateString) return null;
        const month = new Date(dateString).getMonth() + 1;
        if (month >= 3 && month <= 6) return 1;
        if (month >= 9 && month <= 12) return 2;
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

    // 연도/학기별 강의 목록 받아오기 (기존 구문)
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

    // 연도 또는 학기 변경 시 강의 리스트 필터링 (기존 구문)
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

    // 성적 데이터 받아서 두 상태로 동시 분류: lectureId별 성적, gradeId별 성적
    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/grades/all`, {
            params: { userId, year: selectedYear, semester: selectedSemester }
        })
            .then(res => {
                // 기존 방식
                const gradeMap = {};
                // 신규 방식
                const gradeIdMap = {};
                // 강의별 모든 gradeId(복수 성적) 기록
                const lectureGradeIdMap = {};

                res.data.forEach(item => {
                    gradeMap[item.lectureId] = item;
                    gradeIdMap[item.id] = item;

                    if (!lectureGradeIdMap[item.lectureId]) lectureGradeIdMap[item.lectureId] = [];
                    lectureGradeIdMap[item.lectureId].push(item.id);  // 강의별 gradeId 목록 기록
                });

                setGradesByLecture(gradeMap);
                setGradesByGradeId(gradeIdMap);

                // 초기 선택 gradeId: 각 강의에 현재 존재하는 가장 첫 gradeId 사용
                const initialSelectedGradeIds = {};
                Object.keys(lectureGradeIdMap).forEach(lectureId => {
                    initialSelectedGradeIds[lectureId] = lectureGradeIdMap[lectureId][0];
                });
                setSelectedGradeIds(initialSelectedGradeIds);

                // lectures에 gradeIds 배열 추가 (렌더링시 콤보박스 등)
                setLectures(lectures =>
                    lectures.map(l =>
                        ({ ...l, gradeIds: lectureGradeIdMap[String(l.id)] || [] })
                    )
                );

                setError(null);
            })
            .catch(() => {
                setError('성적 정보를 불러오는 데 실패했습니다.');
                setGradesByLecture({});
                setGradesByGradeId({});
                setSelectedGradeIds({});
            });
    }, [userId, selectedYear, selectedSemester]);

    // 연도/학기 선택 핸들러 (기존 구문 그대로)
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

    // gradeId 선택 콤보박스 핸들러
    const handleGradeIdChange = (lectureId, newGradeId) => {
        setSelectedGradeIds(prev => ({
            ...prev,
            [lectureId]: newGradeId
        }));
    };

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>성적 조회</h3>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <Row>
                <Col md={3} style={{ maxHeight: '60vh', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
                    <Form>
                        <Form.Select name="year" value={selectedYear} onChange={handleYearChange}>
                            <option value="" disabled>년도 선택</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}년</option>
                            ))}
                        </Form.Select>

                        <Form.Select name="semester" value={selectedSemester || ''} onChange={handleSemesterChange} style={{ marginTop: 8 }}>
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
                                    <th>gradeId선택</th>
                                    {metrics.map(metric => (
                                        <th key={metric.key}>{metric.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lectures.map(lecture => {
                                    // 선택 또는 초기 gradeId
                                    const gradeId = selectedGradeIds[String(lecture.id)];
                                    const grade = gradesByGradeId[gradeId] || {};

                                    return (
                                        <tr key={lecture.id}>
                                            <td>{lecture.name}</td>
                                            <td>
                                                <Form.Select
                                                    value={gradeId || ''}
                                                    onChange={e => handleGradeIdChange(lecture.id, e.target.value)}
                                                    style={{ maxWidth: 120 }}
                                                >
                                                    {(lecture.gradeIds || []).map(id => (
                                                        <option key={id} value={id}>{id}</option>
                                                    ))}
                                                </Form.Select>
                                            </td>
                                            {metrics.map(metric => {
                                                let value = grade ? grade[metric.key] : '-';
                                                if (value === null || value === undefined) value = '-';
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

export default App;
