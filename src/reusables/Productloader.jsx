import React from "react";

const Productloader = ({ count = 4 }) => {
    return (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex animate-pulse flex-col overflow-hidden border border-emerald-400/20 bg-white shadow-sm"
                >
                    {/* Image */}
                    <div className="relative bg-gray-50 p-6">
                        <div className="absolute left-1 top-2 h-3 w-10 rounded bg-gray-200" />
                        <div className="absolute right-1 top-1 h-6 w-6 rounded-full bg-gray-200" />
                        <div className="mx-auto h-32 w-full rounded bg-gray-200 sm:h-36" />
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col p-4">
                        <div className="h-3 w-24 rounded bg-gray-200" />
                        <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                        <div className="mt-2 h-3 w-16 rounded bg-gray-200" />

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                                <div className="h-5 w-14 rounded bg-gray-200" />
                                <div className="h-4 w-10 rounded bg-gray-200" />
                            </div>
                            <div className="h-8 w-16 rounded bg-gray-200" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Productloader;