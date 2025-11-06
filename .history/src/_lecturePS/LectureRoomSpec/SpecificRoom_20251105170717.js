import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../public/context/UserContext";
import { API_BASE_URL } from "../../public/config/config";

import axios from "axios";
import { useLectureStore } from "./store/lectureStore";

function App() {
    const location = useLocation();
    const data = location?.state;
    const [lectureData, setLectureData] = useState();
    const { setLectureId } = useLectureStore();
    const { user } = useAuth();
    console.log(data);

    console.log()
    useEffect(() => {

        const url = `${API_BASE_URL}/lecture/spec`
        axios.get(url, { params: { id: data } })
            .then((res) => {
                console.log(res.data);
                setLectureData(res.data)
                setLectureId(res.data.id)
            })
            .catch((e) => console.log(e))

    }, [data, user])


    return (
        <>

        </>
    )
}
export default App;