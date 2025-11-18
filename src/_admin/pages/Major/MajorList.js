import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";
import { Table, Button, Alert, Spinner, Stack, Form, Col, Row, Pagination } from "react-bootstrap";

function App() {
    const [majors, setMajors] = useState([]);
    const [loading, setLoading] = useState(false);

    // 에러메시지 출력용 상태
    const [msg, setMsg] = useState({ type: "", text: "" });

    // 삭제할 객체 상태관리
    const [deleting, setDeleting] = useState(false);

    // 선택된 ID 집합
    const [selected, setSelected] = useState(new Set());

    // 헤더 체크박스 용
    const headerCbRef = useRef(null);

    const navigate = useNavigate();

    const [paging, setPaging] = useState({
        totalElements: 0,// 전체 데이터갯수
        pageSize: 10,// 한페이지에 보일 데이터 갯수
        totalPages: 0,// 전체 페이지수
        pageNumber: 0, // 현재 페이지수
        totalButtons: 10,// 하단 페이지 버튼갯수
        startButton: 0,// 페이징 시작버튼
        endButton: 0, // 페이징 끝버튼
        pageStatus: '',// 총 페이지 중 현재페이지

        //  Dto로 보낼거
        searchType: "",// 단과대학 
        searchKeyword: "" // 검색키워드
    });

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/major/findAllMajor`, {
                params: {
                    page: paging.pageNumber,
                    size: Math.max(1, paging.pageSize),
                    sort: 'id,desc',
                    searchType: paging.searchType,
                    searchKeyword: paging.searchKeyword
                },
                withCredentials: true
            });
            const list =
                Array.isArray(data) ? data :
                    Array.isArray(data?.content) ? data.content :
                        Array.isArray(data?.result) ? data.result :
                            [];
            setMajors(list);

            const totalElements = Number(data?.totalElements ?? data?.totalelEments ?? 0);
            const totalPages = Number(data?.totalPages ?? 0);

            const rPageable = data?.rPageable ?? {};
            const rawPageSize = Number(data?.size ?? rPageable?.pageSize ?? paging.pageSize);
            const rawPageNumber = Number(data?.number ?? rPageable.pageNumber ?? 0);

            const safePageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : Math.max(1, paging.pageSize || 10);
            const safePageNumber = Number.isFinite(rawPageNumber) && rawPageNumber >= 0 ? rawPageNumber : 0;

            const totalButtons = paging.totalButtons;
            const block = Math.floor(safePageNumber / totalButtons);
            const startPage = Math.max(0, block * totalButtons);
            const lastIdx = totalPages > 0 ? totalPages - 1 : -1;
            const endPage = lastIdx >= 0 ? Math.min(startPage + totalButtons - 1, lastIdx) : -1;

            const pagingStatus = totalPages > 0
                ? `${safePageNumber + 1} / ${totalPages} 페이지`
                : `0 / 0 페이지`;

            setPaging(prev => ({
                ...prev,
                totalElements,
                totalPages,
                pageNumber: safePageNumber,
                pageSize: safePageSize,
                startPage,
                endPage,
                pagingStatus
            }));
        } catch (err) {
            setMsg({ type: "danger", text: `목록 조회 실패: ${err}` });
            setMajors([]);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, paging.pageNumber, paging.pageSize, paging.searchType, paging.searchKeyword, paging.totalButtons]);

    useEffect(() => {
        let cancelled = false;
        (async () => { if (!cancelled) await load(); })();
        return () => { cancelled = true; }
    }, [load]);

    function formatKoreanPhone(raw) {
        const digits = String(raw ?? "").replace(/\D/g, ""); // 숫자만
        if (!digits) return "-";

        // 02(서울) 구분: 9자리=02-xxx-xxxx, 10자리=02-xxxx-xxxx
        if (digits.startsWith("02")) {
            if (digits.length === 9) return `02-${digits.slice(2, 5)}-${digits.slice(5)}`;
            if (digits.length === 10) return `02-${digits.slice(2, 6)}-${digits.slice(6)}`;
        }

        // 8자리(내선/사내번호): xxxx-xxxx
        if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;

        // 10자리(지역번호 3자리)
        if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;

        // 11자리(휴대폰 010 등)
        if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;

        // 그 외: 있는 그대로(혹은 원하는 규칙 더 추가)
        return digits;
    }

    // 헤더 체크박스 indeterminate
    useEffect(() => {
        if (!headerCbRef.current) return;
        const total = majors.length;
        const sel = selected.size;
        headerCbRef.current.indeterminate = sel > 0 && sel < total;
    }, [majors, selected]);

    const allChecked = majors.length > 0 && selected.size === majors.length;

    const toggleAll = () => {
        if (allChecked) setSelected(new Set());
        else setSelected(new Set(majors.map(c => c.id)));
    };

    const toggleOne = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // 항목 삭제 핸들러
    const handleDeleteSelected = async () => {
        if (selected.size === 0) {
            window.alert("삭제할 항목을 선택해주세요.");
            return;
        }
        if (!window.confirm(`선택한 ${selected.size}건을 삭제할까요?`)) return;
        try {
            setDeleting(true);
            const ids = [...selected];
            await Promise.all(
                ids.map(id =>
                    axios.delete(`${API_BASE_URL}/major/delete/${id}`,
                        { withCredentials: true })
                )
            );
            const remainingOnPage = majors.length - ids.length;
            setSelected(new Set());

            if (remainingOnPage <= 0 && paging.pageNumber > 0) {
                setPaging(f => ({ ...f, pageNumber: f.pageNumber - 1 }));
            } else {
                await load();
            }

            setMsg({ type: "success", text: "해당 과목을 삭제하였습니다." });
        } catch (err) {
            console.log(err);
            setMsg({ type: "danger", text: `삭제 실패 : ${err}` });
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="container mt-4" style={{ maxWidth: 960 }}>
            <Stack direction="horizontal" className="mb-3">
                <h3 className="mb-0">학과 목록</h3>
                <Form>
                    <Row className="mb-3">
                        검색 조건
                        <Col md={4}>
                            <Form.Select
                                name="MajorPaging"
                                value={paging.searchType}
                                onChange={(e) => setPaging((previous) => ({ ...previous, searchType: e.target.value, pageNumber: 0 }))}
                            >
                                <option value='ALL'>전체</option>
                                <option value='MAJORID'>학과코드</option>
                                <option value='MAJORNAME'>학과명</option>
                                <option value='COLLEGENAME'>단과대학</option>
                            </Form.Select>
                        </Col>

                        {/* 검색어 입력란 */}
                        <Col md={4}>
                            <Form.Control
                                name="searchKeyword"
                                type="text"
                                placeholder="검색어를 입력해주세요."
                                value={paging.searchKeyword}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setPaging((previous) => ({ ...previous, searchKeyword: e.target.value, pageNumber: 0 }));
                                }}
                            />
                        </Col>

                        {/* 페이징 상태 보여주기 */}
                        <Col md={2}>
                            <Form.Control
                                as="input"
                                type="text"
                                value={paging.pagingStatus}
                                disabled
                                style={{
                                    fontSize: '20px',
                                    backgroundColor: '#f0f0f0',
                                    textAlign: 'center', // 텍스트 가운데 정렬
                                    width: '100%', // 필요한 너비 설정
                                    margin: '0 auto', // 가운데 정렬을 위한 자동 여백
                                }}
                            />
                        </Col>
                    </Row>
                </Form>

                <div className="ms-auto d-flex gap-2">
                    <Button
                        variant="outline-danger"
                        onClick={handleDeleteSelected}
                        disabled={loading || deleting || selected.size === 0}
                        title={selected.size === 0 ? "선택된 항목이 없습니다" : "선택 항목 삭제"}
                    >
                        {deleting ? <Spinner size="sm" /> : `선택 삭제 (${selected.size})`}
                    </Button>
                    <Button
                        variant="outline-secondary"
                        onClick={load}
                        disabled={loading || deleting}
                    >
                        {loading ? <Spinner size="sm" /> : "새로고침"}
                    </Button>
                    <Button onClick={() => navigate("/majorReg")} disabled={loading || deleting}>
                        새 학과 등록
                    </Button>
                </div>
            </Stack>

            {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

            {loading ? (
                <div className="d-flex justify-content-center py-4">
                    <Spinner />
                </div>
            ) : majors.length === 0 ? (
                <Alert variant="light" className="text-center">
                    등록된 단과대학이 없습니다.
                </Alert>
            ) : (
                <Table bordered hover responsive>
                    <thead>
                        <tr>
                            <th style={{ width: 52, textAlign: "center" }}>
                                {/* 전체 선택 */}
                                <input
                                    ref={headerCbRef}
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th style={{ width: 120 }}>ID</th>
                            <th>학과명</th>
                            <th style={{ width: 220 }}>전화번호</th>
                            <th style={{ width: 120 }}>단과대학</th>
                        </tr>
                    </thead>
                    <tbody>
                        {majors.map((m) => {
                            const checked = selected.has(m.id);
                            return (
                                <tr key={m.id} className={checked ? "table-active" : undefined}>
                                    <td style={{ textAlign: "center" }}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleOne(m.id)}
                                        />
                                    </td>
                                    <td>{m.id}</td>
                                    <td>{m.name}</td>
                                    <td>{formatKoreanPhone(m.office)}</td>
                                    <td>{m.collegeName}</td>
                                    <td style={{ width: 120 }}>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => navigate(`/majorUp/${m.id}`)}   // ✅ 수정 페이지로 이동
                                        >
                                            수정
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}
            {/* 패이징 처리 영역 */}
            <Pagination className="justify-content-center mt-4">
                {/* 앞쪽 영역 */}
                <Pagination.First onClick={() => setPaging(p => ({ ...p, pageNumber: 0 }))} disabled={paging.pageNumber === 0} aria-label="맨처음" />

                <Pagination.Prev onClick={() => setPaging(p => ({ ...p, pageNumber: Math.max(0, p.pageNumber - 1) }))} disabled={paging.pageNumber === 0} aria-label="이전" />

                {/* 숫자 링크가 들어가는 영역 */}
                {(() => {
                    const safeStart = Number.isFinite(paging.startPage) ? paging.startPage : 0; // 시작버튼 음수 방지
                    const safeEnd = Number.isFinite(paging.endPage) ? paging.endPage : -1; // 마지막버튼 음수방지
                    const count = Math.max(0, Math.trunc(safeEnd - safeStart + 1)); // 음수/NaN 방지

                    return Array.from({ length: count }, (_, idx) => { // length:count수만큼 반복
                        const pageIndex = safeStart + idx + 1; // 표시용(1-based)
                        return (
                            <Pagination.Item
                                key={pageIndex}
                                active={paging.pageNumber === (pageIndex - 1)}
                                onClick={() => setPaging(p => ({ ...p, pageNumber: pageIndex - 1 }))}
                            >
                                {pageIndex}
                            </Pagination.Item>
                        );
                    });
                })()}

                <Pagination.Next onClick={() => setPaging(p => ({ ...p, pageNumber: Math.min(p.totalPages - 1, p.pageNumber + 1) }))} disabled={paging.pageNumber >= paging.totalPages - 1} aria-label="다음" />

                <Pagination.Last onClick={() => setPaging(p => ({ ...p, pageNumber: Math.max(0, p.totalPages - 1) }))} disabled={paging.pageNumber >= paging.totalPages - 1} aria-label="맨끝" />
            </Pagination>
        </div>
    );
}
export default App;
