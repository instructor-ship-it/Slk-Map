'use client';

import { useState, useEffect } from 'react';
import Select from 'react-select';

interface Road {
  roadId: string;
  roadName: string;
}

interface RoadOption {
  value: string;
  label: string;
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
  const [selectedRoad, setSelectedRoad] = useState<RoadOption | null>(null);
  const [slk, setSlk] = useState<string>('');
  const [result, setResult] = useState<LocationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [roadsLoading, setRoadsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const roadOptions: RoadOption[] = roads.map((road) => ({
    value: road.roadId,
    label: `${road.roadId} - ${road.roadName}`,
  }));

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
        body: JSON.stringify({ roadId: selectedRoad.value, slk: parseFloat(slk) }),
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
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          SLK Map Finder
        </h1>
        <p className="text-sm text-gray-500 text-center mb-4">v1.0.0</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Road
            </label>
            {roadsLoading ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
            ) : (
              <Select
                options={roadOptions}
                value={selectedRoad}
                onChange={(option) => setSelectedRoad(option)}
                placeholder="Search for a road..."
                isClearable
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#9ca3af' },
                    boxShadow: 'none',
                  }),
                }}
              />
            )}
          </div>

          <div>
            <label htmlFor="slk" className="block text-sm font-medium text-gray-700 mb-1">
              Enter SLK (e.g., 10.5)
            </label>
            <input
              type="number"
              id="slk"
              step="0.1"
              value={slk}
              onChange={(e) => setSlk(e.target.value)}
              placeholder="e.g., 10.5"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleLookup}
            disabled={loading || !selectedRoad || !slk}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Looking up...' : 'Find Location'}
          </button>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-3 border-t pt-4">
              <h2 className="text-lg font-semibold text-gray-800">Location Found</h2>
              
              <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
                <p><span className="font-medium">Road:</span> {result.roadId} - {result.roadName}</p>
                <p><span className="font-medium">SLK:</span> {result.slk}</p>
                <p><span className="font-medium">Coordinates:</span> {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={result.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors font-medium text-sm"
                >
                  Google Maps
                </a>
                <a
                  href={result.streetViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors font-medium text-sm"
                >
                  Street View
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
