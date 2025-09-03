import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SERVER-SIDE API ROUTE DEBUG ===');
    console.log('Request URL:', request.url);
    
    const { searchParams } = new URL(request.url);
    
    // Extract parameters from query string
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const radius = searchParams.get('radius') || '20';
    const limit = searchParams.get('limit') || '20';
    const category = searchParams.get('category');
    
    console.log('Extracted params:', { city, state, radius, limit, category });
    
    if (!city || !state) {
      console.log('Missing city or state');
      return NextResponse.json({ error: 'City and state are required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY;
    console.log('API Key available:', apiKey ? 'YES' : 'NO');
    console.log('API Key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.log('No API key found');
      return NextResponse.json({ error: 'Ticketmaster API key not configured' }, { status: 500 });
    }

    // Build search parameters for Ticketmaster Discovery API
    const ticketmasterParams = new URLSearchParams({
      'apikey': apiKey,
      'size': limit,
      'sort': 'date,asc',
      'startDateTime': new Date().toISOString(),
      'city': city,
      'stateCode': state,
      'radius': radius,
      'unit': 'miles',
      'classificationId': 'KZFzniwnSyZfZ7v7nE', // Family events
    });

    // Add category filtering if specified
    if (category && category !== 'all') {
      // For now, we'll use family events for all categories
      // You can expand this later with specific classification IDs
    }

    const ticketmasterUrl = `https://app.ticketmaster.com/discovery/v2/events.json?${ticketmasterParams.toString()}`;
    
    console.log('Making server-side request to:', ticketmasterUrl.replace(apiKey, 'API_KEY_HIDDEN'));

    const response = await fetch(ticketmasterUrl);
    
    console.log('Ticketmaster response status:', response.status);
    console.log('Ticketmaster response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Ticketmaster error response:', errorText);
      throw new Error(`Ticketmaster API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Ticketmaster response data keys:', Object.keys(data));
    console.log('Events found:', data._embedded?.events?.length || 0);
    
    // Transform the data to match our Event interface
    const events = data._embedded?.events?.map((event: any) => {
      try {
        const venue = event._embedded?.venues?.[0];
        const primaryClassification = event.classifications?.find((c: any) => c.primary);
        
        return {
          id: event.id,
          title: event.name,
          description: `Join us for ${event.name}${venue ? ` at ${venue.name}` : ''}. A ${primaryClassification?.segment?.name?.toLowerCase() || 'entertainment'} event perfect for families and children.`,
          startDate: event.dates.start.dateTime,
          endDate: event.dates.start.dateTime,
          location: venue ? `${venue.name}, ${venue.city.name}, ${venue.state.stateCode}` : 'Location TBD',
          category: primaryClassification?.segment?.name || 'Entertainment',
          ageRange: '4-18', // Default for family events
          cost: event.priceRanges?.[0] ? 
            `$${event.priceRanges[0].min}${event.priceRanges[0].min !== event.priceRanges[0].max ? ` - $${event.priceRanges[0].max}` : ''}` : 
            'Varies',
          imageUrl: event.images?.find((img: any) => img.width / img.height === 16/9)?.url || 
                   event.images?.[0]?.url,
          ticketmasterUrl: event.url,
          latitude: venue ? parseFloat(venue.location.latitude) : undefined,
          longitude: venue ? parseFloat(venue.location.longitude) : undefined,
        };
      } catch (transformError) {
        console.error('Error transforming event:', transformError, 'Event data:', event);
        return null;
      }
    }).filter(Boolean) || [];

    return NextResponse.json({ events });
    
  } catch (error) {
    console.error('=== SERVER-SIDE API ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Full error:', error);
    console.error('=============================');
    
    return NextResponse.json(
      { 
        error: 'Failed to search events', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
