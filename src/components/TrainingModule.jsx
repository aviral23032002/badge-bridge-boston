import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, ChevronRight, RotateCcw, AlertTriangle, 
  CheckCircle2, HelpCircle, Send, X, Loader2, Scale, FileText
} from 'lucide-react';

const TrainingModule = ({ 
  activeScenario, currentPhaseId, showFeedback, feedback, 
  handleChoice, proceed, changeScreen, setShowFeedback
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentSelectedChoice, setCurrentSelectedChoice] = useState(null);

  // --- NEW: Scoring & Report State ---
  const [userHistory, setUserHistory] = useState([]);
  const [scoredPhases, setScoredPhases] = useState(new Set());
  const [finalReport, setFinalReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isChatOpen]);

  if (!activeScenario) return null;
  const currentPhase = activeScenario.phases[currentPhaseId];
  
  // Check if we are at the end of the module
  const isFinalPhase = currentPhase.choices.length === 0;

  // --- NEW: Intercept Choice for Scoring ---
  const onChoiceClick = (choice) => {
    setCurrentSelectedChoice(choice);
    
    // Only record the score on the FIRST attempt of this phase
    if (!scoredPhases.has(currentPhaseId)) {
      const newHistory = [...userHistory, {
        phaseTitle: currentPhase.title,
        chosenText: choice.text,
        score: choice.score || 0
      }];
      setUserHistory(newHistory);
      setScoredPhases(new Set(scoredPhases).add(currentPhaseId));
    }
    
    handleChoice(choice);
  };

  // --- NEW: Generate Report at the End ---
  useEffect(() => {
    if (isFinalPhase && userHistory.length > 0 && !finalReport && !isGeneratingReport) {
      generatePerformanceReport();
    }
  }, [currentPhaseId]);

  const generatePerformanceReport = async () => {
    setIsGeneratingReport(true);
    
    const totalScore = userHistory.reduce((sum, item) => sum + item.score, 0);
    const maxScore = userHistory.length * 4;

    const reportPrompt = `
      You are an expert Legal Evaluator. The user just completed the training module: "${activeScenario.title}".
      Here is the log of their first-attempt choices:
      ${userHistory.map((h, i) => `Step ${i+1}: ${h.phaseTitle} | Action: ${h.chosenText} | Score Earned: ${h.score}/4`).join('\n')}
      
      Total Score: ${totalScore} out of ${maxScore}.
      
      Write a concise, professional legal performance debrief (2 paragraphs). Analyze their decision-making, highlight critical mistakes or excellent legal maneuvering, and provide a final verdict on how well they protected their rights. Speak directly to the user. Do not use markdown formatting.
    `;

    try {
      const response = await fetch('http://localhost:5000/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: reportPrompt,           
          chat_history: [], 
        }),
      });
      const data = await response.json();
      setFinalReport(data.reply);
    } catch (error) {
      console.error("Error generating report:", error);
      setFinalReport("Connection Error: Unable to reach Saul-LM to compile your performance debrief. Please check your terminal connection.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAcknowledge = () => {
    setShowFeedback(false);
    setIsChatOpen(false);
    setMessages([]);
    setCurrentSelectedChoice(null); 
  };

  const handleSendMessage = async () => {
    const currentQuestion = inputValue.trim();
    if (!currentQuestion) return;

    const newUserMsg = { role: 'user', content: currentQuestion };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true);

    const refinedPrompt = `
      [Scenario Context]: ${currentPhase.description}
      [User's Incorrect Choice]: "${currentSelectedChoice?.text}".
    `;

    try {
      const response = await fetch('http://localhost:5000/api/ask-saul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          previous_options: refinedPrompt,  
          chat_history: messages, 
        }),
      });
      
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: data.reply }
      ]);
    } catch (error) {
      console.error("Error communicating with SaulLM:", error);
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: "Connection error. Please check your backend." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate final numbers for the UI
  const totalScore = userHistory.reduce((sum, item) => sum + item.score, 0);
  const maxScore = userHistory.length * 4;

  return (
    <>
      <div className={`phase-container transition-all duration-300 ${showFeedback || isChatOpen ? 'blur-md brightness-50' : ''}`}>
        
        {/* NORMAL PHASE UI */}
        {!isFinalPhase ? (
          <>
            <div className="visual-indicator">
              <Shield size={100} className="glow-icon" />
            </div>
            
            <div className="text-section">
              <h1 className="title">{currentPhase.title}</h1>
              <p className="description">{currentPhase.description}</p>
            </div>

            <div className="options-grid">
              {currentPhase.choices.map((choice, index) => (
                <button key={index} className="choice-card" onClick={() => onChoiceClick(choice)}>
                  <div className="choice-edge"></div>
                  <span className="choice-index">0{index + 1}</span>
                  <span className="choice-text">{choice.text}</span>
                  <ChevronRight className="arrow" size={20} />
                </button>
              ))}
            </div>
          </>
        ) : (
          /* FINAL REPORT CARD UI */
          <div className="legal-report-card">
            <div className="report-header">
              <FileText size={32} color="#c9a25b" />
              <h2>Performance Debrief</h2>
            </div>
            
            <div className="report-score-bar">
              <span className="report-score-title">Final Assessment Score</span>
              <span className="report-score-value">{totalScore} / {maxScore}</span>
            </div>

            <div className="report-body">
              {isGeneratingReport ? (
                <div className="loading-bubble" style={{ justifyContent: 'center', margin: '40px 0' }}>
                  <Loader2 size={24} className="spinner" />
                  <span>Saul-LM is analyzing your legal maneuvers...</span>
                </div>
              ) : (
                <p style={{ whiteSpace: 'pre-line' }}>{finalReport}</p>
              )}
            </div>

            <button className="reset-btn mt-6" style={{ width: '100%', marginTop: '30px' }} onClick={() => changeScreen('BOSTON_MAP')}>
              <RotateCcw size={18} className="mr-2"/> RETURN TO MAP
            </button>
          </div>
        )}
      </div>

      {/* PROCEDURAL ERROR BOX */}
      {showFeedback && !isChatOpen && (
        <div className="feedback-overlay" style={{ zIndex: 100 }}>
          <div className={`feedback-modal ${feedback.isError ? 'modal-fail' : 'modal-pass'} flex flex-col relative`}>
            
            {/* Help icon fixed to top right */}
            {feedback.isError && (
              <button 
                onClick={() => setIsChatOpen(true)}
                className="legal-chat-trigger"
                title="Consult Legal Assistant"
              >
                <HelpCircle size={20} />
              </button>
            )}

            <div className="modal-header">
              {feedback.isError ? <AlertTriangle size={36} /> : <CheckCircle2 size={36} />}
              <h2>{feedback.isError ? "PROCEDURAL ERROR" : "LEGAL PRECISION"}</h2>
            </div>
            
            <div className="modal-body">
              <p>{feedback.message}</p>
            </div>
            
            <div className="modal-footer flex items-center justify-center gap-4 mt-4 relative">
              <button 
                className={`modal-btn ${feedback.isError ? 'btn-retry' : 'btn-proceed'}`} 
                onClick={() => feedback.isError ? handleAcknowledge() : proceed(currentPhase.choices.find(c => c.isCorrect)?.next_id)}
              >
                {feedback.isError ? "ACKNOWLEDGE & RETRY" : "PROCEED"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW 'DECENT & PLAIN' LEGAL CHAT BOT */}
      {isChatOpen && (
        <div className="feedback-overlay" style={{ zIndex: 100 }}>
          <div className="absolute inset-0" onClick={() => setIsChatOpen(false)} />

          <div className="legal-chat-panel">
            
            <div className="legal-header">
              <div className="legal-header-info">
                <div className="legal-icon-wrapper">
                  <Scale size={24} />
                </div>
                <div className="legal-header-text">
                  <h3 className="legal-title">Legal Assistant</h3>
                  <p className="legal-subtitle">BPD Guidelines & Law</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="legal-close-btn">
                <X size={24} />
              </button>
            </div>

            <div className="legal-chat-body">
              {messages.length === 0 ? (
                <div className="legal-empty-state">
                  <Scale size={48} className="legal-empty-icon" />
                  <p>Awaiting Inquiry...</p>
                  <span>Request procedural clarification below.</span>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`legal-message-row ${msg.role === 'user' ? 'row-user' : 'row-bot'}`}>
                    <div className={`legal-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="legal-message-row row-bot">
                  <div className="legal-bubble bubble-bot loading-bubble">
                    <Loader2 size={16} className="spinner" />
                    <span>Consulting legal records...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="legal-input-area">
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Draft your question..."
                className="legal-textarea"
                rows={1}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="legal-send-btn"
              >
                <Send size={18} />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default TrainingModule;