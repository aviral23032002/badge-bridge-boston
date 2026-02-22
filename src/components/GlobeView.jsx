import React from 'react';
import Globe from 'react-globe.gl';
import { ChevronRight, Target } from 'lucide-react';
import { BOSTON_HOTSPOTS } from '../data/mockData';

const GlobeView = ({ globeRef, isLightMode, globeState, triggerZoomToBoston, changeScreen }) => {
  return (
    <div className="globe-fullscreen">
      <Globe
        ref={globeRef}
        globeImageUrl={isLightMode 
          ? "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" 
          : "//unpkg.com/three-globe/example/img/earth-night.jpg"}
        backgroundColor="rgba(0,0,0,0)"
        ringsData={globeState === 'HOTSPOTS' ? BOSTON_HOTSPOTS : []}
        ringColor={() => isLightMode ? '#cc0033' : '#ff0055'}
        ringMaxRadius="weight"
        ringPropagationSpeed={2}
        ringRepeatPeriod={800}
      />
      
      <div className="globe-ui-overlay">
        {globeState === 'IDLE' && (
          <div className="flex-col-center fade-in-up"> 
            <h1 className="hacker-title">GLOBAL JURISDICTION DATABASE</h1>
            <button className="btn-terminal mt-8" onClick={triggerZoomToBoston}>
              SCAN BOSTON, MA <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobeView;