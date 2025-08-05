
import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz, Amendment } from '../types';

// The API key is hardcoded as requested for this personal, single-user application.
const apiKey = "AIzaSyAD4elCt6gvyU-KtEv0lHJZ9dnnIDMYiWs";

if (!apiKey) {
    // This provides a clear error for developers if the API key is not configured.
    throw new Error("API_KEY is not set. Please configure it.");
}
const ai = new GoogleGenAI({ apiKey });


/**
 * Sends a text prompt to the Gemini API for general doubts.
 * @param prompt - The user's query.
 * @returns The AI's text response.
 */
export const askDoubt = async (prompt: string): Promise<string> => {    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful study assistant for a CA student named Shaista. Keep your answers concise, clear, and helpful for a student preparing for accounting and finance exams."
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("Received an empty response from the AI service.");
        return text.trim();

    } catch (error) {
        console.error("Gemini API Error in askDoubt:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        if (message.includes("API key not valid")) {
             throw new Error("AI service connection failed: The API Key is not valid. Please check your environment configuration.");
        }
        throw new Error(`Failed to connect to AI service: ${message}`);
    }
};

/**
 * Generates a step-by-step solution for a given problem.
 * @param question The problem statement.
 * @returns A promise that resolves to the AI-generated solution as a string.
 */
export const getAiProblemSolution = async (question: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Provide a step-by-step solution for the following problem: ${question}`,
            config: {
                systemInstruction: "You are an expert tutor. Provide a clear, step-by-step solution. Explain the reasoning behind each step."
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("Received an empty response from the AI service.");
        return text.trim().replace(/\$/g, ''); // Remove stray dollar signs

    } catch (error) {
        console.error("Gemini API Error in getAiProblemSolution:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Failed to get AI solution: ${message}`);
    }
};

/**
 * Generates a 10-question quiz based on past CA papers.
 * @returns A promise that resolves to a Quiz object.
 */
export const getDailyQuizQuestions = async (): Promise<Quiz> => {
    const prompt = `
        You are an expert CA (Chartered Accountancy) exam coach for a dedicated student named Shaista.

        **YOUR GOAL:**
        Create a challenging 10-question quiz for a CA student. The difficulty should be representative of the CA Final or CA Intermediate (IPCC) exams.

        **RULES FOR QUESTION GENERATION:**
        1.  **Source Material:** Questions should be based on the syllabus for the Indian Chartered Accountancy examinations, covering the last 10 years of past papers for both Group 1 (Intermediate) and Group 2 (Final). They should be practical and concept-based.
        2.  **Subject Distribution:** Ensure a mix of questions from core CA subjects. For example: 3 Accounting, 3 Auditing/Law, and 4 Taxation/Financial Management.
        3.  **Core Topics:**
            *   **Accounting:** Focus on Accounting Standards (Ind AS), consolidation, partnership accounts.
            *   **Auditing and Assurance:** Include questions on Standards on Auditing (SAs), audit procedures, professional ethics.
            *   **Corporate and Other Laws:** Questions on the Companies Act, 2013, contract law, etc.
            *   **Taxation:** Mix of Direct Taxes (Income Tax) and Indirect Taxes (GST).
            *   **Financial Management:** Topics like capital budgeting, cost of capital, working capital management.

        **CRITICAL INSTRUCTIONS FOR EXPLANATIONS:**
        *   **Tone:** Write the explanation as if you are a very patient and kind teacher explaining a complex topic to a 10-year-old. Be extremely simple, use analogies, and avoid jargon where possible. The goal is SUPER simple language for a SUPER hard problem.
        *   **Structure:**
            *   Start with the core concept in one sentence. (e.g., "Okay, this looks tricky, but it's really about figuring out who is responsible for the tax.")
            *   Provide a step-by-step breakdown. Label each step clearly (Step 1, Step 2, etc.).
            *   Explain the 'WHY' for each step. Why do we apply this section? Why this approach?
            *   End with an encouraging summary. ("See? You can solve these tough problems! The key was to remember the rule for this specific situation.")

        **JSON FORMAT:**
        Follow the required JSON schema precisely. Do not add any extra text or markdown outside of the JSON structure.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A creative title for today's quiz, e.g., 'CA Final Revision Sprint #3'" },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    subject: { type: Type.STRING, description: "Accounting, Auditing, Law, Taxation, or Financial Management" },
                                    topic: { type: Type.STRING, description: "The specific topic, e.g., 'Ind AS 115'" },
                                    questionText: { type: Type.STRING, description: "The full text of the question." },
                                    options: {
                                        type: Type.OBJECT,
                                        properties: {
                                            A: { type: Type.STRING },
                                            B: { type: Type.STRING },
                                            C: { type: Type.STRING },
                                            D: { type: Type.STRING },
                                        },
                                        required: ["A", "B", "C", "D"]
                                    },
                                    correctOption: { type: Type.STRING, description: "The key of the correct option (A, B, C, or D)" },
                                    detailedExplanation: { type: Type.STRING, description: "A simple, step-by-step explanation of the solution, written for a student in a friendly and encouraging tone." }
                                },
                                required: ["subject", "topic", "questionText", "options", "correctOption", "detailedExplanation"]
                            }
                        }
                    },
                    required: ["title", "questions"]
                }
            }
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("Received an empty response from the AI service for the quiz.");
        }

        const quizData = JSON.parse(jsonText);
        // Basic validation
        if (!quizData.title || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            throw new Error("AI returned invalid quiz data structure.");
        }
        
        return quizData as Quiz;

    } catch (error) {
        console.error("Gemini API Error in getDailyQuizQuestions:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Failed to generate daily quiz: ${message}`);
    }
};

/**
 * Gets a summary of amendments for a given topic using the Gemini API.
 * @param subject The CA subject (e.g., "Direct Tax").
 * @param topic The specific act or topic (e.g., "Finance Act 2023").
 * @returns A promise that resolves to an object containing a list of summary points.
 */
export const getAmendmentsForTopic = async (subject: string, topic: string): Promise<{ points: string[] }> => {
    const prompt = `
        You are an expert AI assistant for CA (Chartered Accountancy) students in India.
        Your task is to find and summarize key amendments for a specific subject and topic.

        Subject: "${subject}"
        Topic/Act: "${topic}"

        Instructions:
        1. Identify the most critical amendments or changes related to the provided topic and subject.
        2. Summarize these changes into clear, concise, individual points. Each point should be a separate string.
        3. Focus on changes relevant for CA Final or Intermediate exams.
        4. If the topic is broad (e.g., "Companies Act 2013"), focus on the most recent or significant amendments.

        Return the output ONLY in the specified JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        points: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "A single, concise point about a specific amendment."
                            }
                        }
                    },
                    required: ["points"]
                }
            }
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("Received an empty response from the AI service for amendments.");
        }
        
        const summary = JSON.parse(jsonText);
        if (!summary.points || !Array.isArray(summary.points)) {
            throw new Error("AI returned invalid amendment data structure.");
        }

        return summary;

    } catch (error) {
        console.error("Gemini API Error in getAmendmentsForTopic:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Failed to generate amendments: ${message}`);
    }
};

/**
 * Balances a chemical equation using the Gemini API.
 * @param equation - The unbalanced chemical equation (e.g., "H2 + O2 -> H2O").
 * @returns A promise that resolves to the balanced equation string.
 */
export const balanceChemicalEquation = async (equation: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Balance the following chemical equation: ${equation}`,
            config: {
                systemInstruction: "You are a chemistry expert bot. Your task is to balance chemical equations. Return ONLY the balanced equation as a plain string, with no additional text, labels, or explanations. For example, if the input is 'H2 + O2 -> H2O', the output should be '2H2 + O2 -> 2H2O'."
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("Received an empty response from the AI service.");
        }
        // Sometimes the AI might still add markdown like ``` despite instructions.
        return text.trim().replace(/`/g, '');

    } catch (error) {
        console.error("Gemini API Error in balanceChemicalEquation:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        if (message.includes("API key not valid")) {
             throw new Error("AI service connection failed: The API Key is not valid. Please check your environment configuration.");
        }
        throw new Error(`Failed to balance equation with AI: ${message}`);
    }
};