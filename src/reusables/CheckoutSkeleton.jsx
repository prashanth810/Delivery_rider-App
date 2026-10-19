import React from "react";

const Bar = ({ className = "" }) => (
    <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const SectionSkeleton = ({ children }) => (
    <section className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-3">
                <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
                <Bar className="h-4 w-36" />
            </div>
        </div>
        <div className="space-y-3 p-5">{children}</div>
    </section>
);

const AddressCardSkeleton = () => (
    <div className="rounded-md border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
            <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="min-w-0 flex-1 space-y-2">
                <Bar className="h-4 w-28" />
                <Bar className="h-3 w-full" />
                <Bar className="h-3 w-4/5" />
                <Bar className="h-3 w-3/5" />
                <Bar className="h-3 w-2/5" />
            </div>
        </div>
    </div>
);

const OptionSkeleton = () => (
    <div className="rounded-md border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
            <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <Bar className="h-4 w-36" />
                    <Bar className="h-4 w-14" />
                </div>
                <Bar className="h-3 w-3/4" />
            </div>
        </div>
    </div>
);

const SummaryItemSkeleton = () => (
    <li className="flex items-center gap-3 py-4">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded bg-gray-200" />
        <div className="min-w-0 flex-1 space-y-2">
            <Bar className="h-3 w-3/4" />
            <Bar className="h-3 w-1/2" />
        </div>
        <Bar className="h-4 w-14" />
    </li>
);

const CheckoutSkeleton = ({ items = 2 }) => (
    <main
        className="bg-[#f6f7f5] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        aria-busy="true"
        aria-label="Loading checkout"
    >
        <div className="mx-auto w-full max-w-[90%]">
            <Bar className="mb-5 h-7 w-36" />

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
                {/* left column */}
                <div className="space-y-5">
                    {/* 1. Shipping address */}
                    <SectionSkeleton>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {[0, 1, 2].map((i) => (
                                <AddressCardSkeleton key={i} />
                            ))}
                        </div>
                    </SectionSkeleton>

                    {/* 2. Delivery method */}
                    <SectionSkeleton>
                        {[0, 1, 2].map((i) => (
                            <OptionSkeleton key={i} />
                        ))}
                    </SectionSkeleton>

                    {/* 3. Payment method */}
                    <SectionSkeleton>
                        {[0, 1, 2].map((i) => (
                            <OptionSkeleton key={i} />
                        ))}
                    </SectionSkeleton>
                </div>

                {/* order summary */}
                <aside className="rounded-lg border border-gray-200 bg-white lg:sticky lg:top-40">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <Bar className="h-5 w-32" />
                        <Bar className="h-3 w-12" />
                    </div>

                    <ul className="divide-y divide-gray-100 px-5">
                        {Array.from({ length: items }).map((_, i) => (
                            <SummaryItemSkeleton key={i} />
                        ))}
                    </ul>

                    <div className="space-y-3 border-t border-gray-100 px-5 py-4">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="flex justify-between">
                                <Bar className="h-3 w-20" />
                                <Bar className="h-3 w-14" />
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 px-5 py-4">
                        <div className="flex items-center justify-between">
                            <Bar className="h-4 w-14" />
                            <Bar className="h-5 w-20" />
                        </div>
                        <Bar className="mt-4 h-11 w-full" />
                        <Bar className="mx-auto mt-3 h-3 w-40" />
                    </div>
                </aside>
            </div>
        </div>
    </main>
);

export default CheckoutSkeleton;