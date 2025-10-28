import PrivateRoute from "./PrivateRoute";
import { Route, Routes } from "react-router-dom";

// ADMIN imports
import HomeAdmin from '../_admin/ui/Home/HomeAdmin';
import LecRegister from '../_admin/pages/Lecture_Room/LecRegister';
import Lecture_RoomAd from '../_admin/pages/Lecture_Room/Lecture_RoomAd';
import LectureList from '../_admin/pages/Lecture_Room/LectureList';
import CollegeList from '../_admin/pages/College/CollegeList';
import ColRegister from '../_admin/pages/College/ColRegister';
import CollegeUpdate from '../_admin/pages/College/CollegeUpdate';
import Insert_User from '../_admin/pages/StudentCon/Insert_User';
import UserList from '../_admin/pages/StudentCon/UserList';
import UserUpdateByAdmin from '../_admin/pages/StudentCon/UserUpdate';
import InfohomeAD from '../_admin/ui/Home/InfoHomeAD';
import LHomeAD from '../_admin/ui/Home/Lecture_HomeAD';
import StHomeAD from '../_admin/ui/Home/StHomeAd';
import { LayoutStLec as LayoutLecAd } from "../_admin/ui/Layout/Layout_lecAd";
import { LayoutStInfo as LayoutInfoAd } from "../_admin/ui/Layout/Layout_InfoAd";
import { LayoutStCon } from "../_admin/ui/Layout/Layout_StCon";
import AdPage from "../_admin/ui/AdPage";

// STUDENT imports
import HomeStudent from '../_student/pages/HomeStudent';
import StudentInfo from '../_student/pages/Integrated_Info/StudentInfo';
import This_Credit from '../_student/pages/Integrated_Info/This_Credit';
import Entire_Credit from '../_student/pages/Integrated_Info/Entire_Credit';
import Change_Status from '../_student/pages/Integrated_Info/Change_Status';
import ChangeStatusList from '../_student/pages/Integrated_Info/ChangeStatusList';
import ChangeStatusDetail from '../_student/pages/Integrated_Info/ChangeStatusDetail';
import Lecture_Room from '../_student/pages/LectureRoom/Lecture_Room';
import { LayoutStLecst as LayoutLecSt } from "../_student/ui/Layout/Layout_lecSt";
import { LayoutStInfost as LayoutInfoSt } from "../_student/ui/Layout/Layout_InfoSt";
import StPage from "../_student/ui/StPage";

// PROFESSOR imports
import HomePRO from '../_professor/ui/HomePRO';
import LecRegisterPro from '../_professor/Lecture_Room/LecRegisterPro';
import Lecture_HomePro from '../_professor/Lecture_Room/Lecture_HomePro';
import Lecture_RoomPro from '../_professor/Lecture_Room/Lecture_RoomPro';
import NoticeIns from "../_professor/NoticeIns";
import NoticeList from "../_professor/NoticeList";
import NoticeListSpec from "../_professor/NoticeListSpec";
import { Layout_lecP } from "../_professor/ui/Layout/Layout_lecP";
import ProPage from "../_professor/ui/ProPage";

// PUBLIC imports
import Academic_Schedule from '../public/pages/Schedule/Academic_Schedule';
import Academic_ScheduleMod from '../public/pages/Schedule/Academic_ScheduleMod';
import Academic_SchedulePro from '../public/pages/Schedule/Academic_SchedulePro';
import Unauthorizedpage from '../public/Unauthorizedpage';
import LoginPage from '../public/pages/LoginPage';
import FindPW from "../public/FindPW";
import SetPW from "../public/SetPW";

function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path='/' element={<LoginPage />} />
            <Route path='/findPw' element={<FindPW />} />
            <Route path='/setPw' element={<SetPW />} />
            <Route path='/Unauthorizedpage' element={<Unauthorizedpage />} />

            {/* ADMIN */}
            <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
                <Route element={<AdPage />}>
                    <Route path='/ha' element={<HomeAdmin />} />

                    {/* Student Apply */}
                    <Route element={<LayoutStCon />}>
                        <Route path='/sthm/ad' element={<StHomeAD />} />
                        <Route path='/user/insert_user' element={<Insert_User />} />
                        <Route path='/user/:id/update' element={<UserUpdateByAdmin />} />
                        <Route path='/user/UserList' element={<UserList />} />
                    </Route>

                    {/* Integrated_Info (Admin) */}
                    <Route element={<LayoutInfoAd />}>
                        <Route path='/infohome/ad' element={<InfohomeAD />} />
                        <Route path='/This_Credit' element={<This_Credit />} />
                        <Route path='/etrcdt' element={<Entire_Credit />} />
                        <Route path='/collist' element={<CollegeList />} />
                        <Route path='/colreg' element={<ColRegister />} />
                        <Route path='/colup/:id' element={<CollegeUpdate />} />
                    </Route>

                    {/* Lecture (Admin) */}
                    <Route element={<LayoutLecAd />}>
                        <Route path='/LHomeAD' element={<LHomeAD />} />
                        <Route path='/LRoomAd' element={<Lecture_RoomAd />} />
                        <Route path='/_admin/ToDoList' element={<ToDoList />} />
                        <Route path='/LecRegister' element={<LecRegister />} />
                        <Route path='/lectureList' element={<LectureList />} />
                    </Route>

                    {/* Schedule (Admin) */}
                    <Route path='/acschemod' element={<Academic_ScheduleMod />} />
                </Route>
            </Route>

            {/* STUDENT */}
            <Route element={<PrivateRoute allowedRoles={['STUDENT']} />}>
                <Route element={<StPage />}>
                    <Route path='/hs' element={<HomeStudent />} />

                    {/* Integrated_Info (Student) */}
                    <Route element={<LayoutInfoSt />}>
                        <Route path='/StudentInfo' element={<StudentInfo />} />
                        <Route path='/This_Credit' element={<This_Credit />} />
                        <Route path='/Entire_Credit' element={<Entire_Credit />} />
                        <Route path='/Change_Status' element={<Change_Status />} />
                        <Route path='/ChangeStatusList' element={<ChangeStatusList />} />
                        <Route path='/ChangeStatusDetail' element={<ChangeStatusDetail />} />
                    </Route>

                    {/* Lecture (Student) */}
                    <Route element={<LayoutLecSt />}>
                        <Route path='/LHome' element={<Lecture_Home />} />
                        <Route path='/_student/ToDoList' element={<ToDoList />} />
                        <Route path='/LRoom' element={<Lecture_Room />} />
                    </Route>

                    {/* Schedule (Student) */}
                    <Route path='/acsche' element={<Academic_Schedule />} />
                </Route>
            </Route>

            {/* PROFESSOR */}
            <Route element={<PrivateRoute allowedRoles={['PROFESSOR']} />}>
                <Route element={<ProPage />}>
                    <Route path='/hp' element={<HomePRO />} />
                    <Route element={<Layout_lecP />}>
                        <Route path='/LecRegisterPro' element={<LecRegisterPro />} />
                        <Route path='/Lecture_HomePro' element={<Lecture_HomePro />} />
                        <Route path='/LRoomPro' element={<Lecture_RoomPro />} />
                        <Route path='/noticep' element={<NoticeIns />} />
                        <Route path='/notionlist' element={<NoticeList />} />
                        <Route path='/notionlistspec' element={<NoticeListSpec />} />
                    </Route>

                    <Route path='/acsche/p' element={<Academic_SchedulePro />} />
                </Route>
            </Route>
        </Routes>
    );
}
export default App;
