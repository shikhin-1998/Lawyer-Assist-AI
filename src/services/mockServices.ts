import { DocumentSummary, DocumentReference } from '../stores/documentStore';
import { Reference } from '../stores/referenceStore';

// Mock Authentication Service
export const mockAuth = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      return {
        success: true,
        user: {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: email,
          phone: '+1234567890',
        }
      };
    } else {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }
  },

  register: async (userData: any): Promise<{ success: boolean; user?: any; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      user: {
        id: Date.now().toString(),
        ...userData
      }
    };
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Mock Summarizer Service
export const mockSummarizer = {
  generateSummary: async (documentId: string, content?: string): Promise<DocumentSummary> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSummaries = [
      {
        text: "This legal document outlines the terms and conditions for employment agreement between parties. Key provisions include non-compete clauses, intellectual property rights, and termination procedures.",
        references: [
          { id: 'ref1', page: 1, bbox: [100, 150, 300, 50] as [number, number, number, number], snippet: "Employment Agreement", text: "This Employment Agreement..." },
          { id: 'ref2', page: 2, bbox: [80, 200, 250, 40] as [number, number, number, number], snippet: "Non-compete clause", text: "Employee agrees not to..." },
          { id: 'ref3', page: 3, bbox: [120, 100, 280, 60] as [number, number, number, number], snippet: "Termination procedures", text: "Either party may terminate..." }
        ]
      },
      {
        text: "The contract establishes service delivery standards, payment terms, and dispute resolution mechanisms. Important deadlines and deliverables are clearly defined.",
        references: [
          { id: 'ref4', page: 1, bbox: [90, 180, 320, 45] as [number, number, number, number], snippet: "Service Agreement", text: "Service Provider shall..." },
          { id: 'ref5', page: 2, bbox: [110, 120, 290, 55] as [number, number, number, number], snippet: "Payment Terms", text: "Payment shall be made..." },
          { id: 'ref6', page: 4, bbox: [95, 160, 310, 50] as [number, number, number, number], snippet: "Dispute Resolution", text: "Any disputes arising..." }
        ]
      },
      {
        text: "This patent application describes a novel method for data processing with claims covering system architecture and implementation details.",
        references: [
          { id: 'ref7', page: 1, bbox: [85, 140, 330, 60] as [number, number, number, number], snippet: "Patent Application", text: "We claim a method..." },
          { id: 'ref8', page: 2, bbox: [100, 90, 300, 70] as [number, number, number, number], snippet: "System Architecture", text: "The system comprises..." },
          { id: 'ref9', page: 3, bbox: [115, 130, 285, 55] as [number, number, number, number], snippet: "Implementation Details", text: "The method includes..." }
        ]
      }
    ];
    
    const randomSummary = mockSummaries[Math.floor(Math.random() * mockSummaries.length)];
    
    return {
      id: `summary_${documentId}`,
      text: randomSummary.text,
      confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
      references: randomSummary.references,
    };
  }
};

// Mock RAG Service
export const mockRag = {
  askQuestion: async (question: string, documentId: string): Promise<{
    answer: string;
    references: DocumentReference[];
    confidence: number;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Deterministic responses based on question keywords
    const lowerQuestion = question.toLowerCase();
    
    let answer = '';
    let references: DocumentReference[] = [];
    
    if (lowerQuestion.includes('termination') || lowerQuestion.includes('fire') || lowerQuestion.includes('end')) {
      answer = "The termination clause allows either party to terminate the agreement with 30 days written notice. The employee must return all company property and maintain confidentiality of trade secrets for 2 years post-termination.";
      references = [
        { id: 'ref_term1', page: 3, bbox: [120, 100, 280, 60] as [number, number, number, number], snippet: "Termination procedures", text: "Either party may terminate..." },
        { id: 'ref_term2', page: 4, bbox: [90, 150, 320, 45] as [number, number, number, number], snippet: "Notice period", text: "Termination requires 30 days..." }
      ];
    } else if (lowerQuestion.includes('payment') || lowerQuestion.includes('salary') || lowerQuestion.includes('compensation')) {
      answer = "Payment terms specify monthly compensation of $5,000, payable on the 1st of each month. Overtime is compensated at 1.5x the hourly rate for hours worked beyond 40 per week.";
      references = [
        { id: 'ref_pay1', page: 2, bbox: [110, 120, 290, 55] as [number, number, number, number], snippet: "Payment Terms", text: "Payment shall be made..." },
        { id: 'ref_pay2', page: 2, bbox: [95, 180, 310, 50] as [number, number, number, number], snippet: "Overtime compensation", text: "Overtime hours are compensated..." }
      ];
    } else if (lowerQuestion.includes('confidential') || lowerQuestion.includes('nda') || lowerQuestion.includes('secret')) {
      answer = "The confidentiality clause requires the employee to maintain strict secrecy of all proprietary information, trade secrets, and client data. This obligation continues for 3 years after employment ends.";
      references = [
        { id: 'ref_conf1', page: 5, bbox: [85, 140, 330, 60] as [number, number, number, number], snippet: "Confidentiality clause", text: "Employee agrees to maintain..." },
        { id: 'ref_conf2', page: 5, bbox: [100, 200, 300, 40] as [number, number, number, number], snippet: "Duration of obligation", text: "This obligation continues for..." }
      ];
    } else if (lowerQuestion.includes('non-compete') || lowerQuestion.includes('competition')) {
      answer = "The non-compete clause prohibits the employee from working for direct competitors within a 50-mile radius for 12 months after termination. This applies to companies in the same industry offering similar services.";
      references = [
        { id: 'ref_nc1', page: 2, bbox: [80, 200, 250, 40] as [number, number, number, number], snippet: "Non-compete clause", text: "Employee agrees not to..." },
        { id: 'ref_nc2', page: 2, bbox: [120, 250, 280, 35] as [number, number, number, number], snippet: "Geographic scope", text: "Within 50-mile radius..." }
      ];
    } else {
      answer = "Based on the document analysis, I can provide information about various aspects of this agreement. Please ask a specific question about termination, payment, confidentiality, non-compete clauses, or other terms to get detailed information.";
      references = [
        { id: 'ref_gen1', page: 1, bbox: [100, 150, 300, 50] as [number, number, number, number], snippet: "General terms", text: "This agreement contains..." }
      ];
    }
    
    return {
      answer,
      references,
      confidence: 0.8 + Math.random() * 0.15, // 80-95% confidence
    };
  }
};

// Mock Transcriber Service (for when Web Speech API is unavailable)
export const mockTranscriber = {
  transcribe: async (audioBlob?: Blob): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockLegalTexts = [
      "This agreement is entered into on this date between the parties.",
      "The contractor shall provide services in accordance with the terms outlined herein.",
      "Payment shall be made within thirty days of receipt of invoice.",
      "Either party may terminate this agreement with written notice.",
      "Confidential information shall not be disclosed to third parties.",
      "The governing law for this agreement shall be the state of California.",
      "Any disputes arising from this agreement shall be resolved through arbitration.",
      "This agreement constitutes the entire understanding between the parties.",
      "Amendments to this agreement must be made in writing and signed by both parties.",
      "The parties acknowledge that they have read and understood all terms and conditions."
    ];
    
    const randomText = mockLegalTexts[Math.floor(Math.random() * mockLegalTexts.length)];
    return randomText;
  },

  // Simulate streaming transcription
  streamTranscribe: (onChunk: (text: string) => void, onComplete: () => void) => {
    const mockLegalTexts = [
      "This agreement is entered into on this date between the parties.",
      "The contractor shall provide services in accordance with the terms outlined herein.",
      "Payment shall be made within thirty days of receipt of invoice.",
      "Either party may terminate this agreement with written notice.",
      "Confidential information shall not be disclosed to third parties.",
      "The governing law for this agreement shall be the state of California.",
      "Any disputes arising from this agreement shall be resolved through arbitration.",
      "This agreement constitutes the entire understanding between the parties.",
      "Amendments to this agreement must be made in writing and signed by both parties.",
      "The parties acknowledge that they have read and understood all terms and conditions."
    ];

    let currentSentenceIndex = 0;
    let currentCharIndex = 0;
    let currentSentence = mockLegalTexts[currentSentenceIndex];

    const interval = setInterval(() => {
      if (currentCharIndex < currentSentence.length) {
        const newChar = currentSentence[currentCharIndex];
        onChunk(newChar);
        currentCharIndex++;
      } else {
        // Move to next sentence
        onChunk(' ');
        currentSentenceIndex = (currentSentenceIndex + 1) % mockLegalTexts.length;
        currentSentence = mockLegalTexts[currentSentenceIndex];
        currentCharIndex = 0;
        
        // Stop after a few sentences
        if (currentSentenceIndex === 0) {
          clearInterval(interval);
          onComplete();
        }
      }
    }, 150); // Simulate typing speed

    return () => clearInterval(interval);
  }
};
