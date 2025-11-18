import { useEffect, useState } from "react";
import {
    Card,
    CardBody,
    Container,
    ProgressBar,
    Row,
    Col,
    Table
} from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import { useAuth } from "../../public/context/UserContext";
import { useLocation } from "react-router-dom";
import axios from "axios";
import VidTimer from "./VidTimer";

function App() {
    const { user } = useAuth();
    const location = useLocation();
    const data = location?.state;
    const [resdata, setResData] = useState(null);
    const [initialProgress, setInitialProgress] = useState(null);
    const filePath = `${API_BASE_URL}/vid/${resdata?.path}`;
    const [rate, setRate] = useState(0);
    console.log(data);
    useEffect(() => {
        const url = `${API_BASE_URL}/online/Spec`;
        const parameter = {
            params: {
                id: data,
                userId: user?.id,
            },
        };

        axios.get(url, parameter)
            .then((res) => {
                setResData(res.data);
                setInitialProgress({
                    totalWatchedSec: res.data.totalWatchedSec,
                    lastViewedSec: res.data.lastViewedSec,
                });
                setRate(res.data.totalWatchedSec / res.data.vidLength * 100);
            })
            .catch((e) => console.log(e));
    }, [data, user]);

    if (!resdata) {
        return <Container className="py-5"><div>강의 정보를 불러오는 중...</div></Container>;
    }

    const percentage = Math.floor((resdata.totalWatchedSec / resdata.vidLength) * 100);

    return (
        <Container style={{ maxWidth: "900px", marginTop: "2rem" }}>
            <Card className="shadow-sm border-0">
                <CardBody>
                    <h5 className="fw-bold mb-3">📘 강의 상세</h5>
                    <Table bordered hover responsive className="mb-4">
                        <tbody>
                            <tr>
                                <th className="bg-light" style={{ width: '150px' }}>강의명</th>
                                <td>{resdata.title}</td>
                            </tr>
                            <tr>
                                <th className="bg-light">작성자</th>
                                <td>{resdata.username}</td>
                            </tr>
                            <tr>
                                <th className="bg-light">강의 길이</th>
                                <td>{resdata.vidLength}초</td>
                            </tr>
                            <tr>
                                <th className="bg-light">진도율</th>
                                <td>
                                    <div className="d-flex align-items-center gap-3">
                                        <ProgressBar
                                            now={percentage}
                                            label={`${percentage}%`}
                                            style={{ width: "70%" }}
                                            variant={percentage >= 90 ? "done" : "info"}
                                        />
                                        <span>{resdata.totalWatchedSec}초 시청</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </Table>

                    {/* 동영상 타이머/플레이어 */}
                    <VidTimer
                        id={data}
                        initialProgress={initialProgress}
                        filePath={filePath}
                        vidLength={resdata.vidLength}
                    />
                </CardBody>
            </Card>
        </Container>
    );
}
export default App;
