import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Form,
  ListGroup,
  Stack,
} from "react-bootstrap";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/UserContext";

export default function PostViewUI() {
  const { id } = useParams();
  const { user } = useAuth();
  const [page, setPage] = useState({});
  const navigate = useNavigate();
  const [comment, setComment] = useState({
    content : '',
    userId : user.id,
    postId : id
  })

   const typeMap2 = {
    'LECTURE': "[강의]",
    'CALENDAR': "[학사]",
    "OTHERS": "[기타]",
  };

  useEffect(() => {
    const url = `${API_BASE_URL}/inquiry/page/${id}`;
    axios
      .get(url)
      .then((res) => {
        setPage(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const downloadClick = (id) => {
    const url = `${API_BASE_URL}/attachment/download/${id}`;
    axios
      .get(url, { responseType: "blob" })
      .then((response) => {
        const cd = response.headers["content-disposition"] || "";
        const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(cd)?.[1];
        const quoted = /filename="([^"]+)"/i.exec(cd)?.[1];
        const filename =
          (utf8 && decodeURIComponent(utf8)) || quoted || `file-${id}`;

        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        alert("오류");
      });
  };

  const writeComment = async (e) =>{
    e.preventDefault();

    try {
        const url = `${API_BASE_URL}/inquiry/write/comment`;
        const response = await axios.post(url,comment,
            {headers: { 'Content-Type': 'application/json' }}
        )
    if (response.status === 200) {
              alert("댓글 등록 완료");
            }    
    } catch (error) {
             const err = error.response;
             console.log(error)
        if (!err) {
            alert('네트워크 오류가 발생하였습니다');
            return;
        }
        const message = err.data?.message ?? '오류 발생';
        alert(message);

        }
  }

  return (
    <Container className="py-4" style={{ maxWidth: 960 }}>
      <Stack gap={2} className="mb-3">
        <div className="small">{typeMap2[page.tag]}</div>
        <h3 className="mb-0">{page.title}</h3>
        <div className="text-muted small">
          <span className="fw-semibold">{page.userName}</span>
          <span className="mx-2">·</span>
          <span>작성일: {page.createdAt} / 수정일: {page.updateAt} </span>
        </div>
        <div className="text-muted small">
          <span>조회수 {page.viewCount ?? 0}</span>
          <span className="mx-2">·</span>
          <span>댓글 0</span>
        </div>
      </Stack>

      <Card className="mb-3 shadow-sm">
        <Card.Body
          className="p-4"
          style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, minHeight: 480 }}
        >
          {page.content}
        </Card.Body>
      </Card>

      <div className="mb-3">
        <div className="text-muted small mb-2">첨부파일</div>
        <div className="d-flex align-items-center justify-content-between">
          <div className="text-muted w-100">
            <ul className="mb-0 w-100">
              {page.attachmentDtos?.length > 0 ? (
                page.attachmentDtos.map((lecFile) => (
                  <li key={lecFile.id} className="mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-truncate">{lecFile.name}</span>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => downloadClick(lecFile.id)}
                      >
                        다운로드
                      </Button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-muted">첨부된 파일이 없습니다.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-2">
        <Button variant="secondary" size="sm"
            onClick={()=> navigate(`/inquiryBoard`)}
        >돌아가기</Button>
      </div>

      <Card className="mb-5">
        <Card.Header className="py-2">댓글</Card.Header>

        <div className="d-flex flex-column gap-3 px-3 pt-3 pb-0">
          <div className="d-flex gap-3">
            <div
              className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40 }}
            >
              <span className="small">닉</span>
            </div>
            <div className="border rounded w-100 p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="fw-semibold">닉네임</span>
                <span className="text-muted small">YYYY.MM.DD HH:mm</span>
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>
                댓글 내용 예시(한 개만).
              </div>
            </div>
          </div>
        </div>

        <Card.Body>
          <div className="position-relative">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="댓글을 남겨보세요"
              className="mb-0 pe-5"
              style={{ resize: "none" }}
              onChange={(e)=>{
                const value = e.target.value;
                setComment((pre)=>({...pre, content : value}))
                console.log(value)
              }}
            />
            <Button
              variant="primary"
              size="sm"
              className="position-absolute end-0 bottom-0 m-2"
              onClick={(e)=>{writeComment(e)}}
            >
              등록
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
