// API functions for interacting with the Sensay API via our proxy server

// Base URL for our proxy server
const API_BASE_URL = '/api';

/**
 * Creates a new historical figure replica
 * @param name - The name of the historical figure
 * @param shortDescription - A brief description of the historical figure
 * @param systemMessage - The system message defining the historical figure's personality and knowledge
 * @returns The created replica object with UUID
 */
export async function createReplica(
  name: string, 
  shortDescription: string, 
  systemMessage: string
): Promise<{ uuid: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/replicas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        shortDescription,
        systemMessage,
        type: 'character',
        purpose: `Educational historical figure for HistoryAlive project`
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating replica:', error);
    throw error;
  }
}

/**
 * Gets a chat completion from a historical figure replica with retry logic
 * @param replicaId - The UUID of the replica to chat with
 * @param message - The user's message to the replica
 * @param retries - Number of retry attempts (default: 2)
 * @returns The message response from the replica
 */
export async function getChatCompletionWithRetry(
  replicaId: string, 
  message: string, 
  retries = 2
): Promise<{ content: string }> {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          replica_uuid: replicaId,
          messages: [
            {
              role: 'user',
              content: message
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.choices[0].message;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // Wait before retrying (exponential backoff)
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
