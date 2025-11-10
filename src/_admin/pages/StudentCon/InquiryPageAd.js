import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Container,
  Form,
  ListGroup,
  Stack,
} from "react-bootstrap";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";

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
  const [commentList, setCommentList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState({
    content : ''
  });

   const typeMap2 = {
    'LECTURE': "[강의]",
    'CALENDAR': "[학사]",
    "OTHERS": "[기타]",
  };

  const startEdit = (c) => {
  setEditingId(c.postId);                // 수정할 댓글 PK
  setEditingText({ content: c.content ?? "" });
};

const cancelEdit = () => {
  setEditingId(null);
  setEditingText("");
};

  const loadPost = useCallback(async () => {
    try {
      const url = `${API_BASE_URL}/inquiry/page/${id}`;
      const { data } = await axios.get(url);
      console.log(data);
      setPage(data);
    } catch (err) {
      console.log(err);
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    try {
      const url = `${API_BASE_URL}/inquiry/comment/list/${id}`;
      const { data } = await axios.get(url);
      console.log(data)
      setCommentList(data);
    } catch (err) {
      console.log(err);
    }
  }, [id]);

  useEffect(()=>{
    loadPost();
    loadComments();
  },[loadPost, loadComments])


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
        if(comment.content === null || comment.content === ''){
          alert('댓글 내용을 입력하셔야 합니다.')
          return;
        }

        const url = `${API_BASE_URL}/inquiry/write/comment`;
        const response = await axios.post(url,comment,
            {headers: { 'Content-Type': 'application/json' }}
        )
    if (response.status === 200) {
              alert("댓글 등록 완료");
              setComment((pre)=>({...pre, content: ''}));
              await loadComments();
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

  const updateComment =  async (e, id) =>{
    
  try {
        e.preventDefault();
        const url = `${API_BASE_URL}/inquiry/comment/update/${id}`;
        const response =  await axios.patch(url, editingText,
          {headers: { 'Content-Type': 'application/json' } }
        )
        if (response.status === 200) {
          alert("수정 완료");
          navigate(0);
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
    };

    const deleteComment = async (e,id) =>{
      try {
        e.preventDefault();
       if (!window.confirm("댓글을 삭제할까요?")) {
            return;
          }
        const url = `${API_BASE_URL}/inquiry/comment/delete/${id}`;
        const response =  await axios.delete(url)
        if (response.status === 200) {
          alert("삭제 완료");
          navigate(0);
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
    };

    const deletePost = async (e) =>{
      try {
        e.preventDefault();
       if (!window.confirm("게시글을 삭제할까요?")) {
            return;
          }
        const url = `${API_BASE_URL}/inquiry/post/delete/${id}`;
        const response =  await axios.delete(url)
        if (response.status === 200) {
          alert("삭제 완료");
          navigate(-1);
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

      <div className="d-flex justify-content-end gap-2 mb-2">
        {page.user === user.id&&(
           <Button variant="outline-primary" size="sm" onClick={()=> navigate(`/updatePost/${id}`)}>수정</Button>
        )}
       <Button variant="outline-secondary" size="sm" onClick={()=> navigate(-1)}>돌아가기</Button>
        {page.user === user.id&&(
          <Button variant="outline-danger" size="sm" onClick={(e)=> deletePost(e)}>삭제</Button>
        )}
        
      </div>
      <Card className="mb-5">
        <Card.Header className="py-2">댓글</Card.Header>

 {commentList.map((c) => {
  const cid = c.postId;
  const mine = user.id === c.userId;
  const isEditing = editingId === cid;

  return (
    <div className="d-flex flex-column gap-3 px-3 pt-3 pb-0" key={cid}>
      <div className="d-flex gap-3">
        <div
          className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 40, height: 40 }}
        >
          <span className="small">{(c?.userName ?? '').trim().slice(0, 1)}</span>
        </div>

        {/* 댓글칸 */}
        <div className="border rounded w-100 p-3">
          {/* 상단: 이름/시간 */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="fw-semibold">{c.userName}</span>
            <span className="text-muted small">{c.createdAt}</span>
          </div>

          {/* 보기 모드 vs 수정 모드 교체 지점 */}
          {isEditing ? (
            <>
              <Form.Control
                as="textarea"
                rows={3}
                className="mb-2"
                value={editingText.content}
                autoFocus
                onChange={(e) => setEditingText((pre)=>({...pre, content : e.target.value}))}
               
              />
              <div className="d-flex justify-content-end gap-2">
                <Button size="sm" variant="secondary" onClick={cancelEdit}>
                  취소
                </Button>
                <Button size="sm" variant="primary" onClick={(e) => updateComment(e, cid)}>
                  저장
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-2" style={{ whiteSpace: "pre-wrap" }}>
                {c.content}
              </div>

              {mine && (
                <div className="mt-2 d-flex justify-content-end gap-2 small">
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none link-secondary"
                    onClick={() => startEdit(c)}
                  >
                    수정
                  </button>
                  <span className="text-muted">·</span>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none link-danger"
                    onClick={(e) => deleteComment(e,cid)}
                  >
                    삭제
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
})}
        

        <Card.Body>
          <div className="position-relative">
            <Form.Control
              value={comment.content}
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
