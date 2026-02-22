import React from 'react';
import { Target, ChevronRight } from 'lucide-react';
import { SCENARIO_DATABASE } from '../data/mockData';

const ScenarioSelector = ({ openIntelPanel }) => {
  return (
    <div className="view-container w-full max-w-4xl">
      <h2 className="section-title"><Target size={28}/> SELECT HOTSPOT LOCATION</h2>
      <p className="subtitle mb-8 text-left">Isolate a sector to view active intelligence and scenarios.</p>
      
      <div className="scenario-list">
        {Object.values(SCENARIO_DATABASE).map(scenario => (
          <div key={scenario.id} className="scenario-card" onClick={() => openIntelPanel(scenario.id)}>
            <div className="card-edge"></div>
            <div className="card-info">
              <h3>{scenario.location}</h3>
              <p className="location">Associated Scenario: {scenario.title}</p>
            </div>
            <ChevronRight size={24} className="accent-icon" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScenarioSelector;