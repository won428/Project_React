import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Table, Spinner, Alert } from "react-bootstrap";
import { API_BASE_URL } from "../../config/config";

function InfoHome() {
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const studentId = localStorage.getItem("studentId") || 1;

    useEffect(() => {
        setLoading(true);
        setError(null);

        axios
            .get(`${API_BASE_URL}/user/${studentId}`, { withCredentials: true })
            .then((response) => {
                console.log("학생 정보 응답:", response.data); // 디버깅용 로그
                setStudentInfo(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("API 호출 에러:", error.response || error.message);
                setError("학생 정보를 불러오는 중 오류가 발생했습니다.");
                setLoading(false);
            });
    }, [studentId]);

    if (loading) {
        return (
            <Container className="py-4 text-center">
                <Spinner animation="border" />
                <div>정보를 불러오는 중입니다...</div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (!studentInfo) {
        return (
            <Container className="py-4">
                <Alert variant="warning">출력할 학생 정보가 없습니다.</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h3>학생 기본 정보</h3>
            <Table striped bordered hover responsive className="mb-5">
                <tbody>
                    <tr>
                        <th>이름</th>
                        <td>{studentInfo.uname}</td>
                    </tr>
                    <tr>
                        <th>이메일</th>
                        <td>{studentInfo.email}</td>
                    </tr>
                    <tr>
                        <th>전화번호</th>
                        <td>{studentInfo.phone}</td>
                    </tr>
                    <tr>
                        <th>성별</th>
                        <td>{studentInfo.gender}</td>
                    </tr>
                    <tr>
                        <th>학과</th>
                        <td>{studentInfo.majorName}</td>
                    </tr>
                </tbody>
            </Table>
            <h3>학적 정보</h3>
            <Table striped bordered hover responsive>
                <tbody>
                    <tr>
                        <th>학적 상태</th>
                        <td>{studentInfo.studentstatus}</td>
                    </tr>
                    <tr>
                        <th>입학일</th>
                        <td>{studentInfo.admissionDate || "-"}</td>
                    </tr>
                    <tr>
                        <th>휴학일</th>
                        <td>{studentInfo.leaveDate || "-"}</td>
                    </tr>
                    <tr>
                        <th>복학일</th>
                        <td>{studentInfo.returnDate || "-"}</td>
                    </tr>
                    <tr>
                        <th>졸업일</th>
                        <td>{studentInfo.graduationDate || "-"}</td>
                    </tr>
                </tbody>
            </Table>
        </Container>
    );
}

export default InfoHome;
