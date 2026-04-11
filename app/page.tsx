'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const BottomSheet = dynamic(() => import('../components/BottomSheet'), { ssr: false });
const RoadSelector = dynamic(() => import('../components/RoadSelector'), { ssr: false });

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
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  const [slk, setSlk] = useState<string>('');
  const [result, setResult] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [roadsLoading, setRoadsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const handleLookup = async () => {
    if (!selectedRoad || !slk) {
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
        body: JSON.stringify({ roadId: selectedRoad.roadId, slk: parseFloat(slk) }),
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
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 px-6 pt-12 pb-8 text-white">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <h1 className="text-2xl font-bold">SLK Map Finder</h1>
          </div>
          <p className="text-center text-blue-200 text-sm">v1.1.0</p>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-gray-50 rounded-t-3xl min-h-[calc(100vh-140px)]">
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">
          
          {/* Road Selector Card */}
          <button
            onClick={() => setSheetOpen(true)}
            className="w-full bg-white rounded-2xl shadow-sm p-4 text-left border border-gray-100 hover:shadow-md transition-shadow"
          >
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Select Road
            </label>
            {roadsLoading ? (
              <div className="animate-pulse bg-gray-200 h-6 rounded w-3/4"></div>
            ) : selectedRoad ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{selectedRoad.roadId}</p>
                  <p className="text-sm text-gray-500">{selectedRoad.roadName}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-400">Tap to select a road...</p>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </button>

          {/* SLK Input Card */}
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <label htmlFor="slk" className="block text-sm font-medium text-gray-500 mb-2">
              Enter SLK
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                id="slk"
                step="0.1"
                value={slk}
                onChange={(e) => setSlk(e.target.value)}
                placeholder="e.g., 10.5"
                className="flex-1 text-xl font-semibold text-gray-800 bg-transparent focus:outline-none placeholder-gray-300"
              />
              <span className="text-gray-400 text-sm">km</span>
            </div>
          </div>

          {/* Find Button */}
          <button
            onClick={handleLookup}
            disabled={loading || !selectedRoad || !slk}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Looking up...
              </span>
            ) : (
              'Find Location'
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-start space-x-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 flex items-center space-x-2">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-semibold">Location Found</span>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Road</span>
                    <span className="font-semibold text-gray-800">{result.roadId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Name</span>
                    <span className="text-gray-800 text-right">{result.roadName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">SLK</span>
                    <span className="font-semibold text-gray-800">{result.slk} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Coordinates</span>
                    <span className="font-mono text-sm text-gray-600">
                      {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <a
                    href={result.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors font-medium text-sm shadow-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Maps
                  </a>
                  <a
                    href={result.streetViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-purple-500 text-white py-3 px-4 rounded-xl hover:bg-purple-600 transition-colors font-medium text-sm shadow-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Select Road"
      >
        <RoadSelector
          roads={roads}
          selectedRoad={selectedRoad}
          onSelect={setSelectedRoad}
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      </BottomSheet>
    </main>
  );
}
