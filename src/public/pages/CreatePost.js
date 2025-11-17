import { useRef, useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useAuth } from "../context/UserContext";
import { API_BASE_URL } from "../../public/config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function InquiryWrite() {
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);
  const { user } = useAuth();
  const [post, setPost] = useState({
    user: user.id,
    title:'',
    content:'',
    isPrivate:true,
    board:'',
    tag:''  
  });
  const navigate = useNavigate();

const signup = async (e) => {
      try {
        
        e.preventDefault();
        
        if (post.title === null || post.title === '') {
          alert("제목을 입력해주세요.");
          return;
        }

        if (post.content === null || post.content === '') {
          alert("내용을 입력해주세요.");
          return;
        }
        if (post.board === null || post.board === '') {
          alert("작성할 게시판을 선택해주세요..");
          return;
        }
         if (post.tag === null || post.tag === '') {
          alert("말머리를 선택해주세요.");
          return;
        }

        const formData = new FormData();
        formData.append("post", new Blob([JSON.stringify(post)], { type: "application/json" }));
        files.forEach((file) => formData.append("files", file, file.name));

        const url = `${API_BASE_URL}/inquiry/write`
        const response = await axios.post(url, formData);

        if (response.status === 200) {
          alert("등록 완료");
          navigate(-1);
        }
      } catch (error) {
        const err = error.response;
        if (!err) {
          alert("네트워크 오류가 발생하였습니다");
          return;
        }
        const message = err.data?.message ?? "오류 발생";
        alert(message);
      }
    };

 const selectFile = (e) => {
      const picked = Array.from(e.target.files || []);
      setFiles((prev) => [...prev, ...picked]);
      e.target.value = "";
      console.log(files);
    };

    const removeFile = (i) => {
      setFiles(files.filter((_, idx) => idx !== i));
    };

  return (
    <Container className="py-4" style={{ maxWidth: 900 }}>
      <h3 className="mb-4">1:1 문의 글쓰기</h3>

      <Card className="p-4 shadow-sm border-0">
        <Form>
          <Row className="g-2 mb-3">
            <Col md={6}>
              <Form.Select
                value={post.board}
                onChange={(e)=>{
                    const value = e.target.value;
                    setPost((pre)=>({...pre, board: value}))
                }}
              >
                <option value={''}>게시판을 선택해주세요.</option>
                <option value={"INQUIRY"}>1:1 게시판</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Select
                value={post.tag}
                onChange={(e)=>{
                    const value = e.target.value;
                    setPost((pre)=>({...pre, tag: value}))
                }}
              >
                <option value={''}>말머리 선택</option>
                <option value={"LECTURE"}>강의</option>
                <option value={"CALENDAR"}>학사</option>
                <option value={"OTHERS"}>기타</option>
              </Form.Select>
            </Col>
          </Row>

          <Form.Control
            value={post.title}
            onChange={(e)=>{
                const value = e.target.value;
                setPost((pre)=>({...pre, title: value}))
                console.log(post)
            }}
            type="text"
            placeholder="제목을 입력해주세요."
            className="mb-3"
          />

          <Form.Control
            as="textarea"
            style={{ resize: 'none' }}
            onChange={(e)=>{
                const value = e.target.value;
                setPost((pre)=>({...pre, content: value}))
            }}
            placeholder="내용을 입력하세요."
            rows={10}
            className="mb-3"
          />

          {/* 파일 업로드 (커스텀 UI) */}
          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-semibold me-2">첨부파일</Form.Label>

                <Form.Control
                  size="sm"
                  type="file"
                  multiple
                  onChange={selectFile}
                  ref={fileRef}
                  className="d-none"
                />

                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => fileRef.current?.click()}
                >
                  파일 선택
                </Button>

                <div className="small mt-2 text-muted">
                  {files.length ? `${files.length}개 파일 선택됨` : "선택된 파일 없음"}
                </div>

                {files.length > 0 && (
                  <ul
                    className="small mt-1 mb-0 ps-4"
                    style={{ listStyle: "disc" }}
                  >
                    {files.map((f, i) => (
                      <li key={`${f.name}-${i}`}>
                        <span className="me-1">{f.name}</span>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="p-0 ms-1 align-baseline border-0 bg-transparent shadow-none"
                          onClick={() => removeFile(i)}
                          aria-label={`${f.name} 삭제`}
                          title="삭제"
                        >
                          ×
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={()=> navigate("/inquiryBoard")}>취소</Button>
            <Button variant="primary" onClick={signup}>등록</Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
export default InquiryWrite;