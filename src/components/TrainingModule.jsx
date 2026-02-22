import React from 'react';
import { Shield, ChevronRight, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

const TrainingModule = ({ 
  activeScenario, currentPhaseId, showFeedback, feedback, 
  handleChoice, proceed, changeScreen, setShowFeedback 
}) => {
  if (!activeScenario) return null;
  const currentPhase = activeScenario.phases[currentPhaseId];

  return (
    <>
      <div className={`phase-container ${showFeedback ? 'blur-bg' : ''}`}>
        <div className="visual-indicator">
          {currentPhase.choices.length === 0 ? 
            <Shield size={100} className="glow-icon win-icon" /> : 
            <Shield size={100} className="glow-icon" />
          }
        </div>
        
        <div className="text-section">
          <h1 className="title">{currentPhase.title}</h1>
          <p className="description">{currentPhase.description}</p>
        </div>

        <div className="options-grid">
          {currentPhase.choices.map((choice, index) => (
            <button key={index} className="choice-card" onClick={() => handleChoice(choice)}>
              <div className="choice-edge"></div>
              <span className="choice-index">0{index + 1}</span>
              <span className="choice-text">{choice.text}</span>
              <ChevronRight className="arrow" size={20} />
            </button>
          ))}
          {currentPhase.choices.length === 0 && (
            <button className="reset-btn mt-6" onClick={() => changeScreen('BOSTON_MAP')}>
              <RotateCcw size={18} className="mr-2"/> RETURN TO MAP
            </button>
          )}
        </div>
      </div>

      {showFeedback && (
        <div className="feedback-overlay">
          <div className={`feedback-modal ${feedback.isError ? 'modal-fail' : 'modal-pass'}`}>
            <div className="modal-header">
              {feedback.isError ? <AlertTriangle size={36} /> : <CheckCircle2 size={36} />}
              <h2>{feedback.isError ? "PROCEDURAL ERROR" : "LEGAL PRECISION"}</h2>
            </div>
            <div className="modal-body"><p>{feedback.message}</p></div>
            <div className="modal-footer">
              <button 
                className={`modal-btn ${feedback.isError ? 'btn-retry' : 'btn-proceed'}`} 
                onClick={() => feedback.isError ? setShowFeedback(false) : proceed(currentPhase.choices.find(c => c.isCorrect).next_id)}
              >
                {feedback.isError ? "ACKNOWLEDGE & RETRY" : "PROCEED"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrainingModule;