import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row, Form, Button, Table, CardTitle } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import { useAuth } from "../../public/context/UserContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import VidTimer from "./VidTimer";
import { useLectureStore } from "./store/lectureStore";



function App() {

    const { user } = useAuth();
    // const { data } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const data = location?.state;
    const [resdata, setResData] = useState(null);
    const [initialProgress, setInitialProgress] = useState(null);
    const filePath = `${API_BASE_URL}/vid/${resdata?.path}`;

    //파일 및 수강 진행 정보 불러오기
    console.log(user.id);

    useEffect(() => {
        const url = `${API_BASE_URL}/online/Spec`
        const parameter = {
            params: {
                id: data,
                userId: user?.id,
            }
        };
        console.log(parameter);

        axios.get(url, parameter)
            .then((res) => {
                console.log(res.data);
                setResData(res.data);
                setInitialProgress(
                    {
                        totalWatchedSec: res.data.totalWatchedSec,
                        lastViewedSec: res.data.lastViewedSec,
                    }
                );

            })
            .catch((e) => console.log(e))
    }, [data])

    if (!resdata) {
        return <Container><div>강의 정보를 불러오는 중...</div></Container>;
    }


    return (
        <>
            <Container style={{ maxWidth: '800px', marginTop: '2rem' }}>
                <Card>
                    <CardBody>
                        <Card.Title>
                            123
                        </Card.Title>
                        <VidTimer
                            id={data}
                            initialProgress={initialProgress}
                            filePath={filePath}
                            vidLength={resdata.vidLength}

                        ></VidTimer>
                    </CardBody>
                </Card>
            </Container>

        </>
    )
}
export default App;