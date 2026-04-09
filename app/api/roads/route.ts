import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const queryUrl = new URL(
      'https://gisservices.mainroads.wa.gov.au/arcgis/rest/services/OpenData/RoadAssets_DataPortal/MapServer/17/query'
    );

    const params = {
      where: "ROAD LIKE 'H%' OR ROAD LIKE 'M%'",
      outFields: 'ROAD,ROAD_NAME',
      returnDistinctValues: 'true',
      orderByFields: 'ROAD',
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

    const roads = data.features
      .filter((feature: any) => feature.attributes.ROAD && feature.attributes.ROAD_NAME)
      .map((feature: any) => ({
        roadId: feature.attributes.ROAD,
        roadName: feature.attributes.ROAD_NAME,
      }))
      .sort((a: any, b: any) => a.roadId.localeCompare(b.roadId));

    return NextResponse.json(roads);
  } catch (error: any) {
    console.error('Error fetching roads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch road data from MRWA' },
      { status: 500 }
    );
  }
}
