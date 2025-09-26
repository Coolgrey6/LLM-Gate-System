import React, { useState, useEffect } from 'react'
import { Settings, Zap, Activity, Target, CheckCircle, AlertCircle } from 'lucide-react'

const ControlPanel = ({ 
  llmConfig, 
  setLlmConfig, 
  accuracy, 
  totalTests, 
  passedTests, 
  isLoading 
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
          const models = data.models?.map(model => model.name.split(':')[0]) || []
          setInstalledModels(models)
          
          // Set status for each model
          const status = {}
          models.forEach(model => {
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
          {installedModels.length} / 6 Local Models
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
              value="llama2" 
              style={{ 
                backgroundColor: installedModels.includes('llama2') ? '#d4edda' : 'white',
                color: installedModels.includes('llama2') ? '#155724' : 'black'
              }}
            >
              {installedModels.includes('llama2') ? '✅ ' : '❌ '}Llama 2
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
                backgroundColor: installedModels.includes('llama3.1') ? '#d4edda' : 'white',
                color: installedModels.includes('llama3.1') ? '#155724' : 'black'
              }}
            >
              {installedModels.includes('llama3.1') ? '✅ ' : '❌ '}Llama 3.1
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
