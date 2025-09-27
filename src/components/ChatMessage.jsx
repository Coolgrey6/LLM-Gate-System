import React from 'react'
import { Video } from 'lucide-react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

const ChatMessage = ({ message }) => {
  const getAccuracyIcon = (accuracy) => {
    if (accuracy >= 0.8) return <CheckCircle className="accuracy-high" size={16} />
    if (accuracy >= 0.6) return <AlertCircle className="accuracy-medium" size={16} />
    return <XCircle className="accuracy-low" size={16} />
  }

  const getAccuracyClass = (accuracy) => {
    if (accuracy >= 0.8) return 'accuracy-high'
    if (accuracy >= 0.6) return 'accuracy-medium'
    return 'accuracy-low'
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const renderGateResults = (gateResults) => {
    if (!gateResults || gateResults.error) return null

    return (
      <div className="gate-results" style={{ marginTop: '10px', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
          <Info size={14} />
          <span style={{ fontWeight: '600' }}>Gate System Analysis:</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {Object.entries(gateResults).map(([gate, score]) => (
            <div key={gate} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '4px 8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>
                {gate}:
              </span>
              <span style={{ 
                fontWeight: '600',
                color: score >= 0.8 ? '#28a745' : score >= 0.6 ? '#ffc107' : '#dc3545'
              }}>
                {Math.round(score * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`message ${message.type}`}>
      <div className="message-header">
        <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>
          {message.type}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {message.type === 'assistant' && message.accuracy !== undefined && (
            <div className={`accuracy-indicator ${getAccuracyClass(message.accuracy)}`}>
              {getAccuracyIcon(message.accuracy)}
              <span>{Math.round(message.accuracy * 100)}%</span>
            </div>
          )}
          <span style={{ fontSize: '0.8rem', opacity: '0.7' }}>
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
      
      <div style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
        {message.content}
      </div>
      
      {message.imageUrl && (
        <div style={{ marginTop: '15px' }}>
          <img 
            src={message.imageUrl} 
            alt="Generated image" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      )}

      {message.videoUrl && (
        <div style={{ marginTop: '15px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '8px',
            color: '#6c757d',
            fontSize: '0.9rem'
          }}>
            <Video size={16} />
            <span>Generated Video</span>
          </div>
          <img 
            src={message.videoUrl} 
            alt="Generated video preview" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #e9ecef'
            }}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#6c757d', 
            marginTop: '5px',
            fontStyle: 'italic'
          }}>
            Note: This is a demo video preview. Full video generation will be available when Sora API is released.
          </div>
        </div>
      )}
      
      {message.type === 'assistant' && renderGateResults(message.gateResults)}
    </div>
  )
}

export default ChatMessage
