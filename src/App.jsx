import React, { useState, useEffect, useRef } from 'react'
import { Send, Settings, History, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import GateSystem from './components/GateSystem'
import ChatMessage from './components/ChatMessage'
import ControlPanel from './components/ControlPanel'
import HistoryPanel from './components/HistoryPanel'

function App() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [gateSystem, setGateSystem] = useState(null)
  const [accuracy, setAccuracy] = useState(0)
  const [totalTests, setTotalTests] = useState(0)
  const [passedTests, setPassedTests] = useState(0)
  const [conversationHistory, setConversationHistory] = useState([])
  const [selectedHistory, setSelectedHistory] = useState(null)
  const [llmConfig, setLlmConfig] = useState({
    apiKey: '',
    model: 'mistral',
    temperature: 0.7,
    maxTokens: 1000
  })

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize gate system
    const gate = new GateSystem()
    setGateSystem(gate)
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Get real LLM response with gate system validation
      const response = await getLLMResponse(inputValue)
      
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        accuracy: response.accuracy,
        gateResults: response.gateResults
      }

      setMessages(prev => [...prev, assistantMessage])
      
      // Update metrics
      setTotalTests(prev => prev + 1)
      if (response.accuracy > 0.8) {
        setPassedTests(prev => prev + 1)
      }
      setAccuracy((passedTests + (response.accuracy > 0.8 ? 1 : 0)) / (totalTests + 1))

      // Save to history
      const conversationEntry = {
        id: Date.now(),
        userInput: inputValue,
        assistantResponse: response.content,
        accuracy: response.accuracy,
        timestamp: new Date(),
        gateResults: response.gateResults
      }
      setConversationHistory(prev => [conversationEntry, ...prev])

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, there was an error processing your request.',
        timestamp: new Date(),
        accuracy: 0,
        gateResults: { error: true }
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getLLMResponse = async (input) => {
    try {
      // Call Ollama API
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: input,
          stream: false,
          options: {
            temperature: llmConfig.temperature,
            num_predict: llmConfig.maxTokens
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const llmResponse = data.response || 'No response received'

      // Use gate system validation
      const gateResults = gateSystem ? gateSystem.validateResponse(input, llmResponse) : {
        coherence: Math.random() * 0.4 + 0.6,
        relevance: Math.random() * 0.4 + 0.6,
        completeness: Math.random() * 0.4 + 0.6,
        safety: Math.random() * 0.2 + 0.8
      }

      const overallAccuracy = Object.values(gateResults).reduce((sum, val) => sum + val, 0) / Object.keys(gateResults).length

      return {
        content: llmResponse,
        accuracy: overallAccuracy,
        gateResults
      }
    } catch (error) {
      console.error('Error calling Ollama API:', error)
      
      // Fallback to simulated response if Ollama is not available
      const fallbackResponse = "I'm sorry, I'm having trouble connecting to the AI model right now. Please make sure Ollama is running and try again."
      
      const gateResults = gateSystem ? gateSystem.validateResponse(input, fallbackResponse) : {
        coherence: 0.3,
        relevance: 0.2,
        completeness: 0.4,
        safety: 0.9
      }

      return {
        content: fallbackResponse,
        accuracy: 0.45,
        gateResults
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const loadHistoryItem = (historyItem) => {
    setSelectedHistory(historyItem)
    setMessages([
      {
        id: Date.now(),
        type: 'user',
        content: historyItem.userInput,
        timestamp: historyItem.timestamp
      },
      {
        id: Date.now() + 1,
        type: 'assistant',
        content: historyItem.assistantResponse,
        timestamp: historyItem.timestamp,
        accuracy: historyItem.accuracy,
        gateResults: historyItem.gateResults
      }
    ])
  }

  return (
    <div className="container">
      <div className="header">
        <h1>LLM Testing Interface</h1>
        <p>Test LLM responses with real-time accuracy tracking and gate system validation</p>
      </div>
      
      <div className="main-content">
        <div className="controls-panel">
          <ControlPanel 
            llmConfig={llmConfig}
            setLlmConfig={setLlmConfig}
            accuracy={accuracy}
            totalTests={totalTests}
            passedTests={passedTests}
            isLoading={isLoading}
          />
          
          <HistoryPanel 
            conversationHistory={conversationHistory}
            selectedHistory={selectedHistory}
            onSelectHistory={loadHistoryItem}
          />
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-header">
                  <span>Assistant</span>
                  <div className="loading-spinner"></div>
                </div>
                <div>Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <div className="input-group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask the LLM a question..."
                disabled={isLoading}
              />
              <button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputValue.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
