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
    console.log(data);



    return (
        <>
            <Container style={{ maxWidth: '600px', margin: '2rem auto' }} >
                <Row>
                    <Col>

                        <Card >
                            <CardBody>
                                id : {data.id}
                                name : {data.username}
                                title :  {data.title}
                                content : {data.content}
                                created : {data.createdAt}
                            </CardBody>
                        </Card>


                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default App;