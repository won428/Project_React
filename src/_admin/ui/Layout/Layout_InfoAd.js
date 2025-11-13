import { Col, Container, Nav, Row } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";


export const LayoutStInfo = () => {
    const navigate = useNavigate();

    return (

        <Row className="flex-grow-1 w-100">
            {/* 왼쪽 사이드바 */}

            <Col xs={2} className="bg-dark text-white p-3 d-flex flex-column">
                <Nav
                    className="flex-column">
                    <Nav.Link onClick={() => navigate(`/infohome/ad`)}
                        className="text-white"
                    >통합 정보 홈</Nav.Link>
                    <Nav.Link
                        onClick={() => navigate(`/collist`)}
                        className="text-white"
                    >단과대학 조회</Nav.Link>
                    <Nav.Link
                        onClick={() => navigate(`/colreg`)}
                        className="text-white"
                    >단과대학 등록</Nav.Link>
                    <Nav.Link
                        onClick={() => navigate(`/majorList`)}
                        className="text-white"
                    >학과 조회</Nav.Link>
                    <Nav.Link
                        onClick={() => navigate(`/majorReg`)}
                        className="text-white"
                    >학과 등록</Nav.Link>
                </Nav>
            </Col>

            {/* 오른쪽 컨텐츠 영역 */}

            <Col xs={10} className="bg-white p-4" style={{ overflowY: 'auto' }}>
                <Container><Outlet /></Container>
            </Col>

        </Row>

    );
}
