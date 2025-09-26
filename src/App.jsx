import React, { useState, useEffect, useRef } from 'react'
import { Send, Settings, History, Zap, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import GateSystem from './components/GateSystem'
import ChatMessage from './components/ChatMessage'
import ControlPanel from './components/ControlPanel'
import HistoryPanel from './components/HistoryPanel'
import AboutPage from './components/AboutPage'

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
  const [showAbout, setShowAbout] = useState(false)
  const [llmConfig, setLlmConfig] = useState({
    apiKey: '',
    model: 'mistral',
    temperature: 0.7,
    maxTokens: 1000
  })
  const [gateWeights, setGateWeights] = useState({
    coherence: 0.25,
    relevance: 0.25,
    completeness: 0.25,
    safety: 0.25
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
    const gate = new GateSystem(gateWeights)
    setGateSystem(gate)
  }, [gateWeights])

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
      let llmResponse = ''

      // Route to appropriate API based on selected model
      const localModels = ['mistral', 'llama2', 'codellama', 'llama3', 'gemma', 'phi3']
      const openAIModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o']
      const anthropicModels = ['claude-3-sonnet', 'claude-3-opus', 'claude-3-haiku']
      
      if (localModels.includes(llmConfig.model)) {
        // Local models via Ollama
        llmResponse = await callOllamaAPI(input)
      } else if (openAIModels.includes(llmConfig.model)) {
        // OpenAI models
        llmResponse = await callOpenAIAPI(input)
      } else if (anthropicModels.includes(llmConfig.model)) {
        // Anthropic Claude models
        llmResponse = await callAnthropicAPI(input)
      } else {
        throw new Error(`Unsupported model: ${llmConfig.model}`)
      }

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
      console.error('Error calling LLM API:', error)
      
      // Fallback to simulated response if API is not available
      const fallbackResponse = `I'm sorry, I'm having trouble connecting to the ${llmConfig.model} model right now. Please check your API key and try again.`
      
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

  const callOllamaAPI = async (input) => {
    // Map UI model names to actual Ollama model names
    const modelMapping = {
      'mistral': 'mistral:latest',
      'llama2': 'llama2:latest', 
      'codellama': 'codellama:7b',
      'llama3': 'llama3.1:8b',
      'gemma': 'gemma:7b',
      'phi3': 'phi3:mini'
    }
    
    const actualModelName = modelMapping[llmConfig.model] || llmConfig.model
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: actualModelName,
        prompt: input,
        stream: false,
        options: {
          temperature: llmConfig.temperature,
          num_predict: llmConfig.maxTokens
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.response || 'No response received'
  }

  const callOpenAIAPI = async (input) => {
    if (!llmConfig.apiKey) {
      throw new Error('OpenAI API key is required')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llmConfig.apiKey}`
      },
      body: JSON.stringify({
        model: llmConfig.model,
        messages: [
          {
            role: 'user',
            content: input
          }
        ],
        temperature: llmConfig.temperature,
        max_tokens: llmConfig.maxTokens
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No response received'
  }

  const callAnthropicAPI = async (input) => {
    if (!llmConfig.apiKey) {
      throw new Error('Anthropic API key is required')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': llmConfig.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: llmConfig.model,
        max_tokens: llmConfig.maxTokens,
        temperature: llmConfig.temperature,
        messages: [
          {
            role: 'user',
            content: input
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.content[0]?.text || 'No response received'
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

  if (showAbout) {
    return <AboutPage onBack={() => setShowAbout(false)} />
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <div className="header-text">
            <h1>LLM Testing Interface</h1>
            <p>Test LLM responses with real-time accuracy tracking and gate system validation</p>
          </div>
          <button 
            onClick={() => setShowAbout(true)} 
            className="about-button"
            title="About this project"
          >
            <Info size={20} />
            About
          </button>
        </div>
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
            gateWeights={gateWeights}
            setGateWeights={setGateWeights}
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
