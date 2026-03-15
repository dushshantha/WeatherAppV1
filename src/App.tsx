import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import WeatherSearchScreen from './screens/WeatherSearchScreen';
import { ThemeProvider } from './context/ThemeContext';

type Screen = 'home' | 'search';

function AppInner() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  return (
    <div style={{ position: 'relative', width: '100%', height: '100svh', overflow: 'hidden' }}>
      {/* Home screen — slides out left when navigating to search */}
      <div
        className={`screen-slide ${currentScreen === 'home' ? 'screen-visible' : 'screen-exit-left'}`}
      >
        <HomeScreen onNavigateToSearch={() => setCurrentScreen('search')} />
      </div>

      {/* Search screen — slides in from right */}
      <div
        className={`screen-slide ${currentScreen === 'search' ? 'screen-visible' : 'screen-enter-right'}`}
      >
        <WeatherSearchScreen onBack={() => setCurrentScreen('home')} />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

export default App;
