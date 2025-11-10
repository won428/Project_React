import { useEffect, useState } from 'react';
import { Container, Form, Button, Row, Col, Table } from 'react-bootstrap';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../public/config/config';
import { useAuth } from '../../../public/context/UserContext';

// 1. 학생이 수강중인 강의 리스트 뜨기
// 2. 수강중인 강의 행에 '학생의 점수 / 만점' 뜨기
// 3. 상세보기 누르면 강의차시, 해당 강의일자, 출석상태 뜨기

// useEffect로 가져와야할 정보 - 1. 학생이 수강중인 강의정보 / 2. 해당 강의의 출석정보 

function App() {
    const [lectureList, setLectureList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    const { state } = useLocation();
    const { id: paramId } = useParams();

    const { user } = useAuth();
    const userId = user?.id;

    const lectureId = (() => {
        if (typeof state === "number") return state;
        if (state && typeof state === "object" && "lectureId" in state) return state.lectureId;
        const n = Number(paramId);
        return Number.isFinite(n) ? n : undefined;
    })();

    const navigate = useNavigate();

    // 강의 및 성적 상태
    const [lectures, setLectures] = useState([]);
    const [gradesByGradeId, setGradesByGradeId] = useState({});
    const [years, setYears] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!lectureId) return;
        (async () => {
            setLoading(false);
            try {
                const lec = await axios.get(`${API_BASE_URL}/enrollment/selectAll`, { params: { userId } });
                setLectureList(lec.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [lectureId]);



    return (
        <Container style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ margin: 0 }}>성적 조회</h3>

            </div>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <Row>
                {/* <Col md={3} style={{ maxHeight: '60vh', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
                    <Form>
                        <Form.Select name="year" value={selectedYear} onChange={handleYearChange}>
                            <option value="" disabled>년도 선택</option>
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year.slice(-2)}년
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Select name="semester" value={selectedSemester || ''} onChange={handleSemesterChange} style={{ marginTop: 8 }}>
                            <option value="" disabled>학기 선택</option>
                            <option value={1}>1학기 (3~6월)</option>
                            <option value={2}>2학기 (9~12월)</option>
                            <option value={3}>계절학기 1 (1~2월)</option>
                            <option value={4}>계절학기 2 (7~8월)</option>
                        </Form.Select>
                    </Form>
                </Col> */}
            </Row>

            <Row style={{ marginTop: 24 }}>
                <Col md={12} style={{ overflowX: 'auto' }}>
                    {lectures.length === 0 ? (
                        <div>선택한 학기에 수강한 강의가 없습니다.</div>
                    ) : (
                        <Table bordered hover size="sm" style={{ minWidth: 700 }}>
                            <thead>
                                <tr>
                                    <th>강의명</th>
                                    <th>이수구분</th>
                                    <th>수강상태</th>
                                    <th>출결점수</th>
                                    <th>담당교수</th>
                                    <th>상세보기</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lectureList.map((l) =>
                                    <tr>
                                        <th>{ }</th>
                                        <th></th>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Col>
            </Row>

        </Container>
    );
}

export default App;
