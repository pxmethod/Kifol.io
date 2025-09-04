'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { eventService, Event } from '@/lib/services/events';
import { meetupService } from '@/lib/services/meetup';
import { userService, eventReminderService } from '@/lib/database';
import EventTemplateModal from '@/components/EventTemplateModal';
import Toast from '@/components/Toast';

export default function WhatsHappeningPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [userCity, setUserCity] = useState<string>('');
  const [userState, setUserState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [error, setError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [userReminders, setUserReminders] = useState<Set<string>>(new Set());
  const [meetupEvents, setMeetupEvents] = useState<Event[]>([]);
  const [meetupConnected, setMeetupConnected] = useState(false);
  const [meetupLoading, setMeetupLoading] = useState(false);

  // Redirect unauthenticated users to marketing site
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Handle Meetup OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const meetupToken = urlParams.get('meetup_token');
    const error = urlParams.get('error');

    if (error) {
      setError(`Meetup authentication failed: ${error}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (meetupToken) {
      meetupService.setAccessToken(meetupToken);
      setMeetupConnected(true);
      setToastMessage('Successfully connected to Meetup!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Reload events to include Meetup events
      if (userCity && userState) {
        loadMeetupEvents(userCity, userState);
      }
    }
  }, [userCity, userState]);

  // Handle Meetup authentication
  const handleMeetupConnect = () => {
    try {
      const authUrl = meetupService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to initiate Meetup OAuth:', error);
      setError('Failed to connect to Meetup. Please try again.');
    }
  };

  // Load Meetup events
  const loadMeetupEvents = async (city: string, state: string) => {
    if (!meetupConnected || !city || !state) return;

    try {
      setMeetupLoading(true);
      const location = `${city}, ${state}`;
      const meetupResults = await meetupService.searchEvents({
        location,
        radius: 20,
        limit: 20,
      });

      const transformedEvents = meetupResults.map(event => meetupService.transformEvent(event));
      setMeetupEvents(transformedEvents);
    } catch (error) {
      console.error('Failed to load Meetup events:', error);
      setError('Failed to load Meetup events. Please try again.');
    } finally {
      setMeetupLoading(false);
    }
  };

  // Load user's city and state from profile and fetch events
  useEffect(() => {
    const loadUserLocationAndEvents = async () => {
      if (user) {
        try {
          setLoading(true);
          setError('');
          
          // Debug: Check environment variable
          console.log('=== ENVIRONMENT DEBUG ===');
          console.log('NEXT_PUBLIC_TICKETMASTER_API_KEY exists:', !!process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY);
          console.log('========================');
          
          // Load user's city and state from profile
          const userProfile = await userService.getCurrentUser();
          const city = userProfile?.city || '';
          const state = userProfile?.state || '';
          setUserCity(city);
          setUserState(state);
          
          // Only fetch events if we have both city and state
          if (city && state) {
            const locationEvents = await eventService.searchEvents({
              city: `${city}, ${state}`,
              radius: 20,
              limit: 20
            });
            
            setEvents(locationEvents);
            
            // Load Meetup events if connected
            await loadMeetupEvents(city, state);
            
            // Show success message if location was loaded from profile
            setToastMessage(`Location loaded: ${city}, ${state}`);
            setShowToast(true);
            setTimeout(() => {
              setShowToast(false);
            }, 3000);
          } else {
            setEvents([]);
          }
        } catch (err) {
          console.error('Failed to load events:', err);
          setError('Failed to load events. Please try again later.');
          setEvents([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserLocationAndEvents();
  }, [user]);

  // Load user's event reminders
  useEffect(() => {
    const loadUserReminders = async () => {
      if (user) {
        try {
          const reminders = await eventReminderService.getUserReminders(user.id);
          const eventIds: Set<string> = new Set(reminders.map((reminder: { event_id: string }) => reminder.event_id));
          setUserReminders(eventIds);
        } catch (error) {
          console.error('Failed to load user reminders:', error);
        }
      }
    };

    loadUserReminders();
  }, [user]);

  // Handle reminder toggle
  const handleReminderToggle = async (event: Event) => {
    if (!user) return;

    try {
      const isReminded = userReminders.has(event.id);
      
      if (isReminded) {
        // Remove reminder
        await eventReminderService.deleteReminder(user.id, event.id);
        setUserReminders(prev => {
          const newSet = new Set(prev);
          newSet.delete(event.id);
          return newSet;
        });
        setToastMessage('Reminder removed');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        // Add reminder
        await eventReminderService.createReminder({
          user_id: user.id,
          event_id: event.id,
          event_title: event.title,
          event_date: event.startDate.split('T')[0],
          event_location: event.location
        });
        setUserReminders(prev => new Set(prev).add(event.id));
        setToastMessage('Reminder set! We&apos;ll follow up after the event');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
      setToastMessage('Failed to update reminder status');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Handle location change and fetch new events
  const handleLocationChange = async () => {
    if (!userCity || !userState) {
      setEvents([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Debug: Check user authentication status
      console.log('Current user from context:', user);
      console.log('User ID:', user?.id);
      console.log('User email:', user?.email);
      
      if (!user) {
        throw new Error('No user found in context');
      }
      
      // Save location to user profile in database
      try {
        console.log('Attempting to update user profile with:', { city: userCity, state: userState });
        await userService.updateUser({
          city: userCity,
          state: userState
        });
        console.log('User profile updated successfully');
      } catch (updateError) {
        console.error('Failed to update user profile:', updateError);
        
        // Try to create user profile if it doesn't exist
        try {
          console.log('Attempting to create user profile with:', { city: userCity, state: userState });
          await userService.createUser({
            city: userCity,
            state: userState
          });
          console.log('User profile created successfully');
        } catch (createError) {
          console.error('Failed to create user profile:', createError);
          throw new Error(`Failed to save location: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
        }
      }
      
      // Fetch events for the new location
      const locationEvents = await eventService.searchEvents({
        city: `${userCity}, ${userState}`,
        radius: 20,
        limit: 20
      });
      
      setEvents(locationEvents);
      setToastMessage('Location updated successfully!');
      setShowToast(true);
      
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
    } catch (err) {
      console.error('Failed to update location or load events:', err);
      setError(err instanceof Error ? err.message : 'Failed to update location. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-kifolio-bg">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner size="lg" label="Loading..." />
          </div>
        </main>
      </div>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const categories = ['all', 'Arts & Crafts', 'Education', 'Sports', 'Entertainment', 'Technology'];

  // Combine Ticketmaster and Meetup events
  const allEvents = [...events, ...meetupEvents];
  
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToPortfolio = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCreateAchievement = async (achievementData: {
    title: string;
    description: string;
    category: string;
    date: string;
    imageUrl?: string;
  }) => {
    try {
      // TODO: Implement actual achievement creation
      // For now, just show a success message
      console.log('Creating achievement:', achievementData);
      
      setToastMessage('Achievement created successfully!');
      setShowToast(true);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to create achievement:', error);
      setToastMessage('Failed to create achievement. Please try again.');
      setShowToast(true);
      
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-kifolio-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-kifolio-text">
            What&apos;s Happening
          </h1>
          <p className="text-md text-gray-600">
            Discover amazing activities for kids and teens in your area
          </p>
        </div>

            {/* Meetup Integration Section */}
            {!loading && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-kifolio-primary to-kifolio-cta rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Discover More Activities</h3>
                      <p className="text-white/90">
                        Connect with Meetup to find local art classes, science workshops, coding camps, and family activities in your area.
                      </p>
                    </div>
                    <div className="ml-6">
                      {!meetupConnected ? (
                        <button
                          onClick={handleMeetupConnect}
                          className="bg-white text-kifolio-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                          Connect Meetup
                        </button>
                      ) : (
                        <div className="text-center">
                          <div className="text-green-200 text-sm mb-2">✓ Connected</div>
                          <button
                            onClick={() => {
                              setMeetupConnected(false);
                              setMeetupEvents([]);
                              meetupService.setAccessToken('');
                            }}
                            className="text-white/80 hover:text-white text-sm underline"
                          >
                            Disconnect
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}        

        {/* Location Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Your Location</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                value={userCity}
                onChange={(e) => setUserCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kifolio-primary focus:border-transparent"
                placeholder="Enter your city"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                id="state"
                value={userState}
                onChange={(e) => setUserState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kifolio-primary focus:border-transparent"
              >
                <option value="">Select State</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleLocationChange}
            disabled={!userCity || !userState}
            className="btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Update Location
          </button>
        </div>

        {/* No Location Set Message */}
        {!userCity || !userState ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Set Your Location</h3>
            <p className="text-gray-600">
              Please set your city and state above to discover local events.
            </p>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kifolio-primary focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div className="md:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kifolio-primary focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" label="Loading events..." />
              </div>
            )}

            {/* Events Grid */}
            {!loading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <div 
                    key={event.id} 
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    {/* Event Image */}
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p>No Image</p>
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block bg-kifolio-primary/10 text-kifolio-primary text-sm font-medium px-3 py-1 rounded-full">
                            {event.category}
                          </span>
                          <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                            event.source === 'meetup' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {event.source === 'meetup' ? 'Meetup' : 'Ticketmaster'}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-kifolio-text mb-2">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {event.description}
                        </p>
                      </div>

                      {/* Event Info */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(event.startDate)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Ages {event.ageRange}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          {event.cost}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleReminderToggle(event)}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            userReminders.has(event.id)
                              ? 'bg-[#52C889] hover:bg-[#45B37A] text-white'
                              : 'bg-kifolio-primary hover:bg-kifolio-primary-dark text-white'
                          }`}
                        >
                          {userReminders.has(event.id) ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Going
                            </span>
                          ) : (
                            "I'm Going"
                          )}
                        </button>
                        {(event.ticketmasterUrl || event.meetupUrl) && (
                          <a
                            href={event.ticketmasterUrl || event.meetupUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border border-kifolio-primary text-kifolio-primary hover:bg-kifolio-primary hover:text-white rounded-lg font-medium transition-colors"
                          >
                            Learn More
                          </a>
                        )}
                      </div>
                      
                      {/* Reminder Subtext */}
                      {userReminders.has(event.id) && (
                        <p className="text-sm text-gray-600 mt-2 text-center">
                          We&apos;ll send you a reminder after this event to log your child&apos;s achievements.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or category filters to find more events.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Event Template Modal */}
      <EventTemplateModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={handleCreateAchievement}
      />

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          variant="success"
          isVisible={showToast}
          onDismiss={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
