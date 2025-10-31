import { useEffect, useMemo, useState } from "react";
import { Form, Button, Col, Container, Row, Table, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function UsersSkeleton() {

  const [file, setFile] = useState(null);
  const [userList, setUserList] = useState([]);
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [validMajorIdSet, setValidMajorIdSet] = useState(new Set());
  const [selected, setSelected] = useState(new Set());

  const [showMajorModal, setShowMajorModal] = useState(false);  // 학과코드 확인용 창(Modal)
  const [majorFilter, setMajorFilter] = useState(""); // 학과코드 또는 학과명 검색
  const [majorList, setMajorList] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 고유 rid 생성 헬퍼 (addRid와 동일 규칙)
  const genRid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  // ★★★ 모든 업데이트를 rid로만 하도록 헬퍼 추가(인덱스 금지)
  const updateRow = (rid, patch) => {
    setUserList(prev => prev.map(r => (r.__rid === rid ? { ...r, ...patch } : r)));
  };

  // 행 추가 함수 (수동행 표시)
  const addEmptyRow = () => {
    const empty = {
      name: "",
      birthDate: "",       // 입력은 문자열로 받되 normalizeBirthDate에서 변환
      gender: "",          // "남자" | "여자"
      email: "",
      phoneNumber: "",
      majorId: "",
      __rid: genRid(),
      __manual: true,
    };
    setUserList(prev => [...prev, empty]);
  };

  // ===== 행 유효성 검사 헬퍼 =====
  const isEmpty = (v) => v == null || String(v).trim() === "" || v === "-";

  const isEmail = (s) =>
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/
      .test(String(s).trim());

  const isPhone = (s) =>
    /^(01[0-9])[-]?[0-9]{3,4}[-]?[0-9]{4}$/.test(String(s).trim());

  const isPosInt = (v) => /^\d+$/.test(String(v).trim());

  // 하이픈 포맷 미리보기
  const formatPhone = (v) => {
    if (!v) return "";
    const d = String(v).replace(/\D/g, "");
    if (d.startsWith("02")) {
      if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
      if (d.length === 10) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
    } else {
      if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
      if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    }
    return v;
  };

  // 완전 빈 줄 여부
  const isRowEmpty = (u) =>
    [u.name, u.birthDate, u.gender, u.email, u.phoneNumber, u.majorId].every(isEmpty);

  const validateNdBuild = (row) => {
    const errors = {};

    if (isRowEmpty(row)) {
      return { valid: true, errors: {}, payload: null };
    }

    const name = !isEmpty(row.name);
    if (!name) errors.name = "이름은 필수입니다.";

    const birthDate = normalizeBirthDate(row.birthDate);
    if (!birthDate) errors.birthDate = "생년월일 형식 오류(예: 1999-12-25)";

    const email = isEmail(row.email);
    if (!email) errors.email = "이메일 형식 오류(예: honggildong@gildong.com)";

    const phoneNumber = isPhone(row.phoneNumber);
    if (!phoneNumber) errors.phoneNumber = "전화번호 형식 오류(예: 010-0000-0000)";

    const majorNumberic = isPosInt(row.majorId);
    const majorReady = validMajorIdSet.size > 0;
    const majorExits = majorNumberic && majorReady && validMajorIdSet.has(Number(row.majorId));
    if (!majorNumberic) {
      errors.majorId = "학과코드는 숫자여야 합니다.";
    } else if (majorReady && !majorExits) {
      errors.majorId = "존재하지 않는 학과입니다.";
    }

    const genderEnum = (() => {
      const g = String(row.gender ?? "").trim();
      if (g === "남자") return "남자";
      if (g === "여자") return "여자";
    })();
    if (!genderEnum) {
      errors.gender = "성별은 '여자' 또는 '남자'만 가능합니다.";
    }

    const valid = Object.keys(errors).length == 0;
    const payload = valid ? {
      ...row,
      birthDate,
      gender: genderEnum,
    } : null;
    return { valid, errors, payload };
  };

  // ===== 파일 업로드 (수동행 보존 + 엑셀행 교체) =====
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

      // ❌ 이전: 통째로 교체 → 수동행이 사라짐
      // setUserList(addRid(res.data));

      // ✅ 변경: 수동행(__manual=true)은 보존, 엑셀행만 교체
      setUserList(prev => {
        const manualRows = prev.filter(r => r.__manual === true);
        const excelRows = addRid(res.data).map(r => ({
          ...r,
          __manual: false,
        }));
        return [...manualRows, ...excelRows];
      });

      setSelected(new Set());
    } catch (err) {
      console.error('name:', err.name);
      console.error('message:', err.message);
      console.error('config.url:', err.config?.url);
      console.error('toJSON:', err.toJSON?.());
      alert('업로드 중 네트워크 오류가 발생했습니다.');
    }
  };

  // zero-pad
  const pad2 = (n) => String(n).padStart(2, "0");

  // 유효 날짜인지 검사
  const isValidYMD = (y, m, d) => {
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() + 1 === m &&
      dt.getUTCDate() === d
    );
  };

  // 엑셀 직렬값 → yyyy-MM-dd (1899-12-30 기준)
  const excelSerialToYMD = (serial) => {
    const base = Date.UTC(1899, 11, 30);
    const ms = base + Math.round(Number(serial)) * 24 * 60 * 60 * 1000;
    const dt = new Date(ms);
    const y = dt.getUTCFullYear(),
      m = dt.getUTCMonth() + 1,
      d = dt.getUTCDate();
    return `${y}-${pad2(m)}-${pad2(d)}`;
  };

  const normalizeBirthDate = (input) => {
    if (input == null) return null;
    if (input instanceof Date && !isNaN(input)) {
      const y = input.getFullYear();
      const m = input.getMonth() + 1;
      const d = input.getDate();
      return `${y}-${pad2(m)}-${pad2(d)}`;
    }
    let s = String(input).normalize("NFKC").trim().replace(/\s+/g, "");
    if (!s) return null;

    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) {
      const [_, yy, mm, dd] = m.map(Number);
      if (isValidYMD(yy, mm, dd)) return `${yy}-${pad2(mm)}-${pad2(dd)}`;
      return null;
    }
    m = s.match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})$/);
    if (m) {
      const yy = Number(m[1]), mm = Number(m[2]), dd = Number(m[3]);
      if (isValidYMD(yy, mm, dd)) return `${yy}-${pad2(mm)}-${pad2(dd)}`;
      return null;
    }
    m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (m) {
      const yy = Number(m[1]), mm = Number(m[2]), dd = Number(m[3]);
      if (isValidYMD(yy, mm, dd)) return `${yy}-${pad2(mm)}-${pad2(dd)}`;
      return null;
    }
    if (/^\d{5,6}$/.test(s)) {
      const ymd = excelSerialToYMD(s);
      const y = Number(ymd.slice(0, 4));
      if (y >= 1900 && y <= 2100) return ymd;
    }
    return null;
  };

  // 받아온 유저 정보 컨트롤러로 전송
  const handleRegister = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = userList.map(validateNdBuild);

      // 에러상태를 테이블에 표시 (rid 기준으로 반영)
      setUserList(prev => prev.map(r => {
        if (isRowEmpty(r)) return r;
        const i = userList.findIndex(x => x.__rid === r.__rid);
        return i === -1 ? r : { ...r, errors: result[i].errors };
      }));

      const invalidCount = result.filter(r => !r.valid).length;
      if (invalidCount > 0) {
        alert(`입력값 오류로 전송이 중단되었습니다.(오류행 : ${invalidCount}개)\n 빨간 줄을 먼저 수정하세요.`);
        const firstBad = document.querySelector('tr.table-danger');
        firstBad?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const payload = result
        .map(r => r.payload)
        .filter(Boolean)
        .map(p => ({
          name: p.name,
          birthDate: p.birthDate,
          gender: p.gender,
          email: p.email,
          phoneNumber: p.phoneNumber,
          majorId: Number(p.majorId),
        }));
      if (payload.length === 0) {
        alert("전송할 데이터가 없습니다.");
        return;
      }

      console.log('[IMPORT] sending rows:', payload.length, payload.slice(0, 3));

      await axios.post(`${API_BASE_URL}/user/import`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        timeout: 20000,
      });

      alert("등록이 완료되었습니다.");

      // 성공시 첫 화면으로 리셋
      setFile(null);
      setUserList([]);
      setSelected(new Set());
      setResult(null);
      setShowMajorModal(false);

    } catch (err) {
      console.error('[IMPORT] failed:', err?.response || err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err.message;
      alert(`등록 실패(${status ?? '네트워크 오류'}): ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 학과코드 리스트 불러오기
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/major/listAll`,
          { withCredentials: true });
        const ids = new Set(res.data.map(r => Number(r.id)));
        setValidMajorIdSet(ids);
        setMajorList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMajors();
  }, []);

  // 학과코드 → 학과명 매핑
  const majorById = useMemo(() => {
    return new Map(majorList.map(m => [Number(m.id), m]));
  }, [majorList]);

  // 엑셀 행에 rid 부여
  const addRid = (arr) =>
    arr.map((u, i) => ({
      ...u,
      __rid:
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`),
    }));

  // 행 체크박스 + 토글 핸들러
  const toggleRow = (rid) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(rid) ? next.delete(rid) : next.add(rid);
      return next;
    });
  };

  // 헤더 “전체 선택” (완전빈줄 & 비수동은 숨김)
  const allVisibleRids = userList
    .filter(u => !(isRowEmpty(u) && !u.__manual) && u.__rid)
    .map(u => u.__rid);

  const allChecked = allVisibleRids.length > 0 && allVisibleRids.every(rid => selected.has(rid));

  const toggleAll = () => {
    setSelected(prev => {
      if (allChecked) return new Set();
      return new Set(allVisibleRids);
    });
  };

  // 삭제 버튼
  const deleteSelected = () => {
    if (selected.size === 0) return;
    setUserList(prev => prev.filter(u => !selected.has(u.__rid)));
    setSelected(new Set());
  };

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
                style={{ minWidth: 96 }}
              >
                미리보기
              </Button>
            </div>
            <Form.Text className="text-muted">지원 형식: .xlsx, .xls</Form.Text>
          </Col>

          <Col md className="d-flex justify-content-end">
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={() => setShowMajorModal(true)}>
                학과코드 보기
              </Button>
              <Button variant="outline-primary" onClick={addEmptyRow}>
                행 추가
              </Button>
              <Button variant="outline-danger" onClick={deleteSelected} disabled={selected.size === 0}>
                삭제
              </Button>
            </div>
          </Col>
        </Row>

        {userList.length > 0 && (
          <>
            <div className="table-responsive" style={{ maxHeight: 560, overflow: "auto" }}>
              <Table bordered hover size="sm" className="align-middle w-100" style={{ tableLayout: "fixed" }}>
                <thead style={{ position: "sticky", top: 0, background: "#f8f9fa", zIndex: 1 }}>
                  <tr>
                    <th style={{ width: 32 }}>
                      <Form.Check type="checkbox" checked={allChecked} onChange={toggleAll} />
                    </th>
                    <th style={{ minWidth: 120 }}>이름</th>
                    <th style={{ width: 120 }}>생년월일</th>
                    <th style={{ width: 80 }}>성별</th>
                    <th style={{ minWidth: 340 }}>이메일</th>
                    <th style={{ minWidth: 200 }}>휴대전화번호</th>
                    <th style={{ minWidth: 80 }}>학과코드</th>
                    <th style={{ minWidth: 80 }} disabled>학과명</th>
                  </tr>
                </thead>

                <tbody>
                  {userList
                    .filter(u => !(isRowEmpty(u) && !u.__manual))
                    .map((u) => {
                      const { valid, errors } = validateNdBuild(u);
                      const major = majorById.get(Number(u.majorId));
                      return (
                        // ❌ 옛날: key={u.__rid ?? idx}  → idx로 인해 재마운트/복제됨
                        // ✅ 고정: rid만 키로 사용
                        <tr key={u.__rid} className={valid ? "table-success" : "table-danger"}>
                          <td className="text-center">
                            <Form.Check
                              type="checkbox"
                              checked={selected.has(u.__rid)}
                              onChange={() => toggleRow(u.__rid)}
                            />
                          </td>
                          <td>
                            <Form.Control
                              value={u.name ?? ""}
                              onChange={(e) => updateRow(u.__rid, { name: e.target.value })}
                              isInvalid={!!errors.name}
                            />
                          </td>
                          <td>
                            <Form.Control
                              placeholder="1999-01-02"
                              value={u.birthDate ?? ""}
                              onChange={(e) => updateRow(u.__rid, { birthDate: e.target.value })}
                              isInvalid={!!errors.birthDate}
                            />
                          </td>
                          <td>
                            <Form.Select
                              name="gender"
                              value={u.gender ?? ""}
                              onChange={(e) => updateRow(u.__rid, { gender: e.target.value })}
                              isInvalid={!(u.gender === "남자" || u.gender === "여자")}
                            >
                              <option value="">선택</option>
                              <option value="남자">남자</option>
                              <option value="여자">여자</option>
                            </Form.Select>
                          </td>
                          <td style={{ whiteSpace: "normal", wordBreak: "break-all" }}>
                            <Form.Control
                              value={u.email ?? ""}
                              onChange={(e) => updateRow(u.__rid, { email: e.target.value })}
                              isInvalid={!!errors.email}
                            />
                          </td>
                          <td>
                            <Form.Control
                              value={u.phoneNumber ?? ""}
                              onChange={(e) => updateRow(u.__rid, { phoneNumber: e.target.value })}
                              isInvalid={!!errors.phoneNumber}
                            />
                            <Form.Text muted>예: {formatPhone(u.phoneNumber)}</Form.Text>
                          </td>
                          <td>
                            <Form.Control
                              value={u.majorId ?? ""}
                              onChange={(e) => updateRow(u.__rid, { majorId: e.target.value })}
                              isInvalid={!!errors.majorId}
                            />
                          </td>
                          <td className="text-truncate">
                            {major?.name ?? "-"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </Table>

              <Button variant="primary" onClick={handleRegister} disabled={isSubmitting}>
                {isSubmitting ? '등록 중...' : '등록'}
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

        {/* 학과코드 확인 창 */}
        <Modal show={showMajorModal} onHide={() => setShowMajorModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>학과코드 목록</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="mb-3 d-flex gap-2">
              <Form.Control
                placeholder="코드 또는 학과명 검색"
                value={majorFilter}
                onChange={e => setMajorFilter(e.target.value)}
              />
              <Button variant="outline-secondary" onClick={() => setMajorFilter("")}>초기화</Button>
            </div>
            <div style={{ maxHeight: 360, overflow: "auto" }} >
              <Table hover size="sm" className="align-middle">
                <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ width: 120 }}>코드(ID)</th>
                    <th>학과명</th>
                    <th style={{ width: 180 }}>단과대학/계열</th>
                  </tr>
                </thead>
                <tbody>
                  {majorList.filter(m => {
                    const q = majorFilter.trim().toLowerCase();
                    if (!q) return true;
                    const id = String(m.id ?? "").toLowerCase();
                    const name = String(m.name ?? m.m_name ?? "").toLowerCase();
                    const college = String(m.collegeId?.name ?? m.college?.Id ?? m.college?.name ?? m.college?.type ?? "").toLowerCase();
                    return id.includes(q) || name.includes(q) || college.includes(q);
                  })
                    .map((m) => (
                      <tr key={m.id /* __rid가 없을 수 있어 id 사용 */}>
                        <td className="text-monospace">{m.id}</td>
                        <td>{m.name ?? m.m_name ?? "-"}</td>
                        <td className="text-muted">{m.collegeName ?? m.college?.type ?? "-"}</td>
                      </tr>
                    ))}
                  {userList.length === 0 && (
                    <tr><td colSpan={3} className="text-center text-muted">
                      목록이 없습니다.
                    </td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMajorModal(false)}>닫기</Button>
          </Modal.Footer>

        </Modal>
      </Container>
    </div>
  );
}

export default UsersSkeleton;