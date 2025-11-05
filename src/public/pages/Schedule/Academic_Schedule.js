// import { Calendar, dataFnsLocalizer } from "react-big-calendar";

import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { API_BASE_URL } from "../../config/config";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function App() {
    const [CalData, setCalData] = useState();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const url = `${API_BASE_URL}/calendar/List`
        axios.get(url)
            .then((res) => {
                const formatted = res.data.map((item) => ({
                    id: item.id,
                    title: item.title,
                    start: new Date(item.calStartDate),
                    end: new Date(item.eneDate),
                    description: item.description,
                }));
                setCalData(formatted);
                setLoading(false);

            })
            .catch((e) => {
                console.log(e);
            })
    }, [])
    // id: 67, calStartDate: '2025-12-08', eneDate: '2025-12-12', title: '정기휴업일 수업결손 보충강의', description: null
    console.log(CalData);

    return (
        <Container className="mt-5">
            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0"> 학사 일정 캘린더</h5>
                    <Button variant="light" size="sm" onClick={() => window.location.reload()}>
                        새로고침
                    </Button>
                </Card.Header>

                <Card.Body style={{ height: "80vh" }}>
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <Calendar
                            localizer={localizer}
                            events={CalData}
                            startAccessor="start"
                            endAccessor="end"
                            views={["month"]}
                            popup
                            style={{ height: "100%" }}
                            allDayAccessor="allDay"
                        />
                    )}
                </Card.Body>
            </Card>
        </Container>
    )
}
export default App;