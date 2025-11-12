import axios from "axios";
import { useEffect, useState } from "react";
import { Card, Col, Row, Container, Spinner, Dropdown, Form } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import { useAuth } from "../../public/context/UserContext";
import "./../ui/Layout_lecRoomP"; // 스타일 분리 추천
import { useNavigate } from "react-router-dom";

const getTermKeyFromMonth = (month) => {
    if (month >= 2 && month <= 4) { // 3월, 4월, 5월
        return 1; // 1학기
    } else if (month >= 5 && month <= 7) { // 6월, 7월, 8월
        return 2; // 여름학기
    } else if (month >= 8 && month <= 10) { // 9월, 10월, 11월
        return 3; // 2학기
    } else { // 12월(11), 1월(0), 2월(1)
        return 4; // 겨울학기
    }
};

const generateTermOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 예: 10 (11월)
    const startYear = 2020;

    const yearLength = currentYear - startYear + 1;
    const years = Array.from({ length: yearLength }, (_, i) => currentYear - i);

    const terms = [
        { key: 1, value: "1학기" },
        { key: 2, value: "여름학기" },
        { key: 3, value: "2학기" },
        { key: 4, value: "겨울학기" }
    ];


    const currentMaxTermKey = getTermKeyFromMonth(currentMonth); // 11월(10) -> 3



    // "2025-3" (사용자님이 예상하신 올바른 값)
    const currentTermValue = `${currentYear}-${currentMaxTermKey}`;

    years.forEach(year => {
        terms.forEach(term => {
            const termValue = `${year}-${term.key}`;
            const termLabel = `${year}학년도 ${term.value}`;

            if (year === currentYear) {
                // '올해'인 경우: 현재 학기까지만 옵션에 추가
                // (11월(key 3)이면, 1, 2, 3학기만 포함됨)
                if (term.key <= currentMaxTermKey) {
                    options.push({ value: termValue, label: termLabel });
                }
            } else {
                // '과거 연도'인 경우: 모든 학기를 옵션에 추가
                options.push({ value: termValue, label: termLabel });
            }
        });
    });

    // "옵션 리스트"와 "현재 학기 값" ("2025-3")을 둘 다 반환
    return { options, currentTermValue };
};

const { options: termOptions, currentTermValue } = generateTermOptions();;


function LectureList() {
    const [lecRoom, setLecRoom] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filtering, setFiltering] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState(currentTermValue);
    console.log(selectedTerm);

    useEffect(() => {
        if (!loading) {
            setFiltering(true);
        }

        const url = `${API_BASE_URL}/lecture/stlist`;

        axios.get(url, {
            params: {
                username: user.username,
                sortKey: selectedTerm // 'selectedTerm' state를 직접 사용
            }
        })
            .then((res) => {
                setLecRoom(res.data);
            })
            .catch((e) => {
                console.log(e);
            })
            .finally(() => {
                // 모든 로딩 스피너를 비활성화
                setLoading(false);
                setFiltering(false);
            });

        // [★ 핵심 3] 'useEffect'의 의존성 배열
        // 'user' 또는 'selectedTerm'이 변경될 때마다 이 useEffect를 '다시' 실행
    }, [user, selectedTerm]);
    console.log(lecRoom);

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" /> <div>불러오는 중...</div>
            </Container>
        );
    }




    console.log(termOptions);


    return (
        <Container className="mt-4">
            <h4 className="fw-bold mb-3"> 강의 목록</h4>
            <br />
            <Row xs={1} md={2} lg={3} className="g-3">
                <Col >
                    <Form.Select
                        value={selectedTerm}
                        onChange={(e) => {
                            setSelectedTerm(e.target.value)
                        }

                        }
                    >
                        {/* <option
                            key={`${currentYear}-${currentMaxTermKey}`}
                            value={`${currentYear}-${currentMaxTermKey}`}
                        >-- 현재 학기 --</option> */}
                        {termOptions.map((item) =>
                        (<option
                            key={item.value}
                            value={item.value}
                        >{item.label}</option>))}
                    </Form.Select>
                </Col>
            </Row>
            <br />
            <Row xs={1} md={2} lg={3} className="g-3">
                {/* 필터링 중일 때 스피너 (선택 사항) */}
                {filtering ? (
                    <Container className="text-center mt-5">
                        <Spinner animation="border" size="sm" /> <div>목록 갱신 중...</div>
                    </Container>
                ) : (
                    <> {/* lecRoom 렌더링 */}
                        {lecRoom.length > 0 ? (
                            lecRoom.map((item) => (
                                <Col key={item.id}>
                                    <Card className="lecture-card" onClick={() => navigate("/roomspec", { state: item.id })}>
                                        <Card.Body>
                                            <div className="lecture-name">{item.name}</div>
                                            <div className="lecture-info text-muted">{item.userName}</div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <div className="text-muted text-center mt-5">등록된 강의가 없습니다.</div>
                        )}
                    </>
                )}
            </Row>
        </Container>
    );
}

export default LectureList;
