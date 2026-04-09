import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const queryUrl = new URL(
      'https://gisservices.mainroads.wa.gov.au/arcgis/rest/services/OpenData/RoadAssets_DataPortal/MapServer/17/query'
    );

    const params = {
      where: "ROAD LIKE 'H%' OR ROAD LIKE 'M%'",
      outFields: 'ROAD,ROAD_NAME',
      returnGeometry: 'false',
      resultRecordCount: '1000',
      f: 'json',
    };

    queryUrl.search = new URLSearchParams(params).toString();

    const response = await fetch(queryUrl.toString());
    
    if (!response.ok) {
      throw new Error(`MRWA API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features) {
      return NextResponse.json([]);
    }

    // Deduplicate roads by roadId
    const roadMap = new Map<string, string>();
    data.features.forEach((feature: any) => {
      if (feature.attributes.ROAD && feature.attributes.ROAD_NAME) {
        if (!roadMap.has(feature.attributes.ROAD)) {
          roadMap.set(feature.attributes.ROAD, feature.attributes.ROAD_NAME);
        }
      }
    });

    const roads = Array.from(roadMap.entries())
      .map(([roadId, roadName]) => ({ roadId, roadName }))
      .sort((a, b) => a.roadId.localeCompare(b.roadId));

    return NextResponse.json(roads);
  } catch (error: any) {
    console.error('Error fetching roads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch road data from MRWA' },
      { status: 500 }
    );
  }
}
