export interface CurrentWeatherApiResponse {
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
