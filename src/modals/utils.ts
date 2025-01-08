import { ChatHistoryParsed, Roles } from '@/interface/chatHistory';
import { outputSchema } from '@/schema/modeOutput';
import { generateObject, GenerateObjectResult, LanguageModelV1 } from 'ai';

/**
 * Maps the role from `Roles` to the expected output format.
 *
 * @param {Roles} role - The role to map.
 * @returns {'data' | 'user' | 'system' | 'assistant'} The mapped role.
 */
function mapRole(role: Roles): 'data' | 'user' | 'system' | 'assistant' {
  switch (role) {
    case 'function':
      return 'user'; // Adjust this if necessary
    case 'tool':
      return 'data'; // Adjust this if necessary
    default:
      return role; // Directly return the role if it matches the expected values
  }
}

/**
 * Generates an object response based on the provided parameters.
 *
 * @param {Object} params - The parameters for generating the object response.
 * @param {ChatHistoryParsed[] | []} params.messages - The chat history messages.
 * @param {string} params.systemPrompt - The system prompt to use.
 * @param {string} params.prompt - The user prompt to use.
 * @param {string} [params.extractedCode] - Optional extracted code to include in the messages.
 * @param {LanguageModelV1} params.model - The language model to use.
 * @returns {Promise<GenerateObjectResult>} A promise that resolves with the generated object response.
 */
export const generateObjectResponce = async ({
  messages,
  systemPrompt,
  prompt,
  extractedCode,
  model,
}: {
  messages: ChatHistoryParsed[] | [];
  systemPrompt: string;
  prompt: string;
  extractedCode?: string;
  model: LanguageModelV1;
}): Promise<
  GenerateObjectResult<{
    feedback: string;
    hints?: string[] | undefined;
    snippet?: string | undefined;
    programmingLanguage?: string | undefined;
  }>
> => {
  const data = await generateObject({
    model: model,
    schema: outputSchema,
    output: 'object',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'system',
        content: `extractedCode (this code is written by user): ${extractedCode}`,
      },
      ...messages.map((message) => ({
        role: mapRole(message.role),
        content: message.content,
      })),
      { role: 'user', content: prompt },
    ],
  });

  return data;
};
