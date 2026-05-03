import {
  listProjects, getProject, createProject, updateProject, deleteProject,
  listProjectFiles, upsertProjectFile, deleteProjectFile,
  listConversations, addConversation,
} from '../db.js';

function projectIdFromPath(path: string): string | undefined {
  const m = /^\/api\/projects\/([^/]+)/.exec(path);
  return m?.[1];
}

function filePathFromPath(path: string): string | undefined {
  const m = /^\/api\/projects\/[^/]+\/files(.+)/.exec(path);
  if (!m?.[1]) return undefined;
  return decodeURIComponent(m[1]);
}

export async function projectRoutes(req: Request, url: URL): Promise<Response> {
  const path = url.pathname;
  const method = req.method;
  const projectId = projectIdFromPath(path);

  // GET /api/projects — list
  if (path === '/api/projects' && method === 'GET') {
    return Response.json(listProjects());
  }

  // POST /api/projects — create
  if (path === '/api/projects' && method === 'POST') {
    const { name } = await req.json() as { name: string };
    if (!name) return Response.json({ error: 'name required' }, { status: 400 });
    const project = createProject(name);
    return Response.json(project, { status: 201 });
  }

  if (!projectId) {
    return Response.json({ error: 'project id required' }, { status: 400 });
  }

  // GET /api/projects/:id
  if (path === `/api/projects/${projectId}` && method === 'GET') {
    const p = getProject(projectId);
    if (!p) return Response.json({ error: 'not found' }, { status: 404 });
    return Response.json(p);
  }

  // PUT /api/projects/:id
  if (path === `/api/projects/${projectId}` && method === 'PUT') {
    const { name } = await req.json() as { name: string };
    const p = updateProject(projectId, name);
    if (!p) return Response.json({ error: 'not found' }, { status: 404 });
    return Response.json(p);
  }

  // DELETE /api/projects/:id
  if (path === `/api/projects/${projectId}` && method === 'DELETE') {
    deleteProject(projectId);
    return Response.json({ ok: true });
  }

  // GET /api/projects/:id/files — list
  if (path === `/api/projects/${projectId}/files` && method === 'GET') {
    return Response.json(listProjectFiles(projectId));
  }

  // GET /api/projects/:id/conversations
  if (path === `/api/projects/${projectId}/conversations` && method === 'GET') {
    return Response.json(listConversations(projectId));
  }

  // POST /api/projects/:id/conversations — add user message (non-streaming)
  if (path === `/api/projects/${projectId}/conversations` && method === 'POST') {
    const { content } = await req.json() as { content: string };
    if (!content) return Response.json({ error: 'content required' }, { status: 400 });
    const msg = addConversation(projectId, 'user', content);
    return Response.json(msg, { status: 201 });
  }

  // PUT /api/projects/:id/files/* — upsert file
  if (path.startsWith(`/api/projects/${projectId}/files/`) && method === 'PUT') {
    const fp = filePathFromPath(path);
    if (!fp) return Response.json({ error: 'file path required' }, { status: 400 });
    const { content } = await req.json() as { content: string };
    const file = upsertProjectFile(projectId, fp, content);
    return Response.json(file);
  }

  // DELETE /api/projects/:id/files/* — delete file
  if (path.startsWith(`/api/projects/${projectId}/files/`) && method === 'DELETE') {
    const fp = filePathFromPath(path);
    if (!fp) return Response.json({ error: 'file path required' }, { status: 400 });
    deleteProjectFile(projectId, fp);
    return Response.json({ ok: true });
  }

  return Response.json({ error: 'not found' }, { status: 404 });
}
