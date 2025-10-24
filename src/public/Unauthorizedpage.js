import { Button, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function App() {
    const navigate = useNavigate();
    return (
        <>
            <Container className="d-flex justify-content-center align-items-center mt-5">
                <Row>
                    <Col>
                        <header>
                            <h2>접근 권한 오류</h2>
                        </header>
                        <content>
                            <h1>
                                Error : 접근 권한이 없습니다.
                            </h1>
                        </content>
                        <Button
                            type="button"
                            onClick={() => navigate(-1)}
                        >
                            뒤로가기
                        </Button>
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default App;