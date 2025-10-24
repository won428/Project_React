import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';
import { API_BASE_URL } from '../../config/config';

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

    text
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

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/student/info`)
            .then(res => {
                if (res.data.type === 'STUDENT') {
                    setStudentInfo(res.data.studentInfo);
                    setStatusRecords(res.data.statusRecords);
                    setError(null);
                } else {
                    setError('학생 정보만 조회할 수 있습니다.');
                    setStudentInfo(null);
                    setStatusRecords(null);
                }
            })
            .catch(() => {
                setError('데이터 불러오기에 실패했습니다.');
                setStudentInfo(null);
                setStatusRecords(null);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Container>
            <h2>학생 기본 정보</h2>
            <Table bordered striped size="sm" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '75%' }} />
                </colgroup>
                <tbody>
                    <tr><th>아이디</th><td>{studentInfo.userid}</td></tr>
                    <tr><th>학번</th><td>{studentInfo.userCode}</td></tr>
                    <tr><th>이름</th><td>{studentInfo.name}</td></tr>
                    <tr><th>이메일</th><td>{studentInfo.email}</td></tr>
                    <tr><th>전화번호</th><td>{studentInfo.phone}</td></tr>
                    <tr><th>생년월일</th><td>{studentInfo.birthDate}</td></tr>
                    <tr><th>성별</th><td>{studentInfo.gender}</td></tr>
                    <tr><th>소속학과</th><td>{studentInfo.major?.name || ''}</td></tr>
                    <tr><th>사용자 유형</th><td>{studentInfo.type}</td></tr>
                </tbody>
            </Table>

            <h2 className="mt-4">학적 상태</h2>

            <Table bordered size="sm" style={{ width: 'auto', marginBottom: '1rem' }}>
                <tbody>
                    <tr>
                        <td style={{ textAlign: 'center', width: '105px', height: '135px' }}>
                            {statusRecords.studentImage
                                ? <img
                                    src={statusRecords.studentImage}
                                    alt="[증명사진](pplx://action/translate)"
                                    style={{ width: '105px', height: '135px', objectFit: 'cover', display: 'block' }}
                                />
                                : '-'}
                        </td>
                    </tr>
                </tbody>
            </Table>

            <Table bordered striped size="sm" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '75%' }} />
                </colgroup>
                <tbody>
                    <tr><th>학적 상태 ID</th><td>{statusRecords.statusid}</td></tr>
                    <tr><th>학적 상태</th><td>{statusRecords.studentStatus}</td></tr>
                    <tr><th>입학일</th><td>{statusRecords.admissionDate}</td></tr>
                    <tr><th>휴학일</th><td>{statusRecords.leaveDate || '-'}</td></tr>
                    <tr><th>복학일</th><td>{statusRecords.returnDate || '-'}</td></tr>
                    <tr><th>졸업일</th><td>{statusRecords.graduationDate || '-'}</td></tr>
                    <tr><th>유급일</th><td>{statusRecords.retentionDate || '-'}</td></tr>
                    <tr><th>퇴학일</th><td>{statusRecords.expelledDate || '-'}</td></tr>
                    <tr><th>총 학점</th><td>{statusRecords.totalCredit}</td></tr>
                    <tr><th>이번 학기 학점</th><td>{statusRecords.currentCredit}</td></tr>
                </tbody>
            </Table>
        </Container>
    );
}

export default App;