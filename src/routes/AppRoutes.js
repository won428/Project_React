import { Route, Routes } from "react-router-dom";
import Home from './../pages/Home';
import Lecture from '../pages/Lecture/Lectures';
import ToDoList from '../pages/Lecture/ToDoList';
import InfoHome from '../pages/Integrated_Info/InfoHome';
import Academic_Schedule from '../pages/Schedule/Academic_Schedule';


function App() {




    return (
        <>
            <Routes>
                {/* Home */}
                <Route path='/' element={<Home />} ></Route>

                {/* Integrated_Info Tab */}
                <Route path='/InfoHome' element={<InfoHome />} ></Route>
                {/* Lecture Tab */}
                <Route path='/Lectures' element={<Lecture />} ></Route>
                <Route path='/ToDoList' element={<ToDoList />} ></Route>



                {/* Schedule Tab */}
                <Route path='/acsche' element={<Academic_Schedule />} ></Route>
            </Routes>
        </>
    )
}
export default App;