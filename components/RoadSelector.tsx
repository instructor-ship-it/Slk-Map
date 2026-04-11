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
      // Small delay to ensure animation starts
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
    <div className="flex flex-col h-full">
      {/* Search Bar - Fixed at top */}
      <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 z-10">
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
            placeholder="Search roads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {filteredRoads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No roads found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRoads.map((road) => (
              <button
                key={road.roadId}
                onClick={() => handleSelect(road)}
                className={`w-full px-4 py-4 flex items-center justify-between text-left transition-colors hover:bg-gray-50 active:bg-gray-100 ${
                  selectedRoad?.roadId === road.roadId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{road.roadId}</p>
                  <p className="text-sm text-gray-500 truncate">{road.roadName}</p>
                </div>
                {selectedRoad?.roadId === road.roadId && (
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 ml-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
        {filteredRoads.length} road{filteredRoads.length !== 1 ? 's' : ''} found
      </div>
    </div>
  );
}
