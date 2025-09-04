// Meetup API service for event search
// Note: Requires OAuth 2.0 authentication

interface MeetupEvent {
  id: string;
  title: string;
  description: string;
  eventUrl: string;
  dateTime: string;
  duration: number;
  host: {
    id: string;
    name: string;
  };
  group: {
    id: string;
    name: string;
    urlname: string;
  };
  images: Array<{
    id: string;
    baseUrl: string;
    preview: string;
  }>;
  venue?: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
}

interface MeetupSearchParams {
  location: string;
  radius?: number;
  category?: string;
  limit?: number;
}

class MeetupService {
  private baseUrl = 'https://api.meetup.com/gql';
  private accessToken: string | null = null;

  constructor() {
    // Access token will be set when user authenticates
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async makeRequest(query: string, variables: any = {}) {
    if (!this.accessToken) {
      throw new Error('Meetup access token required. Please sign in with Meetup.');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Meetup API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`Meetup API error: ${data.errors[0].message}`);
    }

    return data.data;
  }

  async searchEvents(params: MeetupSearchParams): Promise<any[]> {
    try {
      const query = `
        query SearchEvents($location: String!, $radius: Int, $limit: Int) {
          eventSearch(
            input: {
              location: $location
              radius: $radius
              limit: $limit
              sort: "DATE_ASC"
            }
          ) {
            edges {
              node {
                id
                title
                description
                eventUrl
                dateTime
                duration
                host {
                  id
                  name
                }
                group {
                  id
                  name
                  urlname
                }
                images {
                  id
                  baseUrl
                  preview
                }
                venue {
                  name
                  address
                  city
                  state
                }
              }
            }
          }
        }
      `;

      const variables = {
        location: params.location,
        radius: params.radius || 25,
        limit: params.limit || 20,
      };

      const data = await this.makeRequest(query, variables);
      
      return data.eventSearch?.edges?.map((edge: any) => edge.node) || [];
    } catch (error) {
      console.error('Failed to search Meetup events:', error);
      return [];
    }
  }

  // Transform Meetup event to our Event interface
  transformEvent(meetupEvent: MeetupEvent): any {
    return {
      id: `meetup_${meetupEvent.id}`,
      title: meetupEvent.title,
      description: meetupEvent.description || `Join us for ${meetupEvent.title} organized by ${meetupEvent.group.name}. A great opportunity for families to connect and learn together.`,
      startDate: meetupEvent.dateTime,
      endDate: meetupEvent.dateTime, // Meetup doesn't provide end time in this format
      location: meetupEvent.venue ? 
        `${meetupEvent.venue.name}, ${meetupEvent.venue.city}, ${meetupEvent.venue.state}` : 
        'Location TBD',
      category: this.categorizeEvent(meetupEvent.title, meetupEvent.group.name),
      ageRange: this.estimateAgeRange(meetupEvent.title, meetupEvent.group.name),
      cost: 'Varies', // Meetup doesn't provide cost info in basic API
      imageUrl: meetupEvent.images?.[0]?.baseUrl,
      meetupUrl: meetupEvent.eventUrl,
      source: 'meetup',
      groupName: meetupEvent.group.name,
    };
  }

  private categorizeEvent(title: string, groupName: string): string {
    const text = `${title} ${groupName}`.toLowerCase();
    
    if (text.includes('art') || text.includes('craft') || text.includes('painting') || text.includes('drawing')) {
      return 'Arts & Crafts';
    }
    if (text.includes('science') || text.includes('tech') || text.includes('coding') || text.includes('programming')) {
      return 'Science & Technology';
    }
    if (text.includes('sport') || text.includes('fitness') || text.includes('yoga') || text.includes('dance')) {
      return 'Sports & Fitness';
    }
    if (text.includes('music') || text.includes('concert') || text.includes('band')) {
      return 'Music';
    }
    if (text.includes('family') || text.includes('kids') || text.includes('children')) {
      return 'Family';
    }
    if (text.includes('education') || text.includes('learning') || text.includes('workshop')) {
      return 'Education';
    }
    
    return 'Community';
  }

  private estimateAgeRange(title: string, groupName: string): string {
    const text = `${title} ${groupName}`.toLowerCase();
    
    if (text.includes('toddler') || text.includes('preschool')) {
      return '2-5';
    }
    if (text.includes('kids') || text.includes('children') || text.includes('elementary')) {
      return '5-12';
    }
    if (text.includes('teen') || text.includes('youth') || text.includes('high school')) {
      return '13-18';
    }
    if (text.includes('family') || text.includes('all ages')) {
      return 'All Ages';
    }
    
    return '4-18'; // Default for family-friendly events
  }

  // Get OAuth authorization URL
  getAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_MEETUP_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/meetup/callback`;
    
    if (!clientId) {
      throw new Error('Meetup client ID not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'basic',
    });

    return `https://secure.meetup.com/oauth2/authorize?${params.toString()}`;
  }
}

export const meetupService = new MeetupService();

