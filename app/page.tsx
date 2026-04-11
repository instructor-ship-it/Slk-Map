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
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const selectedRoad = roads.find(r => r.roadId === selectedRoadId);
  
  const filteredRoads = roads.filter(road => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return road.roadId.toLowerCase().includes(query) || 
           road.roadName.toLowerCase().includes(query);
  });

  const handleSelectRoad = (roadId: string) => {
    setSelectedRoadId(roadId);
    setDropdownOpen(false);
    setSearchQuery('');
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
    <main className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-700">
      {/* Header */}
      <div className="bg-blue-600 px-4 pt-8 pb-4 text-white">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-1">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <h1 className="text-xl font-bold">SLK Map Finder</h1>
          </div>
          <p className="text-center text-blue-200 text-xs">v1.1.0</p>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-gray-50 rounded-t-2xl flex-1 pb-8">
        <div className="max-w-md mx-auto px-4 py-5 space-y-4">
          
          {/* Custom Road Selector Dropdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" ref={dropdownRef}>
            <label className="flex items-center px-4 pt-3 pb-1 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Select Road
            </label>
            
            {roadsLoading ? (
              <div className="px-4 pb-3">
                <div className="animate-pulse bg-gray-100 h-12 rounded-xl"></div>
              </div>
            ) : (
              <div className="px-4 pb-3 relative">
                {/* Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`
                    w-full h-12 px-4 pr-10 rounded-xl text-left flex items-center
                    transition-all duration-200
                    ${selectedRoadId 
                      ? 'bg-blue-50 border-2 border-blue-500' 
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                    }
                    ${dropdownOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                  `}
                >
                  {selectedRoadId ? (
                    <span className="font-medium text-gray-800">{selectedRoad?.roadId} — {selectedRoad?.roadName}</span>
                  ) : (
                    <span className="text-gray-500">Select a road...</span>
                  )}
                </button>
                
                {/* Dropdown Arrow */}
                <div className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-blue-500' : selectedRoadId ? 'text-blue-500' : 'text-gray-400'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Dropdown List */}
                {dropdownOpen && (
                  <div className="absolute left-4 right-4 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-64 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search roads..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    {/* Road List */}
                    <div className="overflow-y-auto max-h-52">
                      {filteredRoads.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 text-sm">
                          No roads found
                        </div>
                      ) : (
                        filteredRoads.map((road) => (
                          <button
                            key={road.roadId}
                            type="button"
                            onClick={() => handleSelectRoad(road.roadId)}
                            className={`
                              w-full px-4 py-3 text-left flex items-center justify-between
                              transition-colors
                              ${selectedRoadId === road.roadId 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'hover:bg-gray-50 active:bg-gray-100'
                              }
                            `}
                          >
                            <div>
                              <span className="font-semibold">{road.roadId}</span>
                              <span className="text-gray-400 mx-1">—</span>
                              <span className="text-gray-600">{road.roadName}</span>
                            </div>
                            {selectedRoadId === road.roadId && (
                              <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
                      <span className="text-xs text-gray-400">{filteredRoads.length} roads</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Selected Road Preview */}
            {selectedRoad && !dropdownOpen && (
              <div className="px-4 pb-3">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl px-4 py-2.5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{selectedRoad.roadId}</p>
                      <p className="text-blue-100 text-sm truncate max-w-[200px]">{selectedRoad.roadName}</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SLK Input */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <label htmlFor="slk" className="flex items-center px-4 pt-3 pb-1 text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Enter SLK
            </label>
            <div className="px-4 pb-3">
              <div className={`
                flex items-center h-12 px-4 rounded-xl border-2 transition-all duration-200
                ${slk 
                  ? 'bg-blue-50 border-blue-500' 
                  : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-200'
                }
              `}>
                <input
                  type="number"
                  id="slk"
                  step="0.1"
                  value={slk}
                  onChange={(e) => setSlk(e.target.value)}
                  placeholder="e.g., 10.5"
                  className="flex-1 text-lg font-semibold text-gray-800 bg-transparent focus:outline-none placeholder-gray-400"
                />
                <span className={`text-sm font-medium ml-2 ${slk ? 'text-blue-500' : 'text-gray-400'}`}>km</span>
              </div>
            </div>
          </div>

          {/* Find Button */}
          <button
            onClick={handleLookup}
            disabled={loading || !selectedRoadId || !slk}
            className={`
              w-full py-4 px-6 rounded-2xl font-bold text-lg
              transition-all duration-300 ease-out transform
              ${loading || !selectedRoadId || !slk
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/40 active:scale-[0.98] hover:shadow-xl hover:shadow-blue-600/50'
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Looking up...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Location
              </span>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 flex items-center space-x-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white font-bold">Location Found</span>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Road</span>
                    <p className="font-bold text-gray-800 text-lg">{result.roadId}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-right">
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">SLK</span>
                    <p className="font-bold text-gray-800 text-lg">{result.slk} <span className="text-sm font-normal text-gray-500">km</span></p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Name</span>
                  <p className="text-gray-800 font-medium">{result.roadName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">Coordinates</span>
                  <p className="font-mono text-sm text-gray-700">
                    {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <a
                    href={result.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-md shadow-green-500/30 active:scale-[0.98] transition-transform"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Google Maps
                  </a>
                  <a
                    href={result.streetViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-violet-500 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-md shadow-purple-500/30 active:scale-[0.98] transition-transform"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
