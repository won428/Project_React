import logo from './logo.svg';
import './App.css';
import { Link } from "react-router-dom"; // Link 사용

import AppRoutes from './routes/AppRoutes'
import { useEffect } from 'react';


function App() {

  /**
   * isAuthentivated 원리
   * 1. 사용자가 로그인 요청
   * 2.서버가 사용자 인증 후 JWT(token) 생성
   * 3. 클라이언트가 JWT 저장
   * 4. API 요청 시 JWT 첨부
   * 5. 서버(로컬)에서 JWT 검증
   * 6. 인증된 유저로 API 응답
   */


  useEffect(() => {
    const handleStorageChange = (event) => {
      // 'storage' 이벤트가 발생했을 때
      // 1. 키가 'accessToken'이고 (다른 값이 변한 건 무시)
      // 2. 새 값이 null (즉, 삭제되었을 때)
      if (event.key === 'accessToken' && event.newValue === null) {

        // 현재 탭의 토큰도 만료되었으므로 강제 로그아웃
        console.warn('로그아웃 다시 로그인해주세요.');

        // 실제 로그아웃 처리 (Context API나 Redux 상태 변경)
        // 여기서는 간단히 새로고침하여 로그인 페이지로 보냅니다.
        window.location.href = '/';
      }
    };
    // 스토리지 이벤트 리스너 등록
    window.addEventListener('storage', handleStorageChange);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (



    <AppRoutes />

  );
}

export default App;
