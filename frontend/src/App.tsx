import { useEffect, useState, useRef } from 'react';
import './App.css';

// Import API functions from the new api.ts file
import { createReplica, getChatCompletionWithRetry } from './api';

interface Message {
  text: string;
  sender: 'user' | 'figure';
}

interface HistoricalFigure {
  id: string | null;
  name: string;
  image: string;
  systemMessage: string;
}

interface TimelineItem {
  year: string;
  event: string;
}

interface ContextData {
  timeline: TimelineItem[];
  suggestedQuestions: string[];
}

// Historical figure data
const historicalFigures: Record<string, HistoricalFigure> = {
  lincoln: {
    id: null,
    name: 'Abraham Lincoln',
    image: '/images/lincoln.jpg',
    systemMessage: `You are Abraham Lincoln, the 16th President of the United States who served from 1861 until your assassination in 1865. You led the nation through the American Civil War and succeeded in preserving the Union, abolishing slavery, and modernizing the U.S. economy.

Your speaking style is thoughtful, eloquent, and often includes folksy wisdom and stories. You use period-appropriate language from the mid-19th century, avoiding modern slang or references to events after 1865.

Key facts about your life:
- Born in a log cabin in Kentucky in 1809
- Self-educated, became a lawyer through self-study
- Served in the Illinois legislature and U.S. House of Representatives
- Opposed the expansion of slavery but initially did not call for its abolition
- Elected president in 1860, triggering the secession of Southern states
- Issued the Emancipation Proclamation in 1863
- Delivered the Gettysburg Address, one of the most famous speeches in American history
- Assassinated by John Wilkes Booth on April 14, 1865, at Ford's Theatre

Your political philosophy emphasized preservation of the Union, gradual emancipation of slaves, and reconciliation with the South. You were known for your humility, storytelling ability, and deep moral convictions.`
  },
  curie: {
    id: null,
    name: 'Marie Curie',
    image: '/images/curie.jpg',
    systemMessage: `You are Marie Curie (born Maria Skłodowska), a pioneering physicist and chemist who conducted groundbreaking research on radioactivity. You were the first woman to win a Nobel Prize, the first person to win Nobel Prizes in two different scientific fields (Physics in 1903 and Chemistry in 1911), and the first woman to become a professor at the University of Paris.

Your speaking style is precise, thoughtful, and reflects your scientific mindset. You speak with a slight Polish accent and occasionally use French phrases, as you were born in Poland but spent most of your scientific career in France.

Key facts about your life:
- Born in Warsaw, Poland in 1867
- Moved to Paris in 1891 to study physics and mathematics at the University of Paris
- Married physicist Pierre Curie in 1895 and collaborated closely with him
- Discovered the elements polonium and radium in 1898
- Won the Nobel Prize in Physics in 1903 with Pierre Curie and Henri Becquerel
- Became the first female professor at the University of Paris after Pierre's death in 1906
- Won the Nobel Prize in Chemistry in 1911 for the discovery of radium and polonium
- Founded the Curie Institutes in Paris and Warsaw
- Died in 1934 from aplastic anemia, likely caused by exposure to radiation

Your scientific work was driven by curiosity and determination. You faced significant challenges as a woman in science but persevered through hardship and discrimination. You were known for your dedication to research, humility, and belief in the importance of pure science.`
  },
  shakespeare: {
    id: null,
    name: 'William Shakespeare',
    image: '/images/shakespeare.jpg',
    systemMessage: `You are William Shakespeare, the renowned English playwright, poet, and actor who lived from 1564 to 1616. You are widely regarded as the greatest writer in the English language and the world's greatest dramatist.

Your speaking style is eloquent, poetic, and rich with metaphor and wordplay. You occasionally use Early Modern English phrases and expressions from your era, but remain understandable to modern audiences.

Key facts about your life:
- Born in Stratford-upon-Avon in April 1564
- Married Anne Hathaway at age 18 and had three children
- Became an actor and playwright in London around the 1590s
- Wrote approximately 37 plays and 154 sonnets
- Member of the acting company the Lord Chamberlain's Men (later the King's Men)
- Part-owner of the Globe Theatre in London
- Created works spanning tragedies, comedies, histories, and romances
- Died in 1616 at age 52 in your hometown

Your works explore themes of love, betrayal, power, ambition, and human nature. You revolutionized theater by creating complex, psychologically nuanced characters and innovative language. Your plays include Hamlet, Macbeth, Romeo and Juliet, A Midsummer Night's Dream, and many others that continue to be performed worldwide.`
  },
  tubman: {
    id: null,
    name: 'Harriet Tubman',
    image: '/images/tubman.jpg',
    systemMessage: `You are Harriet Tubman, an American abolitionist and political activist who escaped slavery and then made approximately 13 missions to rescue approximately 70 enslaved people using the network of antislavery activists and safe houses known as the Underground Railroad.

Your speaking style is direct, determined, and occasionally spiritual, reflecting your strong faith. You speak with the dialect and vocabulary of a 19th-century African American who had no formal education but possessed profound wisdom and courage.

Key facts about your life:
- Born into slavery in Maryland around 1822 (exact date unknown)
- Originally named Araminta "Minty" Ross, later took your mother's first name and your husband's last name
- Suffered a severe head injury as a child when an overseer threw a heavy weight that struck your head
- Escaped to Philadelphia in 1849, then returned repeatedly to rescue family and others
- Became known as "Moses" for leading enslaved people to freedom
- Served as a scout, spy, and nurse for the Union Army during the Civil War
- Later became active in the women's suffrage movement
- Established the Harriet Tubman Home for the Aged in Auburn, New York
- Died in 1913 at approximately 90 years of age

You were guided by your faith and determination to fight against the injustice of slavery. Your famous quote "I freed a thousand slaves. I could have freed a thousand more if only they knew they were slaves" reflects your commitment to liberation and justice.`
  }
};

// Context data for historical figures
const contextData: Record<string, ContextData> = {
  lincoln: {
    timeline: [
      { year: '1809', event: 'Born in Hardin County, Kentucky' },
      { year: '1834', event: 'Elected to Illinois state legislature' },
      { year: '1846', event: 'Elected to U.S. House of Representatives' },
      { year: '1860', event: 'Elected as 16th President of the United States' },
      { year: '1863', event: 'Issued Emancipation Proclamation' },
      { year: '1865', event: 'Assassinated at Ford\'s Theatre' }
    ],
    suggestedQuestions: [
      'What was your approach to leadership during the Civil War?',
      'How did you feel about the Emancipation Proclamation?',
      'What were your thoughts on preserving the Union?',
      'How did you handle criticism from your cabinet?'
    ]
  },
  curie: {
    timeline: [
      { year: '1867', event: 'Born in Warsaw, Poland' },
      { year: '1891', event: 'Moved to Paris to study physics and mathematics' },
      { year: '1898', event: 'Discovered radium and polonium with Pierre Curie' },
      { year: '1903', event: 'Awarded Nobel Prize in Physics' },
      { year: '1911', event: 'Awarded Nobel Prize in Chemistry' },
      { year: '1934', event: 'Died from aplastic anemia due to radiation exposure' }
    ],
    suggestedQuestions: [
      'What inspired your interest in radioactivity?',
      'How did you overcome challenges as a woman in science?',
      'What was your research process like?',
      'How did you feel about winning two Nobel Prizes?'
    ]
  },
  shakespeare: {
    timeline: [
      { year: '1564', event: 'Born in Stratford-upon-Avon' },
      { year: '1582', event: 'Married Anne Hathaway' },
      { year: '1592', event: 'First recorded works in London' },
      { year: '1599', event: 'Globe Theatre built, became part-owner' },
      { year: '1603', event: 'Lord Chamberlain\'s Men became the King\'s Men' },
      { year: '1616', event: 'Died in Stratford-upon-Avon' }
    ],
    suggestedQuestions: [
      'What inspired your most famous plays?',
      'How did you approach character development?',
      'What was it like working in the theatre in Elizabethan England?',
      'Which of your works do you consider your greatest achievement?'
    ]
  },
  tubman: {
    timeline: [
      { year: '1822', event: 'Born into slavery in Maryland' },
      { year: '1849', event: 'Escaped to freedom in Philadelphia' },
      { year: '1850', event: 'Began rescue missions on Underground Railroad' },
      { year: '1863', event: 'Led Combahee River Raid during Civil War' },
      { year: '1896', event: 'Founded the Harriet Tubman Home for the Aged' },
      { year: '1913', event: 'Died in Auburn, New York' }
    ],
    suggestedQuestions: [
      'What motivated you to return to the South after escaping?',
      'How did you navigate the Underground Railroad?',
      'What role did faith play in your work?',
      'What was your experience working with the Union Army?'
    ]
  }
};

// Tour guide content
const tourSteps = [
  {
    title: "Welcome to HistoryAlive!",
    text: "Explore history through interactive conversations with historical figures. We'll guide you through the experience."
  },
  {
    title: "Select Your Interests",
    text: "Start by selecting topics you're interested in. This helps us recommend historical figures relevant to your interests."
  },
  {
    title: "Choose a Historical Figure",
    text: "Select a historical figure to have a conversation with. Each figure has unique knowledge and perspective based on their life and era."
  },
  {
    title: "Interactive Conversation",
    text: "Ask questions and receive historically accurate responses. The timeline provides context about key events in their life."
  },
  {
    title: "Take Notes",
    text: "Use the notes panel to record insights from your conversation. Notes are saved automatically for future reference."
  }
];

function App() {
  // State variables
  const [view, setView] = useState<'onboarding' | 'selection' | 'chat'>('onboarding');
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [activeFigure, setActiveFigure] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  // Load saved notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('historyalive_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    
    // Check if tour has been completed
    const tourCompleted = localStorage.getItem('tourCompleted');
    if (!tourCompleted) {
      setShowTour(true);
    }
    
    // Initialize historical figures
    createHistoricalFigures();
  }, []);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create historical figures using Sensay API
  const createHistoricalFigures = async () => {
    for (const figure in historicalFigures) {
      try {
        // Check if we already have an ID for this figure
        if (!historicalFigures[figure].id) {
          const savedId = localStorage.getItem(`figure_${figure}_id`);
          
          if (savedId) {
            historicalFigures[figure].id = savedId;
            console.log(`Loaded ${historicalFigures[figure].name} with ID: ${savedId} from storage`);
          } else {
            try {
              const response = await createReplica(
                historicalFigures[figure].name,
                `A historical replica of ${historicalFigures[figure].name} for educational purposes`,
                historicalFigures[figure].systemMessage
              );
              
              if (response && response.uuid) {
                historicalFigures[figure].id = response.uuid;
                console.log(`Created ${historicalFigures[figure].name} with ID: ${response.uuid}`);
                
                // Save ID to localStorage for persistence
                localStorage.setItem(`figure_${figure}_id`, response.uuid);
              }
            } catch (error) {
              console.error(`Error creating ${historicalFigures[figure].name}:`, error);
              // Continue with other figures even if one fails
            }
          }
        }
      } catch (error) {
        console.error(`Error processing ${historicalFigures[figure].name}:`, error);
      }
    }
  };

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    if (userInterests.includes(interest)) {
      setUserInterests(userInterests.filter(item => item !== interest));
    } else {
      setUserInterests([...userInterests, interest]);
    }
  };

  // Show figure selection based on interests
  const showFigureSelection = () => {
    console.log("Showing figure selection");
    setView('selection');
  };

  // Select a historical figure to chat with
  const selectHistoricalFigure = (figure: string) => {
    setActiveFigure(figure);
    setView('chat');
    setMessages([]);
    
    // Add welcome message
    let welcomeMessage = "";
    switch(figure) {
      case 'lincoln':
        welcomeMessage = "Good day to you. I am Abraham Lincoln, 16th President of these United States. How might I be of service to you today?";
        break;
      case 'curie':
        welcomeMessage = "Bonjour! I am Marie Curie. I would be delighted to discuss science, research, or any questions you may have about my work and life.";
        break;
      case 'shakespeare':
        welcomeMessage = "Greetings, good friend! I am William Shakespeare, playwright and poet. What matters of life, love, or art shall we explore together?";
        break;
      case 'tubman':
        welcomeMessage = "Hello there. I'm Harriet Tubman. I've seen much in my time fighting for freedom and justice. What would you like to know about my journey?";
        break;
      default:
        welcomeMessage = `Hello! I am ${historicalFigures[figure].name}. How may I assist you today?`;
    }
    
    setMessages([{ text: welcomeMessage, sender: 'figure' }]);
  };

  // Return to figure selection
  const returnToSelection = () => {
    setView('selection');
    setMessages([]);
    setInputValue('');
  };

  // Send message to historical figure
  const sendMessage = async () => {
    if (!inputValue.trim() || !activeFigure) return;
    
    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      if (!historicalFigures[activeFigure].id) {
        throw new Error('Historical figure not initialized');
      }
      
      const response = await getChatCompletionWithRetry(
        historicalFigures[activeFigure].id!,
        userMessage
      );
      
      if (response && response.content) {
        setMessages(prev => [...prev, { text: response.content, sender: 'figure' }]);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, { 
        text: "I apologize, but I'm having trouble responding at the moment. Please try again.", 
        sender: 'figure' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Use suggested question
  const useSuggestedQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  // Notes functionality
  const updateNotes = (content: string) => {
    if (!activeFigure) return;
    
    const updatedNotes = { ...notes, [activeFigure]: content };
    setNotes(updatedNotes);
    
    // Save to localStorage
    localStorage.setItem('historyalive_notes', JSON.stringify(updatedNotes));
  };

  const handleNotesChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (!activeFigure) return;
    const content = e.currentTarget.textContent || '';
    updateNotes(content);
  };

  const clearNotes = () => {
    if (!activeFigure) return;
    
    const updatedNotes = { ...notes, [activeFigure]: '' };
    setNotes(updatedNotes);
    
    if (notesRef.current) {
      notesRef.current.textContent = 'Take notes on your conversation here...';
    }
    
    // Update localStorage
    localStorage.setItem('historyalive_notes', JSON.stringify(updatedNotes));
  };

  // Tour guide functionality
  const nextTourStep = () => {
    if (tourStep === 1 && view === 'onboarding') {
      showFigureSelection();
    }
    
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      completeTour();
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem('tourCompleted', 'true');
  };

  // Debug function to force view change
  const forceViewChange = (newView: 'onboarding' | 'selection' | 'chat') => {
    console.log(`Forcing view change to: ${newView}`);
    setView(newView);
  };

  return (
    <div className="app">
      <header>
        <div className="container">
          <h1>HistoryAlive</h1>
          <p className="tagline">Converse with history's greatest minds</p>
        </div>
      </header>

      <main className="container">
        {/* Debug Controls - Remove in production */}
        <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', border: '1px solid #ccc' }}>
          <p>Debug Controls - Current View: {view}</p>
          <button onClick={() => forceViewChange('onboarding')}>Show Onboarding</button>
          <button onClick={() => forceViewChange('selection')}>Show Selection</button>
          {activeFigure && <button onClick={() => forceViewChange('chat')}>Show Chat</button>}
        </div>

        {/* Onboarding Section */}
        {view === 'onboarding' && (
          <section className="onboarding">
            <h2>Welcome to HistoryAlive</h2>
            <p>Explore history through interactive conversations with historical figures. Select your interests to get started.</p>
            
            <div className="interest-tags">
              <div 
                className={`interest-tag ${userInterests.includes('politics') ? 'selected' : ''}`}
                onClick={() => toggleInterest('politics')}
              >
                Politics & Leadership
              </div>
              <div 
                className={`interest-tag ${userInterests.includes('science') ? 'selected' : ''}`}
                onClick={() => toggleInterest('science')}
              >
                Science & Discovery
              </div>
              <div 
                className={`interest-tag ${userInterests.includes('arts') ? 'selected' : ''}`}
                onClick={() => toggleInterest('arts')}
              >
                Arts & Literature
              </div>
              <div 
                className={`interest-tag ${userInterests.includes('social') ? 'selected' : ''}`}
                onClick={() => toggleInterest('social')}
              >
                Social Movements
              </div>
              <div 
                className={`interest-tag ${userInterests.includes('war') ? 'selected' : ''}`}
                onClick={() => toggleInterest('war')}
              >
                War & Conflict
              </div>
              <div 
                className={`interest-tag ${userInterests.includes('philosophy') ? 'selected' : ''}`}
                onClick={() => toggleInterest('philosophy')}
              >
                Philosophy & Ideas
              </div>
            </div>
            
            <button 
              className="continue-btn" 
              onClick={showFigureSelection}
            >
              Continue to Historical Figures
            </button>
          </section>
        )}

        {/* Historical Figures Selection */}
        {view === 'selection' && (
          <section className="historical-figures">
            <h2>Choose a Historical Figure</h2>
            <div className="figure-cards">
              {Object.entries(historicalFigures).map(([key, figure]) => {
                // Filter based on user interests if any are selected
                const figureInterests = {
                  lincoln: ['politics', 'war', 'social'],
                  curie: ['science'],
                  shakespeare: ['arts', 'philosophy'],
                  tubman: ['social', 'war']
                }[key] || [];
                
                const hasMatch = userInterests.length === 0 || 
                  figureInterests.some(interest => userInterests.includes(interest));
                
                if (!hasMatch) return null;
                
                return (
                  <div className="figure-card" key={key}>
                    <span className="era">
                      {key === 'lincoln' ? '1809-1865' : 
                       key === 'curie' ? '1867-1934' : 
                       key === 'shakespeare' ? '1564-1616' : 
                       '1822-1913'}
                    </span>
                    <img src={figure.image} alt={figure.name} />
                    <h3>{figure.name}</h3>
                    <p>
                      {key === 'lincoln' ? '16th U.S. President, Civil War Leader' : 
                       key === 'curie' ? 'Pioneering Physicist and Chemist' : 
                       key === 'shakespeare' ? 'Playwright and Poet' : 
                       'Abolitionist and Political Activist'}
                    </p>
                    <button 
                      className="select-btn"
                      onClick={() => selectHistoricalFigure(key)}
                    >
                      Speak with {figure.name.split(' ')[0]}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Chat Interface */}
        {view === 'chat' && activeFigure && (
          <section className="chat-interface">
            <div className="chat-header">
              <button className="back-btn" onClick={returnToSelection}>&larr; Back</button>
              <div className="active-figure">
                <img 
                  src={historicalFigures[activeFigure].image} 
                  alt={historicalFigures[activeFigure].name} 
                />
                <h3>{historicalFigures[activeFigure].name}</h3>
              </div>
            </div>
            
            <div className="chat-container">
              <div className="historical-context">
                <h3>Historical Context</h3>
                <div className="context-content">
                  <div className="timeline">
                    {contextData[activeFigure].timeline.map((item, index) => (
                      <div className="timeline-item" key={index}>
                        <span className="year">{item.year}</span>
                        <p>{item.event}</p>
                      </div>
                    ))}
                  </div>
                  <div className="suggested-questions">
                    <h4>Suggested Questions</h4>
                    <ul>
                      {contextData[activeFigure].suggestedQuestions.map((question, index) => (
                        <li 
                          key={index}
                          onClick={() => useSuggestedQuestion(question)}
                        >
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="chat-messages">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message ${message.sender === 'user' ? 'user-message' : 'figure-message'}`}
                  >
                    {message.text}
                  </div>
                ))}
                {isLoading && (
                  <div className="message figure-message typing-indicator">
                    <div className="loading-spinner"></div> Thinking...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="chat-input">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question..." 
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
            
            {/* Notes Feature */}
            <div className="notes-panel">
              <h3>
                Your Notes
                <button onClick={clearNotes}>Clear</button>
              </h3>
              <div 
                className="notes-content" 
                contentEditable={true}
                onInput={handleNotesChange}
                ref={notesRef}
                suppressContentEditableWarning={true}
              >
                {notes[activeFigure] || 'Take notes on your conversation here...'}
              </div>
              <div className="notes-actions">
                <button onClick={() => updateNotes(notesRef.current?.textContent || '')}>Save Notes</button>
              </div>
            </div>
          </section>
        )}
        
        {/* Tour Guide Overlay */}
        {showTour && (
          <div className="tour-overlay">
            <div className="tour-card">
              <h3>{tourSteps[tourStep].title}</h3>
              <p>{tourSteps[tourStep].text}</p>
              <div className="tour-buttons">
                <button className="tour-skip" onClick={skipTour}>Skip Tour</button>
                <button className="tour-next" onClick={nextTourStep}>
                  {tourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer>
        <div className="container">
          <p>Created for the Sensay EdTech Breakthrough Hackathon</p>
          <p>Powered by Sensay's Wisdom Engine API</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
