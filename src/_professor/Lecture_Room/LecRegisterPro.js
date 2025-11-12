  import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../config/config";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import { Button, Col, Form, Row } from "react-bootstrap";
import { useAuth } from "../../public/context/UserContext";
  function App() {

    const {user} = useAuth();
    const [professor, setProfessor] = useState({});
    const [lecture,setLecture] = useState({
        name:'',
        level:'',
        user:'',
        credit:'',
        startDate:'',
        endDate:'',
        description:'',
        major:'',
        status:"PENDING",
        totalStudent:'',
        completionDiv:''
    });
    const [major, setMajor] = useState('');
    const [schedule, setSchedule] = useState([]);
    
    const startRef = useRef(null);
    const endRef = useRef(null);
    const emptyRow = () => ({ day: null, startTime: null, endTime: null});
    const [files, setFiles] = useState([]);
    const fileRef = useRef(null);
    const [percent, setPercent] = useState({
      attendanceScore: 20,
      assignmentScore: 20,  
      midtermExam : 30,
      finalExam: 30
    })


    const navigate = useNavigate(); 

     useEffect(()=>{
      const id = user.id;
      const url = `${API_BASE_URL}/lecture/regForPro/${user.id}`
      axios
        .get(url)
        .then((response)=>{
          setProfessor(response.data)
          setLecture((pre)=>({...pre, user : response.data.id, major: response.data.major}))
        })
        .catch((error) => {
          console.error("status:", error.response?.status);
          console.error("data:", error.response?.data);
        })
    },[])

  
    const signup = async (e) => {
      try {
        e.preventDefault();
        console.log(lecture);
        const totalPercent =
          Number(percent.assignmentScore) +
          Number(percent.attendanceScore) +
          Number(percent.midtermExam) +
          Number(percent.finalExam);

        if (totalPercent > 100) {
          alert("퍼센트 비율은 100을 넘을 수 없습니다.");
          return;
        } else if (totalPercent !== 100) {
          alert("퍼센트 비율의 합이 100이 되어야합니다.");
          return;
        }

        if (lecture.completionDiv === null || lecture.completionDiv === "") {
          alert("이수 구분을 선택해주세요");
          return;
        }

         if (!isAllowedStartMonth(lecture.startDate)) {
            alert("시작 월은 1, 3, 9, 12만 가능합니다.");
            return;
        }

        const formData = new FormData();
        formData.append("lecture", new Blob([JSON.stringify(lecture)], { type: "application/json" }));
        formData.append("schedule", new Blob([JSON.stringify(schedule)], { type: "application/json" }));
        formData.append("percent", new Blob([JSON.stringify(percent)], { type: "application/json" }));
        files.forEach((file) => formData.append("files", file, file.name));

        const url = `${API_BASE_URL}/lecture/lectureRegister`;
        const response = await axios.post(url, formData);

        if (response.status === 200) {
          alert("등록 완료");
          navigate("/LRoomPro");
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

    const monthFromDateStr = (dateStr) => {
    if (!dateStr) return null;
    const m = Number(dateStr.slice(5, 7));   // 또는 dateStr.split('-')[1]
    return Number.isNaN(m) ? null : m;
    };

    const ALLOWED_MONTHS = [1, 3, 9, 12];

    const isAllowedStartMonth = (dateStr) => {
    const m = monthFromDateStr(dateStr);
    return m != null && ALLOWED_MONTHS.includes(m);
    };

    return (
      <>
        <Form onSubmit={signup}>
          <Row className="g-3">
            {/* 1) 학년 · 학점 · 상태 */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">학년</Form.Label>
                <Form.Select
                  size="sm"
                  value={lecture.level}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLecture((prev) => ({ ...prev, level: Number(value) }));
                    console.log(e.target.value);
                  }}
                >
                  <option value={"0"}>선택</option>
                  <option value={"1"}>1학년</option>
                  <option value={"2"}>2학년</option>
                  <option value={"3"}>3학년</option>
                  <option value={"4"}>4학년</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">학점</Form.Label>
                <Form.Select
                  size="sm"
                  value={lecture.credit}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLecture((prev) => ({ ...prev, credit: value }));
                    console.log(e.target.value);
                  }}
                >
                  <option value={""}>선택</option>
                  <option value={"1"}>1학점</option>
                  <option value={"2"}>2학점</option>
                  <option value={"3"}>3학점</option>
                  <option value={"4"}>4학점</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">상태</Form.Label>
                <Form.Select
                  size="sm"
                  disabled
                >
                  <option value={"PENDING"}>승인 대기</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* 2) 소속(단과대/학과) · 담당교수 */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">소속 단과 대학</Form.Label>
                <Form.Select
                  size="sm"
                  disabled            
                >
                  <option >
                      {professor.collegeName}
                    </option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">소속 학과</Form.Label>
                <Form.Select
                    size="sm"
                    disabled
                >
                 
                    <option >
                      {professor.majorName}
                    </option>
                  
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">담당 교수</Form.Label>
                <Form.Select
                  size="sm"
                  disabled
                >
                  
                    <option>
                      {professor.name}
                    </option>
                  
                </Form.Select>
              </Form.Group>
            </Col>

            {/* 3) 강의 기본정보 */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">강의 이름</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="강의 이름을 입력해주세요."
                  name="name"
                  value={lecture.name}
                  onChange={(event) => {
                    setLecture((previous) => ({ ...previous, name: event.target.value }));
                    console.log(event.target.value);
                  }}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold">이수 구분</Form.Label>
                <Form.Select
                  size="sm"
                  value={lecture.completionDiv}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLecture((prev) => ({ ...prev, completionDiv: value }));
                    console.log(e.target.value);
                  }}
                >
                  <option value={""}>선택</option>
                  <option value={"MAJOR_REQUIRED"}>전공 필수</option>
                  <option value={"MAJOR_ELECTIVE"}>전공 선택</option>
                  <option value={"LIBERAL_REQUIRED"}>교양 필수</option>
                  <option value={"LIBERAL_ELECTIVE"}>교양 선택</option>
                  <option value={"GENERAL_ELECTIVE"}>일반 선택</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="small fw-semibold">총원</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  placeholder="강의 총원을 입력해주세요."
                  name="totalStudent"
                  value={lecture.totalStudent}
                  onChange={(event) => {
                    setLecture((previous) => ({ ...previous, totalStudent: event.target.value }));
                    console.log(event.target.value);
                  }}
                />
              </Form.Group>
            </Col>

            {/* 4) 기간 */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">시작 날짜</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    size="sm"
                    ref={startRef}
                    type="date"
                    placeholder="YYYY-MM-DD"
                    name="birthdate"
                    value={lecture.startDate}
                    min="0001-01-01"
                    max="9999-12-31"
                    onChange={(event) => {
                    
                    const value = event.target.value;
                    setLecture((previous) => ({ ...previous, startDate: value }));
                    console.log(value);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => startRef.current?.showPicker?.() || startRef.current?.focus()}
                  >
                    달력
                  </Button>
                </div>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">종료 날짜</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    size="sm"
                    ref={endRef}
                    type="date"
                    placeholder="YYYY-MM-DD"
                    name="birthdate"
                    value={lecture.endDate}
                    min="0001-01-01"
                    max="9999-12-31"
                    onChange={(event) => {
                      setLecture((previous) => ({ ...previous, endDate: event.target.value }));
                      console.log(event.target.value);
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => endRef.current?.showPicker?.() || endRef.current?.focus()}
                  >
                    달력
                  </Button>
                </div>
              </Form.Group>
            </Col>

            {/* 4-a) 성적 산출 비율 */}
            <Col md={12}>
              <Form.Group className="mt-2">
                <Form.Label className="small fw-semibold">성적 산출 비율</Form.Label>
                <Row className="g-2 align-items-center">
                  <Col md={3}>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">출석</span>
                      <Form.Control
                        type="number"
                        placeholder="예: 20"
                        min="0"
                        max="100"
                        step="1"
                        name="attendanceScore"
                        onChange={(e) => {
                          const value = e.target.value;
                          setPercent((previous) => ({ ...previous, attendanceScore: value }));
                        }}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </Col>

                  <Col md={3}>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">과제</span>
                      <Form.Control
                        type="number"
                        placeholder="예: 20"
                        min="0"
                        max="100"
                        step="1"
                        name="assignmentScore"
                        onChange={(e) => {
                          const value = e.target.value;
                          setPercent((previous) => ({ ...previous, assignmentScore: value }));
                        }}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </Col>

                  <Col md={3}>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">중간</span>
                      <Form.Control
                        type="number"
                        placeholder="예: 30"
                        min="0"
                        max="100"
                        step="1"
                        name="midtermExam"
                        onChange={(e) => {
                          const value = e.target.value;
                          setPercent((previous) => ({ ...previous, midtermExam: value }));
                        }}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </Col>

                  <Col md={3}>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">기말</span>
                      <Form.Control
                        type="number"
                        placeholder="예: 30"
                        min="0"
                        max="100"
                        step="1"
                        name="finalExam"
                        onChange={(e) => {
                          const value = e.target.value;
                          setPercent((previous) => ({ ...previous, finalExam: value }));
                        }}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </Col>
                </Row>

                <div className="small text-muted mt-1">
                  합계가 100%가 되도록 입력해 주세요.
                  기본값은 20, 20, 30, 30입니다.
                </div>
              </Form.Group>
            </Col>

            {/* 4-b) 수업일수 & 요일/시간 */}
            <Col md={12}>
              <Form.Group className="mt-2">
                <Form.Label className="small fw-semibold">수업 일수</Form.Label>
                <Form.Select
                  size="sm"
                  onChange={(e) => {
                    console.log(schedule);
                    const count = Number(e.target.value) || 0;
                    setSchedule((prev) => {
                      const next = prev.slice(0, count).map((r) => r ?? emptyRow());
                      while (next.length < count) next.push(emptyRow());
                      return next;
                    });
                  }}
                >
                  <option value={""}>선택</option>
                  <option value={1}>1일</option>
                  <option value={2}>2일</option>
                  <option value={3}>3일</option>
                  <option value={4}>4일</option>
                  <option value={5}>5일</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {schedule.map((row, i) => {
              const usedByOthers = new Set(
                schedule
                  .filter((_, idx) => idx !== i)
                  .map((r) => r.day)
                  .filter(Boolean)
              );

              return (
                <Col md={12} key={i}>
                  <Row className="g-2 align-items-end">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold">요일</Form.Label>
                        <Form.Select
                          size="sm"
                          value={row.day}
                          onChange={(e) =>
                            setSchedule((prev) => {
                              const next = prev.map((row, index) => {
                                if (index === i) {
                                  return { ...row, day: e.target.value || null };
                                }
                                return row;
                              });
                              return next;
                            })
                          }
                        >
                          <option value="">선택</option>
                          <option value="MONDAY" disabled={usedByOthers.has("MONDAY")}>
                            월요일
                          </option>
                          <option value="TUESDAY" disabled={usedByOthers.has("TUESDAY")}>
                            화요일
                          </option>
                          <option value="WEDNESDAY" disabled={usedByOthers.has("WEDNESDAY")}>
                            수요일
                          </option>
                          <option value="THURSDAY" disabled={usedByOthers.has("THURSDAY")}>
                            목요일
                          </option>
                          <option value="FRIDAY" disabled={usedByOthers.has("FRIDAY")}>
                            금요일
                          </option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold">시작 시간</Form.Label>
                        <Form.Select
                          size="sm"
                          value={row.startTime}
                          onChange={(e) =>
                            setSchedule((prev) => {
                              const next = prev.map((row, index) => {
                                if (index === i) {
                                  return { ...row, startTime: e.target.value || null };
                                }
                                return row;
                              });
                              return next;
                            })
                          }
                        >
                          <option value={""}>선택</option>
                          <option value={"10:00"}>1교시</option>
                          <option value={"11:00"}>2교시</option>
                          <option value={"12:00"}>3교시</option>
                          <option value={"13:00"}>4교시</option>
                          <option value={"14:00"}>5교시</option>
                          <option value={"15:00"}>6교시</option>
                          <option value={"16:00"}>7교시</option>
                          <option value={"17:00"}>8교시</option>
                          <option value={"18:00"}>9교시</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold">끝나는 시간</Form.Label>
                        <Form.Select
                          size="sm"
                          value={row.endTime}
                          onChange={(e) =>
                            setSchedule((prev) => {
                              const next = prev.map((row, index) => {
                                if (index === i) {
                                  return { ...row, endTime: e.target.value || null };
                                }
                                return row;
                              });
                              return next;
                            })
                          }
                        >
                          <option value={""}>선택</option>
                          <option value={"11:00"}>1교시</option>
                          <option value={"12:00"}>2교시</option>
                          <option value={"13:00"}>3교시</option>
                          <option value={"14:00"}>4교시</option>
                          <option value={"15:00"}>5교시</option>
                          <option value={"16:00"}>6교시</option>
                          <option value={"17:00"}>7교시</option>
                          <option value={"18:00"}>8교시</option>
                          <option value={"19:00"}>9교시</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              );
            })}

            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-semibold me-2">강의 자료</Form.Label>
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
                  <ul className="small mt-1 mb-0 ps-4" style={{ listStyle: "disc" }}>
                    {files.map((f, i) => (
                      <li key={i}>
                        <span className="me-1">{f.name}</span>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          className="p-0 ms-1 align-baseline border-0 bg-transparent shadow-none"
                          onClick={() => {
                            removeFile(i);
                          }}
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

            <Col md={12}>
              <Form.Group>
                <Form.Label className="small fw-semibold">강의 설명</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="강의 설명을 입력해주세요."
                  name="descripton"
                  value={lecture.description}
                  onChange={(event) => {
                    setLecture((previous) => ({ ...previous, description: event.target.value }));
                    console.log(event.target.value);
                  }}
                />
              </Form.Group>
            </Col>

            <Col xs={12} className="mt-2">
              <Button size="sm" variant="primary" type="submit">
                등록하기
              </Button>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
  export default App;
