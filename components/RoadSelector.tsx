'use client';

import { useState, useEffect, useRef } from 'react';

interface Road {
  roadId: string;
  roadName: string;
}

interface RoadSelectorProps {
  roads: Road[];
  selectedRoad: Road | null;
  onSelect: (road: Road | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoadSelector({ roads, selectedRoad, onSelect, isOpen, onClose }: RoadSelectorProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const filteredRoads = roads.filter(road => {
    const query = search.toLowerCase();
    return (
      road.roadId.toLowerCase().includes(query) ||
      road.roadName.toLowerCase().includes(query)
    );
  });

  const handleSelect = (road: Road) => {
    onSelect(road);
    onClose();
  };

  return (
    <>
      {/* Header with close button */}
      <div className="sticky top-0 bg-white z-20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Select Road</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-gray-50">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by road ID or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto bg-white">
        {filteredRoads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">No roads found</p>
            <p className="text-xs mt-1">Try a different search</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRoads.map((road) => (
              <button
                key={road.roadId}
                onClick={() => handleSelect(road)}
                className={`w-full px-4 py-4 flex items-center justify-between text-left transition-colors active:bg-gray-100 ${
                  selectedRoad?.roadId === road.roadId ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-base">{road.roadId}</p>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{road.roadName}</p>
                </div>
                {selectedRoad?.roadId === road.roadId && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center ml-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
        <span className="text-xs text-gray-400 font-medium">
          {filteredRoads.length} road{filteredRoads.length !== 1 ? 's' : ''} found
        </span>
      </div>
    </>
  );
}
