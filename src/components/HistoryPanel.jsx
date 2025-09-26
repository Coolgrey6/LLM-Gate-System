import React from 'react'
import { History, Clock, Target, Trash2, Image } from 'lucide-react'

const HistoryPanel = ({ 
  conversationHistory, 
  selectedHistory, 
  onSelectHistory 
}) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return `${Math.round(diffInHours * 60)}m ago`
    } else if (diffInHours < 24) {
      return `${Math.round(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.8) return '#28a745'
    if (accuracy >= 0.6) return '#ffc107'
    return '#dc3545'
  }

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all conversation history?')) {
      // This would typically be handled by the parent component
      console.log('Clear history requested')
    }
  }

  return (
    <div className="history-section">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px' 
      }}>
        <h3 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#495057'
        }}>
          <History size={18} />
          Test History
        </h3>
        {conversationHistory.length > 0 && (
          <button
            onClick={clearHistory}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc3545',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Clear History"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {conversationHistory.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#6c757d', 
          padding: '20px',
          fontSize: '0.9rem'
        }}>
          No test history yet.<br />
          Start a conversation to see results here.
        </div>
      ) : (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {conversationHistory.map((item) => (
            <div
              key={item.id}
              className={`history-item ${selectedHistory?.id === item.id ? 'selected' : ''}`}
              onClick={() => onSelectHistory(item)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  color: '#495057',
                  flex: 1,
                  marginRight: '10px'
                }}>
                  {item.userInput.length > 50 
                    ? `${item.userInput.substring(0, 50)}...` 
                    : item.userInput
                  }
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontSize: '0.8rem',
                  color: getAccuracyColor(item.accuracy),
                  fontWeight: '600'
                }}>
                  <Target size={12} />
                  {Math.round(item.accuracy * 100)}%
                </div>
              </div>
              
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#6c757d',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Clock size={12} />
                {formatTimestamp(item.timestamp)}
                {item.imageUrl && (
                  <>
                    <span style={{ margin: '0 4px' }}>•</span>
                    <Image size={12} style={{ color: '#007bff' }} />
                    <span style={{ color: '#007bff' }}>Image</span>
                  </>
                )}
              </div>

              {item.gateResults && !item.gateResults.error && (
                <div style={{ 
                  marginTop: '8px',
                  display: 'flex',
                  gap: '4px',
                  flexWrap: 'wrap'
                }}>
                  {Object.entries(item.gateResults).map(([gate, score]) => (
                    <span
                      key={gate}
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        backgroundColor: score >= 0.8 ? '#d4edda' : 
                                       score >= 0.6 ? '#fff3cd' : '#f8d7da',
                        color: score >= 0.8 ? '#155724' : 
                               score >= 0.6 ? '#856404' : '#721c24',
                        fontWeight: '500'
                      }}
                    >
                      {gate}: {Math.round(score * 100)}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {conversationHistory.length > 0 && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#6c757d'
        }}>
          <strong>Total Tests:</strong> {conversationHistory.length}<br />
          <strong>Average Accuracy:</strong> {Math.round(
            conversationHistory.reduce((sum, item) => sum + item.accuracy, 0) / 
            conversationHistory.length * 100
          )}%
        </div>
      )}
    </div>
  )
}

export default HistoryPanel
