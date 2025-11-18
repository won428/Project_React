import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../public/context/UserContext";
import "../ui/Home.css";
import { API_BASE_URL } from "../config/config";
import axios from "axios";
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80";


function Home() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [notice, setNocie] = useState([]);
  const [post, setPost] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [page, setPage] = useState(1);
  const pageRange = 5;
    const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   const [news, setNews] = useState([]);

   // 네이버 IT 뉴스 API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/news`, {
          params: {
            query: "AI",  // 🔹 IT 관련 키워드
            size: 4       // 🔹 가져올 개수
          },
        });

        // 컨트롤러가 ResponseEntity<String> 을 리턴하니까
        // 문자열이면 JSON.parse 한 번 해줌
        const data = typeof res.data === "string"
          ? JSON.parse(res.data)
            
          : res.data;
        console.log(res.data)
        
        setNews(data.items || []);
      } catch (e) {
        console.error("뉴스 가져오기 실패", e);
      }
    };

    fetchNews();
  }, []);


   useEffect(() => {
    // Open-Meteo API를 통해 서울 날씨 정보 가져오기
    const url = `https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9783&current_weather=true&timezone=Asia%2FSeoul`;

    axios
      .get(url)
      .then((response) => {
        console.log(response.data)
        setWeather(response.data.current_weather);
        setLoading(false);
      })
      .catch((error) => {
        console.error("날씨 정보 불러오기 오류", error);
        setError("날씨 정보를 불러오는 데 실패했습니다.");
        setLoading(false);
      });
  }, []);


  const logoutAction = () => {
    logout();
    navigate("/"); // 로그아웃 후 로그인 페이지로
  };

  useEffect(() => {
    const url = `${API_BASE_URL}/calendar/List/ad`;
    const params = {
      year,
      month,
      page: page - 1,
      size: pageRange,
    };
    axios.get(url, { params })
      .then((res) => {
        setPageInfo(res.data);
        setPost(res.data.content);
      })
      .catch((error) => {
        console.error("Error fetching academicCalendar:", error);
      });
  }, [year, month, page]);

  useEffect(() => {
    const url = `${API_BASE_URL}/Entire/List`;
    axios.get(url, { params: { page: 0, size: 3 } })
      .then((res) => {
        setNocie(res.data.content);
        console.log(res.data.content);

      })
      .catch((error) => {
        console.error("Error fetching Entire:", error);
      });

  }, []);

  const navroot = (e) => {

    switch (true) {
      case user?.roles.includes("STUDENT"):
        navigate("/hs");
        break;
      case user?.roles.includes('ADMIN'):
        navigate("/ha");
        break;
      case user?.roles.includes("PROFESSOR"):
        navigate("/hp");
        break;
      default:
        navigate("/Unauthorizedpage");
        break;
    }
  };
  const cardItems = [
    {
      roles: ["ADMIN"],
      title: "사용자 목록",
      description: "전체 사용자 조회 및 설정",
      icon: "⚙️",
      path: "/user/UserList"
    }, {
      roles: ["ADMIN"],
      title: "사용자 등록",
      description: "시용자 등록",
      icon: "⚙️",
      path: "/user/insert_user"
    },
    {
      roles: ["ADMIN"],
      title: "강의 관리",
      description: "강의를 설정합니다.",
      icon: "⚙️",
      path: "/lectureList"
    },
    {
      roles: ["ADMIN"],
      title: "학사일정 관리",
      description: "학사일정을 설정합니다.",
      icon: "⚙️",
      path: "/acschemod"
    },
    {
      roles: ["STUDENT"],
      title: "기본 정보 보기",
      description: "나의 정보를 확인해 보세요.",
      icon: "📊",
      path: "/InfoHome"
    }, {
      roles: ["STUDENT"],
      title: "수강 강의",
      description: "나의 수강 강의를 확인해 보세요.",
      icon: "📊",
      path: "/leclist"
    },
    {
      roles: ["STUDENT"],
      title: "성적조회",
      description: "나의 누적 성적을 확인해 보세요.",
      icon: "📊",
      path: "/Student_Credit"
    },
    {
      roles: ["STUDENT"],
      title: "장학제도",
      description: "다양한 장학금 혜택을 확인하세요.",
      icon: "🎓",
      path: "/"
    },
    {
      roles: ["PROFESSOR"],
      title: "강의실",
      description: "현재 개강중인 강의를 확인하세요.",
      icon: "✍️",
      path: "/LRoomPro"
    },
    {
      roles: ["PROFESSOR"],
      title: "강의 등록",
      description: "개강 할 강의를 등록하세요.",
      icon: "✍️",
      path: "/LecRegisterPro"
    }, {
      roles: ["PROFESSOR"],
      title: "연구 계획서",
      description: "연구 계획서를 등록하세요.",
      icon: "✍️",
      path: "/LecRegisterPro"
    }, {
      roles: ["PROFESSOR"],
      title: "연구 활동",
      description: "진행 중인 연구 활동을 관리하세요.",
      icon: "✍️",
      path: "/LecRegisterPro"
    },

  ];
  const role = user?.roles?.[0]; // 예: "STUDENT", "ADMIN"

  const visibleCards = cardItems.filter(item => item.roles.includes(role));

  const inquiryNavigate = ()=>{
    if( role === 'ADMIN'){
      navigate('/inquiry/admin')
    }else{
      navigate("/inquiryBoard")
    }
  }

    const cleanText = (html) =>
    html
      ? html
          .replace(/<\/?b>/g, "")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
      : "";

  // 글자 수 제한용 함수 (설명은 더 짧게)
  const truncateText = (text, maxLen) => {
    if (!text) return "";
    return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
  };

  return (
    // 🔹 text-light 제거
    <div className="min-vh-100 bg-dark">
      {/* Header */}
      <header className="bg-white border-bottom border-light-subtle sticky-top">
        <div className="container px-3">
          <div
            className="d-flex align-items-center justify-content-between"
            style={{ height: 64 }}
          >
            {/* Logo */}
            <div
              className="d-flex align-items-center gap-2"
              onClick={() => navigate("/home")}
              style={{ cursor: "pointer" }}
            >
              <span className="fw-semibold text-light">
                <img src="/logo22.png" height="30" alt="LMS Logo" />
              </span>
            </div>

            {/* Desktop nav */}
            <nav className="d-none d-md-flex align-items-center gap-3 small">
              <a className="text-muted text-decoration-none">
                대학소개
              </a>
              <a className="text-muted text-decoration-none">
                입학안내
              </a>
              <a onClick={() => navigate("/EnNotList")} className="text-muted text-decoration-none">
                공지사항
              </a>
              <a onClick={() => inquiryNavigate()} className="text-muted text-decoration-none">
                문의
              </a>
              <a onClick={() => navigate("/acsche")} className="text-muted text-decoration-none">
                학사일정
              </a>
            </nav>

            {/* Right side actions */}
            <div className="d-flex align-items-center gap-2">
              {user && (
                <span className="small text-muted d-none d-md-inline">
                  {user.name} 님
                </span>
              )}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                onClick={logoutAction}
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section
        className="position-relative"
        style={{ height: 480, overflow: "hidden" }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100">
          <img
            src={HERO_IMAGE}
            alt="University campus"
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
          />
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background:
                "linear-gradient(90deg, rgba(15,23,42,0.9), rgba(15,23,42,0.6))",
            }}
          />
        </div>

        <div className="position-relative h-100">
          <div className="container h-100 d-flex flex-column justify-content-center">
            <div className="row">
              <div className="col-lg-7 text-white">
                <p className="text-uppercase small mb-2">
                  Korea National University
                </p>
                <h1
                  className="fw-bold mb-3"
                  style={{ fontSize: "2.6rem", lineHeight: 1.2 }}
                >
                  미래를 여는
                  <br />
                  ICT대학교
                </h1>
                <p className="text-white-50 mb-2">
                  4차 산업혁명 시대를 선도하는 글로벌 인재 양성의 요람.
                  <br />
                  ICT대학교에서 여러분의 가능성을 펼쳐 보세요.
                </p>
                {user && (
                  <p className="text-white-50 mb-4">
                    오늘도 좋은 하루 보내세요, <strong>{user.name}</strong> 님
                  </p>
                )}
                <div className="d-flex flex-wrap gap-2">
                  <a
                    href="#admission"
                    className="btn btn-primary rounded-pill px-4"
                  >
                    입학 안내 보기
                  </a>
                  <button
                    type="button"
                    className="btn btn-outline-light rounded-pill px-4"
                    onClick={() => navroot()}
                  >
                    포털 바로가기
                  </button>
                </div>
              </div>
              {/* 오른쪽 빈 영역 유지 */}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 빠른 바로가기 섹션 (배너와 메인 컨텐츠 사이) ===== */}
      <section className="bg-light">
        <div className="container py-4">
          {/* 제목 */}
          <div className="d-flex align-items-center mb-3">
            <p className="fw-semibold mb-0 text-dark">빠른 바로가기</p>
          </div>


          <div className="row g-3 align-items-stretch card-clickable">
            {visibleCards.map((item, index) => (
              <div className="col-lg-3 col-md-6" key={index}>
                <div
                  className="d-flex align-items-center rounded-4 px-4 py-3 shadow-sm h-100"
                  style={{
                    backgroundColor: "#f1f2f4",
                    border: "1px solid #e1e4ea"
                  }}
                  onClick={() => navigate(item.path)}
                  
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 me-3"
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: "#111827"
                    }}
                  >
                    <span className="text-white fs-5">{item.icon}</span>
                  </div>
                  <div>
                    <div className="fw-semibold text-dark mb-1">{item.title}</div>
                    <div className="small text-muted">{item.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Main content */}
      <main className="bg-light py-5">
        <div className="container">
          <div className="row g-4">
            {/* Left column: 공지 + 뉴스 */}
            <div className="col-lg-8">
              {/* Notice board */}
              <section id="notice" className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h2 className="h5 mb-0 text-dark">공지사항</h2>
                  <a
                    href="#"
                    className="small text-muted text-decoration-none"
                    onClick={()=> navigate('/EnNotList')}
                  >
                    더보기
                  </a>
                </div>
                {/* 🔹 카드 안 기본 글씨를 어둡게 */}
                <div className="bg-white rounded-4 shadow-sm p-3 small text-dark">
                  <ul className="list-unstyled mb-0">
                    {notice.length > 0 ? (
                      notice.map((item, index) => (
                        <li key={index} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                          <div>
                            <span className="badge bg-primary-subtle text-primary me-2">
                              {item.name}
                            </span>
                            <span>{item.title}</span>
                          </div>
                          <span className="text-muted">{new Date(item.updatedAt).toLocaleDateString()}</span>
                        </li>
                      ))
                    ) : (
                      <div className="text-center text-muted">
                        공지사항이 없습니다.
                      </div>
                    )
                    }
                  </ul>
                </div>
              </section>

<section id="academic" className="mt-4">
  <div className="d-flex justify-content-between align-items-center mb-2">
    <h2 className="h5 mb-0 text-dark">IT뉴스</h2>
    <a
      href="https://news.naver.com/section/105"
      className="small text-muted text-decoration-none"
      target="_blank"
      rel="noreferrer"
    >
      더보기
    </a>
  </div>

  <div className="row g-3">
    {news.length === 0 ? (
      <div className="col-12 small text-muted">
        표시할 뉴스가 없습니다.
      </div>
    ) : (
      news.slice(0, 2).map((item, idx) => (
        <div className="col-md-6" key={idx}>
          <div className="bg-white rounded-4 shadow-sm h-100 p-3 small text-dark news-card">
            <h3 className="h6 mb-2 text-dark news-title">
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none text-dark fw-bold"
              >
                {cleanText(item.title)}
              </a>
            </h3>
            <p className="text-muted mb-0 news-desc">
              {truncateText(cleanText(item.description), 70)}
            </p>
          </div>
        </div>
      ))
    )}
  </div>
</section>
            </div>

            {/* Right column: 학사일정 + 날씨 */}
            <div className="col-lg-4">
              {/* 학사일정 카드 */}
<section id="admission" className="mb-4">
  <div className="bg-white rounded-4 shadow-sm p-3 small text-dark">
    <h2 className="h6 mb-2 text-dark">{month}월 학사일정</h2>
    <ul className="list-unstyled mb-0">
      {post.length > 0 ? (
        post.slice(0, 4).map((item, index) => (
          <li key={item.id || index} className="d-flex justify-content-between py-1">
            <span>{item.title || `일정 항목 ${item.id}`}</span>
            <span className="text-muted">{item.calStartDate ? new Date(item.calStartDate).toLocaleDateString() : '날짜 없음'}</span>
          </li>
        ))
      ) : (
        <div className="text-center text-muted">
          해당 월에 일정이 없습니다.
        </div>
      )}
    </ul>
    
    {/* "더 보기" 버튼 추가 */}
    {post.length > 5 && (
      <button
        className="btn btn-link text-muted p-0 mt-3"
        onClick={() => navigate("/acsche")}  // "/acsche"로 네비게이트
      >
        더 보기
      </button>
    )}
  </div>
</section>

{/* 날씨 위젯 */}
<section className="mb-4">
  <div className="bg-white rounded-4 shadow-sm p-3 small text-dark">
    <h2 className="h6 mb-2 text-dark">오늘의 캠퍼스 날씨</h2>

    {/* 로딩 중일 때 */}
    {loading && (
      <div className="text-muted small">날씨 정보를 불러오는 중입니다...</div>
    )}

    {/* 에러일 때 */}
    {error && (
      <div className="text-danger small">{error}</div>
    )}

    {/* 데이터가 있을 때만 출력 */}
    {!loading && !error && weather && (
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="display-6 me-3">☀️</div>
          <div>
            <div className="fw-semibold text-dark">
              현재 기온 {weather.temperature}°C
            </div>
            <div className="text-muted small">서울 캠퍼스 기준</div>
          </div>
        </div>

        <div className="text-end">
          <div className="fw-semibold text-dark">
            풍속 {weather.windspeed} m/s
          </div>
          <div className="text-muted small">
            {new Date(weather.time).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })} 기준
          </div>
        </div>
      </div>
    )}

    {/* 추가 정보 */}
    {!loading && !error && weather && (
      <div className="d-flex justify-content-between text-muted small mt-3">
        <span>날씨 코드: {weather.weathercode}</span>
        <span>낮/밤: {weather.is_day ? "낮" : "밤"}</span>
      </div>
    )}
  </div>
</section>


            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-white border-top">
        <div className="container py-4 small">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="fw-semibold mb-1 text-dark">ICT대학교</div>
              <p className="text-muted mb-0">
                사단법인 한국ICT기술협회 | 대표자 : 염기호
                <br />
                대표전화: 02-739-7235 　|　 팩스 : 02-733-3460
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <ul className="list-inline mb-1">
                <li className="list-inline-item">
                  <a href="#" className="text-muted text-decoration-none">
                    신촌센터 | 서울특별시 마포구 백범로 23, 3층 (신수동, 케이터틀)
                  </a>
                </li>
                <li className="list-inline-item">
                  <a href="#" className="text-muted text-decoration-none">
                    강남센터 | 서울특별시 서초구 서초대로77길 41, 4층 (서초동, 대동Ⅱ)
                  </a>
                </li>
              </ul>
              <p className="text-muted mb-0">
                &copy; 2025 ICT대학교. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
