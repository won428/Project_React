import { Button, Col, Container, Row } from "react-bootstrap";
import { useAuth } from "../../../public/context/UserContext";
import { useNavigate } from "react-router-dom";


function App() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();



    return (
        <Container className="mt-4">
            <Row>
                <Col>

                </Col>
            </Row>
        </Container>
    )
}
export default App;