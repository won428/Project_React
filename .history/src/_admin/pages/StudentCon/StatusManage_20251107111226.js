import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Table } from 'react-bootstrap';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';

const statusOptions = ['ENROLLED', 'ON_LEAVE', 'REINSTATED', 'EXPELLED', 'GRADUATED'];

function StatusManage() {
    const { userId } = useAuth();
    const [studentInfo, setStudentInfo] = useState(null);
    const [grades, setGrades] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [dates, setDates] = useState({
        admissionDate: '',
        leaveDate: '',
        graduateDate: '',
        expelledDate: ''
    });

    const [yearList, setYearList] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('1학기');

    const [summary, setSummary] = useState({
        majorAvg: 0,
        liberalAvg: 0,
        totalAvg: 0,
        semesterAvg: 0
    });

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/admin/student/${userId}`).then((res) => {
            setStudentInfo(res.data);
            setSelectedStatus(res.data.academicStatus);
            setDates({
                admissionDate: res.data.admissionDate || '',
                leaveDate: res.data.leaveDate || '',
                graduateDate: res.data.graduateDate || '',
                expelledDate: res.data.expelledDate || ''
            });
        });

        axios.get(`${API_BASE_URL}/api/admin/student/${userId}/grades`).then((res) => {
            setGrades(res.data);

            const years = [...new Set(res.data.map((g) => new Date(g.lecture.lecStartDate).getFullYear()))];
            setYearList(years);
            if (years.length > 0) setSelectedYear(years[0]);
        });
    }, [userId]);

    const filteredGrades = grades.filter((g) => {
        const year = new Date(g.lecture.lecStartDate).getFullYear();
        const month = new Date(g.lecture.lecStartDate).getMonth() + 1;

        let semester = '';
        if (month <= 6) semester = '1학기';
        else semester = '2학기';

        return year === parseInt(selectedYear) && semester === selectedSemester;
    });

    const updateStatus = () => {
    axios.post(`${API_BASE_URL}/api/admin/student/update`, {
        userId,
        academicStatus: selectedStatus,
        ...dates
    })
    .then(() => alert('학적 상태 변경 완료'))
    .catch(() => alert("학적 상태 변경 중 오류가 발생했습니다."));
};

    const updateGradeScores = () => {
    axios.post(`${API_BASE_URL}/api/admin/student/grade/update`, filteredGrades)
        .then(() => alert("성적 수정 완료"))
        .catch(() => alert("성적 수정 중 오류가 발생했습니다."));
};

    const updateSummary = () => {
    axios.post(`${API_BASE_URL}/api/admin/student/summary/update`, {
        userId,
        year: selectedYear,
        semester: selectedSemester,
        ...summary
    })
    .then(() => alert("학점 요약 수정 완료"))
    .catch(() => alert("학점 요약 수정 중 오류가 발생했습니다."));
};

    if (!studentInfo) return <div>로딩중...</div>;

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>학적 정보 관리</h3>

            <div style={{ marginTop: 20 }}>
                <Form.Label>학적 상태</Form.Label>
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </Form.Select>

                <Form.Label style={{ marginTop: 12 }}>입학일</Form.Label>
                <Form.Control type="date" value={dates.admissionDate} onChange={(e) => setDates({ ...dates, admissionDate: e.target.value })} />

                <Button style={{ marginTop: 16 }} onClick={updateStatus}>학적 정보 저장</Button>
            </div>

            <h4 style={{ marginTop: 40 }}>학점 관리</h4>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <Form.Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    {yearList.map((y) => <option key={y} value={y}>{String(y).slice(2)}년</option>)}
                </Form.Select>

                <Form.Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                    <option value="1학기">1학기</option>
                    <option value="2학기">2학기</option>
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

            <Button onClick={updateSummary}>학점 요약 수정 저장</Button>

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
                    {filteredGrades.map((g, idx) => (
                        <tr key={idx}>
                            <td>{g.lecture.lectureName}</td>
                            <td>{g.lecture.credit}</td>
                            <td>
                                <Form.Control
                                    value={g.totalScore}
                                    onChange={(e) => {
                                        const copy = [...filteredGrades];
                                        copy[idx].totalScore = e.target.value;
                                        setGrades(copy);
                                    }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Button style={{ marginTop: 16 }} onClick={updateGradeScores}>성적 수정 저장</Button>

        </Container>
    );
}

export default StatusManage;
