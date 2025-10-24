import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Alert } from "react-bootstrap";
import axios from "axios";
import { API_BASE_URL } from "../../../public/config/config";

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
        <>
            INFOHOME
        </>

    )
}
export default App;