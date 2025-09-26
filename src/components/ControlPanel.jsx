import React from 'react'
import { Settings, Zap, Activity, Target } from 'lucide-react'

const ControlPanel = ({ 
  llmConfig, 
  setLlmConfig, 
  accuracy, 
  totalTests, 
  passedTests, 
  isLoading 
}) => {
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

      <div className="control-group">
        <label htmlFor="apiKey">
          <Settings size={16} style={{ marginRight: '8px', display: 'inline' }} />
          API Configuration
        </label>
        <input
          id="apiKey"
          type="password"
          placeholder="Enter API Key"
          value={llmConfig.apiKey}
          onChange={(e) => handleConfigChange('apiKey', e.target.value)}
        />
      </div>

      <div className="control-group">
        <label htmlFor="model">Model</label>
        <select
          id="model"
          value={llmConfig.model}
          onChange={(e) => handleConfigChange('model', e.target.value)}
        >
          <option value="mistral">Mistral 7B (Local)</option>
          <option value="llama2">Llama 2 (Local)</option>
          <option value="codellama">Code Llama (Local)</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (API)</option>
          <option value="gpt-4">GPT-4 (API)</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet (API)</option>
        </select>
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
