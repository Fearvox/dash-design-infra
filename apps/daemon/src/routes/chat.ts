import { getProject, listConversations, addConversation } from '../db.js';
import { spawnAgent, getAgent } from '../agents.js';

export async function chatRoutes(req: Request, url: URL): Promise<Response> {
  const method = req.method;

  // POST /api/chat — run agent with SSE streaming
  if (url.pathname === '/api/chat' && method === 'POST') {
    const { projectId, agent, prompt } = await req.json() as {
      projectId: string;
      agent: string;
      prompt: string;
    };

    if (!projectId || !agent || !prompt) {
      return Response.json({ error: 'projectId, agent, and prompt are required' }, { status: 400 });
    }

    const project = getProject(projectId);
    if (!project) return Response.json({ error: 'project not found' }, { status: 404 });

    const agentDef = getAgent(agent);
    if (!agentDef?.installed) {
      return Response.json({ error: `agent not available: ${agent}` }, { status: 400 });
    }

    // Save user message
    addConversation(projectId, 'user', prompt);

    // Build prompt context from conversation history
    const history = listConversations(projectId, 20);
    const contextPrompt = history.length > 1
      ? buildContextPrompt(history.slice(0, -1), prompt) // exclude the one we just saved
      : prompt;

    // SSE streaming
    const proc = spawnAgent({ agentName: agent, prompt: contextPrompt });

    // Read stdout as SSE stream (Bun ReadableStream supports async iteration at runtime)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`event: start\ndata: ${JSON.stringify({ agent })}\n\n`));

        let fullOutput = '';

        try {
          const reader = proc.stdout!.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = new TextDecoder().decode(value);
            fullOutput += text;
            controller.enqueue(encoder.encode(`event: chunk\ndata: ${JSON.stringify({ text })}\n\n`));
          }
        } catch (err) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: String(err) })}\n\n`));
        }

        const exitCode = await proc.exited;

        // Save agent response
        addConversation(projectId, 'agent', fullOutput, agent);

        controller.enqueue(encoder.encode(`event: done\ndata: ${JSON.stringify({ exitCode, outputLength: fullOutput.length })}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }

  return Response.json({ error: 'not found' }, { status: 404 });
}

function buildContextPrompt(history: Array<{ role: string; content: string; agent_name: string | null }>, currentPrompt: string): string {
  if (history.length === 0) return currentPrompt;

  const parts = history.map((msg) => {
    const label = msg.role === 'user' ? 'User' : `Agent (${msg.agent_name ?? 'unknown'})`;
    return `${label}: ${msg.content}`;
  });

  return [...parts, `User: ${currentPrompt}\n\nRespond to the user's latest request.`].join('\n\n');
}
