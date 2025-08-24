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
  eventbriteUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface EventbriteEvent {
  id: string;
  name: { text: string };
  description: { text: string };
  start: { local: string };
  end: { local: string };
  venue: {
    name: string;
    address: {
      city: string;
      state: string;
      country: string;
    };
    latitude: string;
    longitude: string;
  };
  category: {
    name: string;
  };
  ticket_availability: {
    is_free: boolean;
    minimum_ticket_price?: {
      display: string;
    };
  };
  logo?: {
    url: string;
  };
  url: string;
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
  private baseUrl = 'https://www.eventbriteapi.com/v3';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_EVENTBRITE_API_KEY || '';
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    if (!this.apiKey) {
      throw new Error('Eventbrite API key not configured');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('token', this.apiKey);
    
    // Add additional parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Eventbrite API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Eventbrite API request failed:', error);
      throw error;
    }
  }

  async searchEvents(params: EventSearchParams): Promise<Event[]> {
    try {
      // Build search parameters
      const searchParams: Record<string, string> = {
        'location.address': params.city,
        'expand': 'venue,category',
        'status': 'live',
        'start_date.range_start': params.startDate || new Date().toISOString(),
        'limit': (params.limit || 20).toString(),
      };

      if (params.radius) {
        searchParams['location.within'] = `${params.radius}mi`;
      }

      if (params.category && params.category !== 'all') {
        searchParams['category_id'] = this.getCategoryId(params.category);
      }

      const response = await this.makeRequest('/events/search/', searchParams);
      
      return response.events.map((event: EventbriteEvent) => this.transformEvent(event));
    } catch (error) {
      console.error('Failed to search events:', error);
      // Return mock data as fallback
      return this.getMockEvents(params.city);
    }
  }

  private transformEvent(eventbriteEvent: EventbriteEvent): Event {
    return {
      id: eventbriteEvent.id,
      title: eventbriteEvent.name.text,
      description: eventbriteEvent.description.text,
      startDate: eventbriteEvent.start.local,
      endDate: eventbriteEvent.end.local,
      location: eventbriteEvent.venue.name,
      category: eventbriteEvent.category.name,
      ageRange: this.estimateAgeRange(eventbriteEvent.description.text),
      cost: eventbriteEvent.ticket_availability.is_free 
        ? 'Free' 
        : eventbriteEvent.ticket_availability.minimum_ticket_price?.display || 'Varies',
      imageUrl: eventbriteEvent.logo?.url,
      eventbriteUrl: eventbriteEvent.url,
      latitude: parseFloat(eventbriteEvent.venue.latitude),
      longitude: parseFloat(eventbriteEvent.venue.longitude),
    };
  }

  private estimateAgeRange(description: string): string {
    const text = description.toLowerCase();
    
    if (text.includes('teen') || text.includes('adolescent') || text.includes('13-18')) {
      return '13-18';
    } else if (text.includes('kid') || text.includes('child') || text.includes('6-12')) {
      return '6-12';
    } else if (text.includes('toddler') || text.includes('preschool') || text.includes('3-5')) {
      return '3-5';
    } else if (text.includes('all ages') || text.includes('family')) {
      return '4-18';
    }
    
    return '4-18'; // Default age range
  }

  private getCategoryId(category: string): string {
    // Eventbrite category IDs - these are examples, you'll need to get the actual IDs
    const categoryMap: Record<string, string> = {
      'Arts & Crafts': '110',
      'Education': '108',
      'Sports': '113',
      'Entertainment': '105',
      'Technology': '102',
      'Music': '103',
      'Food & Drink': '110',
      'Health & Wellness': '107',
    };
    
    return categoryMap[category] || '108'; // Default to Education
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

  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const response = await this.makeRequest(`/events/${eventId}/`, {
        'expand': 'venue,category'
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
      const searchParams: Record<string, string> = {
        'location.latitude': lat.toString(),
        'location.longitude': lng.toString(),
        'location.within': `${radius}mi`,
        'expand': 'venue,category',
        'status': 'live',
        'start_date.range_start': new Date().toISOString(),
        'limit': '20',
      };

      const response = await this.makeRequest('/events/search/', searchParams);
      
      return response.events.map((event: EventbriteEvent) => this.transformEvent(event));
    } catch (error) {
      console.error('Failed to get nearby events:', error);
      return this.getMockEvents('Nearby');
    }
  }
}

export const eventService = new EventService();
