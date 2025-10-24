import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container } from 'react-bootstrap';
import { API_BASE_URL } from '../../config/config';
import { useAuth } from '../../context/UserContext';

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
    const {user}=useAuth();
    useEffect(() => {
        // axios.get(`${API_BASE_URL}/api/student/info`, {
        //     headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJBZG1pbjEyM0BBZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2MTI3NDkyNSwiZXhwIjoxNzYxMjc2NzI1fQ.ygECuL5kwMdawxctSxQlbDYXSGcnlEHJDUtQmsJJziU` }
        // })
        //     .then(res => {
        //         if (res.data.type === 'STUDENT') {
        //             setStudentInfo(res.data.studentInfo);
        //             setStatusRecords(res.data.statusRecords);
        //             setError(null);
        //         } else {
        //             setStudentInfo(null);
        //             setStatusRecords(null);
        //             setError('학생 정보만 조회할 수 있습니다.');
        //         }
        //     })
        //     .catch(() => {
        //         setError('데이터 불러오기에 실패했습니다.');
        //         setStudentInfo(null);
        //         setStatusRecords(null);
        //     })
        //     .finally(() => setLoading(false));
    if(user?.roles)


    }, []);

    
    if (loading) {
        return (
            <Container>
                <div>Loading...</div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <div style={{ color: 'red' }}>{error}</div>
            </Container>
        );
    }

    return (
        <Container>
            <h2>학생 기본 정보</h2>
            <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
                <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '75%' }} />
                </colgroup>
                <tbody>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f9f9f9' }}>아이디</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.userid}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f9f9f9' }}>학번</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.userCode}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f9f9f9' }}>이름</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.name}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f9f9f9' }}>이메일</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.email}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f9f9f9' }}>전화번호</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.phone}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f9f9f9' }}>생년월일</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.birthDate}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f9f9f9' }}>성별</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.gender}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f9f9f9' }}>소속학과</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.major?.name || ''}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', backgroundColor: '#f9f9f9' }}>사용자 유형</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.type}</td>
                    </tr>
                </tbody>
            </table>

            text
            <h2 style={{ marginTop: '3rem' }}>학적 상태</h2>

            {/* 증명사진만 별도로 분리 */}
            <table style={{ borderCollapse: 'collapse', marginBottom: '1rem', width: 'auto' }}>
                <tbody>
                    <tr>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', width: '105px', height: '135px' }}>
                            {statusRecords.studentImage
                                ? <img
                                    src={statusRecords.studentImage}
                                    alt="[증명사진](pplx://action/translate)"
                                    style={{ width: '105px', height: '135px', objectFit: 'cover', display: 'block' }}
                                />
                                : '-'
                            }
                        </td>
                    </tr>
                </tbody>
            </table>

            <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '1rem', tableLayout: 'fixed' }}>
                <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '75%' }} />
                </colgroup>
                <tbody>
                    <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>학적 상태 ID</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.statusid}</td></tr>
                    <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>학적 상태</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.studentStatus}</td></tr>
                    <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>입학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.admissionDate}</td></tr>
                    <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>휴학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.leaveDate || '-'}</td></tr>
                    <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>복학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.returnDate || '-'}</td></tr>
                    <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>졸업일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.graduationDate || '-'}</td></tr>
                    <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>유급일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.retentionDate || '-'}</td></tr>
                    <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>퇴학일</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.expelledDate || '-'}</td></tr>
                    <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>총 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.totalCredit}</td></tr>
                    <tr><th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>이번 학기 학점</th><td style={{ border: '1px solid #ddd', padding: '8px' }}>{statusRecords.currentCredit}</td></tr>
                </tbody>
            </table>
        </Container>
    );
}

export default App;