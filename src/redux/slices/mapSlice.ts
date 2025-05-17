import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { highDemandAreas, availableDrivers } from '../../utils/dummyData';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface HighDemandArea {
  id: string;
  name: string;
  coordinates: Coordinates;
  radius: number;
  demandLevel: number;
}

interface Driver {
  id: string;
  name: string;
  rating: number;
  car: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  location: Coordinates;
  distance: string;
}

interface MapState {
  currentLocation: Coordinates | null;
  region: Region;
  isLocationLoading: boolean;
  locationError: string | null;
  routeCoordinates: Coordinates[];
  isRouteLoading: boolean;
  routeError: string | null;
  estimatedTime: number | null;
  estimatedDistance: number | null;
  highDemandAreas: HighDemandArea[];
  nearbyDrivers: Driver[];
  showDemandHeatmap: boolean;
  selectedDriver: Driver | null;
}

// Default region (San Francisco)
const defaultRegion = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const initialState: MapState = {
  currentLocation: null,
  region: defaultRegion,
  isLocationLoading: false,
  locationError: null,
  routeCoordinates: [],
  isRouteLoading: false,
  routeError: null,
  estimatedTime: null,
  estimatedDistance: null,
  highDemandAreas: highDemandAreas,
  nearbyDrivers: availableDrivers,
  showDemandHeatmap: true,
  selectedDriver: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<Coordinates>) => {
      state.currentLocation = action.payload;
      
      // Also update the map region to center on the current location
      state.region = {
        ...state.region,
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      };
    },
    setRegion: (state, action: PayloadAction<Region>) => {
      state.region = action.payload;
    },
    locationLoading: (state) => {
      state.isLocationLoading = true;
      state.locationError = null;
    },
    locationSuccess: (state, action: PayloadAction<Coordinates>) => {
      state.currentLocation = action.payload;
      state.region = {
        ...state.region,
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      };
      state.isLocationLoading = false;
    },
    locationFailure: (state, action: PayloadAction<string>) => {
      state.isLocationLoading = false;
      state.locationError = action.payload;
    },
    setRouteCoordinates: (state, action: PayloadAction<Coordinates[]>) => {
      state.routeCoordinates = action.payload;
    },
    routeLoading: (state) => {
      state.isRouteLoading = true;
      state.routeError = null;
    },
    routeSuccess: (
      state,
      action: PayloadAction<{
        coordinates: Coordinates[];
        time: number;
        distance: number;
      }>
    ) => {
      state.routeCoordinates = action.payload.coordinates;
      state.estimatedTime = action.payload.time;
      state.estimatedDistance = action.payload.distance;
      state.isRouteLoading = false;
    },
    routeFailure: (state, action: PayloadAction<string>) => {
      state.isRouteLoading = false;
      state.routeError = action.payload;
    },
    clearRoute: (state) => {
      state.routeCoordinates = [];
      state.estimatedTime = null;
      state.estimatedDistance = null;
    },
    setHighDemandAreas: (state, action: PayloadAction<HighDemandArea[]>) => {
      state.highDemandAreas = action.payload;
    },
    updateHighDemandAreas: (state, action: PayloadAction<HighDemandArea>) => {
      const index = state.highDemandAreas.findIndex(area => area.id === action.payload.id);
      if (index !== -1) {
        state.highDemandAreas[index] = action.payload;
      } else {
        state.highDemandAreas.push(action.payload);
      }
    },
    setNearbyDrivers: (state, action: PayloadAction<Driver[]>) => {
      state.nearbyDrivers = action.payload;
    },
    updateDriverLocation: (
      state,
      action: PayloadAction<{ driverId: string; location: Coordinates }>
    ) => {
      const driverIndex = state.nearbyDrivers.findIndex(
        (driver) => driver.id === action.payload.driverId
      );
      if (driverIndex !== -1) {
        state.nearbyDrivers[driverIndex].location = action.payload.location;
      }
    },
    toggleDemandHeatmap: (state) => {
      state.showDemandHeatmap = !state.showDemandHeatmap;
    },
    selectDriver: (state, action: PayloadAction<Driver | null>) => {
      state.selectedDriver = action.payload;
    },
  },
});

export const {
  setCurrentLocation,
  setRegion,
  locationLoading,
  locationSuccess,
  locationFailure,
  setRouteCoordinates,
  routeLoading,
  routeSuccess,
  routeFailure,
  clearRoute,
  setHighDemandAreas,
  updateHighDemandAreas,
  setNearbyDrivers,
  updateDriverLocation,
  toggleDemandHeatmap,
  selectDriver,
} = mapSlice.actions;

export default mapSlice.reducer; 