import React from "react";

const RecentOrdersSkeleton = ({ count = 4 }) => (
    <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-4"
        aria-busy="true"
        aria-label="Loading recent orders"
    >
        {Array.from({ length: count }).map((_, index) => (
            <div
                key={index}
                className="flex animate-pulse items-center gap-3 lg:border-r lg:border-gray-100 lg:px-4 lg:first:pl-0 lg:last:border-r-0"
            >
                {/* image */}
                <div className="h-20 w-20 shrink-0 rounded-md bg-gray-200" />

                {/* text lines */}
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/3 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                    <div className="h-5 w-16 rounded-md bg-gray-200" />
                </div>

                {/* arrow */}
                <div className="h-4 w-4 shrink-0 rounded bg-gray-200" />
            </div>
        ))}
    </div>
);

export default RecentOrdersSkeleton;