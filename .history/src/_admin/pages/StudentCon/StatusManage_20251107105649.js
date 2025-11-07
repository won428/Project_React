import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Table } from 'react-bootstrap';
import { useAuth } from '../../../public/context/UserContext';
import { API_BASE_URL } from '../../../public/config/config';

const statusOptions = [
    'ENROLLED',
    'ON_LEAVE',
    'REINSTATED',
    'EXPELLED',
    'GRADUATED'
];

const userTypeMap = {
    STUDENT: '학생',
    PROFESSOR: '교수',
    ADMIN: '관리자'
};

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
    const [selectedYear, setSelectedYear] = useState('');
    const [yearList, setYearList] = useState([]);

    const [majorAvg, setMajorAvg] = useState(0);
    const [liberalAvg, setLiberalAvg] = useState(0);
    const [totalAvg, setTotalAvg] = useState(0);
    const [semesterAvg, setSemesterAvg] = useState(0);

    function determineSemester(dateStr) {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1;
        if (month <= 2) return '계절학기1';
        if (month <= 6) return '1학기';
        if (month <= 8) return '계절학기2';
        return '2학기';
    }

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

    useEffect(() => {
        if (grades.length === 0 || !selectedYear) return;

        const filtered = grades.filter(
            (g) => new Date(g.lecture.lecStartDate).getFullYear() === parseInt(selectedYear)
        );

        const major = filtered.filter(
            (g) => g.lecture.completionDiv === 'MAJOR_REQUIRED' || g.lecture.completionDiv === 'MAJOR_ELECTIVE'
        );
        const liberal = filtered.filter(
            (g) => g.lecture.completionDiv === 'LIBERAL_REQUIRED' || g.lecture.completionDiv === 'LIBERAL_ELECTIVE'
        );

        const avg = (list) => (list.length ? list.reduce((a, b) => a + b.totalScore, 0) / list.length : 0);

        setMajorAvg(avg(major).toFixed(2));
        setLiberalAvg(avg(liberal).toFixed(2));
        setTotalAvg(avg(filtered).toFixed(2));

        const now = new Date();
        const currentSemester = determineSemester(now.toISOString());

        const sem = filtered.filter(
            (g) => determineSemester(g.lecture.lecStartDate) === currentSemester
        );

        setSemesterAvg(avg(sem).toFixed(2));
    }, [grades, selectedYear]);

    const updateStatus = () => {
        axios
            .post(`${API_BASE_URL}/api/admin/student/update`, {
                userId,
                academicStatus: selectedStatus,
                ...dates
            })
            .then(() => alert('학적 상태 변경 완료'));
    };

    if (!studentInfo) return <div>로딩중...</div>;

    return (
        <Container style={{ marginTop: 24 }}>
            <h3>학적 정보 관리</h3>
            <div>이름: {studentInfo.name}</div>
            <div>유형: {userTypeMap[studentInfo.userType]}</div>

            <Form.Group style={{ marginTop: 16 }}>
                <Form.Label>학적 상태</Form.Label>
                <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    {statusOptions.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group style={{ marginTop: 16 }}>
                <Form.Label>입학일</Form.Label>
                <Form.Control
                    type="date"
                    value={dates.admissionDate}
                    onChange={(e) => setDates({ ...dates, admissionDate: e.target.value })}
                />
            </Form.Group>

            <Button style={{ marginTop: 20 }} onClick={updateStatus}>
                저장
            </Button>

            <h4 style={{ marginTop: 40 }}>학점 요약</h4>

            <Form.Select style={{ width: '200px' }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {yearList.map((y) => (
                    <option key={y} value={y}>
                        {String(y).slice(2)}
                    </option>
                ))}
            </Form.Select>

            <Table bordered style={{ marginTop: 20 }}>
                <tbody>
                    <tr>
                        <td>전공 평균</td>
                        <td>{majorAvg}</td>
                    </tr>
                    <tr>
                        <td>교양 평균</td>
                        <td>{liberalAvg}</td>
                    </tr>
                    <tr>
                        <td>전체 평균</td>
                        <td>{totalAvg}</td>
                    </tr>
                    <tr>
                        <td>이번 학기 평균</td>
                        <td>{semesterAvg}</td>
                    </tr>
                </tbody>
            </Table>
        </Container>
    );
}

export default StatusManage;