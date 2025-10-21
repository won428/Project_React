import PrivateRoute from "../ui/PrivateRoute";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from './../pages/Home';
import Lecture_Home from '../pages/Lecture/Lecture_Home';
import ToDoList from '../pages/Lecture/ToDoList';
import InfoHome from '../pages/Integrated_Info/InfoHome';
import This_Credit from '../pages/Integrated_Info/This_Credit';
import Entire_Credit from '../pages/Integrated_Info/Entire_Credit';
import Academic_Schedule from '../pages/Schedule/Academic_Schedule';
import Lecture_Room from '../pages/Lecture/Lecture_Room/Lecture_Room';
import Unauthorizedpage from '../pages/Unauthorizedpage';


import LoginPage from '../pages/LoginPage';
import { useAuth } from "../context/UserContext";
import { useEffect } from "react";






const Loading = () => <div style={{ textAlign: 'center', marginTop: '100px' }}>⏳ 사용자 정보 불러오는 중...</div>;

function App() {

    const { isAuthenticated, user, roles, loading } = useAuth();
    const navigate = useNavigate();

    /**
     * <PrivateRoute ></PrivateRoute>
     * <PrivateRoute allowedRoles ={['Roles']}>{children} </PrivateRoute>
     * Roles가 있어야 children route에 접근 가능
     */



    return (

        <Routes>


            {/* Home */}
            <Route path='/login' element={<LoginPage />} ></Route>
            <Route path='/Unauthorizedpage' element={<Unauthorizedpage />} ></Route>




            {/* STUDENT */}
            <Route element={<PrivateRoute allowedRoles={['STUDENT']} />}>
                <Route path='/' element={<Home />} ></Route>
                <Route path='/InfoHome' element={<InfoHome />} ></Route>
                <Route path='/This_Credit' element={<This_Credit />} ></Route>

                <Route path='/Entire_Credit' element={<Entire_Credit />} ></Route>

                {/* Lecture Tab */}
                <Route path='/LHome' element={<Lecture_Home />} ></Route>

                <Route path='/ToDoList' element={<ToDoList />} ></Route>

                <Route path='/LRoom' element={<Lecture_Room />} ></Route>



                {/* Schedule Tab */}
                <Route path='/acsche' element={<Academic_Schedule />} ></Route>


            </Route>


            {/* PROFESSOR */}
            <Route element={<PrivateRoute allowedRoles={['PROFESSOR']} />}>
                <Route path='/' element={<Home />} ></Route>
            </Route>



            {/* ADMIN */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
                {/* Integrated_Info Tab */}
                <Route path='/' element={<Home />} ></Route>
                <Route path='/InfoHome' element={<InfoHome />} ></Route>
                <Route path='/This_Credit' element={<This_Credit />} ></Route>

                <Route path='/Entire_Credit' element={<Entire_Credit />} ></Route>



                {/* Lecture Tab */}
                <Route path='/LHome' element={<Lecture_Home />} ></Route>

                <Route path='/ToDoList' element={<ToDoList />} ></Route>

                <Route path='/LRoom' element={<Lecture_Room />} ></Route>





                {/* Schedule Tab */}
                <Route path='/acsche' element={<Academic_Schedule />} ></Route>
            </Route>
        </Routes>

    )
}
export default App;