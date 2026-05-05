import s from './Pagination.module.css'; 

interface PaginationProps {
    currentPage: number;
    totalGroups: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalGroups, pageSize, onPageChange }: PaginationProps) => {
    const totalPages = Math.ceil(totalGroups / pageSize);

    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className={s.container}>
            <button 
                className={`${s.pageBtn} ${s.edgeBtn}`}
                disabled={currentPage === 1}
                onClick={() => onPageChange(1)}
            >
                first
            </button>

            {pages.map(page => (
                <button
                    key={page}
                    className={`${s.pageBtn} ${s.numBtn} ${currentPage === page ? s.active : ''}`}
                    onClick={() => onPageChange(page)}
                >
                    {page}
                </button>
            ))}

            <button 
                className={`${s.pageBtn} ${s.edgeBtn}`}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
            >
                last
            </button>
        </div>
    );
};