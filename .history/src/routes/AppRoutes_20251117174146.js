
import PrivateRoute from "./PrivateRoute";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Lecture_Home from '../_student/pages/Lecture_Home';
import ToDoList from '../_admin/pages/Lecture/ToDoList';
import InfoHome from '../_student/pages/Integrated_Info/InfoHome';
import This_Credit from '../_student/pages/Integrated_Info/Student_Credit';
import CreditAppeal from '../_student/pages/Integrated_Info/CreditAppeal';
import CreditAppealList from '../_student/pages/Integrated_Info/CreditAppealList';
import AttendanceAppeal from '../_student/pages/Integrated_Info/AttendanceAppeal';

import Change_Status from '../_student/pages/Integrated_Info/Change_Status';
import ChangeStatusList from '../_student/pages/Integrated_Info/ChangeStatusList';
import CheckAttendance from '../_student/pages/Integrated_Info/CheckAttendance';
import ChangeStatusDetail from '../_student/pages/Integrated_Info/ChangeStatusDetail';
import Academic_Schedule from '../public/pages/Schedule/Academic_Schedule';
import Academic_ScheduleMod from '../public/pages/Schedule/Academic_ScheduleMod';
import Lecture_RoomAd from '../_admin/pages/Lecture_Room/Lecture_RoomAd';



import InfohomeAD from '../_admin/ui/Home/InfoHomeAD';
import LHomeAD from '../_admin/ui/Home/Lecture_HomeAD';
import StHomeAD from '../_admin/ui/Home/StHomeAd';
import AcheIns from '../public/pages/Schedule/Academic_ScheduleIns';
import AcheUp from '../public/pages/Schedule/Academic_ScheduleUpdate';


import CollegeList from '../_admin/pages/College/CollegeList';
import ColRegister from '../_admin/pages/College/ColRegister';
import CollegeUpdate from '../_admin/pages/College/CollegeUpdate';

import MajorRegister from '../_admin/pages/Major/MajorRegister';
import MajorList from '../_admin/pages/Major/MajorList';
import MajorUpdate from '../_admin/pages/Major/MajorUpdate';

import Insert_User from '../_admin/pages/StudentCon/Insert_User';
import UserBatchReg from '../_admin/pages/StudentCon/UserBatchReg';
import UserList from '../_admin/pages/StudentCon/UserList';
import UserUpdateByAdmin from '../_admin/pages/StudentCon/UserUpdate';
import StatusManage from '../_admin/pages/StudentCon/StatusManage';
import StMList from '../_admin/pages/StudentCon/StMList';
import LectureRegister from '../_admin/pages/Lecture_Room/LecRegister';
import LectureList from '../_admin/pages/Lecture_Room/LectureList';
import LectureRequest from '../_admin/pages/Lecture_Room/LectureRequest';
import LectureListPro from '../_professor/Lecture_Room/LectureListPro';
import LectureDetail from '../_professor/Lecture_Room/LectureDetail';
import CourseRegistration from '../_student/pages/LectureRoom/CourseRegistration';
// import InproLecList from '../_admin/pages/Lecture_Room/InprogressLetureList';
import LecUpdateAd from '../_admin/pages/Lecture_Room/LecUpdateAd'

import InquiryForAd from '../_admin/pages/StudentCon/InquiryForAd';


import NoticeIns from "../_lecturePS/LectureRoomSpec/NoticeList/NoticeIns";
import NoticeList from "../_lecturePS/LectureRoomSpec/NoticeList/NoticeList";
import NoticeListSpec from "../_lecturePS/LectureRoomSpec/NoticeList/NoticeListSpec";
import AssignUpload from "../_lecturePS/LectureRoomSpec/AssignUpload";
import AssignSpec from "../_lecturePS/LectureRoomSpec/AssignSpec";
import AssignList from "../_lecturePS/LectureRoomSpec/AssignList";

import LecturePRO from '../_lecturePS/LectureRoomSpec/Lecture';
import NoticePRO from '../_lecturePS/LectureRoomSpec/NoticeList/Notice';
import ToDoListPRO from '../_lecturePS/LectureRoomSpec/ToDoList';
import Lecture_RoomSP from '../_lecturePS/LectureRoomSpec/Lecture_RoomSP';
import LectureInsert from '../_lecturePS/LectureRoomSpec/LectureInsert';


import Unauthorizedpage from '../public/Unauthorizedpage';

import HomeStudentpage from '../_student/pages/HomeStudentpage';
import HomeAdmin from '../_admin/ui/Home/HomeAdmin';
import HomePRO from '../_professor/ui/HomePRO';


import Home from '../public/Home';
import LecRegisterPro from '../_professor/Lecture_Room/LecRegisterPro';
import Lecture_RoomPro from '../_professor/Lecture_Room/Lecture_RoomPro';
import LectureSession from '../_professor/Lecture_Room/LectureSession';
import GradeCalculation from '../_professor/Lecture_Room/GradeCalculation';
import ManageAppeal from '../_professor/Lecture_Room/ManageAppeal';


import SpecificRoom from '../_lecturePS/LectureRoomSpec/SpecificRoom';
import LectureSpec from '../_lecturePS/LectureRoomSpec/LectureSpec';
import Lecture from '../_lecturePS/LectureRoomSpec/Lecture';

import LoginPage from '../public/pages/LoginPage';

import StPage from "../_student/ui/StPage";
import AdPage from "../_admin/ui/AdPage";
import ProPage from "../_professor/ui/ProPage";
import EnPage from "../public/pages/EntireNotice/EntireNoticePage";
import ProSpecPage from "../_lecturePS/ui/ProSpecPage";

import { Layout_lecRoomP } from '../_lecturePS/ui/Layout_lecRoomP';

import FindPW from "../public/FindPW";
import SetPW from "../public/SetPW";


import NoticeInsertEn from "../public/pages/EntireNotice/NoticeInsAd";
import NoticeSpecEn from "../public/pages/EntireNotice/NoticeSpec";
import NoticeListEn from "../public/pages/EntireNotice/NoticeList";
import InquiryBoard from "../public/pages/InquiryBoard";
import { LayoutStInfoPublic } from "../public/ui/LayoutStInfoPublic";
import CreatePost from "../public/pages/CreatePost";
import InquiryPage from "../public/pages/InquiryPage";
import UpdatePost from "../public/pages/UpdatePost";
import InquiryPageAd from "../_admin/pages/StudentCon/InquiryPageAd";

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
            <Route path="/home" element={<Home />} />
            <Route path='/findPw' element={<FindPW />} ></Route>
            <Route path='/setPw' element={<SetPW />} ></Route>
            <Route path='/Unauthorizedpage' element={<Unauthorizedpage />} ></Route>




            {/* 학교 공통 */}
            <Route element={<PrivateRoute allowedRoles={['PROFESSOR', 'STUDENT', 'ADMIN']} />}>
                <Route element={<EnPage />}>

                    <Route path='/EnNot' element={<NoticeInsertEn />} />
                    <Route path='/EnNotSpec' element={<NoticeSpecEn />} />
                    <Route path='/EnNotList' element={<NoticeListEn />} />
                    <Route path='/acsche' element={<Academic_Schedule />} />


                    {/* <Route element={<LayoutStInfoPublic />}>  </Route> */}
                    <Route path='/inquiryBoard' element={<InquiryBoard />} />
                    <Route path='/createPost' element={<CreatePost />} />
                    <Route path='/inquiryPage/:id' element={<InquiryPage />} />
                    <Route path='/updatePost/:id' element={<UpdatePost />} />


                </Route>
            </Route>




            <Route element={<PrivateRoute allowedRoles={['PROFESSOR', 'STUDENT']} />}>
                <Route element={<ProSpecPage />}>
                    <Route path='/leclist' element={<Lecture_RoomSP />} ></Route>
                    <Route element={<Layout_lecRoomP />}>
                        <Route path='/roomspec' element={<SpecificRoom />} ></Route>

                        <Route path='/Lpro' element={<LecturePRO />} ></Route>
                        <Route path='/Npro' element={<NoticePRO />} ></Route>
                        <Route path='/TodoP' element={<ToDoListPRO />} ></Route>
                        <Route path='/noticep' element={<NoticeIns />} ></Route>
                        <Route path='/notionlist' element={<NoticeList />} ></Route>
                        <Route path='/notionlistspec' element={<NoticeListSpec />} ></Route>
                        <Route path='/asn' element={<AssignUpload />} ></Route>
                        <Route path='/asnlst' element={<AssignList />} ></Route>
                        <Route path='/asnspec' element={<AssignSpec />} ></Route>
                        <Route path='/lecins' element={<LectureInsert />} ></Route>
                        <Route path='/Lec' element={<Lecture />} ></Route>
                        <Route path='/LecSpec' element={<LectureSpec />} ></Route>
                        <Route path='/AttendanceAppeal/:lectureId' element={<AttendanceAppeal />} ></Route>

                        {/* 교수 전용 */}
                        <Route path='/LectureSession/:id' element={<LectureSession />} ></Route>
                        <Route path='/GradeCalculation/:id' element={<GradeCalculation />} ></Route>
                        <Route path='/LectureDetail/:id' element={<LectureDetail />} ></Route>

                    </Route>
                </Route>



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

                        <Route path='/sthm/ad' element={<StHomeAD />} ></Route>
                        <Route path='/user/insert_user' element={<Insert_User />}></Route>
                        <Route path='/user/UserBatchReg' element={<UserBatchReg />}></Route>
                        <Route path='/user/:id/update' element={<UserUpdateByAdmin />}></Route>
                        <Route path='/user/UserList' element={<UserList />}></Route>
                        <Route path='/user/StMList' element={<StMList />}></Route>
                        <Route path='/user/StatusManage/:recordId' element={<StatusManage />}></Route>
                        <Route path='/inquiry/admin' element={<InquiryForAd />}></Route>
                        <Route path='/inquiryPage/admin/:id' element={<InquiryPageAd />}></Route>
                    </Route>

                    {/*Route 묶은 부분 LayoutStInfo 적용*/}
                    {/* Integrated_Info Tab */}


                    <Route path='/infohome/ad' element={<InfohomeAD />} ></Route>

                    <Route path='/collist' element={<CollegeList />} ></Route>
                    <Route path='/colreg' element={<ColRegister />} ></Route>
                    <Route path='/colup/:id' element={<CollegeUpdate />} ></Route>

                    <Route path='/majorReg' element={<MajorRegister />} ></Route>
                    <Route path='/majorList' element={<MajorList />} ></Route>
                    <Route path='/majorUp/:id' element={<MajorUpdate />} ></Route>


                    {/* Integrated_Info Tab */}
                    {/* <Route element={<LayoutStInfo />}>
                    </Route> */}


                    {/* Lecture Tab */}
                    {/*Route 묶은 부분 LayoutStLec 적용*/}
                    <Route path='/LHomeAD' element={<LHomeAD />} ></Route>
                    <Route path='/LRoomAd' element={<Lecture_RoomAd />} ></Route>
                    <Route path='/lectureRegister' element={<LectureRegister />} ></Route>
                    <Route path='/lectureList' element={<LectureList />} ></Route>
                    <Route path='/lectureRequest' element={<LectureRequest />} ></Route>
                    <Route path='/lecUpdateAd/:id' element={<LecUpdateAd />} ></Route>





                    {/* Schedule Tab */}
                    <Route path='/acschemod' element={<Academic_ScheduleMod />} ></Route>
                    <Route path='/acscheIns' element={<AcheIns />} ></Route>
                    <Route path='/acschemod/up' element={<AcheUp />} ></Route>


                </Route>




            </Route>

            ({/* STUDENT */}
            <Route element={<PrivateRoute allowedRoles={['STUDENT']} />}>
                {/* 1) 학생 메인 홈: StPage 레이아웃 없이 단독으로 전체 화면 사용 */}


                {/* 2) 나머지 학생 페이지들은 기존처럼 StPage + 탭 레이아웃 사용 */}
                <Route element={<StPage />}>
                    {/* Integrated_Info Tab */}
                    {/* <Route element={<LayoutStInfost />}> */}

                    <Route path="/hs" element={<HomeStudentpage />} />
                    <Route path="/InfoHome" element={<InfoHome />} />
                    <Route path="/Student_Credit" element={<This_Credit />} />
                    <Route
                        path="/CreditAppeal/:lectureId"
                        element={<CreditAppeal />}
                    />
                    <Route path="/CreditAppealList" element={<CreditAppealList />} />
                    <Route path="/Change_Status" element={<Change_Status />} />
                    <Route path="/ChangeStatusList" element={<ChangeStatusList />} />
                    <Route path="/CheckAttendance" element={<CheckAttendance />} />
                    <Route
                        path="/ChangeStatusDetail/:recordId"
                        element={<ChangeStatusDetail />}
                    />



                    {/* Lecture Tab */}
                    {/* <Route element={<LayoutStLecst />}> */}
                    <Route path="/LHome" element={<Lecture_Home />} />
                    <Route path="/ToDoList" element={<ToDoList />} />
                    <Route
                        path="/courseRegistration"
                        element={<CourseRegistration />}
                    />


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


                        <Route path='/LectureListPro' element={<LectureListPro />} ></Route>
                        <Route path='/LectureDetail/:id' element={<LectureDetail />} ></Route>
                        <Route path='/LectureSession/:id' element={<LectureSession />} ></Route>
                        <Route path='/GradeCalculation/:id' element={<GradeCalculation />} ></Route>
                        <Route path='/ManageAppeal/:lectureId' element={<ManageAppeal />} ></Route>
                    </Route>


                    <Route path='/LecRegisterPro' element={<LecRegisterPro />} ></Route>
                    <Route path='/LRoomPro' element={<Lecture_RoomPro />} ></Route>
                    <Route path='/LectureListPro' element={<LectureListPro />} ></Route>

                </Route>



            </Route>

        </Routes >
    )
}
export default App;
