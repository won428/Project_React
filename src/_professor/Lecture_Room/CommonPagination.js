import { Pagination } from "react-bootstrap";

// 페이징 용 공통 컴포넌트(페이지 하단 바닥 버튼)
export default function CommonPagination({ paging, onPageChange }) {
    if (!paging || paging.totalPages <= 1) return null;

    const { pageNumber, totalPages } = paging;

    const items = [];
    for (let i = 0; i < totalPages; i++) {
        items.push(
            <Pagination.Item
                key={i}
                active={i === pageNumber}
                onClick={() => onPageChange(i)}
            >
                {i + 1}
            </Pagination.Item>
        );
    }

    return (
        <Pagination className="justify-content-center my-3">
            <Pagination.First onClick={() => onPageChange(0)} disabled={pageNumber === 0} />
            <Pagination.Prev onClick={() => onPageChange(pageNumber - 1)} disabled={pageNumber === 0} />
            {items}
            <Pagination.Next
                onClick={() => onPageChange(pageNumber + 1)}
                disabled={pageNumber >= totalPages - 1}
            />
            <Pagination.Last
                onClick={() => onPageChange(totalPages - 1)}
                disabled={pageNumber >= totalPages - 1}
            />
        </Pagination>
    );
}