import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from './UserContext';
import { useNavigate } from 'react-router-dom';
import { set } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import { ca } from 'date-fns/locale';


const getExpFromToken = () => {

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) { return null; }
    const decoded = jwtDecode(token);
    return decoded.exp;
  } catch (e) {
    console.error("getExpFromToken() decode error:", e);
    return null;
  }
};


const formattime = (time) => {
  const minutes = String(Math.floor((time / 60))).padStart(2, '0');
  const seconds = String((time % 60)).padStart(2, '0');
  return `${minutes}:${seconds}`;
};


export const useSessionTimer = () => {
  const [expTime, setExpTime] = useState(getExpFromToken());
  const [remainingTime, setRemainingTime] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    alert("세션이 만료되어 자동 로그아웃됩니다.");
    logout();
    navigate('/');
  }, []);

  useEffect(() => {
    if (!expTime) {
      handleLogout();
      return;
    }

    const updateRemainingTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const newRemaining = expTime - now;
      if (newRemaining <= 0) {
        handleLogout();
        return;
      } else {
        setRemainingTime(newRemaining);
      }
    };

    updateRemainingTime();

    const intervalId = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(intervalId);
  }, [expTime, handleLogout]);

  const refreshTimer = (newAccessToken) => {
    try {
      const decoded = jwtDecode(newAccessToken);
      setExpTime(decoded.exp);
      if (expTime === decoded.exp) {
      }
    } catch (e) {
      console.error("디코딩 실패 다시 시도하세요", e);
      handleLogout();
    }
  };


  return (
    {
      formattedTime: formattime(remainingTime)
      , refreshTimer,
    }
  );
}     
