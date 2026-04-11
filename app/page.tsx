'use client';

import { useState, useEffect, useRef } from 'react';

interface Road {
  roadId: string;
  roadName: string;
}

interface LocationResult {
  roadId: string;
  roadName: string;
  slk: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  googleMapsUrl: string;
  streetViewUrl: string;
  satelliteUrl: string;
}

export default function Home() {
  const [roads, setRoads] = useState<Road[]>([]);
  const [selectedRoadId, setSelectedRoadId] = useState<string>('');
  const [slk, setSlk] = useState<string>('');
  const [result, setResult] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [roadsLoading, setRoadsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRoads() {
      try {
        const res = await fetch('/api/roads');
        if (!res.ok) throw new Error('Failed to fetch roads');
        const data = await res.json();
        setRoads(data);
      } catch (err) {
        console.error(err);
        setError('Could not load road list.');
      } finally {
        setRoadsLoading(false);
      }
    }
    fetchRoads();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get unique first letters for index
  const roadIndex = Array.from(new Set(roads.map(r => r.roadId[0]))).sort();
  
  const selectedRoad = roads.find(r => r.roadId === selectedRoadId);

  const scrollToLetter = (letter: string) => {
    const firstRoad = roads.find(r => r.roadId.startsWith(letter));
    if (firstRoad && listRef.current) {
      const element = document.getElementById(`road-${firstRoad.roadId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSelectRoad = (roadId: string) => {
    setSelectedRoadId(roadId);
    setDropdownOpen(false);
  };

  const handleLookup = async () => {
    if (!selectedRoadId || !slk) {
      setError('Please select a road and enter SLK value.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadId: selectedRoadId, slk: parseFloat(slk) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lookup failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during lookup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-900 px-4 pt-8 pb-4 text-white border-b border-gray-800">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-1">
            <svg className="w-6 h-6 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <h1 className="text-xl font-bold">SLK Map Finder</h1>
          </div>
          <p className="text-center text-gray-500 text-xs">v1.2.0</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-900">
        <div className="max-w-md mx-auto px-4 py-5 space-y-4">
          
          {/* Road Selector - Keyboard Style Picker */}
          <div ref={dropdownRef}>
            <label className="block text-sm text-gray-400 mb-1">Road ID</label>
            {roadsLoading ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg h-12 animate-pulse"></div>
            ) : (
              <div className="relative">
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full bg-gray-800 border border-gray-700 text-white h-12 text-base rounded-lg px-3 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {selectedRoadId ? (
                    <span>
                      <span className="font-mono text-blue-400">{selectedRoad?.roadId}</span>
                      <span className="ml-2 text-gray-300">{selectedRoad?.roadName}</span>
                    </span>
                  ) : (
                    <span className="text-gray-500">Select road</span>
                  )}
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Content - No Search */}
                {dropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                    {/* Road List with Index */}
                    <div className="relative flex">
                      {/* Scrollable Road List */}
                      <div 
                        ref={listRef}
                        className="flex-1 max-h-72 overflow-y-auto overscroll-contain"
                        style={{ scrollBehavior: 'smooth' }}
                      >
                        {roads.length === 0 ? (
                          <div className="py-4 text-center text-gray-500 text-sm">No roads found</div>
                        ) : (
                          roads.map((road) => (
                            <button
                              key={road.roadId}
                              id={`road-${road.roadId}`}
                              type="button"
                              onClick={() => handleSelectRoad(road.roadId)}
                              className={`w-full px-3 py-3 text-left flex items-center justify-between text-white active:bg-gray-600 ${
                                selectedRoadId === road.roadId ? 'bg-blue-900/50' : ''
                              }`}
                            >
                              <span>
                                <span className="font-mono text-blue-400">{road.roadId}</span>
                                <span className="ml-2 text-gray-300 text-sm">{road.roadName}</span>
                              </span>
                              {selectedRoadId === road.roadId && (
                                <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                      
                      {/* Alphabetical Index Bar */}
                      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gray-800/90 flex flex-col items-center justify-center py-1">
                        {roadIndex.map((letter) => (
                          <button
                            key={letter}
                            type="button"
                            onClick={() => scrollToLetter(letter)}
                            className="text-xs font-bold text-blue-400 hover:text-white active:text-white px-1 py-0.5"
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SLK Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Enter SLK (km)</label>
            <input
              type="number"
              step="0.1"
              value={slk}
              onChange={(e) => setSlk(e.target.value)}
              placeholder="e.g., 10.5"
              className="w-full bg-gray-800 border border-gray-700 text-white h-12 text-base rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>

          {/* Find Button */}
          <button
            onClick={handleLookup}
            disabled={loading || !selectedRoadId || !slk}
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Looking up...' : 'Find Location'}
          </button>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-green-600 px-4 py-2 flex items-center space-x-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-semibold text-sm">Location Found</span>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Road</span>
                    <p className="font-mono text-blue-400 font-semibold">{result.roadId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-xs">SLK</span>
                    <p className="text-white font-semibold">{result.slk} km</p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Name</span>
                  <p className="text-gray-300">{result.roadName}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Coordinates</span>
                  <p className="font-mono text-xs text-gray-400">
                    {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <a
                    href={result.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-2 px-2 rounded font-medium text-xs transition-colors"
                  >
                    <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Maps
                  </a>
                  <a
                    href={result.satelliteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white py-2 px-2 rounded font-medium text-xs transition-colors"
                  >
                    <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                    Satellite
                  </a>
                  <a
                    href={result.streetViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white py-2 px-2 rounded font-medium text-xs transition-colors"
                  >
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Street View
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
