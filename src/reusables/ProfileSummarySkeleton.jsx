import React from "react";

const ProfileSummarySkeleton = () => (
    <section
        className="grid animate-pulse gap-6 border border-gray-100 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:items-center"
        aria-busy="true"
        aria-label="Loading profile details"
    >
        {/* User info */}
        <div className="flex items-center gap-4">
            <div className="h-24 w-24 shrink-0 rounded-full bg-gray-200" />

            <div className="min-w-0 flex-1 space-y-2">
                <div className="h-6 w-40 max-w-full rounded bg-gray-200" />
                <div className="h-5 w-52 max-w-full rounded bg-gray-200" />
                <div className="h-5 w-32 rounded bg-gray-200" />
                <div className="flex items-center gap-2 pt-1">
                    <div className="h-6 w-16 rounded-md bg-gray-200" />
                    <div className="h-4 w-28 rounded bg-gray-200" />
                </div>
            </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-y-5 divide-gray-100 sm:grid-cols-4 sm:divide-x">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-1 px-2">
                    <div className="h-6 w-6 rounded bg-gray-200" />
                    <div className="h-7 w-10 rounded bg-gray-200" />
                    <div className="h-4 w-20 rounded bg-gray-200" />
                </div>
            ))}
        </div>
    </section>
);

export default ProfileSummarySkeleton;