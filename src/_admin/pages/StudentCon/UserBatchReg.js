import { useEffect, useState } from "react";
import { Form, Button, Col, Container, Row, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function UsersSkeleton() {

  const [file, setFile] = useState(null);
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  // ===== 행 유효성 검사 헬퍼 =====
  const isEmpty = (v) => v == null || String(v).trim() === "" || v === "-";
  const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s).trim());
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
  const isPhone = (s) => /^01[0-9]-?\d{3,4}-?\d{4}$/.test(String(s).trim());
  const isGender = (s) => ["MALE", "FEMALE"].includes(String(s).trim().toUpperCase());
  const isPosInt = (v) => /^\d+$/.test(String(v).trim());

  // ========전화번호 하이픈(-) 표시용 헬퍼 =========
  const formatPhone = (v) => {
    if (!v) return "";
    const d = String(v).replace(/\D/g, ""); // 숫자만
    if (d.startsWith("02")) {
      // 서울(02) 9~10자리: 02-XXX-XXXX 또는 02-XXXX-XXXX
      if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
      if (d.length === 10) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
    } else {
      // 모바일/일반 지역번호: 10자리(3-3-4) 또는 11자리(3-4-4)
      if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
      if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    }
    return v; // 길이가 애매하면 원본 그대로
  };

  // 엑셀에서 읽은 한 줄이 '완전히 빈 줄'이면 렌더링 제외
  const isRowEmpty = (u) =>
    [u.name, u.birthDate, u.gender, u.email, u.phoneNumber, u.majorId].every(isEmpty);

  // 규격에 맞는지 판정: "맞으면 true"
  const isRowValid = (u) =>
    !isEmpty(u.name) &&
    isISODate(u.birthDate) &&
    isGender(u.gender) &&
    isEmail(u.email) &&
    isPhone(u.phoneNumber) &&
    isPosInt(u.majorId);

  {/* 파일 업로드 해서 유저목록 불러오기 */ }
  const fileUpload = async () => {
    try {
      if (!file) return alert("파일을 선택하세요.");
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${API_BASE_URL}/user/parse`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
        timeout: 20000,
      });
      setUserList(res.data);
    } catch (err) {
      // 네트워크 오류 상세 로그
      console.error('name:', err.name);
      console.error('message:', err.message);
      console.error('config.url:', err.config?.url);
      console.error('toJSON:', err.toJSON?.());
      alert('업로드 중 네트워크 오류가 발생했습니다.');
    }

  };

  {/* 받아온 유저목록 DB에 저장하기 */ }
  const insertAllUsers = async () => {
    const res = await axios.post(`${API_BASE_URL}/user/import`, userList, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    setResult(res.data);
  }



  return (
    <div>


      <Container fluid className="py-4" style={{ maxWidth: "100%" }}>
        {/* 상단 타이틀 + 우측 등록 버튼 */}
        <Row className="align-items-center mb-3">
          <Col>
            <h4 className="mb-0">학생 일괄 등록</h4>
            <div className="text-muted small">해당 양식에 맞춰 엑셀 파일 업로드 시 학생정보가 일괄 등록됩니다.</div>
            <div className="text-muted small">양식에 맞지 않는 파일 업로드 시에는 업로드가 되지 않습니다.</div>
          </Col>
          <Col xs="auto" className="ms-auto">
            <div className="d-flex justify-content-end gap-2">
              {/* <Button variant="primary" onClick={fileUpload}>일괄 업로드</Button> */}

            </div>
          </Col>
        </Row>

        {/* 파일 업로드 UI */}
        <Row className="g-2 mb-3">
          <Col md={8}>
            <div className="d-flex align-items-center flex-nowrap gap-2">
              <Form.Control
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <Button
                variant="primary"
                disabled={!file}
                onClick={fileUpload}
                className="flex-shrink-0 text-nowrap"
                style={{ minWidth: 96 }}   // 96~120px 등 취향대로
              >
                미리보기
              </Button>
            </div>
            <Form.Text className="text-muted">지원 형식: .xlsx, .xls</Form.Text>
          </Col>

          <Col md className="d-flex justify-content-end">
            <Button variant="outline-danger">삭제</Button>
          </Col>
        </Row>


        {userList.length > 0 && (
          <>
            {/* 표: 헤더 + 한 행(샘플) */}
            <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
              <Table bordered hover size="sm" className="align-middle w-100" style={{ tableLayout: "fixed" }}>
                <thead style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
                  <tr>
                    <th style={{ minWidth: 120 }}>이름</th>
                    <th style={{ width: 120 }}>생년월일</th>
                    <th style={{ width: 80 }}>성별</th>
                    <th style={{ minWidth: 340 }}>이메일</th>
                    <th style={{ minWidth: 200 }}>휴대전화번호</th>
                    <th style={{ minWidth: 80 }}>학과</th>
                  </tr>

                </thead>
                <tbody>
                  {userList.filter(u => !isRowEmpty(u))                       // 빈 줄 제거
                    .map((u, idx) => {
                      const valid = isRowValid(u);
                      return (
                        <tr key={idx} className={valid ? "table-success" : "table-danger"}>
                          <td>{u.name}</td>
                          <td>{u.birthDate}</td>
                          <td>{u.gender}</td>
                          <td style={{ whiteSpace: "normal", wordBreak: "break-all" }}>{u.email}</td>
                          <td>{formatPhone(u.phoneNumber)}</td>
                          <td>{u.majorId}</td>
                        </tr>
                      );
                    })}

                </tbody>
              </Table>
              <Button variant="primary" onClick={insertAllUsers}>
                등록
              </Button>
            </div>
          </>
        )}
        {result && (
          <div>
            <p>총 {result.total}건 / 성공 {result.success} / 실패 {result.fail}</p>
            {result.errors?.map((e, idx) => (
              <div key={idx}>{e.rowIndex}행: {e.message}</div>
            ))}
          </div>
        )}
      </Container>

    </div>
  );
}

export default UsersSkeleton;