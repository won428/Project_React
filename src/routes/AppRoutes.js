import { Route, Routes } from "react-router-dom";
import Home from './../pages/Home';
import Lecture_Home from '../pages/Lecture/Lecture_Home';
import ToDoList from '../pages/Lecture/ToDoList';
import InfoHome from '../pages/Integrated_Info/InfoHome';
import This_Credit from '../pages/Integrated_Info/This_Credit';
import Entire_Credit from '../pages/Integrated_Info/Entire_Credit';
import Academic_Schedule from '../pages/Schedule/Academic_Schedule';
import Lecture_Room from '../pages/Lecture/Lecture_Room/Lecture_Room';

import LecRegister from '../pages/Lecture/LecRegister';
import CollegeList from '../pages/Lecture/CollegeList';
import ColRegister from '../pages/Lecture/ColRegister';
import CollegeUpdate from '../pages/Lecture/CollegeUpdate';

import Isert_User from '../pages/Integrated_Info/Insert_User';
import UserList from '../pages/Integrated_Info/UserList';



function App() {




    return (
        <>
            <Routes>
                {/* Home */}
                <Route path='/' element={<Home />} ></Route>

                {/* Integrated_Info Tab */}
                <Route path='/InfoHome' element={<InfoHome />} ></Route>
                <Route path='/This_Credit' element={<This_Credit />} ></Route>
                <Route path='/Entire_Credit' element={<Entire_Credit />} ></Route>
                <Route path='/user/insert_user' element={<Isert_User />} ></Route>
                <Route path='/user/UserList' element={<UserList />} ></Route>




                {/* Lecture&College&Major(단과대학/학과/강의 CRUD) Tab */}
                <Route path='/LHome' element={<Lecture_Home />} ></Route>
                <Route path='/ToDoList' element={<ToDoList />} ></Route>
                <Route path='/LRoom' element={<Lecture_Room />} ></Route>
                <Route path='/LecRegister' element={<LecRegister />} ></Route>

                <Route path='/ColRegister' element={<ColRegister />} ></Route>
                <Route path='/CollegeList' element={<CollegeList />} ></Route>
                <Route path='/CollegeUpdate/:id' element={<CollegeUpdate />} ></Route>

                {/* <Route path='/CollegeUpdate/:id' element={<MajorList />} ></Route>
                <Route path='/CollegeUpdate/:id' element={<MajorRegister />} ></Route>
                <Route path='/CollegeUpdate/:id' element={<MajorUpdate />} ></Route> */}





                {/* Schedule Tab */}
                <Route path='/acsche' element={<Academic_Schedule />} ></Route>
            </Routes>
        </>
    )
}
export default App;