import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Table } from 'react-bootstrap';
import { useAuth } from '../../../public/context/UserContext';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';

const statusOptions = ['ENROLLED', 'ON_LEAVE', 'REINSTATED', 'EXPELLED', 'GRADUATED'];

function StatusManage() {
    const { userId } = useAuth();

    const [studentInfo, setStudentInfo] = useState({
        academicStatus: '',
        admissionDate: '',
        leaveDate: '',
        graduateDate: '',
        expelledDate: ''
    });

    const [grades, setGrades] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [dates, setDates] = useState({
        admissionDate: '',
        leaveDate: '',
        graduateDate: '',
        expelledDate: ''
    });

    const [yearList, setYearList] = useState([]); // yy 형식
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('1학기');

    const [summary, setSummary] = useState({
        majorAvg: 0,
        liberalAvg: 0,
        totalAvg: 0,
        semesterAvg: 0
    });

    const semesterOptions = ['1학기', '2학기', '계절학기 1', '계절학기 2'];

    // studentInfo 초기값 설정
    useEffect(() => {
        setSelectedStatus(studentInfo.academicStatus);
        setDates({
            admissionDate: studentInfo.admissionDate || '',
            leaveDate: studentInfo.leaveDate || '',
            graduateDate: studentInfo.graduateDate || '',
            expelledDate: studentInfo.expelledDate || ''
        });
    }, [studentInfo]);

    // DB 날짜 기반 학기 계산
    const determineSemesterByMonth = (dateString) => {
        if (!dateString) return null;
        const month = new Date(dateString).getMonth() + 1;
        if (month >= 3 && month <= 6) return '1학기';
        if (month >= 9 && month <= 12) return '2학기';
        if (month >= 1 && month <= 2) return '계절학기 1';
        if (month >= 7 && month <= 8) return '계절학기 2';
        return null;
    };

    // 선택한 연도/학기에 맞는 성적 필터링
    const filteredGrades = grades.filter((g) => {
        if (!g.lecture?.lecStartDate) return false;
        const year = new Date(g.lecture.lecStartDate).getFullYear().toString().slice(2); // yy
        const semester = determineSemesterByMonth(g.lecture.lecStartDate);
        return year === selectedYear && semester === selectedSemester;
    });

    // 저장 더미 함수
    const updateStatus = () => {
        alert(`학적 상태: ${selectedStatus}, 입학일: ${dates.admissionDate}`);
    };

    const updateGradeScores = () => {
        alert('성적 수정 완료 (더미)');
    };

    const updateSummary = () => {
        alert('학점 요약 수정 완료 (더미)');
    };

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>학적 정보 관리</h3>

            <div style={{ marginTop: 20 }}>
                <Form.Label>학적 상태</Form.Label>
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </Form.Select>

                <Form.Label style={{ marginTop: 12 }}>입학일</Form.Label>
                <Form.Control
                    type="date"
                    value={dates.admissionDate}
                    onChange={(e) => setDates({ ...dates, admissionDate: e.target.value })}
                />

                <Button style={{ marginTop: 16 }} onClick={updateStatus}>학적 정보 저장</Button>
            </div>

            <h4 style={{ marginTop: 40 }}>학점 관리</h4>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Form.Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    <option value="" disabled>년도 선택</option> {/* 기본 안내 옵션 */}
                    {yearList.map((y) => (
                        <option key={y} value={y}>{y}년</option>
                    ))}
                </Form.Select>

                <Form.Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                    {semesterOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
            </div>

            <Table bordered>
                <tbody>
                    {Object.keys(summary).map((key) => (
                        <tr key={key}>
                            <td>{key}</td>
                            <td>
                                <Form.Control
                                    value={summary[key]}
                                    onChange={(e) => setSummary({ ...summary, [key]: e.target.value })}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Button onClick={updateSummary}>학점 수정 저장</Button>

            <h4 style={{ marginTop: 40 }}>과목별 성적 수정</h4>

            <Table bordered>
                <thead>
                    <tr>
                        <th>과목명</th>
                        <th>학점</th>
                        <th>점수</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredGrades.length === 0 ? (
                        <tr>
                            <td colSpan={3}>선택한 학기에 수강한 과목이 없습니다.</td>
                        </tr>
                    ) : (
                        filteredGrades.map((g, idx) => (
                            <tr key={idx}>
                                <td>{g.lecture?.lectureName || '-'}</td>
                                <td>{g.lecture?.credit || '-'}</td>
                                <td>
                                    <Form.Control
                                        value={g.totalScore || ''}
                                        onChange={(e) => {
                                            const copy = [...filteredGrades];
                                            copy[idx].totalScore = e.target.value;
                                            setGrades(copy);
                                        }}
                                    />
                                </td>
                            </tr>
                        )))}
                </tbody>
            </Table>

            <Button style={{ marginTop: 16 }} onClick={updateGradeScores}>성적 수정 저장</Button>
        </Container>
    );
}

export default StatusManage;
