import React from 'react';
import { ArrowLeft, Info, Activity, AlertCircle, Compass, ChevronRight } from 'lucide-react';

const SectorIntel = ({ activeScenario, changeScreen, startTraining }) => {
  if (!activeScenario) return null;

  return (
    <div className="view-container w-full max-w-5xl intel-wrapper">
      <div className="intel-header">
        {/* Changed routing back to the BOSTON_MAP so it flows perfectly */}
        <button className="back-btn" onClick={() => changeScreen('BOSTON_MAP')}>
          <ArrowLeft size={18} className="mr-2"/> Back to Map
        </button>
        <div className="intel-title-area">
          <h1 className="intel-title">{activeScenario.location}</h1>
          <div className={`rate-badge ${activeScenario.neighborhoodData.interactionRate === 'HIGH' ? 'rate-high' : 'rate-avg'}`}>
            INTERACTION RATE: {activeScenario.neighborhoodData.interactionRate}
          </div>
        </div>
      </div>

      <p className="intel-explainer">
        <Info size={18} className="mr-2"/> 
        This data is sourced publicly from the BPD Open Data Portal and MA POST Commission to provide real-world context before your training.
      </p>

      <div className="intel-grid">
        <div className="intel-card border-blue">
          <div className="intel-card-head"><Activity size={20}/> <h3>FIELD STOPS (FIO)</h3></div>
          <div className="intel-data">
            <div className="data-row"><span>Total Stops YTD:</span> <strong>{activeScenario.neighborhoodData.fioData.stops}</strong></div>
            <div className="data-row"><span>Search/Frisk Rate:</span> <strong>{activeScenario.neighborhoodData.fioData.friskRate}</strong></div>
            <div className="data-row"><span>Primary Basis:</span> <strong>{activeScenario.neighborhoodData.fioData.basis}</strong></div>
          </div>
        </div>

        <div className="intel-card border-slate">
          <div className="intel-card-head"><AlertCircle size={20}/> <h3>OFFICER CONDUCT DATA</h3></div>
          <div className="intel-data">
            <div className="data-row"><span>Sustained Complaints:</span> <strong>{activeScenario.neighborhoodData.misconductData.sustained}</strong></div>
            <div className="data-row"><span>Top Allegation:</span> <strong>{activeScenario.neighborhoodData.misconductData.topViolation}</strong></div>
            <div className="data-row"><span>Discipline Rate:</span> <strong>{activeScenario.neighborhoodData.misconductData.actionRate}</strong></div>
          </div>
        </div>

        <div className="intel-card border-amber">
          <div className="intel-card-head"><Compass size={20}/> <h3>COMMUNITY CONTEXT</h3></div>
          <div className="intel-data">
            <div className="data-row"><span>Primary Focus:</span> <strong>{activeScenario.neighborhoodData.communityContext.focus}</strong></div>
            <div className="data-row"><span>Peak Activity Time:</span> <strong>{activeScenario.neighborhoodData.communityContext.peakTime}</strong></div>
            
            {/* NEW ROW FOR YOUR REAL ARREST DATA */}
            <div className="data-row" style={{marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed var(--border-main)"}}>
              <span>Top Arrest Charges:</span> 
              <strong style={{fontSize: '0.90rem', color: 'var(--red-500)', textAlign: 'right', maxWidth: '60%'}}>
                {activeScenario.neighborhoodData.topArrests}
              </strong>
            </div>

          </div>
        </div>
      </div>

      <div className="intel-footer">
        <div className="mission-brief">
          <h3>MODULE: {activeScenario.title}</h3>
          <p>Learn how to safely and legally navigate this type of encounter.</p>
        </div>
        <button className="btn-launch" onClick={startTraining}>
          START MODULE <ChevronRight size={20} className="ml-2"/>
        </button>
      </div>
    </div>
  );
};

export default SectorIntel;