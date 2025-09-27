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
    maxTokens: 1000,
    generateImage: true,
    imageModel: 'dall-e-3',
    imageSize: '1024x1024',
    imageQuality: 'standard',
    imageProvider: 'local', // 'openai' or 'local'
    generateVideo: false,
    videoModel: 'sora',
    videoDuration: '10s',
    videoQuality: 'standard',
    videoProvider: 'openai', // 'openai' or 'local'
    enableTranslation: false,
    inputLanguage: 'auto',
    outputLanguage: 'en'
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

    console.log('Current LLM Config:', llmConfig)
    console.log('Image generation enabled:', llmConfig.generateImage)
    console.log('Image provider:', llmConfig.imageProvider)

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
        gateResults: response.gateResults,
        imageUrl: response.imageUrl || null
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
        gateResults: response.gateResults,
        imageUrl: response.imageUrl,
        videoUrl: response.videoUrl
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
      let processedInput = input
      let llmResponse = ''

      // Handle translation if enabled
      if (llmConfig.enableTranslation) {
        processedInput = await translateText(input, llmConfig.inputLanguage, 'en')
        console.log('Translated input:', processedInput)
      }

      // Route to appropriate API based on selected model
      const localModels = ['mistral', 'llama2-7b', 'llama2-13b', 'codellama', 'llama3', 'gemma', 'phi3']
      const openAIModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o']
      const anthropicModels = ['claude-3-sonnet', 'claude-3-opus', 'claude-3-haiku']
      
      if (localModels.includes(llmConfig.model)) {
        // Local models via Ollama
        llmResponse = await callOllamaAPI(processedInput)
      } else if (openAIModels.includes(llmConfig.model)) {
        // OpenAI models
        llmResponse = await callOpenAIAPI(processedInput)
      } else if (anthropicModels.includes(llmConfig.model)) {
        // Anthropic Claude models
        llmResponse = await callAnthropicAPI(processedInput)
      } else {
        throw new Error(`Unsupported model: ${llmConfig.model}`)
      }

      // Translate response back if needed
      if (llmConfig.enableTranslation && llmConfig.outputLanguage !== 'en') {
        llmResponse = await translateText(llmResponse, 'en', llmConfig.outputLanguage)
        console.log('Translated response:', llmResponse)
      }

      // Use gate system validation
      const gateResults = gateSystem ? gateSystem.validateResponse(input, llmResponse) : {
        coherence: Math.random() * 0.4 + 0.6,
        relevance: Math.random() * 0.4 + 0.6,
        completeness: Math.random() * 0.4 + 0.6,
        safety: Math.random() * 0.2 + 0.8
      }

      const overallAccuracy = Object.values(gateResults).reduce((sum, val) => sum + val, 0) / Object.keys(gateResults).length

      // Generate image if enabled (or force for testing)
      let imageUrl = null
      const forceImageGeneration = true // Enable for testing image generation
      
      console.log('Image generation check:', {
        generateImage: llmConfig.generateImage,
        forceImageGeneration: forceImageGeneration,
        imageProvider: llmConfig.imageProvider,
        willGenerate: llmConfig.generateImage || forceImageGeneration
      })
      
      if (llmConfig.generateImage || forceImageGeneration) {
        console.log('Image generation enabled, provider:', llmConfig.imageProvider)
        try {
          imageUrl = await generateImage(input)
          console.log('Image generated successfully:', imageUrl ? 'Yes' : 'No')
          console.log('Image URL:', imageUrl)
        } catch (error) {
          console.error('Error generating image with', llmConfig.imageProvider, ':', error)
          
          // Fallback to local generation if OpenAI fails
          if (llmConfig.imageProvider === 'openai') {
            console.log('Falling back to local image generation...')
            try {
              imageUrl = await generateLocalImage(input)
              console.log('Fallback image generated successfully:', imageUrl ? 'Yes' : 'No')
            } catch (fallbackError) {
              console.error('Error with fallback image generation:', fallbackError)
            }
          }
        }
      } else {
        console.log('Image generation disabled')
      }

      // Generate video if enabled
      let videoUrl = null
      const forceVideoGeneration = false // Video generation for testing
      
      if (llmConfig.generateVideo || forceVideoGeneration) {
        console.log('Video generation enabled, provider:', llmConfig.videoProvider)
        try {
          videoUrl = await generateVideo(input)
          console.log('Video generated successfully:', videoUrl ? 'Yes' : 'No')
        } catch (error) {
          console.error('Error generating video:', error)
        }
      } else {
        console.log('Video generation disabled')
      }

      return {
        content: llmResponse,
        accuracy: overallAccuracy,
        gateResults,
        imageUrl,
        videoUrl
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
        gateResults,
        imageUrl: null,
        videoUrl: null
      }
    }
  }

  const callOllamaAPI = async (input) => {
    // Map UI model names to actual Ollama model names
    const modelMapping = {
      'mistral': 'mistral:latest',
      'llama2-7b': 'llama2:7b',
      'llama2-13b': 'llama2:13b',
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

  const generateImage = async (prompt) => {
    if (llmConfig.imageProvider === 'openai') {
      return await generateOpenAIImage(prompt)
    } else if (llmConfig.imageProvider === 'local') {
      return await generateLocalImage(prompt)
    }
    throw new Error('Invalid image provider')
  }

  const generateVideo = async (prompt) => {
    if (llmConfig.videoProvider === 'openai') {
      return await generateOpenAIVideo(prompt)
    } else if (llmConfig.videoProvider === 'local') {
      return await generateLocalVideo(prompt)
    }
    throw new Error('Invalid video provider')
  }

  const generateOpenAIImage = async (prompt) => {
    if (!llmConfig.apiKey) {
      throw new Error('API key is required for OpenAI image generation')
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${llmConfig.apiKey}`
      },
      body: JSON.stringify({
        model: llmConfig.imageModel,
        prompt: prompt,
        size: llmConfig.imageSize,
        quality: llmConfig.imageQuality,
        n: 1
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Image generation error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.data[0]?.url || null
  }

  const generateLocalImage = async (prompt) => {
    console.log('Generating local demo image for prompt:', prompt)
    // Always use demo image generation for local mode
    // This creates beautiful gradient images with the prompt text
    return await generateFallbackImage(prompt)
  }

  const generateFallbackImage = async (prompt) => {
    console.log('Generating professional demo image for prompt:', prompt)
    console.log('Image size from config:', llmConfig.imageSize)
    
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Set canvas size based on configuration
      const [width, height] = llmConfig.imageSize.split('x').map(Number)
      canvas.width = width
      canvas.height = height
      
      console.log('Canvas created:', { width, height, canvasWidth: canvas.width, canvasHeight: canvas.height })
      
      // Create multiple layered gradients for depth
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.3, 0,
        canvas.width * 0.7, canvas.height * 0.7, Math.max(canvas.width, canvas.height)
      )
      
      const gradient2 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      
      // Choose sophisticated color schemes based on prompt content
      const themes = [
        { name: 'Sunset', colors: ['#ff7e5f', '#feb47b', '#ff6b6b', '#ee5a24'] },
        { name: 'Ocean', colors: ['#667eea', '#764ba2', '#4facfe', '#00f2fe'] },
        { name: 'Forest', colors: ['#56ab2f', '#a8e6cf', '#43e97b', '#38f9d7'] },
        { name: 'Cosmic', colors: ['#2c3e50', '#3498db', '#9b59b6', '#e74c3c'] },
        { name: 'Aurora', colors: ['#a8edea', '#fed6e3', '#ff9a9e', '#fecfef'] },
        { name: 'Volcano', colors: ['#ff416c', '#ff4b2b', '#ff6b6b', '#ee5a24'] },
        { name: 'Galaxy', colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'] },
        { name: 'Mystic', colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7'] }
      ]
      
      const theme = themes[prompt.length % themes.length]
      
      // Apply radial gradient
      gradient1.addColorStop(0, theme.colors[0])
      gradient1.addColorStop(0.5, theme.colors[1])
      gradient1.addColorStop(1, theme.colors[2])
      
      ctx.fillStyle = gradient1
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Apply linear gradient overlay
      gradient2.addColorStop(0, 'rgba(0,0,0,0.1)')
      gradient2.addColorStop(0.5, 'rgba(255,255,255,0.1)')
      gradient2.addColorStop(1, 'rgba(0,0,0,0.1)')
      
      ctx.fillStyle = gradient2
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add sophisticated decorative elements
      ctx.globalCompositeOperation = 'overlay'
      
      // Floating particles
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = Math.random() * 3 + 1
        const alpha = Math.random() * 0.3 + 0.1
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Geometric shapes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 100 + 50
        
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.random() * Math.PI * 2)
        ctx.fillRect(-size/2, -size/2, size, size)
        ctx.restore()
      }
      
      ctx.globalCompositeOperation = 'source-over'
      
      // Add sophisticated text with multiple effects
      const fontSize = Math.min(width / 15, 48)
      ctx.font = `bold ${fontSize}px 'Arial', sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Word wrap the prompt intelligently
      const words = prompt.split(' ')
      const lines = []
      let currentLine = ''
      const maxWidth = canvas.width * 0.85
      
      words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      })
      if (currentLine) lines.push(currentLine)
      
      // Draw text with multiple effects
      const startY = canvas.height / 2 - (lines.length - 1) * (fontSize * 0.8)
      
      lines.forEach((line, index) => {
        const y = startY + (index * fontSize * 1.6)
        
        // Outer glow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
        ctx.shadowBlur = 20
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.fillText(line, canvas.width / 2, y)
        
        // Inner shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 10
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.fillText(line, canvas.width / 2 + 2, y + 2)
        
        // Main text with gradient
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        
        const textGradient = ctx.createLinearGradient(
          canvas.width / 2 - 100, y - fontSize/2,
          canvas.width / 2 + 100, y + fontSize/2
        )
        textGradient.addColorStop(0, '#ffffff')
        textGradient.addColorStop(0.5, '#f0f0f0')
        textGradient.addColorStop(1, '#ffffff')
        
        ctx.fillStyle = textGradient
        ctx.fillText(line, canvas.width / 2, y)
      })
      
      // Add sophisticated border with gradient
      const borderGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
      borderGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)')
      borderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)')
      
      ctx.strokeStyle = borderGradient
      ctx.lineWidth = 6
      ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30)
      
      // Add corner decorations
      const cornerSize = 30
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 3
      
      // Top-left corner
      ctx.beginPath()
      ctx.moveTo(15, 15 + cornerSize)
      ctx.lineTo(15, 15)
      ctx.lineTo(15 + cornerSize, 15)
      ctx.stroke()
      
      // Top-right corner
      ctx.beginPath()
      ctx.moveTo(canvas.width - 15 - cornerSize, 15)
      ctx.lineTo(canvas.width - 15, 15)
      ctx.lineTo(canvas.width - 15, 15 + cornerSize)
      ctx.stroke()
      
      // Bottom-left corner
      ctx.beginPath()
      ctx.moveTo(15, canvas.height - 15 - cornerSize)
      ctx.lineTo(15, canvas.height - 15)
      ctx.lineTo(15 + cornerSize, canvas.height - 15)
      ctx.stroke()
      
      // Bottom-right corner
      ctx.beginPath()
      ctx.moveTo(canvas.width - 15, canvas.height - 15 - cornerSize)
      ctx.lineTo(canvas.width - 15, canvas.height - 15)
      ctx.lineTo(canvas.width - 15 - cornerSize, canvas.height - 15)
      ctx.stroke()
      
      // Add theme name and AI label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '14px Arial'
      ctx.fillText(`${theme.name} Theme • AI Generated`, canvas.width / 2, canvas.height - 25)
      
      console.log(`Professional demo image generated successfully with ${theme.name} theme`)
      const dataUrl = canvas.toDataURL('image/png')
      console.log('Generated image data URL length:', dataUrl.length)
      return dataUrl
      
    } catch (error) {
      console.error('Error generating professional demo image:', error)
      // Return a simple colored rectangle as absolute fallback
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 400
      canvas.height = 400
      ctx.fillStyle = '#667eea'
      ctx.fillRect(0, 0, 400, 400)
      ctx.fillStyle = 'white'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Image Generation Error', 200, 200)
      return canvas.toDataURL()
    }
  }

  const generateOpenAIVideo = async (prompt) => {
    if (!llmConfig.apiKey) {
      throw new Error('API key is required for OpenAI video generation')
    }

    console.log('Generating OpenAI video for prompt:', prompt)
    
    // Note: Sora is not yet publicly available via API
    // This is a placeholder for when it becomes available
    throw new Error('OpenAI Sora video generation is not yet available via API. This feature will be enabled when Sora becomes publicly accessible.')
  }

  const generateLocalVideo = async (prompt) => {
    console.log('Generating local demo video for prompt:', prompt)
    
    // Create a simple animated demo video using canvas
    return await generateDemoVideo(prompt)
  }

  const generateDemoVideo = async (prompt) => {
    console.log('Generating demo video for prompt:', prompt)
    
    // Create a simple animated GIF-like video using canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 512
    canvas.height = 512
    
    // Create frames for animation
    const frames = []
    const frameCount = 30 // 1 second at 30fps
    
    for (let i = 0; i < frameCount; i++) {
      const progress = i / frameCount
      
      // Clear canvas
      ctx.fillStyle = `hsl(${(progress * 360 + 200) % 360}, 70%, 50%)`
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add animated elements
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.beginPath()
      ctx.arc(
        256 + Math.sin(progress * Math.PI * 4) * 50,
        256 + Math.cos(progress * Math.PI * 4) * 30,
        20 + Math.sin(progress * Math.PI * 2) * 10,
        0,
        Math.PI * 2
      )
      ctx.fill()
      
      // Add text
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Demo Video', 256, 100)
      
      // Add prompt text (truncated)
      ctx.font = '16px Arial'
      const truncatedPrompt = prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt
      ctx.fillText(truncatedPrompt, 256, 450)
      
      // Add frame number
      ctx.font = '12px Arial'
      ctx.fillText(`Frame ${i + 1}/${frameCount}`, 256, 480)
      
      frames.push(canvas.toDataURL('image/png'))
    }
    
    // For now, return the first frame as a static image
    // In a real implementation, this would create an actual video file
    console.log(`Demo video generated with ${frameCount} frames`)
    return frames[0] // Return first frame as placeholder
  }

  const translateText = async (text, fromLang, toLang) => {
    try {
      // Use Google Translate API (free tier available)
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`)
      
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0]
      }
      
      // Fallback: return original text
      return text
    } catch (error) {
      console.error('Translation error:', error)
      // Fallback: return original text
      return text
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
        gateResults: historyItem.gateResults,
        imageUrl: historyItem.imageUrl
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
                placeholder={llmConfig.enableTranslation ? 
                  `Ask the LLM a question (${llmConfig.inputLanguage === 'auto' ? 'any language' : llmConfig.inputLanguage})...` : 
                  "Ask the LLM a question..."
                }
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
