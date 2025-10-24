import PrivateRoute from "../PrivateRoute";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Lecture_Home from '../../_admin/pages/Lecture/Lecture_Room/Lecture_Home';
import ToDoList from '../../_admin/pages/Lecture/ToDoList';

import InfoHome from '../../_student/pages/Integrated_Info/InfoHome';
import This_Credit from '../../student/pages/Integrated_Info/This_Credit';
import Entire_Credit from '../../student/pages/Integrated_Info/Entire_Credit';
import Academic_Schedule from '../pages/Schedule/Academic_Schedule';
import Lecture_Room from '../../pages/Lecture/Lecture_Room/Lecture_Room';

import LecRegister from '../../_admin/pages/Lecture/Lecture_Room/LecRegister';
import CollegeList from '../../_admin/pages/Lecture/CollegeList';
import ColRegister from '../../_admin/pages/Lecture/ColRegister';
import CollegeUpdate from '../../_admin/pages/Lecture/CollegeUpdate';

import Insert_User from '../../student/pages/Integrated_Info/Insert_User';
import UserList from '../../_admin/UserList';
import UserUpdateByAdmin from '../../_admin/UserUpdate';






import Unauthorizedpage from '../Unauthorizedpage';

import HomeStudent from '../../_student/pages/HomeStudent';
import HomeAdmin from '../../pages/HomeAdmin';
import HomePRO from '../../pages/HomePRO';
import LoginPage from '../pages/LoginPage';
import { useAuth } from "../../context/UserContext";
import { useEffect } from "react";
import StPage from "../StPage";
import AdPage from "../../_admin/ui/AdPage";
import { LayoutStLec } from "../../_student/ui/Layout_lec";
import { LayoutStInfo } from "../../_student/ui/Layout_Info";
import CHPW from "../FindPW";


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
            <Route path='/CHPW' element={<CHPW />} ></Route>CHPW
            <Route path='/Unauthorizedpage' element={<Unauthorizedpage />} ></Route>


            {/* 재배치 라우터 목록 */}





            {/* <Route path='/CollegeUpdate/:id' element={<MajorList />} ></Route>
                <Route path='/CollegeUpdate/:id' element={<MajorRegister />} ></Route>
                <Route path='/CollegeUpdate/:id' element={<MajorUpdate />} ></Route> */}



            {/* <Route element={<PrivateRoute allowedRoles={['ADMIN', 'STUDENT']} />}>
                <Route path='/' element={<Home />}></Route>

            </Route> */}
            {/* ADMIN */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
                {/* Route 묶은 부분을 StPage적용 */}
                <Route element={<AdPage />}>

                    <Route path='/ha' element={<HomeAdmin />}></Route>
                    {/*Route 묶은 부분 LayoutStInfo 적용*/}
                    {/* Integrated_Info Tab */}
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
                        <Route path='/user/insert_user' element={<Insert_User />}></Route>
                        <Route path='/user/:id/update' element={<UserUpdateByAdmin />}></Route>
                        <Route path='/user/UserList' element={<UserList />}></Route>
                    </Route>


                    {/* Schedule Tab */}
                    <Route path='/acsche' element={<Academic_Schedule />} ></Route>


                </Route>
            </Route>



            {/* STUDENT */}
            <Route element={<PrivateRoute allowedRoles={['STUDENT']} />}>
                {/* Route 묶은 부분을 StPage적용 */}
                <Route element={<StPage />}>

                    <Route path='/hs' element={<HomeStudent />}></Route>
                    {/*Route 묶은 부분 LayoutStInfo 적용*/}
                    {/* Integrated_Info Tab */}
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
                <Route path='/LecRegister' element={<LecRegister />} ></Route>
            </Route>




        </Routes>

    )
}
export default App;