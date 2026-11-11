import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION ?? 'us-east-1',
})

const MODEL_ID = process.env.BEDROCK_MODEL_ID ?? 'anthropic.claude-3-haiku-20240307-v1:0'

export async function summariseTicketConversation(messages: { role: string; content: string }[]): Promise<string> {
  const prompt = `You are summarising a school support ticket conversation for a school principal.
Provide a concise 3-5 sentence summary covering: the parent's concern, what was attempted, and current status.
Be factual and neutral.

Conversation:
${messages.map(m => `[${m.role}]: ${m.content}`).join('\n')}

Summary:`

  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const res = await bedrockClient.send(new InvokeModelCommand({
    modelId: MODEL_ID,
    body,
    contentType: 'application/json',
    accept: 'application/json',
  }))

  const result = JSON.parse(new TextDecoder().decode(res.body))
  return result.content[0].text as string
}
