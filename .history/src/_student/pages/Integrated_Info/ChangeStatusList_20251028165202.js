import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Container, Row, Col, Table, Alert, Button, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import { API_BASE_URL } from '../../../public/config/config';
import { useAuth } from '../../../public/context/UserContext';

const statusLabel = (code) => {
  switch (code) {
    case 'ON_LEAVE': return '휴학 신청';
    case 'RETURNED': return '복학 신청';
    case 'GRADUATED': return '졸업 요청';
    case 'ENROLLED': return '재학 유지';
    case 'MILITARY_LEAVE': return '군 휴학';
    case 'MEDICAL_LEAVE': return '입원 출석 인정';
    default: return code ?? '-';
  }
};

const statusBadge = (st) => {
  const variant = st === 'APPROVED' ? 'success'
    : st === 'REJECTED' ? 'danger'
    : st === 'PENDING' ? 'warning'
    : 'secondary';
  const label = st ?? '-';
  return <Badge bg={variant}>{label}</Badge>;
};

export default function ChangeStatusList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');
  const [meId, setMeId] = useState(null);
  const [fetchingId, setFetchingId] = useState(false);

  const token = useMemo(() => sessionStorage.getItem('accessToken'), []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setErrMsg('');
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      // 서버가 인증 사용자 기준으로 필터링한다고 가정
      const { data } = await axios.get(`${API_BASE_URL}/api/student/record/my`, { headers });
      const list = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
      setRows(list);
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        setErrMsg('접근 권한이 없습니다. 다시 로그인 후 이용하세요.');
      } else {
        setErrMsg('목록을 불러오지 못했습니다. 잠시 후 다시 시도하세요.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setErrMsg('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    fetchList();
  }, [token, fetchList]);

  const resolveUserId = useCallback(async () => {
    // 1) 컨텍스트에서 우선 시도
    const uidFromCtx = user?.id ?? user?.userId ?? user?.userid ?? null;
    if (uidFromCtx) return uidFromCtx;

    // 2) 캐시된 meId
    if (meId) return meId;

    // 3) API 조회
    if (fetchingId) return null;
    try {
      setFetchingId(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get(`${API_BASE_URL}/api/student/info`, { headers });
      const uid =
        data?.studentInfo?.userid ??
        data?.studentInfo?.userId ??
        data?.studentInfo?.id ??
        null;
      if (uid) setMeId(uid);
      return uid;
    } finally {
      setFetchingId(false);
    }
  }, [user, meId, fetchingId, token]);

  const goDetail = (recordId) => {
    navigate(`/ChangeStatusDetail/${recordId}`);
  };

  const goApply = useCallback(async () => {
    const uid = await resolveUserId();
    if (!uid) {
      alert('학생 정보가 없습니다. 내 정보 페이지에서 다시 시도하세요.');
      navigate('/StudentInfo');
      return;
    }
    navigate('/Change_Status', { state: { userId: uid } });
  }, [resolveUserId, navigate]);

  return (
    <Container style={{ maxWidth: 1000, marginTop: '2rem' }}>
      <Row className="align-items-center mb-3">
        <Col><h3>내 학적변경 신청 내역</h3></Col>
        <Col className="text-end">
          <Button variant="primary" onClick={goApply} disabled={fetchingId}>
            {fetchingId ? '확인 중...' : '새 신청'}
          </Button>
        </Col>
      </Row>

      {errMsg && (
        <Alert variant="danger" className="mb-3">
          {errMsg}
        </Alert>
      )}

      {loading ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Spinner animation="border" size="sm" />
          <span>불러오는 중...</span>
        </div>
      ) : rows.length === 0 ? (
        <Alert variant="secondary">신청 내역이 없습니다.</Alert>
      ) : (
        <Table bordered hover responsive size="sm">
          <thead>
            <tr>
              <th style={{ width: 110 }}>접수번호</th>
              <th style={{ width: 160 }}>신청 목적</th>
              <th>제목</th>
              <th style={{ width: 140 }}>신청일</th>
              <th style={{ width: 120 }}>상태</th>
              <th style={{ width: 110 }}>자세히</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const id = r.recordId ?? r.id;
              return (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{statusLabel(r.studentStatus)}</td>
                  <td>{r.title ?? '-'}</td>
                  <td>{r.appliedDate ? dayjs(r.appliedDate).format('YYYY-MM-DD') : '-'}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td>
                    <Button variant="outline-secondary" size="sm" onClick={() => goDetail(id)}>
                      상세
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
