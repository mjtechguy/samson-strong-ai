import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateFitnessResponse = async (
  message: string,
  userProfile: {
    age: number;
    weight: number;
    height: number;
    sex: string;
    fitnessGoals: string[];
    experienceLevel: string;
  }
) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional fitness trainer. Use the following user profile to provide personalized advice:
            Age: ${userProfile.age}
            Weight: ${userProfile.weight}kg
            Height: ${userProfile.height}cm
            Sex: ${userProfile.sex}
            Goals: ${userProfile.fitnessGoals.join(', ')}
            Experience: ${userProfile.experienceLevel}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error('Error generating fitness response:', error);
    throw new Error('Failed to generate fitness response');
  }
};