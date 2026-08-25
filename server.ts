import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Ordering guarantee: Mount JSON parser before all API routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialise Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

// Model Fallback Ladder: Ordered by availability and latency per Production Directives
const MODEL_FALLBACK_LADDER = [
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

/**
 * Resilient Content Generation helper with automatic fallback ladder
 */
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      const text = response.text || '';
      if (text || response) {
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.statusCode || 500;
      console.warn(`[Gemini Fallback Ladder] Model ${model} failed with status ${status}: ${err?.message}. Trying next fallback...`);
      // Continue to next model in ladder for recoverable errors
    }
  }

  throw new Error(`All Gemini fallback models exhausted. Last error: ${lastError?.message || 'Unknown error'}`);
}

// API Health Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    modelsConfigured: MODEL_FALLBACK_LADDER,
  });
});

// API: Multi-turn Chat for Thought Expansion & Reflection
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    // Null-Safe Destructuring
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { messages = [], framework = 'free_flow', currentMood = '', userTone = 'compassionate' } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const frameworkInstructions: Record<string, string> = {
      free_flow: 'You are a warm, wise, non-judgmental journaling companion. Help the user explore their thoughts, unknot tangled feelings, and reflect deeply. Ask one or two gentle, thought-provoking clarifying questions at a time.',
      stoic: 'You are a Stoic philosophical mentor (in the tradition of Marcus Aurelius, Seneca, Epictetus). Guide the user to distinguish between what is within their control and what is not, practicing equanimity, virtue, and objective perspective.',
      gratitude: 'You are a gratitude coach. Help the user savor small everyday victories, appreciate hidden blessings, and anchor positive neural pathways through detailed sensory recollection.',
      problem_solving: 'You are a structured thought deconstructor. Help the user break down complex challenges into root causes, first principles, manageable experiments, and clear decisions without overwhelming them.',
      emotional_clarity: 'You are an empathetic emotional translator. Validate what the user feels, help them name nuanced emotions (beyond just "happy" or "stressed"), and create a safe space for psychological decompression.',
      future_vision: 'You are a high-leverage visioning guide. Help the user align daily micro-actions with their long-term purpose, values, and ideal future self.',
    };

    const selectedInstruction = frameworkInstructions[framework] || frameworkInstructions.free_flow;
    const moodContext = currentMood ? `The user currently self-reports feeling: "${currentMood}".` : '';

    const systemInstruction = `You are the AI Reflection Partner in "Personal Gemini Journal".
Your Role:
- You are not a lecturer or a generic assistant. You are a personal, conversational thought partner.
- Tone: ${userTone}, warm, attentive, grounded, concise.
- Core philosophy: ${selectedInstruction}
- Current context: ${moodContext}
- Guidelines:
  1. Validate the user's reflection authentically before diving into questions.
  2. Keep responses focused (typically 2-4 sentences or a short bulleted insight plus 1-2 thoughtful Socratic questions).
  3. Never give medical, psychiatric, or legal advice. If a user expresses severe crisis, gently advise seeking human professional support.
  4. Use clear markdown formatting (bolding key phrases, concise lists) for pleasant reading.`;

    // Convert messages to Gemini format
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(m.content || '') }],
    }));

    const result = await generateContentWithFallback({
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      reply: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (err: any) {
    console.error('[API /api/chat Error]:', err);
    res.status(500).json({
      error: 'Failed to generate reflective reply',
      message: err?.message || 'Server error',
    });
  }
});

// API: Automated Summarization, Takeaways, & Insights Extraction
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { transcript = [], framework = 'free_flow', initialMood = '' } = body;

    if (!Array.isArray(transcript) || transcript.length === 0) {
      res.status(400).json({ error: 'Journal transcript is required' });
      return;
    }

    const transcriptText = transcript
      .map((t: any) => `${t.role === 'user' ? 'Me (Journaler)' : 'Gemini (Partner)'}: ${t.content}`)
      .join('\n\n');

    const prompt = `Analyze this personal reflective journal session and generate a structured JSON summary.

Full Conversation Transcript:
"""
${transcriptText}
"""

Journaling Framework Used: ${framework}
Initial Logged Mood: ${initialMood || 'Unspecified'}

Generate a clean JSON object with the following fields:
- "title": A creative, evocative, and personalized 3 to 7 word title summarizing the heart of this reflection.
- "executiveSummary": A coherent 2-3 sentence overview capturing what was explored and resolved.
- "keyInsights": Array of 2 to 4 bullet points highlighting key realizations, cognitive shifts, or breakthroughs.
- "actionItems": Array of 1 to 3 concrete, gentle next steps, intentions, or habits discussed.
- "detectedMood": A string representing the overall emotional valence (e.g. "Peaceful Clarity", "Productive Focus", "Hopeful & Energized", "Vulnerable & Processing", "Grateful & Grounded", "Determined").
- "themes": Array of 2 to 4 short thematic tags without hash symbols (e.g. ["Career Growth", "Self-Compassion", "Decision Making", "Mindfulness"]).
- "closingAffirmation": A 1-sentence personalized uplifting closing thought or motto for the journaler.

Respond ONLY with valid JSON matching this structure:
{
  "title": "string",
  "executiveSummary": "string",
  "keyInsights": ["string"],
  "actionItems": ["string"],
  "detectedMood": "string",
  "themes": ["string"],
  "closingAffirmation": "string"
}`;

    const result = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    let parsed = {};
    try {
      // Clean possible markdown code fences if returned
      const cleanJson = result.text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        title: 'Reflective Journal Entry',
        executiveSummary: result.text.slice(0, 200),
        keyInsights: ['Gained clarity through self-reflection.'],
        actionItems: ['Continue mindful awareness tomorrow.'],
        detectedMood: initialMood || 'Reflective',
        themes: ['Journaling', 'Personal Growth'],
        closingAffirmation: 'Every moment of honest self-reflection is a step toward wisdom.',
      };
    }

    res.json({
      summary: parsed,
      modelUsed: result.modelUsed,
    });
  } catch (err: any) {
    console.error('[API /api/summarize Error]:', err);
    res.status(500).json({
      error: 'Failed to synthesize journal summary',
      message: err?.message || 'Server error',
    });
  }
});

// API: Dynamic Prompt Suggestions by Time of Day & Theme
app.post('/api/prompts', async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { timeOfDay = 'morning', theme = 'general' } = body;

    const prompt = `Generate 4 inspiring, thought-provoking single-sentence journaling prompts for a user writing during the ${timeOfDay} with a focus theme of "${theme}".
Return a JSON array of 4 strings. Example: ["Prompt 1", "Prompt 2", "Prompt 3", "Prompt 4"]`;

    const result = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    let prompts: string[] = [];
    try {
      const cleanJson = result.text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      prompts = JSON.parse(cleanJson);
    } catch {
      prompts = [
        'What is one thing that brought an unexpected smile to your face today?',
        'If today had a central lesson to teach you, what would it be?',
        'What is an assumption you made recently that might deserve a second look?',
        'What would your most grounded, peaceful self say to you right now?',
      ];
    }

    res.json({ prompts });
  } catch (err: any) {
    console.error('[API /api/prompts Error]:', err);
    res.json({
      prompts: [
        'What is on your mind most strongly right now?',
        'What would make today or tomorrow feel meaningful?',
        'What feeling is asking for your attention today?',
        'What is a win, big or small, you want to acknowledge?',
      ],
    });
  }
});

// Setup Vite middleware in Development, or serve static build in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Personal Gemini Journal] Server is running on port ${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
