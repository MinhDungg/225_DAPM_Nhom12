import { useState } from 'react';

export const useSelection = (items = []) => {
    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedIds(items.map(item => item.maHoSo));
    };

    const clearSelection = () => {
        setSelectedIds([]);
    };

    return {
        selectedIds,
        toggleSelection,
        selectAll,
        clearSelection,
        isAllSelected: items.length > 0 && selectedIds.length === items.length
    };
};
