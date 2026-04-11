import { NextResponse } from 'next/server';
import length from '@turf/length';
import along from '@turf/along';
import type { Feature, LineString } from 'geojson';

export async function POST(request: Request) {
  try {
    const { roadId, slk } = await request.json();

    if (!roadId || typeof slk !== 'number') {
      return NextResponse.json(
        { error: 'Road ID and valid SLK are required' },
        { status: 400 }
      );
    }

    const queryUrl = new URL(
      'https://gisservices.mainroads.wa.gov.au/arcgis/rest/services/OpenData/RoadAssets_DataPortal/MapServer/17/query'
    );

    const params = {
      where: `ROAD = '${roadId}' AND START_SLK <= ${slk} AND END_SLK >= ${slk}`,
      outFields: 'ROAD,ROAD_NAME,START_SLK,END_SLK',
      returnGeometry: 'true',
      outSR: '4326',
      f: 'json',
    };

    queryUrl.search = new URLSearchParams(params).toString();

    const response = await fetch(queryUrl.toString());
    
    if (!response.ok) {
      throw new Error(`MRWA API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return NextResponse.json(
        { error: `No segment found for road ${roadId} at SLK ${slk}` },
        { status: 404 }
      );
    }

    const segment = data.features[0];
    const { geometry, attributes } = segment;

    if (!geometry || !geometry.paths || geometry.paths.length === 0) {
      return NextResponse.json(
        { error: 'No geometry available for this segment' },
        { status: 404 }
      );
    }

    const coordinates: number[][] = geometry.paths[0];
    const geoJsonLine: Feature<LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: coordinates,
      },
    };

    const segmentLength = length(geoJsonLine, { units: 'kilometers' });
    const slkRange = attributes.END_SLK - attributes.START_SLK;
    const slkOffset = slk - attributes.START_SLK;
    const proportion = slkOffset / slkRange;
    const distanceAlong = segmentLength * proportion;
    const point = along(geoJsonLine, distanceAlong, { units: 'kilometers' });

    if (!point || !point.geometry || !point.geometry.coordinates) {
      return NextResponse.json(
        { error: 'Could not interpolate position' },
        { status: 500 }
      );
    }

    const [lng, lat] = point.geometry.coordinates;

    const googleMapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
    const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat.toFixed(6)},${lng.toFixed(6)}`;
    const satelliteUrl = `https://www.google.com/maps/@${lat.toFixed(6)},${lng.toFixed(6)},18z/data=!3m1!1e3`;

    return NextResponse.json({
      roadId: attributes.ROAD,
      roadName: attributes.ROAD_NAME,
      slk: slk,
      coordinates: {
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
      },
      googleMapsUrl,
      streetViewUrl,
      satelliteUrl,
    });

  } catch (error: any) {
    console.error('SLK Lookup error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during lookup' },
      { status: 500 }
    );
  }
}
