import React, { useState } from 'react';
import { ArrowLeft, Info, Activity, AlertCircle, Compass, ChevronRight, CheckCircle2 } from 'lucide-react';

const SectorIntel = ({ activeScenario, changeScreen, startTraining }) => {
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);

  if (!activeScenario) return null;

  const currentModule = activeScenario.availableModules[selectedModuleIndex];
  const data = activeScenario.neighborhoodData;

  return (
    <div className="view-container w-full max-w-5xl intel-wrapper">
      {/* Header Area */}
      <div className="intel-header">
        <button className="back-btn" onClick={() => changeScreen('BOSTON_MAP')}>
          <ArrowLeft size={18} className="mr-2"/> Back to Map
        </button>
        <div className="intel-title-area">
          <h1 className="intel-title">{activeScenario.location}</h1>
        </div>
      </div>

      <p className="intel-explainer">
        <Info size={18} className="mr-2"/> 
        This demographic and crime data is sourced publicly to provide real-world context for your training scenario.
      </p>

      {/* Intel Cards */}
      <div className="intel-grid">
        <div className="intel-card border-blue">
          <div className="intel-card-head"><Activity size={20}/> <h3>ARREST METRICS</h3></div>
          <div className="intel-data">
            <div className="data-row"><span>Total Arrests:</span> <strong>{data.total_arrests.toLocaleString()}</strong></div>
            <div className="data-row"><span>Juvenile Arrests:</span> <strong>{data.juvenile_arrests.toLocaleString()}</strong></div>
            <div className="data-row"><span>Juvenile Impact Rate:</span> <strong>{data.juvenile_percent}%</strong></div>
          </div>
        </div>

        <div className="intel-card border-amber">
          <div className="intel-card-head"><AlertCircle size={20}/> <h3>THREAT PROFILE</h3></div>
          <div className="intel-data">
            <div className="data-row"><span>Concerning Crimes:</span> <strong className="text-orange">{data.concerning_crimes.toLocaleString()}</strong></div>
            <div className="data-row"><span>High-Risk Ratio:</span> <strong className="text-orange">{data.concerning_crime_percent}%</strong></div>
            <div className="data-row" style={{marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed var(--border-main)"}}>
              <span>Zone Assessment:</span> 
              <strong style={{fontSize: '0.90rem', textAlign: 'right', maxWidth: '60%'}}>
                {data.concerning_crime_percent > 50 ? 'ELEVATED RISK' : 'STANDARD PATROL'}
              </strong>
            </div>
          </div>
        </div>

        <div className="intel-card border-slate">
          <div className="intel-card-head"><Compass size={20}/> <h3>TACTICAL OVERVIEW</h3></div>
          <div className="intel-data">
            <div className="data-row"><span>Interaction Level:</span> <strong>{data.interactionRate}</strong></div>
            <div className="data-row"><span>Coordinates:</span> <strong>{activeScenario.lat.toFixed(3)}, {activeScenario.lng.toFixed(3)}</strong></div>
            <div className="data-row" style={{marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed var(--border-main)"}}>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                 Prepare for encounters aligned with the neighborhood's specific crime profile.
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Selection Area */}
      <div className="module-selection-area">
        <h3 className="module-selection-title">SELECT TRAINING MODULE:</h3>
        
        <div className="module-tiles-grid">
          {activeScenario.availableModules.map((module, index) => {
            const isActive = selectedModuleIndex === index;
            return (
              <button 
                key={module.id || index}
                className={`module-tile ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedModuleIndex(index)}
              >
                <div className="module-tile-content">
                  <span className="module-tile-title">{module.title}</span>
                  {isActive && <CheckCircle2 size={18} className="active-icon" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="module-launch-bar">
          <p className="module-description">
            <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold', marginRight: '8px' }}>MISSION:</span>
            {currentModule?.description || "Learn how to safely and legally navigate this type of encounter."}
          </p>
          
          <button className="btn-launch" onClick={() => startTraining(currentModule)}>
            START MODULE <ChevronRight size={20} className="ml-2"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectorIntel;