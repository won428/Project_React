// src/pages/college/CollegeListPage.jsx
import { useEffect, useRef, useState } from "react";
import { Table, Button, Alert, Spinner, Stack, Form, Col, Row } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";
import Pagination from 'react-bootstrap/Pagination';

export default function CollegeListPage() {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(false);          // 목록 로딩
    const [deleting, setDeleting] = useState(false);        // 삭제 로딩
    const [msg, setMsg] = useState({ type: "", text: "" });
    const [selected, setSelected] = useState(new Set());    // 선택된 ID 집합
    const headerCbRef = useRef(null);
    const navigate = useNavigate();

    {/* 페이징 관련 */ }
    const [paging, setPaging] = useState({
        totalElements: 0, // 전체 데이터 갯수
        pageSize: 10, // 한 페이지에 보일 데이터 갯수
        totalPages: 0, // 전체페이지 갯수
        pageNumber: 0, // 현재 페이지 수
        pageCount: 10, // 하단 페이지 버튼갯수
        startPage: 0, // 페이징 시작버튼
        endPage: 0,// 페이징 끝버튼
        pagingStatus: '',// 전체페이지 중 현재페이지 : "pageNumber/totalPages"

        // CollegeSearchDto로 보낼 값
        searchType: "ALL",// 카테고리 콤보박스(ALL,TYPE,OFFICE)
        searchKeyword: ""// 검색할 키워드
    });

    useEffect(() => {

        let cancelled = false;
        async function load() {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/college/list`, {
                    params: {
                        pageSize: Math.max(1, paging.pageSize),
                        pageNumber: paging.pageNumber,
                        searchType: paging.searchType,
                        searchKeyword: paging.searchKeyword
                    },
                    withCredentials: true
                });
                if (cancelled) return;

                // 목록
                const content = response.data?.content ?? [];
                // 응답에 content가 있으면 그걸 쓰고, null이거나 undefined면 빈 배열을 사용하겠다.
                setColleges(Array.isArray(content) ? content : []);

                const totalElements = Number(response.data?.totalElements ?? 0);
                const totalPages = Number(response.data?.totalPages ?? 0);

                const rPageable = response.data?.pageable ?? {};
                const rawPageSize = Number(response.data?.size ?? rPageable?.pageSize ?? paging.pageSize); // 0 대신 이전값
                const rawPageNumber = Number(response.data?.number ?? rPageable?.pageNumber ?? 0);

                const safePageNumber = Number.isFinite(rawPageNumber) && rawPageNumber >= 0 ? rawPageNumber : 0;
                const safePageSize = Number.isFinite(rawPageSize) && rawPageSize > 0 ? rawPageSize : Math.max(1, paging.pageSize || 10);

                const pageCount = paging.pageCount;

                const block = Math.floor(safePageNumber / pageCount);
                const startPage = Math.max(0, block * pageCount);
                const lastIdx = totalPages > 0 ? totalPages - 1 : -1;
                const endPage = lastIdx >= 0 ? Math.min(startPage + pageCount - 1, lastIdx) : -1;


                const pagingStatus = totalPages > 0
                    ? `${safePageNumber + 1} / ${totalPages} 페이지`
                    : `0 / 0 페이지`;

                setPaging(previous => ({
                    ...previous,
                    totalElements,
                    totalPages,
                    pageNumber: safePageNumber,
                    pageSize: safePageSize,
                    pageCount,
                    startPage,
                    endPage,
                    pagingStatus
                }));
            } catch (error) {
                if (cancelled) return;
                const reason = error.response?.data?.message || error.message || "요청 실패";
                setMsg({ type: "danger", text: `목록 조회 실패: ${reason}` });
                setColleges([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true };
    }, [paging.pageNumber, paging.pageSize, paging.searchType, paging.searchKeyword]);

    // 헤더 체크박스 indeterminate
    useEffect(() => {
        if (!headerCbRef.current) return;
        const total = colleges.length;
        const sel = selected.size;
        headerCbRef.current.indeterminate = sel > 0 && sel < total;
    }, [colleges, selected]);

    const allChecked = colleges.length > 0 && selected.size === colleges.length;

    const toggleAll = () => {
        if (allChecked) setSelected(new Set());
        else setSelected(new Set(colleges.map(c => c.id)));
    };

    const toggleOne = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleDeleteSelected = async () => {
        if (selected.size === 0) return window.alert("삭제할 항목을 선택해 주세요.");
        if (!window.confirm(`선택한 ${selected.size}건을 삭제할까요?`)) return;

        try {
            setDeleting(true);
            const ids = [...selected];
            await Promise.all(ids.map(id =>
                axios.delete(`${API_BASE_URL}/college/delete/${id}`)
            ));
            // 삭제 후 첫 페이지로 새로고침(선택)
            setSelected(new Set());
            setPaging(p => ({ ...p, pageNumber: 0 })); // → useEffect가 재요청
            setMsg({ type: "success", text: "선택 항목이 삭제되었습니다." });
        } catch (err) {
            const reason = err.response?.data?.message || err.message || "요청 실패";
            setMsg({ type: "danger", text: `삭제 실패: ${reason}` });
        } finally {
            setDeleting(false);
        }
    };

    // 한국 전화번호 포맷터 (02/지역번호/휴대폰/내선 등 기본 케이스 처리)
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


    return (
        <div className="container mt-4" style={{ maxWidth: 960 }}>
            <Stack direction="horizontal" className="mb-3">
                <h3 className="mb-0">단과대학 목록</h3>
                <Form>
                    <Row className="mb-3">
                        {/* 카테고리 선별란 */}
                        <Col md={4}>
                            <Form.Select
                                name="collegePaging"
                                value={paging.searchType}
                                onChange={(e) => setPaging((previous) => ({ ...previous, searchType: e.target.value, pageNumber: 0 }))}
                            >
                                <option value='ALL'>전체</option>
                                <option value='TYPE'>계열명</option>
                                <option value='OFFICE'>단과대학 전화번호</option>
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
                        onClick={() => setPaging(p => ({ ...p }))}
                        disabled={loading || deleting}
                    >
                        {loading ? <Spinner size="sm" /> : "새로고침"}
                    </Button>
                    <Button onClick={() => navigate("/colreg")} disabled={loading || deleting}>
                        새 단과대학 등록
                    </Button>
                </div>
            </Stack>

            {msg.text && <Alert variant={msg.type}>{msg.text}</Alert>}

            {loading ? (
                <div className="d-flex justify-content-center py-4">
                    <Spinner />
                </div>
            ) : colleges.length === 0 ? (
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
                            <th>계열명</th>
                            <th style={{ width: 220 }}>전화번호</th>
                            <th style={{ width: 120 }}>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {colleges.map((c) => {
                            const checked = selected.has(c.id);
                            return (
                                <tr key={c.id} className={checked ? "table-active" : undefined}>
                                    <td style={{ textAlign: "center" }}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleOne(c.id)}
                                        />
                                    </td>
                                    <td>{c.id}</td>
                                    <td>{c.type}</td>
                                    <td>{formatKoreanPhone(c.office)}</td>
                                    <td style={{ width: 120 }}>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => navigate(`/colup/${c.id}`)}   // ✅ 수정 페이지로 이동
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
                <Pagination.First
                    onClick={() => {
                        console.log('First 버튼 클릭(0 페이지로 이동)');
                        setPaging((previous) => ({ ...previous, pageNumber: 0 }));
                    }}
                    disabled={paging.pageNumber === 0}
                    as="button"
                >
                    맨처음
                </Pagination.First>

                <Pagination.Prev
                    onClick={() => {
                        setPaging((previous) => ({ ...previous, pageNumber: Math.max(0, paging.startPage - 1) }));
                    }}
                    disabled={paging.pageNumber === 0}
                    as="button"
                >
                    이전
                </Pagination.Prev>

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

                <Pagination.Next
                    onClick={() => {
                        setPaging((previous) => ({ ...previous, pageNumber: Math.min(previous.totalPages - 1, previous.endPage + 1) }));
                    }}
                    disabled={paging.endPage >= paging.totalPages - 1}
                    as="button"
                >
                    다음
                </Pagination.Next>

                <Pagination.Last
                    onClick={() => {
                        setPaging((previous) => ({ ...previous, pageNumber: Math.max(0, previous.totalPages - 1) }));
                    }}
                    disabled={paging.pageNumber >= paging.totalPages - 1}
                    as="button"
                >
                    맨끝
                </Pagination.Last>
            </Pagination>
        </div>
    );
}