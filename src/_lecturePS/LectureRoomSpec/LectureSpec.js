import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row, Form, Button, Table, CardTitle } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import { useAuth } from "../../public/context/UserContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useLectureStore } from "./store/lectureStore";

function App() {
    const { user } = useAuth();
    // const { data } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const data = location?.state;
    const { lectureId } = useLectureStore();
    const [mod, setMod] = useState(false);
    const [resdata, setResData] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [subfiles, setSubfiles] = useState([]);
    const fileRef = useRef();

    useEffect(() => {
        const url = `${API_BASE_URL}/online/Spec`
        const parameter = { params: { id: data } }
        axios.get(url, parameter)
            .then((res) => {
                console.log(res.data);
                setResData(res.data)

            })
            .catch((e) => console.log(e))
    }, [data])

    // useEffect(()=>{

    // },[])
    // 추후 비디오 경과에 따른 출석 인정 기능 구현

    if (!resdata) {
        return <Container><div>강의 정보를 불러오는 중...</div></Container>;
    }

    const filePath = `${API_BASE_URL}/vid/${resdata?.path}`;

    console.log(filePath);



    return (
        <>
            <Container style={{ maxWidth: '800px', marginTop: '2rem' }}>
                <Card>
                    <CardBody>
                        <video

                            src={filePath}
                            width="100%"
                            controls
                        >

                        </video>
                        {data}
                    </CardBody>
                </Card>
            </Container>

        </>
    )
}
export default App;