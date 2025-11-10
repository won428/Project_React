import { Card, Col, Container, Form, Row } from "react-bootstrap";
import { useAuth } from "../../../public/context/UserContext";
import { useEffect } from "react";

function App() {
    const { user } = useAuth();

    useEffect(() => {



    }, [])
    return (
        <Container>
            <Row>
                <Col>
                    <Card>
                        {user.id} 님 {user.roles}
                    </Card>
                    <Card md={6}>
                        <Form>
                            ToDoList

                        </Form>
                    </Card>
                    <Card md={6}>
                        NoticeList
                    </Card>
                </Col>
            </Row>

        </Container>
    )
}
export default App;