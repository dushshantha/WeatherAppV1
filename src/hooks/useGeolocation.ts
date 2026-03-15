import { useState, useCallback } from 'react';

export interface GeolocationState {
  lat: number | null;
  lon: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeolocationState & { getLocation: () => void } {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lon: null,
    error: null,
    loading: false,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by your browser.' }));
      return;
    }

    setState({ lat: null, lon: null, error: null, loading: true });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (err) => {
        let message = 'Unable to determine your location.';
        if (err.code === err.PERMISSION_DENIED) {
          message = 'Location access denied. Please enable location permissions.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable.';
        } else if (err.code === err.TIMEOUT) {
          message = 'Location request timed out.';
        }
        setState({ lat: null, lon: null, error: message, loading: false });
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return { ...state, getLocation };
}
