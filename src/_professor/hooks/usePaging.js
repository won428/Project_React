import { useCallback, useEffect, useState } from "react";

export function usePaging(fetcher, initialSearch = {}, initinalPageSize = 10) {
    const [list, setList] = useState([]); // 객체 목록 받아올 상태 리스트
    const [paging, setPaging] = useState({ // 페이징 조건
        pageNumber: 0, // 현재페이지
        pageSize: initinalPageSize, // 한 페이지의 사이즈
        totalSize: 0, // 총 페이지
        totalElements: 0, // 총 데이터
    });
    const [search, setSearch] = useState(initialSearch); // 검색조건+검색키워드 들어있는 객체
    const [loading, setLoading] = useState(false);

    const loadPage = useCallback(
        async (pageNumber = 0) => {
            setLoading(true);
            try {
                const result = await fetcher({ // 
                    pageNumber,
                    pageSize: paging.pageSize,
                    search,
                }); // axios, URL, param을 외부페이지에 맡김
                setList(result.content || []); // 받아온 객체 바인딩
                setPaging(result.paging || { // 받아온 페이징 정보 바인딩
                    pageNumber,
                    pageSize: paging.pageSize,
                    totalPages: 0,
                    totalElements: 0,
                });
            } finally {
                setLoading(false);
            }
        }, [fetcher, paging.pageSize, search]);

    // 검색조건이 바뀌면 0페이지부터 다시 로드
    useEffect(() => {
        loadPage(0);
    }, [loadPage]);

    const changePage = (pageNumber) => {
        if (pageNumber < 0 || pageNumber >= paging.totalPages) return; // 현재 페이지넘버가 음수거나, 총페이지보다 크면 리턴
        loadPage(pageNumber); // 현재 페이지넘버로 페이지 로딩
    };

    return {
        list, // 현재 페이지 데이터 배열
        paging, // { pageNumber, pageSize, totalPages, totalElements }
        search, // 검색조건 객체 {searchType, searchKeyword}
        setSearch, // 검색조건 바꾸는 함수
        loading, // 로딩 중인지 여부
        changePage, // 페이지 바꾸는 함수
        reload: () => loadPage(paging.pageNumber), // 현재 페이지 다시 로드하는 함수
    };
}