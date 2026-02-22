import React, { useState, useEffect, useRef } from 'react';
import { SCENARIO_DATABASE } from './data/mockData';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import GlobeView from './components/GlobeView';
import BostonMap from './components/BostonMap';
import SectorIntel from './components/SectorIntel';
import TrainingModule from './components/TrainingModule';
import './App.css';

const App = () => {
  const globeRef = useRef();
  
  const [isLightMode, setIsLightMode] = useState(false); 
  
  const [screen, setScreen] = useState('GLOBE'); 
  const [globeState, setGlobeState] = useState('IDLE');
  const [transitioning, setTransitioning] = useState(false);
  
  const [activeScenario, setActiveScenario] = useState(null);
  const [currentPhaseId, setCurrentPhaseId] = useState("start");
  const [feedback, setFeedback] = useState({ message: "", isError: false });
  const [showFeedback, setShowFeedback] = useState(false);

  // Tracks the history of correct choices made in a scenario
  const [choiceHistory, setChoiceHistory] = useState([]);

  useEffect(() => {
    if (globeRef.current && globeState === 'IDLE') {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 1.0;
    }
  }, [globeState]);

  const triggerZoomToBoston = () => {
    setGlobeState('ZOOMING');
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
      globeRef.current.pointOfView({ lat: 42.3601, lng: -71.0589, altitude: 0.2 }, 2000);
      
      setTimeout(() => { 
        changeScreen('BOSTON_MAP'); 
      }, 2000);
    }
  };

  const changeScreen = (nextScreen) => {
    setTransitioning(true);
    setTimeout(() => {
      setScreen(nextScreen);
      setTransitioning(false);
      // Clear history when leaving the training module
      if (nextScreen !== 'TRAINING') {
        setChoiceHistory([]);
      }
    }, 600);
  };

  const openIntelPanel = (scenarioId) => {
    setActiveScenario(SCENARIO_DATABASE[scenarioId]);
    changeScreen('INTEL');
  };

  const startTraining = (selectedModule) => {
    setActiveScenario(prev => ({
      ...prev,
      phases: selectedModule.phases,
      title: selectedModule.title 
    }));
    setCurrentPhaseId("start");
    setChoiceHistory([]); // Reset history on fresh start
    changeScreen('TRAINING');
  };

  const handleChoice = (choice) => {
    setFeedback({ message: choice.feedback, isError: !choice.isCorrect });
    setShowFeedback(true);
  };

  const proceed = (nextId) => {
    setShowFeedback(false);
    
    // Find the correct choice object from the current phase BEFORE moving to nextId
    if (activeScenario && activeScenario.phases[currentPhaseId]) {
      const correctChoice = activeScenario.phases[currentPhaseId].choices.find(c => c.isCorrect);
      // Push the TEXT of the correct choice into the history array
      if (correctChoice && correctChoice.text) {
        setChoiceHistory(prev => [...prev, correctChoice.text]);
      }
    }
    
    // Now move to the next phase
    setCurrentPhaseId(nextId);
  };

  return (
    <div className={`app-container ${isLightMode ? 'light-mode' : 'dark-mode'}`}>
      <NavBar 
        screen={screen} 
        globeState={globeState} 
        isLightMode={isLightMode} 
        setIsLightMode={setIsLightMode} 
      />

      <main className={`content-area ${transitioning ? 'fade-out' : 'fade-in'}`}>
        {screen === 'GLOBE' && (
          <GlobeView 
            globeRef={globeRef} 
            isLightMode={isLightMode} 
            globeState={globeState} 
            triggerZoomToBoston={triggerZoomToBoston} 
          />
        )}

        {screen === 'BOSTON_MAP' && (
          <BostonMap 
            isLightMode={isLightMode} 
            openIntelPanel={openIntelPanel} 
          />
        )}

        {screen === 'INTEL' && (
          <SectorIntel 
            activeScenario={activeScenario} 
            changeScreen={changeScreen} 
            startTraining={startTraining} 
          />
        )}

        {screen === 'TRAINING' && (
          <TrainingModule 
            activeScenario={activeScenario}
            currentPhaseId={currentPhaseId}
            showFeedback={showFeedback}
            feedback={feedback}
            handleChoice={handleChoice}
            proceed={proceed}
            changeScreen={changeScreen}
            setShowFeedback={setShowFeedback}
            choiceHistory={choiceHistory} 
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;