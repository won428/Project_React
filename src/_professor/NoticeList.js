import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Form, Button, Table } from "react-bootstrap";
import { API_BASE_URL } from "../public/config/config";
import { useAuth } from "../public/context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function App() {
    const { user } = useAuth();
    const [post, setPost] = useState({});
    const navigate = useNavigate();
    useEffect(() => {
        const url = `${API_BASE_URL}/notice/List`
        axios.get(url, { params: { email: user.email } })
            .then((res) => {
                setPost({
                    title: res?.data.title,
                    name: res?.data.user.name,
                    createdat: res?.data.createdAt,
                    updatedat: res?.data.updatedAt,
                })
                console.log(post);

            })
            .catch((e) => {
                console.log(e);

            })




    }, [])

    return (
        <>
            <Container style={{ maxWidth: '600px', margin: '2rem auto' }} >
                <Row>
                    <Col>
                        <Card>
                            <CardBody>
                                <Table>

                                </Table>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default App;