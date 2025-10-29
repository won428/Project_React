import logo from './logo.svg';
import './App.css';
import { Link } from "react-router-dom"; // Link 사용

import AppRoutes from './routes/AppRoutes'


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



  return (

    <td>
      <Link to={`/ChangeStatusDetail/${record.recordId}`} style={{ textDecoration: 'underline', color: 'blue' }}>
        {record.title}
      </Link>
    </td>



  );
}

export default App;
