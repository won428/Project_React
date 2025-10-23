import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Alert } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../config/config";

const typeMap = {
    ADMIN: "관리자",
    STUDENT: "학생",
    PROFESSOR: "교수",
};

function InfoHome({ userId }) {
    console.log("userId:", userId);
    const [student, setStudent] = useState(null);
    const [userType, setUserType] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/student/${userId}`)
            .then((res) => {
                const rawType = res.data.utype; // 예: "STUDENT"
                const humanReadableType = typeMap[rawType]; // 예: "학생"
                setStudent(res.data);
                setUserType(humanReadableType);
            })
            .catch(() => {
                setError("학생 정보를 불러올 수 없습니다.");
            });
    }, [userId]);

    if (error) return <Alert variant="danger">{error}</Alert>;

    if (!userType) return <div>로딩중...</div>;

    if (userType !== "학생") {
        return (
            <Alert variant="warning">
                학적 정보는 학생 계정으로 로그인한 경우에만 조회할 수 있습니다.
            </Alert>
        );
    }

    if (!student) return <div>로딩중...</div>;

    return (
        <Container>
            {/* 학생 기본정보, 학적 상태 테이블 출력 (기존과 동일) */}
            <Card className="mb-3">
                <Card.Body>
                    <Row>
                        <Col md={2} className="d-flex align-items-center">
                            <img
                                src={student.studentimage || "/default.png"}
                                alt="profile"
                                style={{ width: 120, height: 120 }}
                            />
                        </Col>
                        <Col md={10}>
                            <Table bordered size="sm">
                                <tbody>
                                    <tr>
                                        <th>학번</th>
                                        <td>{student.usercode}</td>
                                        <th>성명</th>
                                        <td>{student.uname}</td>
                                        <th>성별</th>
                                        <td>{student.gender}</td>
                                    </tr>
                                    <tr>
                                        <th>생년월일</th>
                                        <td>{student.birthdate}</td>
                                        <th>확정상태</th>
                                        <td>{student.studentstatus}</td>
                                        <th>국적</th>
                                        <td>대한민국</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header>학적 사항</Card.Header>
                <Card.Body>
                    <Table bordered>
                        <tbody>
                            <tr>
                                <th>대학(부)</th>
                                <td>{student.college}</td>
                                <th>학과(전공)</th>
                                <td>{student.majorName}</td>
                            </tr>
                            <tr>
                                <th>현재학년/이수학기</th>
                                <td>{student.grade} / {student.semester}</td>
                                <th>입학구분/전형</th>
                                <td>{student.admissionType}</td>
                            </tr>
                            <tr>
                                <th>지도교수</th>
                                <td>{student.professor || "현상규"}</td>
                                <th>평점평균</th>
                                <td>{student.gpa || "4.5"}</td>
                            </tr>
                            <tr>
                                <th>등록기준</th>
                                <td>{student.regRule}</td>
                                <th>수료연월일</th>
                                <td>{student.graduationDate}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default InfoHome;
