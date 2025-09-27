import React, { useState, useEffect } from 'react'
import { Settings, Zap, Activity, Target, CheckCircle, AlertCircle, Image, Video, Languages } from 'lucide-react'

const ControlPanel = ({ 
  llmConfig, 
  setLlmConfig, 
  accuracy, 
  totalTests, 
  passedTests, 
  isLoading,
  gateWeights,
  setGateWeights
}) => {
  const [installedModels, setInstalledModels] = useState([])
  const [modelStatus, setModelStatus] = useState({})

  // Check which models are installed
  useEffect(() => {
    const checkInstalledModels = async () => {
        try {
          const response = await fetch('http://localhost:11434/api/tags')
          if (response.ok) {
            const data = await response.json()
            const installedModelNames = data.models?.map(model => model.name.split(':')[0]) || []
            
            // Map installed models to expected model names
            const modelMapping = {
              'mistral': 'mistral',
              'codellama': 'codellama',
              'llama3.1': 'llama3',
              'gemma': 'gemma',
              'phi3': 'phi3'
            }
            
            // Also check for specific model variants
            const specificModelMapping = {
              'llama2:7b': 'llama2-7b',
              'llama2:13b': 'llama2-13b'
            }
            
            const detectedModels = []
            Object.entries(modelMapping).forEach(([installedName, expectedName]) => {
              if (installedModelNames.includes(installedName)) {
                detectedModels.push(expectedName)
              }
            })
            
            // Check for specific model variants
            const fullModelNames = data.models?.map(model => model.name) || []
            Object.entries(specificModelMapping).forEach(([fullName, expectedName]) => {
              if (fullModelNames.includes(fullName)) {
                detectedModels.push(expectedName)
              }
            })
            
            setInstalledModels(detectedModels)
            
            // Set status for each model
            const status = {}
            detectedModels.forEach(model => {
              status[model] = 'installed'
            })
            setModelStatus(status)
          }
        } catch (error) {
          console.log('Ollama not available or models not loaded')
        }
    }
    
    checkInstalledModels()
  }, [])

  const handleConfigChange = (field, value) => {
    setLlmConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getStatusIcon = () => {
    if (isLoading) return <Activity className="status-loading" size={16} />
    return <Zap className="status-connected" size={16} />
  }

  const getStatusText = () => {
    if (isLoading) return 'Processing...'
    return 'Connected'
  }

  const getStatusClass = () => {
    if (isLoading) return 'status-loading'
    return 'status-connected'
  }

  return (
    <div>
      <div className={`status-indicator ${getStatusClass()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>

      <div className="metric-card">
        <div className="metric-title">
          <Target size={16} style={{ marginRight: '8px', display: 'inline' }} />
          Overall Accuracy
        </div>
        <div className="metric-value">
          {Math.round(accuracy * 100)}%
        </div>
        <div className="metric-description">
          Based on {totalTests} tests
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-title">
          <Zap size={16} style={{ marginRight: '8px', display: 'inline' }} />
          Test Results
        </div>
        <div className="metric-value">
          {passedTests}/{totalTests}
        </div>
        <div className="metric-description">
          Passed tests (≥80% accuracy)
        </div>
      </div>

      <div className="metric-card" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
        <div className="metric-title">
          <CheckCircle size={16} style={{ marginRight: '8px', display: 'inline', color: '#28a745' }} />
          Installed Models
        </div>
        <div className="metric-value" style={{ fontSize: '1rem', color: '#28a745' }}>
          {installedModels.length} / 8 Local Models
        </div>
        <div className="metric-description" style={{ fontSize: '0.8rem' }}>
          {installedModels.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
              {installedModels.map((model, index) => (
                <span 
                  key={index}
                  style={{ 
                    backgroundColor: '#d4edda', 
                    color: '#155724', 
                    padding: '2px 6px', 
                    borderRadius: '3px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}
                >
                  {model}
                </span>
              ))}
            </div>
          ) : (
            'No local models detected'
          )}
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="apiKey">
          <Settings size={16} style={{ marginRight: '8px', display: 'inline' }} />
          API Configuration
        </label>
        <input
          id="apiKey"
          type="password"
          placeholder={
            llmConfig.model.includes('gpt') ? 'Enter OpenAI API Key' :
            llmConfig.model.includes('claude') ? 'Enter Anthropic API Key' :
            'Enter API Key (for API models)'
          }
          value={llmConfig.apiKey}
          onChange={(e) => handleConfigChange('apiKey', e.target.value)}
        />
        <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '5px' }}>
          {llmConfig.model.includes('gpt') && 'Required for OpenAI models (GPT-3.5, GPT-4, GPT-4 Turbo, GPT-4o)'}
          {llmConfig.model.includes('claude') && 'Required for Anthropic models (Claude 3 Sonnet, Opus, Haiku)'}
          {['mistral', 'llama2', 'codellama', 'llama3', 'gemma', 'phi3'].includes(llmConfig.model) && 'Not needed for local models (Ollama)'}
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="model">Model</label>
        <select
          id="model"
          value={llmConfig.model}
          onChange={(e) => handleConfigChange('model', e.target.value)}
          style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '14px'
          }}
        >
          <optgroup label="Local Models (Ollama)">
            <option 
              value="mistral" 
              style={{ 
                backgroundColor: installedModels.includes('mistral') ? '#d4edda' : 'white',
                color: installedModels.includes('mistral') ? '#155724' : 'black'
              }}
            >
              {installedModels.includes('mistral') ? '✅ ' : '❌ '}Mistral 7B
            </option>
            <option 
              value="llama2-7b" 
              style={{ 
                backgroundColor: installedModels.includes('llama2-7b') ? '#d4edda' : 'white',
                color: installedModels.includes('llama2-7b') ? '#155724' : 'black'
              }}
            >
              {installedModels.includes('llama2-7b') ? '✅ ' : '❌ '}Llama 2 7B
            </option>
            <option 
              value="llama2-13b" 
              style={{ 
                backgroundColor: installedModels.includes('llama2-13b') ? '#d4edda' : 'white',
                color: installedModels.includes('llama2-13b') ? '#155724' : 'black'
              }}
            >
              {installedModels.includes('llama2-13b') ? '✅ ' : '❌ '}Llama 2 13B
            </option>
            <option 
              value="codellama" 
              style={{ 
                backgroundColor: installedModels.includes('codellama') ? '#d4edda' : 'white',
                color: installedModels.includes('codellama') ? '#155724' : 'black'
              }}
            >
              {installedModels.includes('codellama') ? '✅ ' : '❌ '}Code Llama
            </option>
            <option 
              value="llama3" 
              style={{ 
                backgroundColor: installedModels.includes('llama3') ? '#d4edda' : 'white',
                color: installedModels.includes('llama3') ? '#155724' : 'black'
              }}
            >
              {installedModels.includes('llama3') ? '✅ ' : '❌ '}Llama 3.1
            </option>
            <option 
              value="gemma" 
              style={{ 
                backgroundColor: installedModels.includes('gemma') ? '#d4edda' : 'white',
                color: installedModels.includes('gemma') ? '#155724' : 'black'
              }}
            >
              {installedModels.includes('gemma') ? '✅ ' : '❌ '}Gemma
            </option>
            <option 
              value="phi3" 
              style={{ 
                backgroundColor: installedModels.includes('phi3') ? '#d4edda' : 'white',
                color: installedModels.includes('phi3') ? '#155724' : 'black'
              }}
            >
              {installedModels.includes('phi3') ? '✅ ' : '❌ '}Phi-3 Mini
            </option>
          </optgroup>
          <optgroup label="OpenAI Models (API)">
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-4o">GPT-4o</option>
          </optgroup>
          <optgroup label="Anthropic Models (API)">
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
          </optgroup>
        </select>
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#6c757d', 
          marginTop: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <CheckCircle size={12} style={{ color: '#28a745' }} />
          <span>Green = Installed & Ready</span>
          <AlertCircle size={12} style={{ color: '#dc3545', marginLeft: '10px' }} />
          <span>Red = Not Installed</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="temperature">Temperature</label>
        <input
          id="temperature"
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={llmConfig.temperature}
          onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
        />
        <div style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '5px' }}>
          {llmConfig.temperature} (0 = deterministic, 2 = creative)
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="maxTokens">Max Tokens</label>
        <input
          id="maxTokens"
          type="number"
          min="100"
          max="4000"
          step="100"
          value={llmConfig.maxTokens}
          onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label>
          <Image size={16} style={{ marginRight: '8px', display: 'inline' }} />
          Image Generation
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <input
            type="checkbox"
            id="generateImage"
            checked={llmConfig.generateImage}
            onChange={(e) => handleConfigChange('generateImage', e.target.checked)}
          />
          <label htmlFor="generateImage" style={{ margin: 0 }}>
            Generate images for prompts
          </label>
        </div>
        
        {llmConfig.generateImage && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="imageProvider">Image Provider</label>
              <select
                id="imageProvider"
                value={llmConfig.imageProvider}
                onChange={(e) => handleConfigChange('imageProvider', e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                <option value="openai">OpenAI (API Key Required)</option>
                <option value="local">Local/Open Source (No API Key)</option>
              </select>
            </div>

            {llmConfig.imageProvider === 'openai' && (
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="imageModel">Image Model</label>
                <select
                  id="imageModel"
                  value={llmConfig.imageModel}
                  onChange={(e) => handleConfigChange('imageModel', e.target.value)}
                  style={{
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  <option value="dall-e-3">DALL-E 3</option>
                  <option value="dall-e-2">DALL-E 2</option>
                </select>
              </div>
            )}

            {llmConfig.imageProvider === 'local' && (
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="localImageModel">Local Image Model</label>
                <select
                  id="localImageModel"
                  value="stable-diffusion"
                  disabled
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '14px',
                    width: '100%',
                    color: '#6c757d'
                  }}
                >
                  <option value="stable-diffusion">Stable Diffusion (Local)</option>
                </select>
                <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '5px' }}>
                  Generates professional demo images with 8 themed color schemes
                </div>
              </div>
            )}

            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="imageSize">Image Size</label>
              <select
                id="imageSize"
                value={llmConfig.imageSize}
                onChange={(e) => handleConfigChange('imageSize', e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                <option value="1024x1024">1024x1024 (Square)</option>
                <option value="1792x1024">1792x1024 (Landscape)</option>
                <option value="1024x1792">1024x1792 (Portrait)</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="imageQuality">Image Quality</label>
              <select
                id="imageQuality"
                value={llmConfig.imageQuality}
                onChange={(e) => handleConfigChange('imageQuality', e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                <option value="standard">Standard</option>
                <option value="hd">HD (Higher Quality)</option>
              </select>
            </div>

            <div style={{ 
              fontSize: '0.8rem', 
              color: '#6c757d', 
              backgroundColor: llmConfig.imageProvider === 'openai' ? '#fff3cd' : '#d1ecf1',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${llmConfig.imageProvider === 'openai' ? '#ffeaa7' : '#bee5eb'}`
            }}>
              <strong>Note:</strong> {
                llmConfig.imageProvider === 'openai' 
                  ? 'OpenAI image generation requires an API key and will consume additional credits.'
                  : 'Local mode generates professional demo images with themed color schemes, particles, and sophisticated effects.'
              }
            </div>
          </>
        )}
      </div>

      <div className="control-group">
        <label>
          <Video size={16} style={{ marginRight: '8px', display: 'inline' }} />
          Video Generation
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <input
            type="checkbox"
            id="generateVideo"
            checked={llmConfig.generateVideo}
            onChange={(e) => handleConfigChange('generateVideo', e.target.checked)}
          />
          <label htmlFor="generateVideo" style={{ margin: 0 }}>
            Generate videos for prompts
          </label>
        </div>
        
        {llmConfig.generateVideo && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="videoProvider">Video Provider</label>
              <select
                id="videoProvider"
                value={llmConfig.videoProvider}
                onChange={(e) => handleConfigChange('videoProvider', e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                <option value="openai">OpenAI Sora (API Key Required)</option>
                <option value="local">Local/Open Source (No API Key)</option>
              </select>
            </div>

            {llmConfig.videoProvider === 'openai' && (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="videoModel">Video Model</label>
                  <select
                    id="videoModel"
                    value={llmConfig.videoModel}
                    onChange={(e) => handleConfigChange('videoModel', e.target.value)}
                    style={{
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '8px',
                      fontSize: '14px',
                      width: '100%'
                    }}
                  >
                    <option value="sora">Sora (Text-to-Video)</option>
                  </select>
                </div>
              </>
            )}

            {llmConfig.videoProvider === 'local' && (
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="localVideoModel">Local Video Model</label>
                <select
                  id="localVideoModel"
                  value="demo-video"
                  disabled
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '14px',
                    width: '100%',
                    color: '#6c757d'
                  }}
                >
                  <option value="demo-video">Demo Video Generator (Local)</option>
                </select>
                <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '5px' }}>
                  Generates animated demo videos with canvas-based animation
                </div>
              </div>
            )}

            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="videoDuration">Video Duration</label>
              <select
                id="videoDuration"
                value={llmConfig.videoDuration}
                onChange={(e) => handleConfigChange('videoDuration', e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                <option value="5s">5 seconds</option>
                <option value="10s">10 seconds</option>
                <option value="30s">30 seconds</option>
                <option value="60s">60 seconds</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="videoQuality">Video Quality</label>
              <select
                id="videoQuality"
                value={llmConfig.videoQuality}
                onChange={(e) => handleConfigChange('videoQuality', e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                <option value="standard">Standard</option>
                <option value="hd">HD (720p)</option>
                <option value="fullhd">Full HD (1080p)</option>
              </select>
            </div>

            <div style={{ 
              fontSize: '0.8rem', 
              color: '#6c757d', 
              backgroundColor: llmConfig.videoProvider === 'openai' ? '#fff3cd' : '#d1ecf1',
              padding: '8px',
              borderRadius: '4px',
              border: `1px solid ${llmConfig.videoProvider === 'openai' ? '#ffeaa7' : '#bee5eb'}`
            }}>
              <strong>Note:</strong> {
                llmConfig.videoProvider === 'openai' 
                  ? 'OpenAI Sora video generation requires an API key and is not yet publicly available. This feature will be enabled when Sora becomes accessible via API.'
                  : 'Local mode generates animated demo videos with canvas-based animation, particles, and dynamic effects.'
              }
            </div>
          </>
        )}
      </div>

      <div className="control-group">
        <label>
          <Languages size={16} style={{ marginRight: '8px', display: 'inline' }} />
          Translation & Language
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <input
            type="checkbox"
            id="enableTranslation"
            checked={llmConfig.enableTranslation}
            onChange={(e) => handleConfigChange('enableTranslation', e.target.checked)}
          />
          <label htmlFor="enableTranslation" style={{ margin: 0 }}>
            Enable translation
          </label>
        </div>
        
        {llmConfig.enableTranslation && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="inputLanguage">Input Language</label>
              <select
                id="inputLanguage"
                value={llmConfig.inputLanguage}
                onChange={(e) => handleConfigChange('inputLanguage', e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                <option value="auto">Auto-detect</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
                <option value="nl">Dutch</option>
                <option value="sv">Swedish</option>
                <option value="no">Norwegian</option>
                <option value="da">Danish</option>
                <option value="fi">Finnish</option>
                <option value="pl">Polish</option>
                <option value="tr">Turkish</option>
              </select>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="outputLanguage">Output Language</label>
              <select
                id="outputLanguage"
                value={llmConfig.outputLanguage}
                onChange={(e) => handleConfigChange('outputLanguage', e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px',
                  fontSize: '14px',
                  width: '100%'
                }}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
                <option value="ar">Arabic</option>
                <option value="hi">Hindi</option>
                <option value="nl">Dutch</option>
                <option value="sv">Swedish</option>
                <option value="no">Norwegian</option>
                <option value="da">Danish</option>
                <option value="fi">Finnish</option>
                <option value="pl">Polish</option>
                <option value="tr">Turkish</option>
              </select>
            </div>

            <div style={{ 
              fontSize: '0.8rem', 
              color: '#6c757d', 
              backgroundColor: '#e8f5e8',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #c3e6c3'
            }}>
              <strong>Note:</strong> Translation uses Google Translate API (free tier). Input is translated to English for processing, then output is translated to your selected language.
            </div>
          </>
        )}
      </div>

      <div className="control-group">
        <label>
          <Target size={16} style={{ marginRight: '8px', display: 'inline' }} />
          Gate System Weights
        </label>
        <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '10px' }}>
          Adjust the importance of each validation gate (total should equal 1.0)
        </div>
        
        <div className="gate-weight-slider">
          <label htmlFor="coherence-weight">Coherence: {gateWeights.coherence.toFixed(2)}</label>
          <input
            id="coherence-weight"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={gateWeights.coherence}
            onChange={(e) => setGateWeights(prev => ({ ...prev, coherence: parseFloat(e.target.value) }))}
            style={{ marginBottom: '8px' }}
          />
        </div>

        <div className="gate-weight-slider">
          <label htmlFor="relevance-weight">Relevance: {gateWeights.relevance.toFixed(2)}</label>
          <input
            id="relevance-weight"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={gateWeights.relevance}
            onChange={(e) => setGateWeights(prev => ({ ...prev, relevance: parseFloat(e.target.value) }))}
            style={{ marginBottom: '8px' }}
          />
        </div>

        <div className="gate-weight-slider">
          <label htmlFor="completeness-weight">Completeness: {gateWeights.completeness.toFixed(2)}</label>
          <input
            id="completeness-weight"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={gateWeights.completeness}
            onChange={(e) => setGateWeights(prev => ({ ...prev, completeness: parseFloat(e.target.value) }))}
            style={{ marginBottom: '8px' }}
          />
        </div>

        <div className="gate-weight-slider">
          <label htmlFor="safety-weight">Safety: {gateWeights.safety.toFixed(2)}</label>
          <input
            id="safety-weight"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={gateWeights.safety}
            onChange={(e) => setGateWeights(prev => ({ ...prev, safety: parseFloat(e.target.value) }))}
            style={{ marginBottom: '8px' }}
          />
        </div>

        <div style={{ 
          fontSize: '0.8rem', 
          color: gateWeights.coherence + gateWeights.relevance + gateWeights.completeness + gateWeights.safety === 1.0 ? '#28a745' : '#dc3545',
          fontWeight: 'bold',
          marginTop: '10px',
          padding: '5px',
          backgroundColor: gateWeights.coherence + gateWeights.relevance + gateWeights.completeness + gateWeights.safety === 1.0 ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
          border: `1px solid ${gateWeights.coherence + gateWeights.relevance + gateWeights.completeness + gateWeights.safety === 1.0 ? '#28a745' : '#dc3545'}`
        }}>
          Total Weight: {(gateWeights.coherence + gateWeights.relevance + gateWeights.completeness + gateWeights.safety).toFixed(2)}
          {gateWeights.coherence + gateWeights.relevance + gateWeights.completeness + gateWeights.safety === 1.0 ? ' ✅' : ' ⚠️'}
        </div>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <strong>Gate System Active</strong>
        <div style={{ marginTop: '8px', color: '#666' }}>
          Responses are validated for:
          <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
            <li>Coherence & Logic</li>
            <li>Relevance to Input</li>
            <li>Completeness</li>
            <li>Safety & Appropriateness</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
