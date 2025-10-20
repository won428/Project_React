    import { Button, Form } from "react-bootstrap";
    import Layout_Info from "../../ui/Layout_Info";
import { use, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../config/config";
import axios from "axios";


    function App() {
        const dateInputRef = useRef(null);
        const [user, setUser] = useState({
            name:'',
            id:'',
            password:'',
            birthdate:'',
            email:'',
            phone:'',
            gender:'',
            major:'',
            type:'',
            status_id:''
            });
        const[colleges,setColleges] = useState([]);
        const[majors,setMajors] = useState([]);
            
        
        const collegeList = () => {
            const url = `${API_BASE_URL}/college/list`
            axios
                .get(url)
                .then((response)=>{
                    setColleges(response.data)
                })
                .catch((error)=>{
                    console.log(error)
                })
                
            }

            useEffect(() => {collegeList();}, []);

        const 

    
        return (
            <>
                <Layout_Info>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>이름</Form.Label>
                        <Form.Control 
                            type="text"
                            placeholder="이름을 입력해 주세요."
                            name="name"
                            value={user.name}
                            onChange={(event)=> setUser(previous=>({...previous, name: event.target.value}))}
                            
                        />
                        
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>이메일</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="이메일을 입력해 주세요."
                            name="email"
                            value={user.email}
                            onChange={(event)=> setUser(previous=>({...previous, email: event.target.value}))}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>생년월일</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                ref={dateInputRef}
                                type="date"                 // 브라우저 내장 달력
                                placeholder="YYYY-MM-DD"
                                name="birthdate"
                                value={user.birthdate}
                                onChange={(event)=>setUser(previous=>({...previous, birthdate: event.target.value}))}
                                />
                                <Button
                                variant="outline-secondary"
                                onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
                                >
                                달력
                                </Button>
                            </div>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>휴대전화</Form.Label> {/* +82 같이 국가번호 셀렉박스 추가 */}
                        <Form.Control 
                            type="tel"
                            placeholder="이름을 입력해 주세요."
                            name="phone"
                            value={user.phone}
                            onChange={(event)=> setUser(previous=>({...previous, phone: event.target.value}))}
                        />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="college">
                        <Form.Label>소속 단과대학</Form.Label>
                        <Form.Select>
                        <option>선택</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="department">
                        <Form.Label>소속 학과</Form.Label>
                        <Form.Select>
                        <option>선택</option>
                        </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="department">
                        <Form.Label>사용자 구분</Form.Label>
                        <Form.Select>
                        <option>선택</option>
                        <option>학생</option>
                        <option>교수</option>
                        <option>관리자</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <Form.Check type="checkbox" label="Check me out" />
                    </Form.Group>
                    
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
            </Form>
                </Layout_Info>
            </>
        )
    }
    export default App;