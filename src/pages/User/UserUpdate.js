import { useNavigate, useParams } from "react-router-dom";
import Layout_Info from "../../ui/Layout_Info";
import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";

function App() {

    const {id} = useParams()
    const [user,setUser] = useState({});
    const navigate = useNavigate();

    useEffect(()=>{
        const url = `${API_BASE_URL}/user/update/admin`

        axios.get(url,{id})
            .then((response)=>{
                setUser(response.data)
            })
            .catch((error)=>{
                console.log(error)
            })


    },[])




    const typeMap = {
        ADMIN: '관리자',
        STUDENT: '학생',
        PROFESSOR: '교수'
    };

    return (
        <>
            <Layout_Info>
               <Container fluid className="py-4">
      {/* 상단 타이틀 + 우측 등록 버튼 */}
      <Row className="align-items-center mb-3">
        <Col md={6}>
          <h4 className="mb-0">사용자 목록</h4>
          <div className="text-muted small">엑셀 스타일 표 UI</div>
        </Col>
        <Col md={6} className="text-end">
          <Button variant="primary" onClick={() => navigate('/user/insert_user')}>
            등록
          </Button>
        </Col>
      </Row>

      {/* 표: 헤더 + 한 행(샘플) */}
      <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
        <Table bordered hover size="sm" className="align-middle" style={{ tableLayout: "fixed", whiteSpace: "nowrap" }}>
          <thead style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
            <tr>
              <th style={{ minWidth: 160 }}>이름</th>
              <th style={{ width: 100 }}>성별</th>
              <th style={{ width: 100 }}>생년월일</th>
              <th style={{ width: 140 }}>학번</th>
              <th style={{ minWidth: 220 }}>이메일</th>
              <th style={{ width: 140 }}>비밀번호</th>
              <th style={{ minWidth: 160 }}>휴대전화번호</th>
              <th style={{ minWidth: 160 }}>단과대학</th>
              <th style={{ minWidth: 180 }}>학과</th>
              <th style={{ width: 120 }}>역할구분</th>
              <th style={{ width: 160 }}>액션</th>
            </tr>
          </thead>
          <tbody>
            
              <tr key={user.user_code}>
              <td>{user.u_name}</td>
              <td>{user.gender === 'MALE' ? '남자' : '여자'}</td>
              <td>{user.birthdate}</td>
              <td>{user.user_code}</td>
              <td>{user.email}</td>
              <td>{user.password}</td>
              <td>{user.phone}</td>
              <td>{user.college}</td>
              <td>{user.major}</td>
              <td>{typeMap[user.u_type]}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-primary" onClick={() => console.log('수정')}>
                    수정
                  </Button>
                </div>
              </td>
            </tr>
            
            
          </tbody>
        </Table>
      </div>
    </Container>
            </Layout_Info>
        </>
    )
}
export default App;