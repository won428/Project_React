// import { Calendar, dataFnsLocalizer } from "react-big-calendar";

import { Card, Container, Form } from "react-bootstrap";

function App() {
    return (
        <Container>
            <Card className="mt-5">
                <Form>
                    (가안) react-big-calendar dataFnsLocalizer 활용
                    캘린더 형태 눌렀을 때 한 주형태의 캘린더 형태로 출력
                    description 활용
                    or 그냥 캘린더 형태만 description 삭제
                </Form>
            </Card>
        </Container>
    )
}
export default App;