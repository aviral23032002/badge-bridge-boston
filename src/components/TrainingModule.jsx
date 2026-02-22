import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, ChevronRight, RotateCcw, AlertTriangle, 
  CheckCircle2, HelpCircle, Send, X, Loader2, Bot
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

    const formattedContext = [
      `[Scenario Context]: ${currentPhase.title} - ${currentPhase.description}`,
      currentSelectedChoice ? `[User's Incorrect Choice]: ${currentSelectedChoice.text}` : ''
    ].filter(Boolean);

    try {
      const response = await fetch('http://localhost:5000/api/ask-saul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,           
          previous_options: formattedContext, 
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
      <div className={`phase-container transition-all duration-300 ${showFeedback || isChatOpen ? 'blur-bg' : ''}`}>
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
            {/* HELP ICON MOVED TO TOP RIGHT CORNER OF BOX */}
            {feedback.isError && (
              <button 
                onClick={() => setIsChatOpen(true)}
                className="cyber-chat-trigger"
                title="ACCESS TERMINAL LOGS"
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

      {/* CHAT BOT BOX - Centered like the error box */}
      {isChatOpen && (
        <div className="feedback-overlay" style={{ zIndex: 100 }}>
          <div className="absolute inset-0" onClick={() => setIsChatOpen(false)} />

          <div className="cyber-chat-panel flex flex-col relative z-10 w-full max-w-[650px] h-[600px] max-h-[80vh]">
            <div className="scanline"></div> 

                      <div className="cyber-header">
                          {/* Left: Small Logo */}
                          <div className="bot-icon-wrapper" style={{ padding: '6px' }}>
                              <Bot size={18} />
                          </div>

                          {/* Center: Title and Status */}
                          <div className="header-text-center">
                              <h3 className="cyber-title" style={{ fontSize: '0.9rem' }}>LEGAL_MAINFRAME // SYS.AI</h3>
                              <p className="cyber-subtitle" style={{ fontSize: '0.65rem' }}>STATUS: ONLINE | PORT: 5000</p>
                          </div>

                          {/* Right: Close Button (Acts as the third piece to balance the center) */}
                          <button onClick={() => setIsChatOpen(false)} className="cyber-close-btn">
                              <X size={20} />
                          </button>
                      </div>

            {/* Scrollable Area */}
            <div className="cyber-chat-body cyber-scroll flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="empty-chat-state">
                  <Bot size={50} className="mb-4 opacity-50" />
                  <p>AWAITING QUERY...</p>
                  <span>REQUEST PROCEDURAL CLARIFICATION</span>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`cyber-message-wrapper ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`cyber-message ${msg.role === 'user' ? 'msg-user' : 'msg-bot'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="cyber-message-wrapper justify-start">
                  <div className="cyber-message msg-bot flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin text-[var(--neon-blue)]" />
                    <span>FETCHING BPD RECORDS...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="cyber-input-area">
              <div className="relative flex items-end gap-2 w-full">
                <span className="cyber-prompt-symbol">{'>'}</span>
                <textarea 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="ENTER COMMAND..."
                  className="cyber-textarea"
                  rows={1}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="cyber-send-btn"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrainingModule;