import logo from './logo.svg';
import './App.css';
import Menuitem from './ui/Menuitems'
import LoginPage from './pages/LoginPage'

import AppRoutes from './routes/AppRoutes'
import axios from 'axios';
import { useState } from 'react';
import UserProvider from './UserProvider';


function App() {
  const [user, setUser] = useState('');
  const appName = ' LMS Service';
  /**
   * isAuthentivated 원리
   * 1. 사용자가 로그인 요청
   * 2.서버가 사용자 인증 후 JWT(token) 생성
   * 3. 클라이언트가 JWT 저장
   * 4. API 요청 시 JWT 첨부
   * 5. 서버(로컬)에서 JWT 검증
   * 6. 인증된 유저로 API 응답
   */
  // Switch 구문으로 axios respone 받아서 
  const isAuthenticated = localStorage.getItem("accessToken");
  console.log(isAuthenticated);



  return (
    <UserProvider>
      {isAuthenticated ?
        <div>

          < header className="app-wrapper" > <Menuitem /></header >

          <main className='main-content'>
            <AppRoutes />
          </main>

          <footer className="bg-dark footer py-3 mt-5">
            <p>&copy;2025{appName}.All rights reserved</p>
          </footer>

        </div >

        : <LoginPage />}
    </UserProvider>
  );
}

export default App;
