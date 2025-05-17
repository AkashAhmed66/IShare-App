import axios from 'axios';

// Replace this with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyCIYUPct8PuTHdhQMKkFPQ83Ktxhns5wFw';

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
    // For demo purposes, generate a mock route between the points
    // In production, you would use your backend server to make the API request

    // Calculate straight-line distance
    const lat1 = origin.latitude;
    const lon1 = origin.longitude;
    const lat2 = destination.latitude;
    const lon2 = destination.longitude;
    
    // Haversine formula to calculate distance
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    // Calculate estimated duration (assuming average speed of 30 km/h)
    const duration = Math.round(distance / 30 * 60); // Duration in minutes

    // Generate a route with some variance
    // We'll create points along the path with slight deviations to simulate a real road
    const numPoints = 8; // Number of points in our route
    const coordinates = [];
    
    for (let i = 0; i <= numPoints; i++) {
      // Interpolate between origin and destination
      const fraction = i / numPoints;
      
      // Add a slight randomness to make it look like a real route
      // For a more realistic route, you might use a curve algorithm
      const variance = 0.002 * Math.sin(fraction * Math.PI); // Max 0.002 degrees ~ 200m
      
      const lat = origin.latitude + fraction * (destination.latitude - origin.latitude) + variance;
      const lng = origin.longitude + fraction * (destination.longitude - origin.longitude) + variance;
      
      coordinates.push({
        latitude: lat,
        longitude: lng
      });
    }
    
    // Return the mock route data
    return {
      coordinates,
      distance: distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`,
      duration: duration < 60 ? `${duration} min` : `${Math.floor(duration / 60)} hr ${duration % 60} min`,
      startAddress: "Starting Point",
      endAddress: "Destination"
    };

    /* IMPORTANT: For production, implement this properly:
    const response = await axios.get('https://your-backend-server.com/api/directions', {
      params: {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode: 'driving'
      }
    });
    return response.data;
    */
  } catch (error) {
    console.error('Error fetching directions:', error);
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
    // For demo purposes, if we're running on a device/emulator with limited API access,
    // return some mock data that's dynamically generated from the query
    if (!query) return [];
    
    // Create mock results based on the search query for demonstration
    // In production, you would set up a proxy server to make the API calls
    const results = [
      {
        id: 'place_' + Math.random().toString(36).substring(7),
        name: query.charAt(0).toUpperCase() + query.slice(1) + ' Plaza',
        address: `${123 + query.length} ${query.charAt(0).toUpperCase() + query.slice(1)} Street, Anytown`,
        coordinates: {
          latitude: location ? location.latitude + 0.01 : 23.8103,
          longitude: location ? location.longitude + 0.01 : 90.4125
        },
        types: ['point_of_interest']
      },
      {
        id: 'place_' + Math.random().toString(36).substring(7),
        name: query.charAt(0).toUpperCase() + query.slice(1) + ' Mall',
        address: `${456 + query.length} Shopping Avenue, Anytown`,
        coordinates: {
          latitude: location ? location.latitude - 0.01 : 23.8203,
          longitude: location ? location.longitude - 0.01 : 90.4225
        },
        types: ['shopping_mall']
      },
      {
        id: 'place_' + Math.random().toString(36).substring(7),
        name: query.charAt(0).toUpperCase() + query.slice(1) + ' Park',
        address: `${789 + query.length} Nature Drive, Anytown`,
        coordinates: {
          latitude: location ? location.latitude + 0.02 : 23.8050,
          longitude: location ? location.longitude + 0.02 : 90.4050
        },
        types: ['park']
      }
    ];

    // In a real app, you would make a server-side request:
    // 1. Send the request to your own backend server
    // 2. Your server makes the request to Google Places API
    // 3. Your server returns the results to the client

    /* IMPORTANT: For production, implement this properly:
    const response = await axios.get('https://your-backend-server.com/api/places', {
      params: {
        query,
        lat: location?.latitude,
        lng: location?.longitude
      }
    });
    return response.data;
    */
    
    return results;
  } catch (error) {
    console.error('Error searching places:', error);
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
    // For demo purposes, return mock place details
    // In production, you would use a backend proxy server
    
    // Generate consistent details based on the placeId
    const idNum = placeId.split('_')[1] || '123';
    
    return {
      id: placeId,
      name: `Place ${idNum}`,
      address: `${idNum} Main Street, Anytown`,
      coordinates: {
        latitude: 23.8103 + (parseInt(idNum.substring(0, 2)) / 1000),
        longitude: 90.4125 + (parseInt(idNum.substring(0, 2)) / 1000)
      },
      types: ['point_of_interest']
    };

    /* IMPORTANT: For production, implement this properly:
    const response = await axios.get('https://your-backend-server.com/api/place-details', {
      params: {
        placeId
      }
    });
    return response.data;
    */
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
};

// Export the Maps Service as a singleton
const MapsService = {
  getDirections,
  searchPlaces,
  getPlaceDetails,
  decodePolyline
};

export default MapsService; 