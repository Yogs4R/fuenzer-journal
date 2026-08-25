import type { ChatMessage, JournalFrameworkId, JournalSummary } from '../types/journal';

/**
 * Send messages to Gemini thought companion endpoint
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  framework: JournalFrameworkId = 'free_flow',
  currentMood: string = '',
  userTone: string = 'compassionate'
): Promise<{ reply: string; modelUsed: string }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      framework,
      currentMood,
      userTone,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Server returned error ${response.status}`);
  }

  const data = await response.json();
  return {
    reply: data.reply || '',
    modelUsed: data.modelUsed || 'gemini-3.1-flash-lite',
  };
}

/**
 * Request comprehensive reflection summarization, takeaways, and titles
 */
export async function summarizeJournalSession(
  transcript: ChatMessage[],
  framework: JournalFrameworkId = 'free_flow',
  initialMood: string = ''
): Promise<{ summary: JournalSummary; modelUsed: string }> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcript,
      framework,
      initialMood,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Summarization failed (${response.status})`);
  }

  const data = await response.json();
  return {
    summary: data.summary,
    modelUsed: data.modelUsed || 'gemini-3.1-flash-lite',
  };
}

/**
 * Fetch dynamic AI journaling prompts
 */
export async function fetchDynamicPrompts(
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',
  theme: string = 'general'
): Promise<string[]> {
  try {
    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timeOfDay, theme }),
    });

    if (!response.ok) throw new Error('Prompt request failed');
    const data = await response.json();
    return Array.isArray(data.prompts) ? data.prompts : [];
  } catch (err) {
    console.warn('Failed to fetch dynamic prompts, using fallback list', err);
    return [
      'What is on your mind most strongly in this present moment?',
      'What would make today feel truly rewarding or grounded?',
      'What is one feeling you have been carrying that needs space to breathe?',
      'What is something you handled well recently that you should give yourself credit for?',
    ];
  }
}
