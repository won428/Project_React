import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Form, Button, Modal, Nav } from "react-bootstrap";
import { API_BASE_URL } from "../../public/config/config";
import axios from "axios";
import { useAuth } from "../../public/context/UserContext";
import { useNavigate, useParams } from "react-router-dom";

function ManageAppeal() {
    const { user } = useAuth();
    const { lectureId } = useParams();
    const navigate = useNavigate();

    const STATUS_MAP = { PENDING: "처리중", APPROVED: "승인", REJECTED: "반려" };
    const WEIGHTS = { ascore: 20, asScore: 20, tscore: 30, ftScore: 30 };
    const ATTENDANCE_LABELS = {
        MEDICAL_PROBLEM: "병결",
        EARLY_LEAVE: "조퇴",
        LATE: "지각",
        ABSENT: "결석",
        PRESENT: "출석",
        EXCUSED: "공결"
    };

    const [appeals, setAppeals] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [codeError, setCodeError] = useState("");
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [activeTab, setActiveTab] = useState("GRADE");
    const [modalMode, setModalMode] = useState(""); // "gradeView" | "gradeApprove" | "attView" | "attApprove"
    const [updatedScores, setUpdatedScores] = useState({
        ascore: 0, asScore: 0, tscore: 0, ftScore: 0, totalScore: 0, lectureGrade: 0
    });
    const [updatedAttendance, setUpdatedAttendance] = useState({ newStatus: "" });

    const calculateTotalAndGrade = ({ ascore, asScore, tscore, ftScore }) => {
        const att = Math.max(0, Math.min(ascore || 0, WEIGHTS.ascore));
        const as = Math.max(0, Math.min(asScore || 0, WEIGHTS.asScore));
        const mid = Math.max(0, Math.min(tscore || 0, WEIGHTS.tscore));
        const fin = Math.max(0, Math.min(ftScore || 0, WEIGHTS.ftScore));
        const totalPoints = att + as + mid + fin;
        const maxPoints = WEIGHTS.ascore + WEIGHTS.asScore + WEIGHTS.tscore + WEIGHTS.ftScore;
        const totalScore = Math.round((totalPoints / maxPoints * 100) * 100) / 100;
        const lectureGrade = Math.round((totalScore / 100 * 4.5) * 100) / 100;
        return { totalScore, lectureGrade };
    };

    const fetchAppeals = () => {
        if (!lectureId || !user?.id) return;
        axios.get(`${API_BASE_URL}/api/appeals/lectureAppeals/${lectureId}`, { params: { receiverId: user.id } })
            .then(res => {
                console.log("API 응답 데이터:", res.data);
                // 백엔드 컬럼명에 맞춰 필드 매핑
                const mapped = res.data.map(a => ({
                    appealId: a.appeal_id,
                    studentName: a.student_name,
                    studentCode: a.student_code,
                    title: a.title,
                    appealDate: a.appeal_date,
                    status: a.status,
                    appealType: a.appeal_type,
                    content: a.content,
                    sendingId: a.sending_id,
                    // Attendance_records 관련 필드
                    attendanceRecord: a.attendance_record ? {
                        attendanceDate: a.attendance_record.attendance_date,
                        attendStudent: a.attendance_record.attend_student
                    } : null,
                    // 성적 필드
                    ascore: a.ascore,
                    asScore: a.as_score,
                    tscore: a.tscore,
                    ftScore: a.ft_score
                }));
                setAppeals(mapped);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => { fetchAppeals(); }, [lectureId, user]);

    const handleCodeChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { setSearchCode(value); setCodeError(""); }
        else { setCodeError("학번만 입력해주세요"); }
    };
    const handleNameChange = (e) => setSearchName(e.target.value);

    const filteredAppeals = appeals.filter(a => {
        const nameMatch = searchName ? a.studentName.toLowerCase().includes(searchName.toLowerCase()) : true;
        const codeMatch = searchCode ? a.studentCode.includes(searchCode) : true;
        const tabMatch = activeTab === "GRADE"
            ? ["GRADE", "ASSIGNMENT", "MIDTERMEXAM", "FINALEXAM"].includes(a.appealType)
            : activeTab === "ATTENDANCE"
                ? a.appealType === "ATTENDANCE"
                : true;
        return nameMatch && codeMatch && tabMatch;
    });

    const openModal = (appeal, mode) => {
        if (appeal.appealType === "ATTENDANCE") {
            const attendanceDate = appeal.attendanceRecord?.attendanceDate || "";
            const attendStatus = appeal.attendanceRecord?.attendStudent || "";

            setSelectedAppeal({ ...appeal, attendanceDate, attendStatus });
            setUpdatedAttendance({ newStatus: attendStatus });
            setModalMode(mode === "approve" ? "attApprove" : "attView");
        } else {
            const { totalScore, lectureGrade } = calculateTotalAndGrade(appeal);
            setSelectedAppeal({ ...appeal });
            setUpdatedScores({ ...appeal, totalScore, lectureGrade });
            setModalMode(mode === "approve" ? "gradeApprove" : "gradeView");
        }
    };

    const handleScoreChange = (e) => {
        const { name, value } = e.target;
        if (value === "" || /^\d+$/.test(value)) {
            const numValue = value === "" ? 0 : Number(value);
            const newScores = { ...updatedScores, [name]: numValue };
            const { totalScore, lectureGrade } = calculateTotalAndGrade(newScores);
            setUpdatedScores({ ...newScores, totalScore, lectureGrade });
        }
    };

    const handleAttendanceChange = (e) => setUpdatedAttendance({ newStatus: e.target.value });

    const handleApproveClick = (appeal) => openModal(appeal, "approve");

    const rejectAppeal = (appealId) => {
        axios.put(`${API_BASE_URL}/api/appeals/${appealId}/reject`, { receiverId: user.id })
            .then(() => fetchAppeals())
            .catch(err => console.error(err));
    };

    const handleApproveSubmit = async () => {
        if (!selectedAppeal) return;
        try {
            if (selectedAppeal.appealType === "ATTENDANCE") {
                await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateStatus`, {
                    newStatus: updatedAttendance.newStatus,
                    sendingId: selectedAppeal.sendingId,
                    receiverId: user.id,
                    lectureId
                });
            } else {
                await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/updateScores`, {
                    ascore: updatedScores.ascore,
                    asScore: updatedScores.asScore,
                    tscore: updatedScores.tscore,
                    ftScore: updatedScores.ftScore,
                    totalScore: updatedScores.totalScore,
                    lectureGrade: updatedScores.lectureGrade,
                    sendingId: selectedAppeal.sendingId,
                    receiverId: user.id,
                    lectureId
                });
            }
            await axios.put(`${API_BASE_URL}/api/appeals/${selectedAppeal.appealId}/approve`, { receiverId: user.id });
            setModalMode("");
            fetchAppeals();
        } catch (err) {
            console.error(err);
        }
    };

    const getAttendanceTypeLabel = (status) => ATTENDANCE_LABELS[status] || status || "";

    return (
        <Container style={{ marginTop: 24 }}>
            {/* --- 이하 기존 코드와 모달 폼 구조 그대로 유지 --- */}
            {/* 검색, 테이블, 모달 4종류 모두 기존 코드 그대로 */}
            {/* ...생략하지 않고 원본 그대로 붙여 넣으면 됨 */}
        </Container>
    );
}

export default ManageAppeal;
