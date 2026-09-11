import React from 'react';

interface CatalogSkeletonProps {
  count?: number;
}

export const CatalogSkeleton: React.FC<CatalogSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="rounded-2xl bg-carbon-900 border border-carbon-800/80 overflow-hidden animate-pulse flex flex-col justify-between"
          aria-hidden="true"
        >
          {/* Media Header Placeholder */}
          <div className="relative aspect-video w-full bg-carbon-850">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-carbon-750/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="absolute top-3 right-3 w-20 h-6 rounded-full bg-carbon-800" />
            <div className="absolute top-3 left-3 w-24 h-5 rounded-md bg-carbon-800" />
          </div>

          {/* Card Content Placeholder */}
          <div className="p-6 flex flex-col flex-1 justify-between">
            <div>
              {/* Brand & Model */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="w-16 h-3.5 bg-carbon-800 rounded" />
                  <div className="w-3/4 h-6 bg-carbon-750 rounded" />
                </div>
                <div className="w-12 h-5 bg-carbon-800 rounded" />
              </div>

              {/* Description */}
              <div className="mt-4 space-y-1.5">
                <div className="w-full h-3 bg-carbon-800/60 rounded" />
                <div className="w-4/5 h-3 bg-carbon-800/60 rounded" />
              </div>

              {/* Technical Specs Grid */}
              <div className="mt-5 pt-4 border-t border-carbon-800/60 grid grid-cols-3 gap-2">
                <div className="h-12 rounded-lg bg-carbon-850" />
                <div className="h-12 rounded-lg bg-carbon-850" />
                <div className="h-12 rounded-lg bg-carbon-850" />
              </div>
            </div>

            {/* Price and Button */}
            <div className="mt-6 pt-4 border-t border-carbon-800/60 flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-12 h-2.5 bg-carbon-800 rounded" />
                <div className="w-24 h-6 bg-carbon-750 rounded" />
              </div>
              <div className="w-28 h-9 rounded-lg bg-carbon-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
