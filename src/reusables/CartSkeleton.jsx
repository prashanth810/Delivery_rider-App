import React from 'react';

const Bar = ({ className = "" }) => (
    <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const CartItemSkeleton = () => (
    <div className="flex flex-col gap-4 py-5 first:pt-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: image + info */}
        <div className="flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-gray-200 sm:h-30 sm:w-28" />
            <div className="min-w-0 space-y-2">
                <Bar className="h-3 w-16" />
                <Bar className="h-4 w-40 sm:w-52" />
                <Bar className="h-3 w-12" />
                <Bar className="h-7 w-24" />
            </div>
        </div>

        {/* Right: price + quantity */}
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-2">
            <div className="flex items-baseline gap-3">
                <Bar className="h-5 w-20" />
                <Bar className="h-3 w-12" />
            </div>
            <Bar className="h-9 w-28" />
        </div>
    </div>
);

const CartSkeleton = ({ items = 3 }) => (
    <div
        className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3"
        aria-busy="true"
        aria-label="Loading your cart"
    >
        {/* Product details */}
        <div className="border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
            <div className="mb-2 hidden items-center justify-between border-b-2 border-dashed border-gray-300 pb-3 sm:flex">
                <Bar className="h-4 w-28" />
                <Bar className="h-7 w-16" />
            </div>

            <div className="divide-y divide-gray-100">
                {Array.from({ length: items }).map((_, i) => (
                    <CartItemSkeleton key={i} />
                ))}
            </div>
        </div>

        {/* Order summary */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <Bar className="mb-4 h-5 w-32" />

                {/* Promo */}
                <div className="mb-5 flex flex-col gap-2 sm:flex-row">
                    <Bar className="h-10 flex-1" />
                    <Bar className="h-10 w-20" />
                </div>

                {/* Summary lines */}
                <div className="space-y-3 border-b border-gray-100 pb-4">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                            <Bar className="h-3 w-28" />
                            <Bar className="h-3 w-16" />
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-4">
                    <Bar className="h-5 w-28" />
                    <Bar className="h-5 w-20" />
                </div>

                {/* Buttons */}
                <Bar className="mb-3 h-11 w-full" />
                <Bar className="h-10 w-full" />
            </div>

            {/* Secure banner */}
            <div className="flex animate-pulse items-center gap-3 bg-gray-200 p-4">
                <div className="h-8 w-8 shrink-0 rounded bg-gray-300" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-full rounded bg-gray-300" />
                    <div className="h-3 w-2/3 rounded bg-gray-300" />
                </div>
            </div>
        </div>
    </div>
);

export default CartSkeleton;