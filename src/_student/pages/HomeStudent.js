import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { useAuth } from "../../public/context/UserContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";

function App() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const appName = "LMS";
    const [userdata, setUserdata] = useState({});
    useEffect(() => {

        const url = `${API_BASE_URL}/user/detailAll/${user?.id}`;
        axios.get(url)
            .then((res) => {
                setUserdata(res.data);
                console.log("User code fetched:", res.data);
            })
            .catch((error) => {
                console.error("Error fetching user code:", error);
            });

    }, [user?.id]);

    return (
        <Container>
            <Row>
                <Col>
                    <Container className="text-center mt-5">
                        <Row>
                            <Col className="mx-5">
                                <Card>
                                    <Card>
                                        이미지
                                    </Card>
                                    <Card.Body>
                                        <ul>
                                            <li>환영합니다, {user?.name}님!</li>
                                            <li>학번: {userdata.userCode}</li>

                                            <li>전화번호: {userdata.phone}</li>
                                            <li>소속 학과: {userdata?.major.name}</li>
                                        </ul>


                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col className="mx-5">

                                <Card>
                                    <Card>
                                    </Card>
                                    <Card.Body>
                                        <>
                                            {userdata?.gradeInfoList?.map((gradeInfo, index) => (
                                                <div key={index}>
                                                    <ul>
                                                        <li>{gradeInfo.name}</li>
                                                        <li> {gradeInfo.status}</li>
                                                    </ul>
                                                </div>
                                            ))
                                            }


                                        </>


                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="mt-4">
                                <Card>
                                    1
                                </Card>
                            </Col>
                            <Col className="mt-4">
                                <Card>
                                    학사 일정
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
    )
}
export default App;