import { Card, Col, Row } from "react-bootstrap";
import Layout from "../../../ui/Layout_lec";
function App() {


    // user-> id -> id로 lecture list 불러오고 
    return (
        <div>
            <Layout>
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



            </Layout>
        </div>
    )
}
export default App;