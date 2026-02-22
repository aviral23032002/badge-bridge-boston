import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, ChevronRight, RotateCcw, AlertTriangle, 
  CheckCircle2, HelpCircle, Send, X, Loader2, Scale 
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

  const onChoiceClick = (choice) => {
    setCurrentSelectedChoice(choice);
    handleChoice(choice);
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

  return (
    <>
      <div className={`phase-container transition-all duration-300 ${showFeedback || isChatOpen ? 'blur-md brightness-50' : ''}`}>
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
            <button key={index} className="choice-card" onClick={() => onChoiceClick(choice)}>
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