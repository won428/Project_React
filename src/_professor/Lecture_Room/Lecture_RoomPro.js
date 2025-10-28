import axios from "axios";
import { useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import { useAuth } from "../../public/context/UserContext";
function App() {
    const [LecRoom, setLecRoom] = useState();
    const { user } = useAuth();
    useEffect(() => {
        const url = `${API_BASE_URL}/Lecture/List`
        console.log(user);

        axios.get(url, { state: user.email })
            .then((res) => {
                setLecRoom(res.data)
            })
            .catch((e) => {
                console.log(e);
            })




    }, [])

    // user-> id -> id로 lecture list 불러오고 
    return (
        <div>

            <Row>
                <Col>
                    <Card

                        className="h-100" style={{ cursor: 'pointer' }}>
                        1
                    </Card>
                    <Card className="h-100" style={{ cursor: 'pointer' }}>
                        2
                    </Card>
                    <Card className="h-100" style={{ cursor: 'pointer' }}>
                        3
                    </Card>
                </Col>
                <Col>
                    <Card className="h-100" style={{ cursor: 'pointer' }}>
                        4
                    </Card>
                    <Card className="h-100" style={{ cursor: 'pointer' }}>
                        5
                    </Card>
                    <Card className="h-100" style={{ cursor: 'pointer' }}>
                        6
                    </Card>
                </Col>
                <Col>
                    <Card className="h-100" style={{ cursor: 'pointer' }}>
                        7
                    </Card>
                    <Card className="h-100" style={{ cursor: 'pointer' }}>
                        8
                    </Card>
                    <Card className="h-100" style={{ cursor: 'pointer' }}>
                        9
                    </Card>
                </Col>
            </Row>

        </div>
    )
}
export default App;