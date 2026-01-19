
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Quiz, Course, CalendarEvent } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const modelName = 'gemini-2.5-flash';

// --- Quiz and Content Generation ---

export const generateCourseImage = async (courseTitle: string, learningOutcomes: string): Promise<string | null> => {
    try {
        const prompt = `An illustrative-style, vibrant, and professional course banner image relevant to a course titled "${courseTitle}". The course covers: ${learningOutcomes}. The image should be abstract and visually appealing, suitable for an online learning platform. Avoid text. Aspect ratio 16:9.`;
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating course image:", error);
        return null;
    }
};

export const generateAvatarImage = async (userName: string): Promise<string | null> => {
    try {
        const prompt = `A professional headshot avatar for an online profile. The user is named "${userName}". Digital art style, vibrant colors, clean background, facing forward, pleasant expression.`;
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating avatar image:", error);
        return null;
    }
};

export const generateQuiz = async (topic: string, instruction?: string): Promise<Quiz | null> => {
  try {
    const response = await ai.models.generateContent({
        model: modelName,
        contents: `Generate a 5-question multiple-choice quiz about ${topic}. Each question should have 4 options and one correct answer. ${instruction || ''}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING },
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                },
                                correctAnswer: { type: Type.STRING }
                            },
                            required: ["question", "options", "correctAnswer"]
                        }
                    }
                },
                required: ["topic", "questions"]
            },
        },
    });

    const jsonText = response.text;
    const quizData = JSON.parse(jsonText);
    return quizData as Quiz;

  } catch (error) {
    console.error("Error generating quiz:", error);
    return null;
  }
};

export const generateCourseContent = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Generate a concise and informative educational text for a subtopic titled "${topic}". The content should be suitable for an online course. Explain the concept clearly. Use paragraphs for readability. Format the output as clean, semantic HTML using tags like <p>, <strong>, and <ul> for key points. Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating course content:", error);
        return "<p>Failed to generate content. Please try again.</p>";
    }
};

export interface LessonPlanOptions {
    keyTopics: string;
    trainingHours: number;
    assessmentHours: number;
    startTime: string;
    endTime: string;
    includeMorningBreak: boolean;
    includeLunchBreak: boolean;
    includeAfternoonBreak: boolean;
    instruction?: string;
}

export const generateLessonPlan = async (options: LessonPlanOptions): Promise<string> => {
    const { keyTopics, trainingHours, assessmentHours, startTime, endTime, includeMorningBreak, includeLunchBreak, includeAfternoonBreak, instruction } = options;
    
    const totalDuration = trainingHours + assessmentHours;

    let breakInstructions = 'The schedule should include';
    const breaks = [];
    if (includeMorningBreak) breaks.push('a morning break (approx. 15 minutes)');
    if (includeLunchBreak) breaks.push('a lunch break (approx. 1 hour)');
    if (includeAfternoonBreak) breaks.push('an afternoon break (approx. 15 minutes)');

    if (breaks.length > 0) {
        breakInstructions += ` ${breaks.join(', ')}.`;
    } else {
        breakInstructions = 'No breaks are scheduled.';
    }

    try {
        const prompt = `
        Generate a structured and detailed lesson plan in the form of an HTML table. The output must be a single, well-formed <table> element with a <thead> and <tbody>. Do not include <html>, <body>, or <style> tags. The table should have a clean design with classes "min-w-full divide-y divide-gray-200".

        **Lesson Plan Parameters:**
        - **Key Topics to Cover**: 
        ${keyTopics}
        - **Total Duration**: ${totalDuration} hours
        - **Training Duration**: ${trainingHours} hours
        - **Assessment Duration**: ${assessmentHours} hours
        - **Daily Schedule**: The plan should fit within a daily schedule starting at ${startTime} and ending at ${endTime}.
        - **Breaks**: ${breakInstructions}

        **Table Structure:**
        The table must have a header (<thead>) and a body (<tbody>) with the following columns in this exact order:
        1.  **Duration**: The time allocated for the activity (e.g., "1 hour", "30 mins").
        2.  **Learning Unit**: The overarching module or unit name.
        3.  **Topics and Activities**: A detailed description of the specific topic being covered and the corresponding learning activities.
        4.  **Instruction Methods**: Choose ONE of the following options:
            - Interactive Presentation
            - Demonstration
            - Practice and Drill
            - Concept Formation
            - Role Play
            - Simulation
            - Case Study
            - Reflection Journaling
        5.  **Assessment Methods**: Choose ONE of the following options:
            - Written Exam
            - Practical Exam
            - Case Study
            - Reflection Journaling
            - Oral Questioning
            - Role Play

        **Instructions:**
        - Create a timed agenda that logically sequences the key topics, activities, assessments, and specified breaks.
        - The total time for all activities, breaks, and assessments must sum up to the total duration and fit within the daily schedule.
        - Fill the table rows (<tr> with <td> elements) accordingly. Be specific and practical in the "Topics and Activities" column.
        - For "Instruction Methods" and "Assessment Methods" columns, you MUST use one of the provided options from the lists above. If an activity like a break does not have one, leave the cell empty or use 'N/A'.
        - **User Instructions**: ${instruction || 'N/A'}
        `;

        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating lesson plan:", error);
        return "<p>Failed to generate lesson plan. Please try again.</p>";
    }
};


export const generateCaseStudy = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Generate a realistic and engaging case study related to the topic: "${topic}". The case study should present a problem or scenario, provide relevant background details, and conclude with questions for discussion or analysis. Format the output as clean, semantic HTML using tags like <h3>, <p>, and <ul> for the questions. Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating case study:", error);
        return "<p>Failed to generate case study. Please try again.</p>";
    }
};

export const generateRolePlayScenario = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Design an interactive role-playing scenario for learners on the topic: "${topic}". Describe the setting, the roles for participants, the central conflict or task, and the learning objectives. Format the output as clean, semantic HTML using tags like <h3> for sections, and <p> and <ul> for details. Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating role play scenario:", error);
        return "<p>Failed to generate role play scenario. Please try again.</p>";
    }
};

export const generateEscapeRoomGame = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `
        Design a text-based digital escape room game concept for learners on the topic: "${topic}".
        The output must be a complete game concept formatted as clean, semantic HTML using tags like <h3>, <h4>, <p>, <ul>, and <li>. Do not include <html> or <body> tags.

        The concept should include:
        1.  **Theme/Narrative**: A brief, engaging story that sets the scene.
        2.  **Objective**: What the player needs to do to "escape" or win.
        3.  **Puzzles**: A sequence of 3-4 puzzles. Each puzzle must be directly related to the learning topic of "${topic}". Describe the puzzle and what the player needs to do.
        4.  **Clues**: For each puzzle, provide a hint that can help a struggling player.
        
        **User Instructions:**
        ${instruction || 'None'}
        `;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating escape room game:", error);
        return "<p>Failed to generate escape room game. Please try again.</p>";
    }
};

export const generateWrittenAssessment = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Generate a set of 3-5 written assessment questions for the topic: "${topic}". Include a mix of question types, such as short answer, essay, and problem-solving. Provide ideal answers or a grading rubric for each question. Format the output as clean, semantic HTML using tags like <h3>, <h4>, <p>, and <blockquote> for answers/rubrics. Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating written assessment:", error);
        return "<p>Failed to generate written assessment. Please try again.</p>";
    }
};

export const generateOralQuestioning = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Generate a list of 10-15 oral questioning prompts to assess a learner's understanding of the topic: "${topic}". The questions should range from basic recall to higher-order thinking and application. Format the output as a clean, semantic HTML ordered list (<ol> and <li>). Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating oral questioning prompts:", error);
        return "<p>Failed to generate oral questioning prompts. Please try again.</p>";
    }
};

export const generateInteractivePollSurvey = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Generate a short, 3-5 question interactive poll or survey about the topic: "${topic}". The questions should be engaging and designed to quickly gauge audience understanding or opinions. For each question, provide 3-4 multiple-choice options. Format the output as clean, semantic HTML using tags like <h3>, <h4> for questions, and <ul> with <li> for options. Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating interactive poll/survey:", error);
        return "<p>Failed to generate poll/survey. Please try again.</p>";
    }
};

export const generatePracticalLab = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Generate a detailed, step-by-step practical lab exercise for the topic: "${topic}". The lab should be hands-on and guide the learner through a specific task. Include a list of prerequisites, the lab objective, and clear, numbered steps. Format the output as clean, semantic HTML using tags like <h3>, <p>, <ul>, and <ol>. Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating practical lab:", error);
        return "<p>Failed to generate practical lab. Please try again.</p>";
    }
};

export const generateMindMap = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Generate a mind map on the topic: "${topic}". The mind map should start with a central idea and branch out into key concepts and sub-points. Format the output as a nested HTML unordered list (<ul> with nested <li> and <ul>). Do not include <html> or <body> tags. The structure should be hierarchical. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating mind map:", error);
        return "<p>Failed to generate mind map. Please try again.</p>";
    }
};

// --- NEW CURRICULUM DESIGN TOOLS ---

export const generateLearningOutcomes = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Generate 3-5 clear, measurable learning outcomes for a topic titled "${topic}". The outcomes should follow the SMART (Specific, Measurable, Achievable, Relevant, Time-bound) principles where applicable. Format the output as a clean, semantic HTML unordered list (<ul> and <li>). Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating learning outcomes:", error);
        return "<p>Failed to generate learning outcomes. Please try again.</p>";
    }
};

export const generateRationaleOfSequencing = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Generate a rationale for the sequencing of topics for a course module on "${topic}". Explain the pedagogical flow from one topic to the next, justifying why the topics are ordered in that specific way. Consider principles like simple to complex, foundational to advanced, etc. Format the output as clean, semantic HTML with paragraphs (<p>) and bold tags (<strong>) for emphasis. Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating rationale of sequencing:", error);
        return "<p>Failed to generate rationale. Please try again.</p>";
    }
};

export const generateBackgroundResearch = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Conduct and summarize background research on the topic: "${topic}". Include key definitions, historical context, and current industry trends. The summary should be suitable for course developers. Format the output as clean, semantic HTML using headings (<h3>), paragraphs (<p>), and lists (<ul>). Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating background research:", error);
        return "<p>Failed to generate research. Please try again.</p>";
    }
};

export const generatePerformanceGapAnalysis = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Create a performance gap analysis for a professional learning about the topic "${topic}".
        The analysis should be presented as a clean, semantic HTML table. Do not include <html> or <body> tags.
        The table should have three columns:
        1. **Current Performance/Knowledge**: Describe the typical starting point for a learner.
        2. **Desired Performance/Knowledge**: Describe the target state after completing the training.
        3. **Identified Gap & Training Needs**: Clearly state the gap and what training is required to bridge it.
        Provide 3-4 distinct points in the analysis.
        ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating performance gap analysis:", error);
        return "<p>Failed to generate analysis. Please try again.</p>";
    }
};

export const generateInstructionMethods = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Suggest and justify a variety of instructional methods for teaching the topic: "${topic}". Include methods for different learning styles (e.g., visual, auditory, kinesthetic). For each method, provide a brief rationale. Format the output as clean, semantic HTML using headings (<h3>) for each method and paragraphs (<p>) for the rationale. Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating instruction methods:", error);
        return "<p>Failed to generate methods. Please try again.</p>";
    }
};

export const generateAssessmentMethods = async (topic: string, instruction?: string): Promise<string> => {
    try {
        const prompt = `Propose a set of diverse assessment methods to evaluate learner competency on the topic: "${topic}". Include both formative (e.g., quizzes, discussions) and summative (e.g., projects, exams) assessments. Explain the purpose of each method. Format the output as clean, semantic HTML using headings (<h3>) and paragraphs (<p>). Do not include <html> or <body> tags. ${instruction || ''}`;
        const response = await ai.models.generateContent({ model: modelName, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating assessment methods:", error);
        return "<p>Failed to generate methods. Please try again.</p>";
    }
};


// --- Analytics ---

export interface AnalyticsResult {
    summary: string;
    strugglingLearners: {
        name: string;
        reason: string;
    }[];
    recommendations: string[];
}

export const generateProgressAnalysis = async (course: Course): Promise<AnalyticsResult | null> => {
    if (!course.learners || course.learners.length === 0) {
        return null;
    }

    const prompt = `As an expert educational data analyst, analyze the following learner progress data for the course "${course.title}". 
    Data: ${JSON.stringify(course.learners)}.
    Provide a JSON analysis:
    1. A brief overall summary (2-3 sentences) of class performance.
    2. A list of learners who are struggling (progress < 50% or quiz score < 65%). For each, provide their name and a brief reason. If none, return an empty array.
    3. A list of exactly 3 actionable, concise recommendations for the trainer.`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        strugglingLearners: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: { name: { type: Type.STRING }, reason: { type: Type.STRING } },
                                required: ["name", "reason"]
                            }
                        },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["summary", "strugglingLearners", "recommendations"]
                }
            }
        });
        const jsonText = response.text;
        return JSON.parse(jsonText) as AnalyticsResult;
    } catch (error) {
        console.error("Error generating progress analysis:", error);
        return null;
    }
}

// --- Chatbot Instances ---

let tutorChatInstance: Chat | null = null;
let advisorChatInstance: Chat | null = null;

// Context-Aware AI Tutor for Logged-In Users
const getTutorChatInstance = (courses: Course[], calendarEvents: CalendarEvent[]): Chat => {
    const courseInfo = courses.map(c => `- ${c.title} (Status: ${c.enrollmentStatus})`).join('\n');
    const assignmentInfo = calendarEvents.filter(e => e.type === 'assignment').map(a => `- ${a.title} (Due: ${a.date})`).join('\n');

    const systemInstruction = `You are Tertiary, a helpful and friendly AI tutor for an online learning platform.
    Your user is currently enrolled in the following courses:
    ${courseInfo || 'None'}
    
    They have the following upcoming assignments:
    ${assignmentInfo || 'None'}

    Use this context to answer questions about their pending assignments or to explain concepts related to their courses. 
    If asked a general question, answer it clearly and concisely. Keep your tone encouraging and positive.`;

    if (!tutorChatInstance) {
        tutorChatInstance = ai.chats.create({
            model: modelName,
            config: { systemInstruction },
        });
    }
    // Note: In a real app, you might update the history or system instruction if the context changes.
    // For this implementation, we create it once with the initial context.
    return tutorChatInstance;
};

export const getTutorResponseStream = async (message: string, courses: Course[], calendarEvents: CalendarEvent[]) => {
    try {
        const chat = getTutorChatInstance(courses, calendarEvents);
        return await chat.sendMessageStream({ message });
    } catch (error) {
        console.error("Error getting AI Tutor stream:", error);
        throw new Error("Could not connect to the AI Tutor.");
    }
};

export const resetTutorChat = () => {
    tutorChatInstance = null;
};


// Public Course Advisor for Homepage
const getAdvisorChatInstance = (courses: Course[]): Chat => {
    const courseList = courses.map(c => `- ${c.title} (Fee: $${c.courseFee})`).join('\n');
    const systemInstruction = `You are an AI course advisor for Tertiary LMS. Your goal is to help prospective learners by answering questions about the available courses.
    Here is the list of available courses and their fees:
    ${courseList}

    Answer questions about course content, fees, and funding options based on the provided data. Be friendly, helpful, and encourage users to sign up. Do not answer questions outside of this scope.`;

    if (!advisorChatInstance) {
        advisorChatInstance = ai.chats.create({
            model: modelName,
            config: { systemInstruction },
        });
    }
    return advisorChatInstance;
};

export const getAdvisorResponseStream = async (message: string, courses: Course[]) => {
    try {
        const chat = getAdvisorChatInstance(courses);
        return await chat.sendMessageStream({ message });
    } catch (error) {
        console.error("Error getting Course Advisor stream:", error);
        throw new Error("Could not connect to the AI Advisor.");
    }
};
