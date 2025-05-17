export interface CurrentWeatherApiResponse {
  location: Location;
  current: Current;
}

export interface WeatherApiError {
  error: {
    code: number;
  };
}

interface Current {
  temp_c: number;
  humidity: number;

  condition: Condition;
}

interface Condition {
  text: string;
}

interface Location {
  name: string;
}
