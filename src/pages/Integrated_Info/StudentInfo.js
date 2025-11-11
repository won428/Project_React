import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Spinner, Alert } from 'react-bootstrap';


function App() {
    // 나중에 axios로 API 호출 후 상태로 변경 예정
    const [studentInfo, setStudentInfo] = useState({
        userid: null,                  // Long 타입 숫자 → 초기값 null
        userCode: null,            // 고유 코드 Long
        name: '',                  // 이름 문자열
        password: '',              // 비밀번호 문자열
        birthDate: '',             // 'yyyy-MM-dd' 형식 날짜 문자열
        email: '',                 // 이메일 문자열
        phone: '',                 // 휴대전화 문자열
        gender: '',                // 성별 문자열 (예: 'MALE', 'FEMALE')
        major: null,               // 소속 학과 객체 혹은 ID(null 초기)
        type: '',                  // 사용자 유형 문자열 (예: 'STUDENT', 'PROFESSOR', 'ADMIN')
    });


    const [academicStatus, setAcademicStatus] = useState({
        statusid: null,                 // 학적 상태 PK 번호(Long)
        studentStatus: 'ENROLLED', // 학적 상태 문자열 (재학, 휴학, 복학, 퇴학, 졸업 등)
        admissionDate: '',         // 입학일자 (yyyy-MM-dd 형식)
        leaveDate: '',             // 휴학일자 (nullable)
        returnDate: '',            // 복학일자 (nullable)
        graduationDate: '',        // 졸업일자 (nullable)
        retentionDate: '',         // 유급일자 (nullable)
        expelledDate: '',          // 퇴학/제적일 (nullable)
        totalCredit: 0,            // 총 학점 (integer)
        currentCredit: 0.0,        // 이번 학기 학점 (double)
        studentImage: '',          // 증명사진 이미지 경로 문자열
    });


    useEffect(() => {
        // 추후 axios로 로그인 ID 기반 API 호출하여 데이터 갱신 예정
        // 예: axios.get(...) → setStudentInfo(...), setAcademicStatus(...)
    }, []);

    return (
        <div>
            <h2>학생 기본 정보</h2>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>아이디</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.userid}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>학번</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.userCode}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>이름</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.name}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>이메일</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.email}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>전화번호</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.phone}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>생년월일</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.birthDate}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>성별</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.gender}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>소속학과</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.major?.name || ''}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>사용자 유형</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{studentInfo.type}</td>
                    </tr>
                </tbody>
            </table>

            <h2>학적 상태</h2>
            <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '1rem' }}>
                <tbody>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>학적 상태 ID</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{academicStatus.statusid}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>학적 상태</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{academicStatus.studentStatus}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>입학일</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{academicStatus.admissionDate}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>휴학일</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{academicStatus.leaveDate || '-'}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>복학일</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{academicStatus.returnDate || '-'}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>졸업일</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{academicStatus.graduationDate || '-'}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>유급일</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{academicStatus.retentionDate || '-'}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>퇴학일</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{academicStatus.expelledDate || '-'}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>총 학점</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{academicStatus.totalCredit}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>이번 학기 학점</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{academicStatus.currentCredit}</td>
                    </tr>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>증명사진</th>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                            {academicStatus.studentImage ? <img src={academicStatus.studentImage} alt="[translate:증명사진]" style={{ width: '100px' }} /> : '-'}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default App;