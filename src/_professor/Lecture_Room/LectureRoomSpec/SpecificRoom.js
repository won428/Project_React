import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../public/context/UserContext";
import { API_BASE_URL } from "../../../public/config/config";
import axios from "axios";

function App() {
    const location = useLocation();
    const data = location?.state;
    const [lectureData, setLectureData] = useState();
    const { user } = useAuth();
    console.log(data);

    useEffect(() => {

        const url = `${API_BASE_URL}/lecture/spec`
        axios.get(url, { params: { id: data } })
            .then((res) => {
                console.log(res.data);
                setLectureData(res.data)
            })
            .catch((e) => console.log(e))

    }, [data, user])


    return (
        <>

        </>
    )
}
export default App;