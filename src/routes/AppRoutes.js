import { Route, Routes } from "react-router-dom";
import Home from './../pages/Home';
import Lecture_Home from '../pages/Lecture/Lecture_Home';
import ToDoList from '../pages/Lecture/ToDoList';
import InfoHome from '../pages/Integrated_Info/InfoHome';
import This_Credit from '../pages/Integrated_Info/This_Credit';
import Entire_Credit from '../pages/Integrated_Info/Entire_Credit';
import Academic_Schedule from '../pages/Schedule/Academic_Schedule';
import Lecture_Room from '../pages/Lecture/Lecture_Room/Lecture_Room';


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



                {/* Lecture Tab */}
                <Route path='/LHome' element={<Lecture_Home />} ></Route>

                <Route path='/ToDoList' element={<ToDoList />} ></Route>

                <Route path='/LRoom' element={<Lecture_Room />} ></Route>





                {/* Schedule Tab */}
                <Route path='/acsche' element={<Academic_Schedule />} ></Route>
            </Routes>
        </>
    )
}
export default App;