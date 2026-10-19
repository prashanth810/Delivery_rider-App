import React from "react";

const QuickActionsSkeleton = ({ count = 4 }) => (
    <section
        className="animate-pulse border border-gray-100 bg-white p-5 shadow-sm"
        aria-busy="true"
        aria-label="Loading quick actions"
    >
        {/* "Quick Actions" title */}
        <div className="mb-4 h-6 w-32 rounded bg-gray-200" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 p-4">
                    {/* icon box */}
                    <div className="h-11 w-11 shrink-0 bg-gray-200" />

                    {/* title + description */}
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-200" />
                        <div className="h-3 w-full rounded bg-gray-200" />
                    </div>

                    {/* arrow */}
                    <div className="h-4 w-4 shrink-0 rounded bg-gray-200" />
                </div>
            ))}
        </div>
    </section>
);

export default QuickActionsSkeleton;