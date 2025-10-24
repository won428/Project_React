import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { API_BASE_URL } from '../../config/config';
import { useAuth } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

function App() {
    const [studentInfo, setStudentInfo] = useState({
        userid: null,
        userCode: null,
        name: '',
        password: '',
        birthDate: '',
        email: '',
        phone: '',
        gender: '',
        major: null,
        type: '',
    });

    const [statusRecords, setStatusRecords] = useState({
        statusid: null,
        studentStatus: 'ENROLLED',
        admissionDate: '',
        leaveDate: '',
        returnDate: '',
        graduationDate: '',
        retentionDate: '',
        expelledDate: '',
        totalCredit: 0,
        currentCredit: 0.0,
        studentImage: '',
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchStudentInfo() {
            if (!user?.roles.includes("STUDENT")) {
                navigate('/Unauthorizedpage');
                return;
            }

            try {
                const res = await axios.get(`${API_BASE_URL}/api/student/info`, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` }
                });

                if (res.data.type === 'STUDENT') {
                    setStudentInfo(res.data.studentInfo);
                    setStatusRecords(res.data.statusRecords);
                    setError(null);
                } else {
                    setStudentInfo(null);
                    setStatusRecords(null);
                    setError('학생 정보만 조회할 수 있습니다.');
                }
            } catch (err) {
                setError('데이터 불러오기에 실패했습니다.');
                setStudentInfo(null);
                setStatusRecords(null);
            } finally {
                setLoading(false);
            }
        }

        fetchStudentInfo();
    }, [user, navigate]);

    if (loading) {
        return (
            <Container><div>Loading...</div></Container>
        );
    }

    if (error) {
        return (
            <Container><div style={{ color: 'red' }}>{error}</div></Container>
        );
    }

    return (
        <Container>
            <h2>학생 기본 정보</h2>
            {/* 학생 정보 테이블들 */}
            {/* 학적 상태 테이블들 */}
            {/* 기존과 동일 */}
        </Container>
    );
}

export default App;
