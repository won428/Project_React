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
    const [gradesByLecture, setGradesByLecture] = useState({});
    const [gradesByGradeId, setGradesByGradeId] = useState({});
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

    // 날짜 문자열에서 연도 뒷 두 자리 숫자 추출 (예: 2025 -> "25")
    const extractYear = (dateString) => {
        if (!dateString) return '';
        const fullYear = new Date(dateString).getFullYear().toString();
        return fullYear.slice(-2);  // 뒤에서 두 글자 추출
    };

    // 월로 학기 결정: 3~6월->1학기, 9~12월->2학기
    const determineSemesterByMonth = (dateString) => {
        if (!dateString) return null;
        const month = new Date(dateString).getMonth() + 1;
        if (month >= 3 && month <= 6) return 1;
        if (month >= 9 && month <= 12) return 2;
        return null;
    };

    // startDate 기준으로 년도별 분류
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

    // 년도 목록
    const [years, setYears] = useState([]);

    // 연도 선택시 학기 자동선택 및 강의 필터링
    useEffect(() => {
        // 전체 강의 받아오기 (연도 무관)
        axios.get(`${API_BASE_URL}/api/grades/semester/lectures`, {
            params: { userId }
        })
            .then(res => {
                const groupedLectures = groupLecturesByYear(res.data);
                const yearList = Object.keys(groupedLectures).sort();
                setYears(yearList);

                if (yearList.length > 0) {
                    // 초기 선택 연도 지정
                    setSelectedYear(yearList[0]);
                    // 초기 학기 자동설정 - 첫 연도 강의 중 첫 학기의 학기 코드
                    const firstYearLectures = groupedLectures[yearList[0]];
                    const semestersInYear = [...new Set(firstYearLectures.map(l => l.semester).filter(Boolean))];
                    setSelectedSemester(semestersInYear.length > 0 ? semestersInYear[0] : null);
                    // 학기별 강의 필터링
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

    // 년도 또는 학기 변경 시 강의 리스트 필터링
    useEffect(() => {
        // 강의 목록 조회

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
        // 학기도 연동해서 자동설정
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

    // 강의별 gradeId 선택 (콤보박스 등)
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
                                    {metrics.map(metric => (
                                        <th key={metric.key}>{metric.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lectures.map(lecture => {
                                    // lectureId에 대응하는 gradeId 자동 선택 (selectedGradeIds 미사용 시 기본 설정)
                                    // 예를 들어 백엔드가 강의별 대표 gradeId를 줄 경우 아래에서 그 값을 활용
                                    // 없으면, 예시로 gradesByGradeId에서 lectureId로 필터 후 첫 아이템 선택하는 로직 구현 가능
                                    let gradeId = null;
                                    Object.values(gradesByGradeId).some(grade => {
                                        if (grade.lectureId === lecture.id) {
                                            gradeId = grade.id;
                                            return true; // 최초 발견 시 종료
                                        }
                                        return false;
                                    });

                                    const grade = gradesByGradeId[gradeId] || {};

                                    return (
                                        <tr key={lecture.id}>
                                            <td>{lecture.name}</td>
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
