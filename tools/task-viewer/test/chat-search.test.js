// @vitest-environment node
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import http from 'node:http';
import os from 'node:os';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { CHAT_MODEL, runChat, SEARCH_URL, USER_AGENT } from '../chat.js';

const schema = name => ({
    name, description: name,
    inputSchema: { type: 'object', properties: {
        objective: { type: 'string' }, search_queries: { type: 'array', items: { type: 'string' } },
        urls: { type: 'array', items: { type: 'string' } },
        session_id: { type: 'string' }, model_name: { type: 'string' },
    } },
});
const json = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
const tool = (name, args) => ({ role: 'assistant', content: null, tool_calls: [{
    id: randomUUID(), type: 'function', function: { name, arguments: JSON.stringify(args) },
}] });
const search = () => tool('web_search', { objective: 'Node documentation', search_queries: ['Node abort signal'] });
const fetchPage = () => tool('web_fetch', { urls: ['https://nodejs.org/api/globals.html'] });

// Script only the model and remote service; the production SDK, resolver, HTTP
// route, tool dispatcher and downstream messages execute normally.
function remoteFixture(answers, { toolError = false, failDiscovery = false, toolResult } = {}) {
    const calls = [];
    const request = vi.fn(async (url, init = {}) => {
        const body = init.body ? JSON.parse(init.body) : {};
        calls.push({ url: String(url), init, body });
        if (String(url) === SEARCH_URL) {
            if (body.method === 'initialize') return json({ jsonrpc: '2.0', id: body.id, result: {
                protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'fixture', version: '1' },
            } });
            if (body.method === 'notifications/initialized' || body.method === 'notifications/cancelled') return new Response(null, { status: 202 });
            if (body.method === 'tools/list') {
                if (failDiscovery) return new Response('Service unavailable', { status: 503 });
                return json({ jsonrpc: '2.0', id: body.id, result: { tools: [schema('web_search'), schema('web_fetch')] } });
            }
            if (body.method === 'tools/call') return json({ jsonrpc: '2.0', id: body.id, result: {
                isError: toolError, content: [{ type: 'text', text: toolError ? 'Free anonymous quota reached' : (toolResult || 'Node docs https://nodejs.org/api/globals.html: AbortSignal cancels operations.') }],
            } });
            throw new Error('Unexpected MCP method: ' + body.method);
        }
        expect(String(url)).toBe('https://api.openai.com/v1/chat/completions');
        const answer = answers.shift();
        if (typeof answer === 'function') return json({ choices: [{ message: answer(body) }] });
        if (!answer) throw new Error('Unexpected model call');
        return json({ choices: [{ message: answer }] });
    });
    vi.stubGlobal('fetch', request);
    return { calls, request };
}

let server, base, home;
beforeAll(async () => {
    home = await mkdtemp(path.join(os.tmpdir(), 'shrimp-chat-test-'));
    vi.spyOn(os, 'homedir').mockReturnValue(home);
    process.env.SHRIMP_VIEWER_PORT = '0';
    const { startServer } = await import('../server.js');
    server = await startServer();
    if (!server.listening) await once(server, 'listening');
    base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
    await rm(home, { recursive: true, force: true });
    vi.restoreAllMocks();
    delete process.env.SHRIMP_VIEWER_PORT;
});
afterEach(() => { delete process.env.SHRIMP_WEB_SEARCH; vi.useRealTimers(); });
function chat(overrides = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(base + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
        });
        req.on('error', reject);
        req.end(JSON.stringify({ message: 'Find Node documentation', agents: ['openai'],
            context: { currentPage: 'task-detail', currentTask: { name: 'Read docs' } },
            availableAgents: [], openAIKey: 'inference-only-fixture-key', ...overrides }));
    });
}

describe('chat HTTP caller with real MCP SDK transport', () => {
    it('defaults to anonymous search, fetches URLs and consumes results before preserving task-modification output', async () => {
        const id = randomUUID();
        const fixture = remoteFixture([search(), fetchPage(), body => {
            expect(body.messages.filter(m => m.role === 'tool')).toHaveLength(2);
            expect(body.messages.at(-1).content).toContain('https://nodejs.org/api/globals.html');
            return { role: 'assistant', content: 'Read [Node docs](https://nodejs.org/api/globals.html).\nTASK_MODIFICATION: {"notes":"Read source"}' };
        }]);
        const result = await chat({ conversationId: id });
        expect(result.status).toBe(200);
        expect(result.data).toEqual({ response: 'Read [Node docs](https://nodejs.org/api/globals.html).', respondingAgents: ['openai'], taskModification: { suggested: true, notes: 'Read source' } });
        for (const call of fixture.calls.filter(c => c.url === SEARCH_URL)) {
            expect(new Headers(call.init.headers).get('User-Agent')).toBe(USER_AGENT);
            expect(new Headers(call.init.headers).has('Authorization')).toBe(false);
            if (call.body.method === 'tools/call') {
                expect(call.body.params.arguments.session_id).toBe(id);
                expect(call.body.params.arguments.model_name).toBe(CHAT_MODEL);
            }
        }
        const model = fixture.calls.find(c => c.url.includes('openai.com'));
        expect(model.init.headers.Authorization).toBe('Bearer inference-only-fixture-key');
        expect(model.body.model).toBe(CHAT_MODEL);
        expect(model.body.tools[0].function.parameters.properties).not.toHaveProperty('session_id');
    });

    it('keeps one ID for follow-up turns and isolates concurrent conversations', async () => {
        const a = randomUUID(), b = randomUUID();
        const answer = body => body.messages.some(m => m.role === 'tool') ? { content: 'Source' } : search();
        const fixture = remoteFixture([answer, answer, answer, answer]);
        const results = await Promise.all([chat({ conversationId: a }), chat({ conversationId: b })]);
        expect(results.map(r => r.status)).toEqual([200, 200]);
        const ids = fixture.calls.filter(c => c.body.method === 'tools/call').map(c => c.body.params.arguments.session_id);
        expect(new Set(ids)).toEqual(new Set([a, b]));
        const follow = remoteFixture([fetchPage(), { content: 'Follow-up source' }]);
        expect((await chat({ conversationId: a })).status).toBe(200);
        expect(follow.calls.find(c => c.body.method === 'tools/call').body.params.arguments.session_id).toBe(a);
    });

    it.each([{ searchEnabled: false }, { serverDisabled: true }])('respects search disabled controls: %j', async ({ serverDisabled, ...choice }) => {
        if (serverDisabled) process.env.SHRIMP_WEB_SEARCH = 'false';
        const fixture = remoteFixture([{ content: 'Local task answer' }]);
        const result = await chat(choice);
        expect(result.status).toBe(200);
        expect(fixture.calls).toHaveLength(1);
        expect(fixture.calls[0].body).not.toHaveProperty('tools');
    });

    it('keeps quota errors visible to the model without changing IDs or falling back', async () => {
        const id = randomUUID();
        const fixture = remoteFixture([search(), search(), body => {
            expect(body.messages.at(-1).content).toContain('Search tool failed: Free anonymous quota reached');
            return { content: 'Search is unavailable; I cannot verify that source.' };
        }], { toolError: true });
        expect((await chat({ conversationId: id })).data.response).toContain('unavailable');
        expect(fixture.calls.filter(c => c.body.method === 'tools/call').every(c => c.body.params.arguments.session_id === id)).toBe(true);
    });

    it('reports discovery failure and does not silently answer without the requested provider', async () => {
        const fixture = remoteFixture([], { failDiscovery: true });
        expect((await chat()).status).toBe(500);
        expect(fixture.calls.some(c => c.url.includes('openai.com'))).toBe(false);
    });

    it.each(['file:///etc/passwd', 'javascript:alert(1)', 'https://user:pass@example.com'])('rejects invalid fetch URL %s before dispatch', async url => {
        const fixture = remoteFixture([tool('web_fetch', { urls: [url] })]);
        expect((await chat()).status).toBe(500);
        expect(fixture.calls.some(c => c.body.method === 'tools/call')).toBe(false);
    });

    it('overrides model-provided conversation metadata', async () => {
        const id = randomUUID();
        const fixture = remoteFixture([tool('web_search', { objective: 'docs', search_queries: ['Node docs'], session_id: 'wrong', model_name: 'wrong' }), { content: 'Done' }]);
        expect((await chat({ conversationId: id })).status).toBe(200);
        expect(fixture.calls.find(c => c.body.method === 'tools/call').body.params.arguments).toMatchObject({ session_id: id, model_name: CHAT_MODEL });
    });

    it('requires the existing inference key before any search work', async () => {
        const oldKey = process.env.OPENAI_API_KEY;
        const oldAlternate = process.env.OPEN_AI_KEY_SHRIMP_TASK_VIEWER;
        delete process.env.OPENAI_API_KEY;
        delete process.env.OPEN_AI_KEY_SHRIMP_TASK_VIEWER;
        try {
            const fixture = remoteFixture([]);
            expect((await chat({ openAIKey: '' })).status).toBe(400);
            expect(fixture.calls).toHaveLength(0);
        } finally {
            if (oldKey !== undefined) process.env.OPENAI_API_KEY = oldKey;
            if (oldAlternate !== undefined) process.env.OPEN_AI_KEY_SHRIMP_TASK_VIEWER = oldAlternate;
        }
    });

    it('bounds repeated tool calls instead of looping indefinitely', async () => {
        const fixture = remoteFixture([search(), search(), search(), search(), search()]);
        expect((await chat()).status).toBe(500);
        expect(fixture.calls.filter(c => c.body.method === 'tools/call')).toHaveLength(4);
    });

    it('cancels remote work when the HTTP client disconnects', async () => {
        const fixture = remoteFixture([search()]);
        const normalRequest = fixture.request.getMockImplementation();
        let started, cancelled;
        const begun = new Promise(resolve => { started = resolve; });
        const stopped = new Promise(resolve => { cancelled = resolve; });
        fixture.request.mockImplementation((url, init) => {
            const body = init.body ? JSON.parse(init.body) : {};
            if (body.method !== 'tools/call') return normalRequest(url, init);
            return new Promise((resolve, reject) => {
                init.signal.addEventListener('abort', () => {
                    cancelled(); reject(init.signal.reason);
                }, { once: true });
                started();
            });
        });
        const req = http.request(base + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        req.on('error', () => {});
        req.end(JSON.stringify({ message: 'Search now', context: { currentPage: 'tasks' }, availableAgents: [], agents: ['openai'], openAIKey: 'fixture' }));
        await begun;
        req.destroy();
        await stopped;
    });

    it('does not accept arbitrary conversation identities', async () => {
        const fixture = remoteFixture([]);
        expect((await chat({ conversationId: 'user@example.com' })).status).toBe(500);
        expect(fixture.calls).toHaveLength(0);
    });
});

describe('timeouts and cancellation', () => {
    it('cancels an in-flight model request', async () => {
        const controller = new AbortController();
        vi.stubGlobal('fetch', vi.fn((url, init) => new Promise((resolve, reject) => {
            init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
            controller.abort(new Error('Browser cancelled'));
        })));
        await expect(runChat({ apiKey: 'fixture', message: 'Hi', systemPrompt: '', searchEnabled: false, signal: controller.signal })).rejects.toThrow('Browser cancelled');
    });
    it('times out a stalled model request', async () => {
        vi.useFakeTimers();
        vi.stubGlobal('fetch', vi.fn((url, init) => new Promise((resolve, reject) => {
            init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
        })));
        const result = runChat({ apiKey: 'fixture', message: 'Hi', systemPrompt: '', searchEnabled: false });
        const assertion = expect(result).rejects.toThrow('Chat timed out');
        await vi.advanceTimersByTimeAsync(90000);
        await assertion;
    });
    it('cancels an in-flight MCP request through the SDK', async () => {
        const controller = new AbortController();
        const fixture = remoteFixture([search(), { content: 'Done' }]);
        const normalRequest = fixture.request.getMockImplementation();
        fixture.request.mockImplementation((url, init) => {
            const body = init.body ? JSON.parse(init.body) : {};
            if (body.method !== 'tools/call') return normalRequest(url, init);
            return new Promise((resolve, reject) => {
                init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
                controller.abort(new Error('MCP turn cancelled'));
            });
        });
        await expect(runChat({ apiKey: 'fixture', message: 'Hi', systemPrompt: '', signal: controller.signal })).rejects.toThrow();
    });

    it('times out stalled MCP discovery', async () => {
        vi.useFakeTimers();
        vi.stubGlobal('fetch', vi.fn((url, init) => new Promise((resolve, reject) => {
            init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true });
        })));
        const result = runChat({ apiKey: 'fixture', message: 'Hi', systemPrompt: '' });
        const assertion = expect(result).rejects.toThrow();
        await vi.advanceTimersByTimeAsync(20001);
        await assertion;
    });

    it('does no remote work for an already cancelled turn', async () => {
        const controller = new AbortController(); controller.abort();
        const fixture = remoteFixture([]);
        await expect(runChat({ apiKey: 'fixture', message: 'Hi', systemPrompt: '', signal: controller.signal })).rejects.toThrow();
        expect(fixture.calls).toHaveLength(0);
    });
});
