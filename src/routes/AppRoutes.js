import PrivateRoute from "../ui/PrivateRoute";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from '../pages/HomeAdmin';
import Lecture_Home from '../pages/Lecture/Lecture_Home';
import ToDoList from '../pages/Lecture/ToDoList';
import InfoHome from '../pages/Integrated_Info/InfoHome';
import This_Credit from '../pages/Integrated_Info/This_Credit';
import Entire_Credit from '../pages/Integrated_Info/Entire_Credit';
import Academic_Schedule from '../pages/Schedule/Academic_Schedule';
import Lecture_Room from '../pages/Lecture/Lecture_Room/Lecture_Room';
import Unauthorizedpage from '../pages/Unauthorizedpage';

import HomeStudent from '../pages/HomeStudent';
import HomeAdmin from '../pages/HomeAdmin';
import HomePRO from '../pages/HomePRO';
import LoginPage from '../pages/LoginPage';
import { useAuth } from "../context/UserContext";
import { useEffect } from "react";
import StPage from "../pages/StPage";
import { LayoutStLec } from "../ui/Layout_lec";
import { LayoutStInfo } from "../ui/Layout_Info";


function App() {
    /**
     * <PrivateRoute ></PrivateRoute>
     * <PrivateRoute allowedRoles ={['Roles']}>{children} </PrivateRoute>
     * Roles가 있어야 children route에 접근 가능
     */



    return (

        <Routes>
            {/* Home */}
            <Route path='/' element={<LoginPage />} ></Route>
            <Route path='/Unauthorizedpage' element={<Unauthorizedpage />} ></Route>


            {/* <Route element={<PrivateRoute allowedRoles={['ADMIN', 'STUDENT']} />}>
                <Route path='/' element={<Home />}></Route>

            </Route> */}
            {/* ADMIN */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
                <Route path='/ha' element={<HomeAdmin />}></Route>

            </Route>



            {/* STUDENT */}
            <Route element={<PrivateRoute allowedRoles={['STUDENT']} />}>
                {/* Route 묶은 부분을 StPage적용 */}
                <Route element={<StPage />}>

                    <Route path='/hs' element={<HomeStudent />}></Route>
                    {/*Route 묶은 부분 LayoutStInfo 적용*/}
                    <Route element={<LayoutStInfo />}>
                        <Route path='/InfoHome' element={<InfoHome />} ></Route>
                        <Route path='/This_Credit' element={<This_Credit />} ></Route>

                        <Route path='/Entire_Credit' element={<Entire_Credit />} ></Route>
                    </Route>
                    {/* Lecture Tab */}
                    {/*Route 묶은 부분 LayoutStLec 적용*/}
                    <Route element={< LayoutStLec />}>
                        <Route path='/LHome' element={<Lecture_Home />} ></Route>

                        <Route path='/ToDoList' element={<ToDoList />} ></Route>

                        <Route path='/LRoom' element={<Lecture_Room />} ></Route>
                    </Route>


                    {/* Schedule Tab */}
                    <Route path='/acsche' element={<Academic_Schedule />} ></Route>


                </Route>
            </Route>

            {/* PROFESSOR */}
            <Route element={<PrivateRoute allowedRoles={['PROFESSOR']} />}>
                <Route path='/hp' element={<HomePRO />}></Route>

            </Route>




        </Routes>

    )
}
export default App;