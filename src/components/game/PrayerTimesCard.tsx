"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FajrIcon, DhuhrIcon, AsrIcon, MaghribIcon, IshaIcon, SunriseIcon } from '@/components/icons/prayer-time-icons';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise: string;
}

interface HijriDate {
  date: string;
  day: string;
  weekday: { en: string };
  month: { en: string };
  year: string;
}

interface CachedPrayerData {
  prayerTimes: PrayerTimes;
  hijriDate: HijriDate;
  location: string;
  timestamp: number;
}

export function PrayerTimesCard() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const CACHE_KEY = 'prayerTimesCache';
    const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

    const loadFromCache = () => {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { prayerTimes, hijriDate, location, timestamp } = JSON.parse(cachedData) as CachedPrayerData;
          if (Date.now() - timestamp < CACHE_DURATION) {
            setPrayerTimes(prayerTimes);
            setHijriDate(hijriDate);
            setLocation(location);
            setLoading(false);
            return true; // Cache is valid and used
          }
        }
      } catch (e) {
        console.error("Failed to read from cache", e);
      }
      return false; // Cache is invalid or non-existent
    };

    const saveDataToCache = (data: Omit<CachedPrayerData, 'timestamp'>) => {
      try {
        const cacheData: CachedPrayerData = { ...data, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (e) {
        console.error("Failed to save to cache", e);
      }
    };

    const fetchPrayerTimes = (latitude: number, longitude: number) => {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      axios.get(`https://api.aladhan.com/v1/calendar/${year}/${month}`, {
        params: { latitude, longitude, method: 2 } // ISNA
      })
      .then(response => {
        const data = response.data.data;
        const todayData = data[day-1];
        const newPrayerTimes = todayData.timings;
        const newHijriDate = todayData.date.hijri;
        
        setPrayerTimes(newPrayerTimes);
        setHijriDate(newHijriDate);
        
        // Fetch location and then save to cache
        axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          .then(res => {
            const newLocation = `${res.data.city}, ${res.data.countryCode}`;
            setLocation(newLocation);
            saveDataToCache({ prayerTimes: newPrayerTimes, hijriDate: newHijriDate, location: newLocation });
          })
          .catch(err => {
            console.error("Error fetching city name:", err);
            setLocation("Unknown Location");
            // Still save other data to cache
            saveDataToCache({ prayerTimes: newPrayerTimes, hijriDate: newHijriDate, location: "Unknown Location" });
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch(err => {
        console.error("Error fetching prayer times:", err);
        setError("Could not fetch prayer times. Please try again later.");
        setLoading(false);
      });
    };
    
    // Main logic
    const cacheLoaded = loadFromCache();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchPrayerTimes(latitude, longitude);
        },
        err => {
          if (!cacheLoaded) { // Only show error if there's no cached data to display
            setError("Please enable location services to see prayer times.");
            setLoading(false);
          }
        }
      );
    } else {
       if (!cacheLoaded) {
          setError("Geolocation is not supported by your browser.");
          setLoading(false);
       }
    }
  }, []);

  const prayerIcons = {
    Fajr: <FajrIcon className="h-6 w-6 text-primary" />,
    Sunrise: <SunriseIcon className="h-6 w-6 text-primary" />,
    Dhuhr: <DhuhrIcon className="h-6 w-6 text-primary" />,
    Asr: <AsrIcon className="h-6 w-6 text-primary" />,
    Maghrib: <MaghribIcon className="h-6 w-6 text-primary" />,
    Isha: <IshaIcon className="h-6 w-6 text-primary" />,
  };
  
  const prayerOrder: (keyof PrayerTimes)[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardContent className="pt-6">
        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <Skeleton className="h-5 w-1/3" />
                 <Skeleton className="h-5 w-1/4" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          </div>
        ) : error && !prayerTimes ? ( // Only show error if there are no prayer times to display
           <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Location Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : prayerTimes ? (
          <div className="space-y-4">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-card-foreground">{location || <Skeleton className="h-4 w-24" />}</span>
                </div>
                {hijriDate && (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-card-foreground">
                            {hijriDate.day} {hijriDate.month.en}, {hijriDate.year} AH
                        </span>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-4">
              {prayerTimes && prayerOrder.map(key => (
                <div key={key} className="flex flex-col items-center justify-center p-2 bg-secondary/50 rounded-lg space-y-1">
                  {prayerIcons[key]}
                  <span className="font-bold text-secondary-foreground text-sm">{key}</span>
                  <span className="text-sm text-muted-foreground">{prayerTimes[key]}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
