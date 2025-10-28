import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Form, Button, Table } from "react-bootstrap";
import { API_BASE_URL } from "../public/config/config";
import { useAuth } from "../public/context/UserContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function App() {
    const { user } = useAuth();
    // const { data } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const data = location?.state;
    useEffect(() => {
        const url = `${API_BASE_URL}/notice/specific`
        const parameter = { id: data }
        axios.get(url, parameter)
            .then((res) => {

            })
            .catch((e) => console.log(e))



    }, [])


    return (
        <>
            <Container style={{ maxWidth: '600px', margin: '2rem auto' }} >
                <Row>
                    <Col>

                        <Card >
                            <CardBody>
                                <Col>
                                    <Row >id : {data}</Row>
                                    <Row >name : {data.username}</Row>
                                    <Row >title :  {data.title}</Row>
                                    <Row >content : {data.content}</Row>
                                    <Row >created : {data.createdAt}</Row>
                                </Col>
                            </CardBody>
                        </Card>


                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default App;