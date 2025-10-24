// src/pages/college/CollegeListPage.jsx
import { useEffect, useRef, useState } from "react";
import { Table, Button, Alert, Spinner, Stack } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../public/config/config";

export default function CollegeListPage() {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(false);          // 목록 로딩
    const [deleting, setDeleting] = useState(false);        // 삭제 로딩
    const [msg, setMsg] = useState({ type: "", text: "" });
    const [selected, setSelected] = useState(new Set());    // 선택된 ID 집합
    const headerCbRef = useRef(null);
    const navigate = useNavigate();

    const fetchColleges = async () => {
        setMsg({ type: "", text: "" });
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/college/list`);
            setColleges(Array.isArray(res.data) ? res.data : []);
            setSelected(new Set()); // 목록 새로고침 시 선택 초기화
        } catch (err) {
            const reason = err.response?.data?.message || err.message || "요청 실패";
            setMsg({ type: "danger", text: `목록 조회 실패: ${reason}` });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchColleges();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 헤더 체크박스 indeterminate 처리
    useEffect(() => {
        if (!headerCbRef.current) return;
        const total = colleges.length;
        const sel = selected.size;
        headerCbRef.current.indeterminate = sel > 0 && sel < total;
    }, [colleges, selected]);

    const allChecked = colleges.length > 0 && selected.size === colleges.length;

    const toggleAll = () => {
        if (allChecked) {
            setSelected(new Set());
        } else {
            setSelected(new Set(colleges.map((c) => c.id)));
        }
    };

    const toggleOne = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleDeleteSelected = async () => {
        if (selected.size === 0) {
            window.alert("삭제할 항목을 선택해 주세요.");
            return;
        }
        if (!window.confirm(`선택한 ${selected.size}건을 삭제할까요?`)) return;

        try {
            setDeleting(true);
            const ids = [...selected];
            await Promise.all(
                ids.map((id) =>
                    axios.delete(`${API_BASE_URL}/college/delete/${id}`)
                )
            );
            // 성공 후 새로고침
            await fetchColleges();
            setMsg({ type: "success", text: "선택 항목이 삭제되었습니다." });
        } catch (err) {
            const reason = err.response?.data?.message || err.message || "요청 실패";
            setMsg({ type: "danger", text: `삭제 실패: ${reason}` });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: 960 }}>
            <Stack direction="horizontal" className="mb-3">
                <h3 className="mb-0">단과대학 목록</h3>
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
                        onClick={fetchColleges}
                        disabled={loading || deleting}
                    >
                        {loading ? <Spinner size="sm" /> : "새로고침"}
                    </Button>
                    <Button onClick={() => navigate("/ColRegister")} disabled={loading || deleting}>
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
                                    <td>{c.office ?? "-"}</td>
                                    <td style={{ width: 120 }}>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => navigate(`/CollegeUpdate/${c.id}`)}   // ✅ 수정 페이지로 이동
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
        </div>
    );
}
