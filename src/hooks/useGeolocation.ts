import { useState, useEffect } from 'react';

interface GeolocationState {
  lat: number | null;
  lon: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lon: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation is not supported by your browser.' }));
      return;
    }

    setState((s) => ({ ...s, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState({
          lat: null,
          lon: null,
          error: err.message,
          loading: false,
        });
      },
      { timeout: 10000 }
    );
  }, []);

  return state;
}
