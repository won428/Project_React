import PrivateRoute from "./PrivateRoute";
import { Route, Routes } from "react-router-dom";
import Lecture_Home from '../_admin/pages/Lecture_Room/Lecture_Home';
import ToDoList from '../_admin/pages/Lecture/ToDoList';
import InfoHome from '../_student/pages/Integrated_Info/InfoHome';
import This_Credit from '../_student/pages/Integrated_Info/This_Credit';
import Entire_Credit from '../_student/pages/Integrated_Info/Entire_Credit';
import Change_Status from '../_student/pages/Integrated_Info/Change_Status';
import ChangeStatusDetail from '../_student/pages/Integrated_Info/ChangeStatusDetail';
import ChangeStatusDetail from '../_student/pages/Integrated_Info/ChangeStatusDetail';
import Academic_Schedule from '../public/pages/Schedule/Academic_Schedule';
import Academic_ScheduleMod from '../public/pages/Schedule/Academic_ScheduleMod';
import Lecture_RoomAd from '../_admin/pages/Lecture_Room/Lecture_RoomAd';
import Lecture_Room from '../_student/pages/LectureRoom/Lecture_Room';

import InfohomeAD from '../_admin/ui/Home/InfoHomeAD';
import LHomeAD from '../_admin/ui/Home/Lecture_HomeAD';
import StHomeAD from '../_admin/ui/Home/StHomeAd';


import CollegeList from '../_admin/pages/College/CollegeList';
import ColRegister from '../_admin/pages/College/ColRegister';
import CollegeUpdate from '../_admin/pages/College/CollegeUpdate';

import Insert_User from '../_admin/pages/StudentCon/Insert_User';
import UserList from '../_admin/pages/StudentCon/UserList';
import UserUpdateByAdmin from '../_admin/pages/StudentCon/UserUpdate';
import LectureRegister from '../_admin/pages/Lecture_Room/LecRegister';
import LectureList from '../_admin/pages/Lecture_Room/LectureList';
import LectureRequest from '../_admin/pages/Lecture_Room/LectureRequest';
import LectureListPro from '../_professor/Lecture_Room/LectureListPro';
import LectureDetail from '../_professor/Lecture_Room/LectureDetail';
import CourseRegistration from '../_student/pages/LectureRoom/CourseRegistration';


import NoticeIns from "../_professor/NoticeIns";
import NoticeList from "../_professor/NoticeList";
import NoticeListSpec from "../_professor/NoticeListSpec";




import Unauthorizedpage from '../public/Unauthorizedpage';

import HomeStudent from '../_student/pages/HomeStudent';
import HomeAdmin from '../_admin/ui/Home/HomeAdmin';
import HomePRO from '../_professor/ui/HomePRO';

import LecRegisterPro from '../_professor/Lecture_Room/LecRegisterPro';
import Lecture_HomePro from '../_professor/Lecture_Room/Lecture_HomePro';
import Lecture_RoomPro from '../_professor/Lecture_Room/Lecture_RoomPro';
import Academic_SchedulePro from '../public/pages/Schedule/Academic_SchedulePro';


import LoginPage from '../public/pages/LoginPage';

import StPage from "../_student/ui/StPage";
import AdPage from "../_admin/ui/AdPage";
import ProPage from "../_professor/ui/ProPage";


import { LayoutStLec } from "../_admin/ui/Layout/Layout_lecAd";
import { LayoutStInfo } from "../_admin/ui/Layout/Layout_InfoAd";
import { LayoutStCon } from "../_admin/ui/Layout/Layout_StCon";

import { LayoutStLecst } from "../_student/ui/Layout/Layout_lecSt";
import { LayoutStInfost } from "../_student/ui/Layout/Layout_InfoSt";


import { Layout_lecP } from "../_professor/ui/Layout/Layout_lecP";


import FindPW from "../public/FindPW";
import SetPW from "../public/SetPW";


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
            <Route path='/findPw' element={<FindPW />} ></Route>
            <Route path='/setPw' element={<SetPW />} ></Route>
            <Route path='/Unauthorizedpage' element={<Unauthorizedpage />} ></Route>


            {/* 재배치 라우터 목록 */}





            {/* <Route path='/CollegeUpdate/:id' element={<MajorList />} ></Route>
                <Route path='/CollegeUpdate/:id' element={<MajorRegister />} ></Route>
                <Route path='/CollegeUpdate/:id' element={<MajorUpdate />} ></Route> */}

            <Route element={<PrivateRoute allowedRoles={['ADMIN', 'STUDENT']} />}>

            </Route>

            {/* <Route element={<PrivateRoute allowedRoles={['ADMIN', 'STUDENT']} />}>
                <Route path='/' element={<Home />}></Route>




            </Route> */}
            {/* ADMIN */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
                {/* Route 묶은 부분을 StPage적용 */}
                <Route element={<AdPage />}>
                    <Route path='/ha' element={<HomeAdmin />}></Route>

                    {/* Student Apply */}
                    <Route element={<LayoutStCon />}>
                        
                        <Route path='/sthm/ad' element={<StHomeAD />} ></Route>
                        <Route path='/user/insert_user' element={<Insert_User />}></Route>
                        <Route path='/user/:id/update' element={<UserUpdateByAdmin />}></Route>
                        <Route path='/user/UserList' element={<UserList />}></Route>
                    </Route>

                    {/*Route 묶은 부분 LayoutStInfo 적용*/}
                    {/* Integrated_Info Tab */}
                    <Route element={<LayoutStInfo />}>


                        <Route path='/infohome/ad' element={<InfohomeAD />} ></Route>
                        <Route path='/This_Credit' element={<This_Credit />} ></Route>
                        <Route path='/etrcdt' element={<Entire_Credit />} ></Route>
                        <Route path='/collist' element={<CollegeList />} ></Route>
                        <Route path='/colreg' element={<ColRegister />} ></Route>
                        <Route path='/colup/:id' element={<CollegeUpdate />} ></Route>

                    </Route>


                    {/* Lecture Tab */}
                    {/*Route 묶은 부분 LayoutStLec 적용*/}
                    <Route element={< LayoutStLec />}>
                        <Route path='/LHomeAD' element={<LHomeAD />} ></Route>
                        <Route path='/LRoomAd' element={<Lecture_RoomAd />} ></Route>
                        <Route path='/ToDoList' element={<ToDoList />} ></Route>
                        <Route path='/lectureRegister' element={<LectureRegister />} ></Route>
                        <Route path='/lectureList' element={<LectureList />} ></Route>
                        <Route path='/lectureRequest' element={<LectureRequest />} ></Route>



                    </Route>


                    {/* Schedule Tab */}
                    <Route path='/acschemod' element={<Academic_ScheduleMod />} ></Route>


                </Route>
            </Route>



            {/* STUDENT */}
            <Route element={<PrivateRoute allowedRoles={['STUDENT']} />}>
                {/* Route 묶은 부분을 StPage적용 */}
                <Route element={<StPage />}>

                    <Route path='/hs' element={<HomeStudent />}></Route>
                    {/*Route 묶은 부분 LayoutStInfo 적용*/}
                    {/* Integrated_Info Tab */}
                    <Route element={<LayoutStInfost />}>


                        <Route path='/InfoHome' element={<InfoHome />} ></Route>
                        <Route path='/This_Credit' element={<This_Credit />} ></Route>
                        <Route path='/Entire_Credit' element={<Entire_Credit />} ></Route>
                        <Route path='/Change_Status' element={<Change_Status />} ></Route>
                    </Route>

                    {/* Lecture Tab */}
                    {/*Route 묶은 부분 LayoutStLec 적용*/}
                    <Route element={< LayoutStLecst />}>
                        <Route path='/LHome' element={<Lecture_Home />} ></Route>

                        <Route path='/ToDoList' element={<ToDoList />} ></Route>

                        <Route path='/LRoom' element={<Lecture_Room />} ></Route>
                        <Route path='/courseRegistration' element={<CourseRegistration />} ></Route>
                    </Route>


                    {/* Schedule Tab */}
                    <Route path='/acsche' element={<Academic_Schedule />} ></Route>


                </Route>
            </Route>

            {/* PROFESSOR */}
            <Route element={<PrivateRoute allowedRoles={['PROFESSOR']} />}>
                <Route element={<ProPage />}>
                    <Route path='/hp' element={<HomePRO />}></Route>
                    <Route element={<Layout_lecP />}>

                        <Route path='/LecRegisterPro' element={<LecRegisterPro />} ></Route>
                        <Route path='/Lecture_HomePro' element={<Lecture_HomePro />} ></Route>
                        <Route path='/LRoomPro' element={<Lecture_RoomPro />} ></Route>
                        <Route path='/noticep' element={<NoticeIns />} ></Route>
                        <Route path='/notionlist' element={<NoticeList />} ></Route>
                        <Route path='/LectureListPro' element={<LectureListPro />} ></Route>
                        <Route path='/LectureDetail/:id' element={<LectureDetail />} ></Route>
                        <Route path='/notionlistspec' element={<NoticeListSpec />} ></Route>
                    </Route>


                    <Route path='/acsche/p' element={<Academic_SchedulePro />} ></Route>
                </Route>
            </Route>



        </Routes>

    )
}
export default App;