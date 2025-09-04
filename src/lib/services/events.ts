export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  ageRange: string;
  cost: string;
  imageUrl?: string;
  ticketmasterUrl?: string;
  meetupUrl?: string;
  source?: 'ticketmaster' | 'meetup';
  groupName?: string;
  latitude?: number;
  longitude?: number;
}

export interface TicketmasterEvent {
  id: string;
  name: string;
  type: string;
  url: string;
  locale: string;
  images: Array<{
    ratio: string;
    url: string;
    width: number;
    height: number;
    fallback: boolean;
  }>;
  sales: {
    public: {
      startDateTime: string;
      endDateTime: string;
    };
  };
  dates: {
    start: {
      localDate: string;
      localTime: string;
      dateTime: string;
    };
    timezone: string;
    status: {
      code: string;
    };
  };
  classifications: Array<{
    primary: boolean;
    segment: {
      id: string;
      name: string;
    };
    genre: {
      id: string;
      name: string;
    };
    subGenre: {
      id: string;
      name: string;
    };
  }>;
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  _embedded: {
    venues: Array<{
      id: string;
      name: string;
      type: string;
      url: string;
      locale: string;
      images: Array<{
        ratio: string;
        url: string;
        width: number;
        height: number;
        fallback: boolean;
      }>;
      distance: number;
      units: string;
      address: {
        line1: string;
        line2?: string;
      };
      city: {
        name: string;
      };
      state: {
        name: string;
        stateCode: string;
      };
      country: {
        name: string;
        countryCode: string;
      };
      postalCode: string;
      location: {
        longitude: string;
        latitude: string;
      };
      timezone: string;
    }>;
  };
}

export interface EventSearchParams {
  city: string;
  radius?: number; // in miles
  category?: string;
  startDate?: string;
  endDate?: string;
  ageRange?: string;
  limit?: number;
}

class EventService {
  private apiKey: string;
  private baseUrl = 'https://app.ticketmaster.com/discovery/v2';
  private version = '2.0'; // Force rebuild

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY || '';
    console.log('Ticketmaster API Key loaded:', this.apiKey ? 'Yes' : 'No');
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    console.log('Making Ticketmaster API request to:', endpoint);
    console.log('API Key available:', this.apiKey ? 'Yes' : 'No');
    
    if (!this.apiKey) {
      throw new Error('Ticketmaster API key not configured');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('apikey', this.apiKey);
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Ticketmaster API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ticketmaster API request failed:', error);
      throw error;
    }
  }

  async searchEvents(params: EventSearchParams): Promise<Event[]> {
    try {
      console.log('=== TICKETMASTER DEBUG ===');
      console.log('Using server-side API route to avoid CORS');
      console.log('========================');
      
      // Parse city and state
      const [city, state] = params.city ? params.city.split(',').map(s => s.trim()) : ['', ''];
      
      if (!city || !state) {
        console.log('No city/state provided, returning mock data');
        return this.getEnhancedMockEvents(params.city, params.category);
      }

      // Build query parameters for our server-side API
      const queryParams = new URLSearchParams({
        'city': city,
        'state': state,
        'radius': (params.radius || 20).toString(),
        'limit': (params.limit || 20).toString(),
        'category': params.category || 'all'
      });

      // Call our server-side API route
      const response = await fetch(`/api/events/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.events && Array.isArray(data.events)) {
        console.log(`Found ${data.events.length} events from Ticketmaster`);
        return data.events;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to search events:', error);
      // Return mock data as fallback
      return this.getEnhancedMockEvents(params.city, params.category);
    }
  }

  private transformEvent(ticketmasterEvent: TicketmasterEvent): Event {
    const venue = ticketmasterEvent._embedded?.venues?.[0];
    const primaryClassification = ticketmasterEvent.classifications?.find(c => c.primary);
    
    return {
      id: ticketmasterEvent.id,
      title: ticketmasterEvent.name,
      description: this.generateEventDescription(ticketmasterEvent),
      startDate: ticketmasterEvent.dates.start.dateTime,
      endDate: ticketmasterEvent.dates.start.dateTime, // Ticketmaster doesn't provide end time in basic response
      location: venue ? `${venue.name}, ${venue.city.name}, ${venue.state.stateCode}` : 'Location TBD',
      category: primaryClassification?.segment?.name || 'Entertainment',
      ageRange: this.estimateAgeRange(ticketmasterEvent.name, primaryClassification?.segment?.name),
      cost: this.formatPrice(ticketmasterEvent.priceRanges),
      imageUrl: this.getBestImage(ticketmasterEvent.images),
      ticketmasterUrl: ticketmasterEvent.url,
      source: 'ticketmaster',
      latitude: venue ? parseFloat(venue.location.latitude) : undefined,
      longitude: venue ? parseFloat(venue.location.longitude) : undefined,
    };
  }

  private estimateAgeRange(title: string, category?: string): string {
    const text = (title + ' ' + (category || '')).toLowerCase();
    
    if (text.includes('teen') || text.includes('adolescent') || text.includes('13-18') || text.includes('high school')) {
      return '13-18';
    } else if (text.includes('kid') || text.includes('child') || text.includes('6-12') || text.includes('elementary')) {
      return '6-12';
    } else if (text.includes('toddler') || text.includes('preschool') || text.includes('3-5') || text.includes('baby')) {
      return '3-5';
    } else if (text.includes('all ages') || text.includes('family') || text.includes('children')) {
      return '4-18';
    }
    
    return '4-18'; // Default age range for family events
  }

  private generateEventDescription(event: TicketmasterEvent): string {
    const venue = event._embedded?.venues?.[0];
    const primaryClassification = event.classifications?.find(c => c.primary);
    
    let description = `Join us for ${event.name}`;
    
    if (venue) {
      description += ` at ${venue.name}`;
    }
    
    if (primaryClassification?.segment?.name) {
      description += `. A ${primaryClassification.segment.name.toLowerCase()} event`;
    }
    
    description += ' perfect for families and children.';
    
    return description;
  }

  private formatPrice(priceRanges?: Array<{min: number, max: number, currency: string}>): string {
    if (!priceRanges || priceRanges.length === 0) {
      return 'Varies';
    }
    
    const priceRange = priceRanges[0];
    const currency = priceRange.currency === 'USD' ? '$' : priceRange.currency;
    
    if (priceRange.min === priceRange.max) {
      return `${currency}${priceRange.min}`;
    } else {
      return `${currency}${priceRange.min} - ${currency}${priceRange.max}`;
    }
  }

  private getBestImage(images: Array<{url: string, width: number, height: number}>): string | undefined {
    if (!images || images.length === 0) {
      return undefined;
    }
    
    // Find the best image (prefer 16:9 ratio, then largest)
    const bestImage = images.find(img => img.width / img.height === 16/9) || 
                     images.reduce((best, current) => 
                       current.width > best.width ? current : best
                     );
    
    return bestImage?.url;
  }

  private getClassificationId(category: string): string | null {
    // Ticketmaster classification IDs for family-friendly events
    const classificationMap: Record<string, string> = {
      'Arts & Crafts': 'KZFzniwnSyZfZ7v7nE', // Family
      'Education': 'KZFzniwnSyZfZ7v7nE', // Family
      'Sports': 'KZFzniwnSyZfZ7v7nE', // Family
      'Entertainment': 'KZFzniwnSyZfZ7v7nE', // Family
      'Technology': 'KZFzniwnSyZfZ7v7nE', // Family
      'Music': 'KZFzniwnSyZfZ7v7nE', // Family
      'Food & Drink': 'KZFzniwnSyZfZ7v7nE', // Family
      'Health & Wellness': 'KZFzniwnSyZfZ7v7nE', // Family
    };
    
    return classificationMap[category] || null;
  }

  private getEnhancedMockEvents(city: string, category?: string): Event[] {
    const allEvents = [
      {
        id: '1',
        title: 'Kids Art Workshop',
        description: 'Creative painting and drawing workshop for children ages 6-12. Perfect for budding artists!',
        startDate: this.getFutureDate(1, 10, 0),
        endDate: this.getFutureDate(1, 12, 0),
        location: `${city} Art Center`,
        category: 'Arts & Crafts',
        ageRange: '6-12',
        cost: 'Free',
        imageUrl: '/placeholders/placeholder-1.svg'
      },
      {
        id: '2',
        title: 'Science Fair for Teens',
        description: 'Interactive science experiments and demonstrations. Learn about physics, chemistry, and biology!',
        startDate: this.getFutureDate(2, 14, 0),
        endDate: this.getFutureDate(2, 16, 0),
        location: `${city} Science Center`,
        category: 'Education',
        ageRange: '13-18',
        cost: '$15',
        imageUrl: '/placeholders/placeholder-2.svg'
      },
      {
        id: '3',
        title: 'Youth Soccer Tournament',
        description: 'Friendly soccer competition for kids and teens. Teams welcome!',
        startDate: this.getFutureDate(3, 9, 0),
        endDate: this.getFutureDate(3, 17, 0),
        location: `${city} Sports Complex`,
        category: 'Sports',
        ageRange: '8-16',
        cost: '$25',
        imageUrl: '/placeholders/placeholder-3.svg'
      },
      {
        id: '4',
        title: 'Coding Camp for Kids',
        description: 'Learn programming basics with fun projects and games. No experience needed!',
        startDate: this.getFutureDate(4, 9, 0),
        endDate: this.getFutureDate(4, 15, 0),
        location: `${city} Tech Hub`,
        category: 'Technology',
        ageRange: '10-14',
        cost: '$45',
        imageUrl: '/placeholders/placeholder-4.svg'
      },
      {
        id: '5',
        title: 'Music & Movement for Toddlers',
        description: 'Interactive music and dance session for little ones ages 2-5. Parents welcome!',
        startDate: this.getFutureDate(5, 10, 30),
        endDate: this.getFutureDate(5, 11, 30),
        location: `${city} Community Center`,
        category: 'Entertainment',
        ageRange: '2-5',
        cost: 'Free',
        imageUrl: '/placeholders/placeholder-1.svg'
      },
      {
        id: '6',
        title: 'Robotics Workshop',
        description: 'Build and program your own robot! Perfect for kids interested in engineering.',
        startDate: this.getFutureDate(6, 13, 0),
        endDate: this.getFutureDate(6, 16, 0),
        location: `${city} Maker Space`,
        category: 'Technology',
        ageRange: '8-14',
        cost: '$35',
        imageUrl: '/placeholders/placeholder-2.svg'
      },
      {
        id: '7',
        title: 'Basketball Skills Clinic',
        description: 'Learn fundamental basketball skills with professional coaches.',
        startDate: this.getFutureDate(7, 9, 0),
        endDate: this.getFutureDate(7, 11, 0),
        location: `${city} Recreation Center`,
        category: 'Sports',
        ageRange: '10-16',
        cost: '$20',
        imageUrl: '/placeholders/placeholder-3.svg'
      },
      {
        id: '8',
        title: 'Creative Writing Workshop',
        description: 'Express your imagination through storytelling and creative writing exercises.',
        startDate: this.getFutureDate(8, 15, 0),
        endDate: this.getFutureDate(8, 17, 0),
        location: `${city} Public Library`,
        category: 'Education',
        ageRange: '12-18',
        cost: 'Free',
        imageUrl: '/placeholders/placeholder-4.svg'
      }
    ];

    // Filter by category if specified
    if (category && category !== 'all') {
      return allEvents.filter(event => event.category === category);
    }

    return allEvents;
  }

  private getMockEvents(city: string): Event[] {
    return [
      {
        id: '1',
        title: 'Kids Art Workshop',
        description: 'Creative painting and drawing workshop for children ages 6-12. Perfect for budding artists!',
        startDate: '2025-08-25T10:00:00',
        endDate: '2025-08-25T12:00:00',
        location: `${city} Art Center`,
        category: 'Arts & Crafts',
        ageRange: '6-12',
        cost: 'Free',
        imageUrl: '/placeholders/placeholder-1.svg'
      },
      {
        id: '2',
        title: 'Science Fair for Teens',
        description: 'Interactive science experiments and demonstrations. Learn about physics, chemistry, and biology!',
        startDate: '2025-08-26T14:00:00',
        endDate: '2025-08-26T16:00:00',
        location: `${city} Science Center`,
        category: 'Education',
        ageRange: '13-18',
        cost: '$15',
        imageUrl: '/placeholders/placeholder-2.svg'
      },
      {
        id: '3',
        title: 'Youth Soccer Tournament',
        description: 'Friendly soccer competition for kids and teens. Teams welcome!',
        startDate: '2025-08-27T09:00:00',
        endDate: '2025-08-27T17:00:00',
        location: `${city} Sports Complex`,
        category: 'Sports',
        ageRange: '8-16',
        cost: '$25',
        imageUrl: '/placeholders/placeholder-3.svg'
      },
      {
        id: '4',
        title: 'Coding Camp for Kids',
        description: 'Learn programming basics with fun projects and games. No experience needed!',
        startDate: '2025-08-28T09:00:00',
        endDate: '2025-08-28T15:00:00',
        location: `${city} Tech Hub`,
        category: 'Technology',
        ageRange: '10-14',
        cost: '$45',
        imageUrl: '/placeholders/placeholder-4.svg'
      }
    ];
  }

  private getFutureDate(daysFromNow: number, hour: number, minute: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  }

  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const response = await this.makeRequest(`/events/${eventId}.json`, {
        'include': 'venue'
      });
      
      return this.transformEvent(response);
    } catch (error) {
      console.error('Failed to get event by ID:', error);
      return null;
    }
  }

  // Get nearby events based on coordinates
  async getNearbyEvents(lat: number, lng: number, radius: number = 20): Promise<Event[]> {
    try {
      // For now, we'll use the enhanced mock data for nearby events
      // You can extend the server-side API later to support lat/lng coordinates
      console.log(`Using mock data for nearby events (lat: ${lat}, lng: ${lng}, radius: ${radius}km - not yet implemented)`);
      return this.getEnhancedMockEvents('Nearby');
    } catch (error) {
      console.error('Failed to get nearby events:', error);
      return this.getEnhancedMockEvents('Nearby');
    }
  }
}

export const eventService = new EventService();
