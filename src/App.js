import logo from './logo.svg';
import './App.css';
import Menuitem from './ui/Menuitems'
import LoginPage from './pages/LoginPage'

import AppRoutes from './routes/AppRoutes'


function App() {
  const appName = ' LMS Service';
  {/* {isAuthenticated ? <AppRoute /> : <LoginPage />} JWT token을 사용하여 
    로그인 확인 + security 적용
    */ }
  return (
    <div>
      <header className="app-wrapper"><Menuitem /></header>
      <main className='main-content'>
        <AppRoutes />
      </main>
      <footer className="bg-dark footer py-3 mt-5">
        <p>&copy;2025{appName}.All rights reserved</p>
      </footer>
    </div>
  );
}

export default App;
