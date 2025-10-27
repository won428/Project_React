import { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row, Form, Button, Table } from "react-bootstrap";
import { API_BASE_URL } from "../public/config/config";
import { useAuth } from "../public/context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function App() {
    const { user } = useAuth();
    const [post, setPost] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const url = `${API_BASE_URL}/notice/List`
        axios.get(url, { params: { email: user.email } })
            .then((res) => {
                setPost(res.data)


            })
            .catch((e) => {
                console.log(e);
            })
    }, [user.email])
    console.log(post);


    const specificPage = (evt, item) => {
        evt.preventDefault();

        navigate("/notionlistspec/", { state: item })


    }
    return (
        <>
            <Container style={{ maxWidth: '600px', margin: '2rem auto' }} >
                <Row>
                    <Col>

                        {
                            post.length > 0 ?
                                (post?.map((item) =>

                                    <Card onClick={(e) => specificPage(e, item)}>
                                        <CardBody>
                                            <Row>id : {item.id}</Row>
                                            <Row>name : {item.username}</Row>
                                            <Row>id : title :  {item.title}</Row>
                                            <Row>created : {item.createdAt}</Row>




                                        </CardBody>
                                    </Card>)
                                )
                                :
                                <div>
                                    게시물이 존재하지 않습니다.
                                </div>
                        }
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default App;