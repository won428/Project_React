import axios from "axios";
import { useEffect, useState } from "react";
import { Card, Col, Row, Container, Spinner, Dropdown, Form } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import { useAuth } from "../../public/context/UserContext";
import "./../ui/Layout_lecRoomP"; // 스타일 분리 추천
import { useNavigate } from "react-router-dom";

const generateTermOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const startYear = 2015
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => (currentYear - i))

    const terms = [
        { key: 1, value: "1학기" },
        { key: 2, value: "여름학기" },
        { key: 3, value: "2학기" },
        { key: 4, value: "겨울학기" }
    ];// Month / 3 값으로 구분

    const currentMaxTermKey = Math.floor(currentMonth / 3) + 1;



    years.forEach(year => {
        terms.forEach(term => {
            const termValue = `${year}-${term.key}`; // "2025-1"
            const termLabel = `${year}학년도 ${term.value}`; // "2025학년도 1학기"

            if (year === currentYear) {
                // '올해'인 경우: 현재 학기까지만 옵션에 추가
                if (term.key <= currentMaxTermKey - 1) {
                    options.push({ value: termValue, label: termLabel });
                }
            } else {
                // '과거 연도'인 경우: 모든 학기를 옵션에 추가
                options.push({ value: termValue, label: termLabel });
            }
        });
    });


    return options;
};

const termOptions = generateTermOptions();

function LectureList() {
    const [lecRoom, setLecRoom] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtering, setFiltering] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedTerm, setSelectedTerm] = useState("");

    const upDate = (new Date().getMonth()) / 3;
    useEffect(() => {
        const url = `${API_BASE_URL}/lecture/stlist`;
        axios.get(url, {
            params: {
                email: user.email,
                term: upDate
            }
        })
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

    console.log(termOptions);

    const SelectedValue = () => {


    }

    return (
        <Container className="mt-4">
            <h4 className="fw-bold mb-3"> 강의 목록</h4>
            <Row xs={1} md={2} lg={3} className="g-3">

                <Form.Select>

                </Form.Select>

                {lecRoom.length > 0 ? (
                    lecRoom.map((item) => (
                        <Col key={item.id}>
                            <Card className="lecture-card" onClick={() => navigate("/roomspec", { state: item.id })}>
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
