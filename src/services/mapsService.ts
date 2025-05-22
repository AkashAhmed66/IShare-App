import axios from 'axios';

// Replace this with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AlzaSyM2UhGcgh7zeSvJiTtYIEnq4ACUZd4b52R';

// Optional proxy URL to avoid CORS issues in development - you can set this to your backend proxy
// For mobile apps, this is typically not needed since requests come directly from the device
const PROXY_URL = ''; // Leave empty to make direct requests

/**
 * Build a URL for Google Maps API requests, optionally using a proxy
 * @param endpoint The API endpoint path
 * @param params The query parameters
 * @returns The complete URL
 */
const buildApiUrl = (endpoint: string, params: Record<string, string>) => {
  // Add API key to params
  params.key = GOOGLE_MAPS_API_KEY;
  
  // Build query string
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  // Base Google Maps API URL
  const googleApiUrl = `https://maps.gomaps.pro/maps/api/${endpoint}?${queryString}`;
  
  // Use proxy if specified, otherwise use direct URL
  return PROXY_URL ? `${PROXY_URL}${encodeURIComponent(googleApiUrl)}` : googleApiUrl;
};

// Type definitions for Google Maps responses
interface DirectionStep {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  end_location: { lat: number; lng: number };
  start_location: { lat: number; lng: number };
  html_instructions: string;
  polyline: { points: string };
  travel_mode: string;
}

interface DirectionLeg {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  end_address: string;
  start_address: string;
  end_location: { lat: number; lng: number };
  start_location: { lat: number; lng: number };
  steps: DirectionStep[];
}

interface DirectionRoute {
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  legs: DirectionLeg[];
  overview_polyline: { points: string };
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}

interface DirectionsResponse {
  routes: DirectionRoute[];
  status: string;
}

interface PlacesResult {
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  name: string;
  place_id: string;
  types: string[];
}

interface PlacesResponse {
  results: PlacesResult[];
  status: string;
}

/**
 * Decode Google Maps encoded polyline into an array of coordinates
 * @param encoded The encoded polyline string
 * @returns Array of latitude/longitude coordinates
 */
export const decodePolyline = (encoded: string) => {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5
    });
  }

  return points;
};

/**
 * Get directions between two locations
 * @param origin Starting location (latitude, longitude)
 * @param destination Ending location (latitude, longitude)
 * @returns Array of coordinates representing the route
 */
export const getDirections = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) => {
  try {
    // Prepare parameters
    const params: Record<string, string> = {
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
      mode: 'driving'
    };
    
    // Build URL using our helper
    const url = buildApiUrl('directions/json', params);
    console.log('Directions API request URL:', url);
    
    const response = await axios.get(url);

    // Log detailed response for debugging
    console.log('Directions API response status:', response.data.status);
    console.log('Directions API response error_message:', response.data.error_message);
    
    if (response.data.status !== 'OK') {
      console.error('Directions API error:', {
        status: response.data.status,
        error_message: response.data.error_message,
        url: url,
        apiKey: `${GOOGLE_MAPS_API_KEY.substring(0, 5)}...${GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 4)}`,
        fullResponse: JSON.stringify(response.data)
      });
      throw new Error(`Directions API error: ${response.data.status} - ${response.data.error_message || 'No error message provided'}`);
    }

    // Extract route information
    const route = response.data.routes[0];
    const leg = route.legs[0];
    
    // Decode the polyline to get coordinates
    const coordinates = decodePolyline(route.overview_polyline.points);
    
    // Return the route data in our app's format
    return {
      coordinates,
      distance: leg.distance.text,
      duration: leg.duration.text,
      startAddress: leg.start_address,
      endAddress: leg.end_address
    };
  } catch (error) {
    console.error('Error fetching directions:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    throw error;
  }
};

/**
 * Search for places based on query text
 * @param query The search query
 * @param location Optional current location to bias results
 * @returns Array of place suggestions
 */
export const searchPlaces = async (
  query: string,
  location?: { latitude: number; longitude: number }
) => {
  try {
    if (!query) return [];

    // Prepare parameters
    const params: Record<string, string> = {
      query: query
    };
    
    // Add location bias if provided
    if (location) {
      params.location = `${location.latitude},${location.longitude}`;
      params.radius = '50000';
    }
    
    // Build URL using our helper
    const url = buildApiUrl('place/textsearch/json', params);
    console.log('Places API request URL:', url);
    
    const response = await axios.get(url);

    // Log detailed response for debugging
    console.log('Places API response status:', response.data.status);
    console.log('Places API response error_message:', response.data.error_message);
    
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      console.error('Places API error:', {
        status: response.data.status,
        error_message: response.data.error_message,
        url: url,
        apiKey: `${GOOGLE_MAPS_API_KEY.substring(0, 5)}...${GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 4)}`,
        fullResponse: JSON.stringify(response.data)
      });
      throw new Error(`Places API error: ${response.data.status} - ${response.data.error_message || 'No error message provided'}`);
    }

    // Format the response data to match our app's expected format
    return response.data.results.map((place: PlacesResult) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng
      },
      types: place.types
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    throw error;
  }
};

/**
 * Get details for a specific place by its ID
 * @param placeId The Google Place ID
 * @returns Detailed place information
 */
export const getPlaceDetails = async (placeId: string) => {
  try {
    // Prepare parameters
    const params: Record<string, string> = {
      place_id: placeId,
      fields: 'name,formatted_address,geometry,types'
    };
    
    // Build URL using our helper
    const url = buildApiUrl('place/details/json', params);
    console.log('Place Details API request URL:', url);
    
    const response = await axios.get(url);

    // Log detailed response for debugging
    console.log('Place Details API response status:', response.data.status);
    console.log('Place Details API response error_message:', response.data.error_message);
    
    if (response.data.status !== 'OK') {
      console.error('Place Details API error:', {
        status: response.data.status,
        error_message: response.data.error_message,
        url: url,
        apiKey: `${GOOGLE_MAPS_API_KEY.substring(0, 5)}...${GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 4)}`,
        fullResponse: JSON.stringify(response.data)
      });
      throw new Error(`Place Details API error: ${response.data.status} - ${response.data.error_message || 'No error message provided'}`);
    }

    const placeDetails = response.data.result;
    
    return {
      id: placeId,
      name: placeDetails.name,
      address: placeDetails.formatted_address,
      coordinates: {
        latitude: placeDetails.geometry.location.lat,
        longitude: placeDetails.geometry.location.lng
      },
      types: placeDetails.types
    };
  } catch (error) {
    console.error('Error fetching place details:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    throw error;
  }
};

/**
 * Test the Google Maps API key to check if it's valid and has the necessary permissions
 * @returns A promise that resolves to true if the key is valid
 */
export const testGoogleMapsApiKey = async () => {
  try {
    console.log('Testing Google Maps API key...');
    console.log(`API Key starts with: ${GOOGLE_MAPS_API_KEY.substring(0, 5)}...`);
    
    // Prepare a simple test query
    const params: Record<string, string> = {
      query: 'test'
    };
    
    // Build the test URL
    const url = buildApiUrl('place/textsearch/json', params);
    console.log('API Key test URL:', url);
    
    // Test the API key with a simple Places API request
    const response = await axios.get(url);
    
    console.log('API Key test response status:', response.data.status);
    console.log('API Key test response error_message:', response.data.error_message || 'No error message');
    console.log('API Key test full response:', JSON.stringify(response.data));
    
    return {
      valid: response.data.status === 'OK' || response.data.status === 'ZERO_RESULTS',
      status: response.data.status,
      error_message: response.data.error_message || 'No error message'
    };
  } catch (error) {
    console.error('Error testing Google Maps API key:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: JSON.stringify(error.response?.data),
        message: error.message
      });
    }
    return {
      valid: false,
      status: 'ERROR',
      error_message: error.message
    };
  }
};

// Export the Maps Service as a singleton
const MapsService = {
  getDirections,
  searchPlaces,
  getPlaceDetails,
  decodePolyline,
  testGoogleMapsApiKey
};

export default MapsService; 
