// app/api/satellite/test-planet/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PLANET_API_KEY = 'PLAKf5d4beffc719426fbfd853d277585141';

export async function GET(request: NextRequest) {
  try {
    // Тестируем Planet Basemaps API
    const response = await fetch(`https://api.planet.com/basemaps/v1/mosaics?api_key=${PLANET_API_KEY}`);
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'success',
        message: 'Planet API key is working!',
        mosaics_count: data.mosaics ? data.mosaics.length : 0,
        api_access: 'basic'
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json({
        status: 'error',
        message: 'Planet API key authentication failed',
        error: errorText,
        status_code: response.status
      }, { status: 400 });
    }
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Planet API test failed',
      error: error.message
    }, { status: 500 });
  }
}