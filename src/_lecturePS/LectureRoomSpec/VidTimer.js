import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../config/config";


const Heartbeat = 60000;
function VidTimer({
    id, initialProgress, filePath, vidLength
}) {


    const [totWatchSec, setTotWatchSec] = useState(initialProgress.totalWatchedSec || 0)
    const [lastViewedSec, setLastViewedSec] = useState(initialProgress.lastViewedSec || 0)
    const videoRef = useRef(null);
    // 수강 인정 timer
    useEffect(() => {
        const timer = setInterval(() => {
            if (videoRef.current && !videoRef.current.paused) {
                setTotWatchSec(prevTime => prevTime + 1)
            }
        }, 1000)
        return () => clearInterval(timer);
    }, [])



    // 서버로 현재 상태 전송
    useEffect(() => {
        const sendProgress = async () => {
            if (!videoRef.current) return;
            const url = `${API_BASE_URL}/online/progress`
            const currentTimestamp = videoRef.current.currentTime; // 현재 위치 (이어보기용)

            console.log(`[Heartbeat] : 누적 ${totWatchSec}초, 현재 ${currentTimestamp}초`);

            await axios.post(url, {
                id: id,
                totalWatchedSec: totWatchSec, // (출석용) 누적 시간
                lastViewedSec: currentTimestamp,
                vidLength: vidLength,      // (이어보기용) 현재 위치
            });
        };
        const heartbeatTimer = setInterval(sendProgress, Heartbeat);

        // 페이지를 닫거나 벗어날 때 마지막 상태 전송
        const handleUnload = () => sendProgress();
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            clearInterval(heartbeatTimer);
            window.removeEventListener('beforeunload', handleUnload);
            sendProgress(); // 컴포넌트 사라지기 직전 최종 저장
        };
    }, [id, totWatchSec]);

    return (<video
        ref={videoRef}
        controls
        src={filePath}
        // (이어보기) 마운트 시 최종 시청 지점(lastViewedSec)으로 이동
        onLoadedMetadata={() => {
            if (videoRef.current) videoRef.current.currentTime = lastViewedSec;
        }}
        style={{ width: '100%' }}
    />
    )
}
export default VidTimer;