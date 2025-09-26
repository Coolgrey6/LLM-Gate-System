import React from 'react'
import { ArrowLeft, ExternalLink, Brain, Shield, Zap, Target } from 'lucide-react'

const AboutPage = ({ onBack }) => {
  return (
    <div className="about-page">
      <div className="about-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
          Back to Interface
        </button>
        <h1>LLM Testing Interface</h1>
        <p className="creator-info">Created by <strong>Donald M. Bugden</strong></p>
      </div>

      <div className="about-content">
        <div className="about-section">
          <h2><Brain size={24} style={{ marginRight: '10px', display: 'inline' }} />About This Project</h2>
          <p>
            The LLM Testing Interface is a comprehensive platform for evaluating and testing Large Language Models (LLMs) 
            with real-time accuracy tracking and validation. This tool provides researchers, developers, and AI enthusiasts 
            with a powerful way to assess model performance across different parameters and configurations.
          </p>
        </div>

        <div className="about-section">
          <h2><Shield size={24} style={{ marginRight: '10px', display: 'inline' }} />Gate System Algorithm</h2>
          <p>
            The core innovation of this interface is the <strong>Gate System Algorithm</strong>, a multi-dimensional 
            validation framework that evaluates LLM responses across four critical dimensions:
          </p>
          
          <div className="gate-explanations">
            <div className="gate-item">
              <h3>1. Coherence Gate</h3>
              <p>
                Evaluates logical flow and consistency in responses. Uses natural language processing techniques 
                to detect contradictory statements, logical connectors, and sentence structure patterns.
              </p>
              <a href="https://en.wikipedia.org/wiki/Coherence_(linguistics)" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about Coherence in Linguistics
              </a>
            </div>

            <div className="gate-item">
              <h3>2. Relevance Gate</h3>
              <p>
                Measures how well responses address the input question using word overlap analysis and 
                question-answering pattern recognition.
              </p>
              <a href="https://en.wikipedia.org/wiki/Relevance_theory" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about Relevance Theory
              </a>
            </div>

            <div className="gate-item">
              <h3>3. Completeness Gate</h3>
              <p>
                Assesses whether responses provide sufficient information through length analysis, 
                detail indicators, and sentence count evaluation.
              </p>
              <a href="https://en.wikipedia.org/wiki/Information_completeness" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about Information Completeness
              </a>
            </div>

            <div className="gate-item">
              <h3>4. Safety Gate</h3>
              <p>
                Scans for potentially harmful content using pattern matching, inappropriate language detection, 
                and bias identification techniques.
              </p>
              <a href="https://en.wikipedia.org/wiki/AI_safety" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about AI Safety
              </a>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2><Zap size={24} style={{ marginRight: '10px', display: 'inline' }} />Technical Implementation</h2>
          <p>
            This interface integrates multiple cutting-edge technologies and methodologies:
          </p>
          
          <div className="tech-list">
            <div className="tech-item">
              <h3>Large Language Models (LLMs)</h3>
              <p>
                Supports both local models via Ollama and cloud-based models from OpenAI and Anthropic.
              </p>
              <a href="https://en.wikipedia.org/wiki/Large_language_model" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about Large Language Models
              </a>
            </div>

            <div className="tech-item">
              <h3>Ollama Framework</h3>
              <p>
                Enables local deployment of LLMs with optimized performance on Apple Silicon.
              </p>
              <a href="https://en.wikipedia.org/wiki/Ollama" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about Ollama
              </a>
            </div>

            <div className="tech-item">
              <h3>Natural Language Processing</h3>
              <p>
                Implements advanced NLP techniques for text analysis and validation.
              </p>
              <a href="https://en.wikipedia.org/wiki/Natural_language_processing" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about Natural Language Processing
              </a>
            </div>

            <div className="tech-item">
              <h3>Real-time Validation</h3>
              <p>
                Provides instant feedback on response quality using weighted scoring algorithms.
              </p>
              <a href="https://en.wikipedia.org/wiki/Real-time_computing" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about Real-time Computing
              </a>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2><Target size={24} style={{ marginRight: '10px', display: 'inline' }} />Scientific Foundation</h2>
          <p>
            The Gate System Algorithm is based on established research in computational linguistics, 
            machine learning validation, and AI safety. Key scientific principles include:
          </p>
          
          <div className="science-list">
            <div className="science-item">
              <h3>Computational Linguistics</h3>
              <p>
                The coherence and relevance gates utilize principles from computational linguistics 
                to analyze text structure and meaning.
              </p>
              <a href="https://en.wikipedia.org/wiki/Computational_linguistics" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about Computational Linguistics
              </a>
            </div>

            <div className="science-item">
              <h3>Machine Learning Validation</h3>
              <p>
                The scoring system employs machine learning validation techniques to ensure 
                consistent and reliable evaluation metrics.
              </p>
              <a href="https://en.wikipedia.org/wiki/Validation_(machine_learning)" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about ML Validation
              </a>
            </div>

            <div className="science-item">
              <h3>Pattern Recognition</h3>
              <p>
                Advanced pattern recognition algorithms identify linguistic patterns, 
                safety concerns, and quality indicators in generated text.
              </p>
              <a href="https://en.wikipedia.org/wiki/Pattern_recognition" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about Pattern Recognition
              </a>
            </div>

            <div className="science-item">
              <h3>Human-Computer Interaction</h3>
              <p>
                The interface design follows HCI principles to provide intuitive 
                and effective interaction with complex AI systems.
              </p>
              <a href="https://en.wikipedia.org/wiki/Human%E2%80%93computer_interaction" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} /> Learn about Human-Computer Interaction
              </a>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2>About Donald M. Bugden</h2>
          <p>
            Donald M. Bugden is a software developer and AI researcher with expertise in machine learning, 
            natural language processing, and human-computer interaction. This project represents a synthesis 
            of cutting-edge AI technologies with practical usability considerations.
          </p>
          <p>
            The LLM Testing Interface demonstrates the importance of validation frameworks in AI development, 
            providing researchers and developers with tools to ensure AI systems meet high standards of 
            accuracy, safety, and reliability.
          </p>
        </div>

        <div className="about-section">
          <h2>Open Source & Research</h2>
          <p>
            This project is built with open-source technologies and follows research best practices. 
            The Gate System Algorithm represents a novel approach to LLM validation that can be 
            extended and improved by the research community.
          </p>
          <p>
            <strong>Technologies Used:</strong> React, Vite, Ollama, OpenAI API, Anthropic API, 
            Natural Language Processing, Machine Learning Validation, Real-time Computing
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
