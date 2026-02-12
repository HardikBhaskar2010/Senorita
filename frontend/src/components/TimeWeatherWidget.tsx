import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind, CloudFog, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface WeatherData {
  temp_c: number;
  condition: {
    text: string;
    code: number;
  };
  humidity: number;
  wind_kph: number;
}

const TimeWeatherWidget = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<{ city: string; country: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [romanticMessage, setRomanticMessage] = useState("");

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // Fetch weather from WeatherAPI.com
              const response = await fetch(
                `https://api.weatherapi.com/v1/current.json?key=b8fbeea9b01548e9ad9225335261202&q=${latitude},${longitude}`
              );
              
              if (response.ok) {
                const data = await response.json();
                setWeather(data.current);
                setLocation({
                  city: data.location.name,
                  country: data.location.country
                });
                setRomanticMessage(getRomanticWeatherMessage(data.current.condition.text, data.current.temp_c));
              }
              setLoading(false);
            },
            () => {
              // Fallback to default location if geolocation fails
              fetchDefaultWeather();
            }
          );
        } else {
          fetchDefaultWeather();
        }
      } catch (error) {
        console.error("Error fetching weather:", error);
        setLoading(false);
      }
    };

    const fetchDefaultWeather = async () => {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=b8fbeea9b01548e9ad9225335261202&q=auto:ip`
        );
        
        if (response.ok) {
          const data = await response.json();
          setWeather(data.current);
          setLocation({
            city: data.location.name,
            country: data.location.country
          });
          setRomanticMessage(getRomanticWeatherMessage(data.current.condition.text, data.current.temp_c));
        }
      } catch (error) {
        console.error("Error fetching default weather:", error);
      }
      setLoading(false);
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const weatherInterval = setInterval(fetchWeather, 1800000);

    return () => clearInterval(weatherInterval);
  }, []);

  // Get romantic weather message
  const getRomanticWeatherMessage = (condition: string, temp: number): string => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return "☀️ Perfect sunshine for a romantic stroll together";
    } else if (conditionLower.includes('cloud')) {
      return "☁️ Cozy weather for cuddling under blankets";
    } else if (conditionLower.includes('rain')) {
      return "🌧️ Rainy day romance - perfect for dancing in the rain";
    } else if (conditionLower.includes('snow')) {
      return "❄️ Snowy magic - time to build a snowman together";
    } else if (conditionLower.includes('mist') || conditionLower.includes('fog')) {
      return "🌫️ Mysterious weather, perfect for holding hands tight";
    } else if (conditionLower.includes('wind')) {
      return "💨 Breezy day - let me be your shelter";
    } else if (temp > 25) {
      return "🌡️ Warm and lovely - just like your smile";
    } else if (temp < 10) {
      return "🧊 Chilly outside - let me keep you warm";
    } else {
      return "💕 Beautiful weather for making memories together";
    }
  };

  // Get weather icon
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return <Sun className="w-12 h-12 text-yellow-400" />;
    } else if (conditionLower.includes('rain')) {
      return <CloudRain className="w-12 h-12 text-blue-400" />;
    } else if (conditionLower.includes('snow')) {
      return <CloudSnow className="w-12 h-12 text-blue-200" />;
    } else if (conditionLower.includes('drizzle')) {
      return <CloudDrizzle className="w-12 h-12 text-blue-300" />;
    } else if (conditionLower.includes('wind')) {
      return <Wind className="w-12 h-12 text-gray-400" />;
    } else if (conditionLower.includes('mist') || conditionLower.includes('fog')) {
      return <CloudFog className="w-12 h-12 text-gray-300" />;
    } else {
      return <Cloud className="w-12 h-12 text-gray-400" />;
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 22) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  // Format date and time
  const formatDateTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return currentTime.toLocaleString('en-US', options);
  };

  return (
    <motion.div
      className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-lg backdrop-blur-sm relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background orb */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      
      <div className="relative z-10 space-y-4">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            {getGreeting()} 💕
          </h3>
        </motion.div>

        {/* Date and Time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <p className="text-lg md:text-xl font-semibold text-foreground">
              {formatDateTime()}
            </p>
          </div>
        </motion.div>

        {/* Weather Section */}
        {loading ? (
          <div className="flex items-center gap-3 mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading weather...</p>
          </div>
        ) : weather && location ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    {getWeatherIcon(weather.condition.text)}
                  </motion.div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{Math.round(weather.temp_c)}°C</p>
                    <p className="text-sm text-muted-foreground">{weather.condition.text}</p>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>📍 {location.city}, {location.country}</p>
                  <p>💧 Humidity: {weather.humidity}%</p>
                  <p>💨 Wind: {Math.round(weather.wind_kph)} km/h</p>
                </div>
              </div>
            </div>

            {/* Romantic Weather Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 p-3 rounded-xl bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-purple-500/10 border border-pink-500/20"
            >
              <p className="text-sm font-medium text-foreground italic">
                {romanticMessage}
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground">Weather data unavailable</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TimeWeatherWidget;
