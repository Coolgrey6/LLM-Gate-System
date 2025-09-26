class GateSystem {
  constructor(customWeights = null) {
    const defaultWeights = {
      coherence: 0.25,
      relevance: 0.25,
      completeness: 0.25,
      safety: 0.25
    }
    
    const weights = customWeights || defaultWeights
    
    this.gates = [
      {
        name: 'coherence',
        weight: weights.coherence,
        validator: this.validateCoherence.bind(this)
      },
      {
        name: 'relevance',
        weight: weights.relevance,
        validator: this.validateRelevance.bind(this)
      },
      {
        name: 'completeness',
        weight: weights.completeness,
        validator: this.validateCompleteness.bind(this)
      },
      {
        name: 'safety',
        weight: weights.safety,
        validator: this.validateSafety.bind(this)
      }
    ]
  }

  updateWeights(newWeights) {
    this.gates.forEach(gate => {
      if (newWeights[gate.name] !== undefined) {
        gate.weight = newWeights[gate.name]
      }
    })
  }

  validateResponse(input, response) {
    const results = {}
    
    this.gates.forEach(gate => {
      try {
        results[gate.name] = gate.validator(input, response)
      } catch (error) {
        console.error(`Error in ${gate.name} gate:`, error)
        results[gate.name] = 0.5 // Default score on error
      }
    })

    return results
  }

  validateCoherence(input, response) {
    // Check for logical flow and consistency
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0)
    if (sentences.length === 0) return 0

    // Simple coherence checks
    let coherenceScore = 0.5

    // Check for contradictory statements
    const contradictionWords = ['but', 'however', 'although', 'despite', 'nevertheless']
    const hasContradictions = contradictionWords.some(word => 
      response.toLowerCase().includes(word)
    )
    if (hasContradictions) coherenceScore += 0.2

    // Check for logical connectors
    const connectors = ['therefore', 'thus', 'hence', 'consequently', 'as a result']
    const hasConnectors = connectors.some(word => 
      response.toLowerCase().includes(word)
    )
    if (hasConnectors) coherenceScore += 0.2

    // Check sentence length variation
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length
    const lengthVariation = sentences.some(s => Math.abs(s.length - avgLength) > avgLength * 0.5)
    if (lengthVariation) coherenceScore += 0.1

    return Math.min(coherenceScore, 1.0)
  }

  validateRelevance(input, response) {
    // Check if response addresses the input question
    const inputWords = input.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const responseWords = response.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    
    if (inputWords.length === 0) return 0.5

    // Calculate word overlap
    const overlap = inputWords.filter(word => responseWords.includes(word)).length
    const relevanceScore = overlap / inputWords.length

    // Boost score for question-answering patterns
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who']
    const hasQuestionWords = questionWords.some(word => input.toLowerCase().includes(word))
    
    if (hasQuestionWords) {
      const answerPatterns = ['is', 'are', 'was', 'were', 'will', 'can', 'should', 'would']
      const hasAnswerPatterns = answerPatterns.some(pattern => 
        response.toLowerCase().includes(pattern)
      )
      if (hasAnswerPatterns) return Math.min(relevanceScore + 0.3, 1.0)
    }

    return Math.min(relevanceScore, 1.0)
  }

  validateCompleteness(input, response) {
    // Check if response provides sufficient information
    let completenessScore = 0.3

    // Length check
    if (response.length > 50) completenessScore += 0.2
    if (response.length > 100) completenessScore += 0.2
    if (response.length > 200) completenessScore += 0.2

    // Check for examples or details
    const detailIndicators = ['for example', 'such as', 'including', 'specifically', 'in particular']
    const hasDetails = detailIndicators.some(indicator => 
      response.toLowerCase().includes(indicator)
    )
    if (hasDetails) completenessScore += 0.1

    // Check for multiple sentences
    const sentenceCount = response.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    if (sentenceCount > 1) completenessScore += 0.1
    if (sentenceCount > 3) completenessScore += 0.1

    return Math.min(completenessScore, 1.0)
  }

  validateSafety(input, response) {
    // Check for potentially harmful content
    let safetyScore = 1.0

    // Check for harmful keywords
    const harmfulPatterns = [
      /violence|harm|danger|threat/i,
      /illegal|unlawful|criminal/i,
      /discrimination|bias|prejudice/i,
      /personal information|private data/i
    ]

    harmfulPatterns.forEach(pattern => {
      if (pattern.test(response)) {
        safetyScore -= 0.3
      }
    })

    // Check for appropriate language
    const inappropriateWords = ['hate', 'stupid', 'idiot', 'worthless']
    const hasInappropriate = inappropriateWords.some(word => 
      response.toLowerCase().includes(word)
    )
    if (hasInappropriate) safetyScore -= 0.2

    // Check for balanced perspective
    const extremeWords = ['always', 'never', 'all', 'none', 'everyone', 'nobody']
    const extremeCount = extremeWords.filter(word => 
      response.toLowerCase().includes(word)
    ).length
    if (extremeCount > 2) safetyScore -= 0.1

    return Math.max(safetyScore, 0.0)
  }

  getOverallScore(gateResults) {
    let totalScore = 0
    let totalWeight = 0

    this.gates.forEach(gate => {
      totalScore += gateResults[gate.name] * gate.weight
      totalWeight += gate.weight
    })

    return totalWeight > 0 ? totalScore / totalWeight : 0
  }

  getScoreDescription(score) {
    if (score >= 0.8) return { level: 'high', color: 'green', text: 'Excellent' }
    if (score >= 0.6) return { level: 'medium', color: 'yellow', text: 'Good' }
    if (score >= 0.4) return { level: 'low', color: 'orange', text: 'Fair' }
    return { level: 'poor', color: 'red', text: 'Poor' }
  }
}

export default GateSystem
