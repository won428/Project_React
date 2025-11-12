function AttendaceCheckForm({ show, onHide, onExited, loading, form, rows, onAppeal, onCheck, navigate }) {

    const handleAppealClick = () => {
        const selectedRow = rows.find(r => r.checked);
        if (!selectedRow) return alert("이의제기할 강의차시를 선택하세요.");
        navigate(`/AttendanceAppeal/${form.lectureId}`, {
            state: {
                lectureId: form.lectureId,
                attendanceDate: selectedRow.attendanceDate,
                attendanceType: selectedRow.attendStudent === "지각" ? "BE_LATE" : "ABSENT"
            }
        });
    }

    return (
        <Modal show={show} onHide={onHide} onExited={onExited} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>출결기록 상세조회</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="d-flex justify-content-center py-4">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <>
                        {/* 모달 상단 정보 */}
                        <div className="mb-3">
                            <div className="fw-semibold">{form.lectureName}</div>
                            <div className="d-flex align-items-center text-muted small">
                                <div>{form.professorName} · {form.majorName}</div>
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="ms-auto"
                                    onClick={() => onAppeal?.(form)}
                                >
                                    이의제기
                                </Button>
                            </div>
                            <div className="mt-2">
                                <span className="fw-semibold">출결 점수:</span>{" "}
                                {form.score} / {form.total}
                            </div>
                        </div>

                        {/* 출결 테이블 */}
                        <Table bordered size="sm" className="mb-0">
                            <thead>
                                <tr>
                                    <th>선택</th>
                                    <th>강의차시</th>
                                    <th>강의일</th>
                                    <th>출결상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, idx) => (
                                    <tr key={r.lectureSession}>
                                        <td>
                                            <Form.Check
                                                type="checkbox"
                                                checked={r.checked || false}
                                                disabled={rows.some(row => row.checked) && !r.checked} // 단일 선택
                                                onChange={() => onCheck(idx)}
                                            />
                                        </td>
                                        <td>{r.lectureSession}</td>
                                        <td>{r.attendanceDate}</td>
                                        <td>{r.attendStudent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>닫기</Button>
            </Modal.Footer>
        </Modal>
    );
}
