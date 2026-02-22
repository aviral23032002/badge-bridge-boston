import React from 'react';
import { BookOpen, Sun, Moon } from 'lucide-react';

const NavBar = ({ screen, globeState, isLightMode, setIsLightMode }) => {
  return (
    <nav className="top-nav">
      <div className="logo">
        <BookOpen size={24} className="accent-icon" />
        <span>BADGE BRIDGE BOSTON</span>
      </div>
      
      <div className="nav-actions">
        <div className="status-badge">
          <div className="live-dot"></div>
          <span className="hide-mobile font-medium">
            {screen === 'GLOBE' && globeState === 'IDLE' && "COMMUNITY DASHBOARD"}
            {screen === 'GLOBE' && globeState !== 'IDLE' && "ISOLATING SECTOR"}
            {/* UPDATED THIS LINE: */}
            {screen === 'BOSTON_MAP' && "SELECT NEIGHBORHOOD"}
            {screen === 'INTEL' && "NEIGHBORHOOD CONTEXT"}
            {screen === 'TRAINING' && "ACTIVE LEARNING MODULE"}
          </span>
        </div>
        
        <button 
          className="theme-toggle" 
          onClick={() => setIsLightMode(!isLightMode)}
          title="Toggle Light/Dark Mode"
        >
          {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;