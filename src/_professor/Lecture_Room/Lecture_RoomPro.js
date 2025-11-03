import axios from "axios";
import { useEffect, useState } from "react";
import { Card, Col, Row, Container, Spinner } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import { useAuth } from "../../public/context/UserContext";
import "../ui/LectureList.css"; // 스타일 분리 추천
import { useNavigate } from "react-router-dom";

function LectureList() {
    const [lecRoom, setLecRoom] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const url = `${API_BASE_URL}/lecture/List`;
        axios.get(url, { params: { email: user.email } })
            .then((res) => {
                setLecRoom(res.data);
                setLoading(false);
            })
            .catch((e) => {
                console.log(e);
                setLoading(false);
            });
    }, [user]);
    console.log(lecRoom);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" /> <div>불러오는 중...</div>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h4 className="fw-bold mb-3"> 강의 목록</h4>
            <Row xs={1} md={2} lg={3} className="g-3">
                {lecRoom.length > 0 ? (
                    lecRoom.map((item) => (
                        <Col key={item.id}>
                            <Card className="lecture-card" onClick={() => navigate(`/lectureSession/${item.id}`, { state: item.id })}>
                                <Card.Body>
                                    <div className="lecture-name">{item.name}</div>
                                    <div className="lecture-info text-muted">
                                        {item.userName}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <div className="text-muted text-center mt-5">등록된 강의가 없습니다.</div>
                )}
            </Row>
        </Container>
    );
}

export default LectureList;
