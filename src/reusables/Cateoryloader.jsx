
import React from "react";

const Cateoryloader = ({ count = 11 }) => {
    return (
        <div className="flex gap-14 overflow-x-auto bg-gray-100 px-10 py-8 scrollbar">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex shrink-0 flex-col items-center gap-3">
                    <div className="h-20 w-20 animate-pulse rounded-full border-2 border-gray-200 bg-gray-300" />
                    <div className="h-2 w-20 animate-pulse rounded bg-gray-300" />
                </div>
            ))}
        </div>
    );
};

export default Cateoryloader;