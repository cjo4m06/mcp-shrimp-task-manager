import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ChatAgent from '../src/components/ChatAgent';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key, fallback) => typeof fallback === 'string' ? fallback : key }) }));
vi.mock('@uiw/react-md-editor', () => ({ default: { Markdown: ({ source }) => <div>{source}</div> } }));
const props = { profileId: 'one', currentPage: 'task-list', tasks: [], showToast: vi.fn() };
let requests;
beforeEach(() => {
    localStorage.clear();
    requests = [];
    Element.prototype.scrollIntoView = vi.fn();
    fetch.mockImplementation(async (url, options) => {
        if (url === '/api/global-settings') return { ok: true, json: async () => ({ openAIKey: 'saved-inference-key' }) };
        if (url.startsWith('/api/agents/combined/')) return { ok: true, json: async () => [] };
        requests.push({ body: JSON.parse(options.body), signal: options.signal });
        return { ok: true, json: async () => ({ response: 'Source https://nodejs.org', respondingAgents: ['openai'] }) };
    });
});
afterEach(() => vi.clearAllMocks());
async function send() {
    fireEvent.change(screen.getByPlaceholderText('chat.inputPlaceholder'), { target: { value: 'Find Node docs' } });
    fireEvent.click(screen.getByRole('button', { name: '📤' }));
    await waitFor(() => expect(screen.getByPlaceholderText('chat.inputPlaceholder')).not.toBeDisabled());
}

describe('chat-owned search sessions and preferences', () => {
    it('keeps a session across turns and panel close, resetting on new chat and project switch', async () => {
        const view = render(<ChatAgent {...props} />);
        fireEvent.click(screen.getByTitle('chat.openTooltip'));
        await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/global-settings'));
        await send();
        await send();
        expect(requests).toHaveLength(2);
        const firstId = requests[0].body.conversationId;
        expect(firstId).toMatch(/^[0-9a-f-]{36}$/);
        expect(requests[1].body.conversationId).toBe(firstId);
        expect(requests[0].body.searchEnabled).toBe(true);
        expect(requests[0].body.openAIKey).toBe('saved-inference-key');
        fireEvent.click(screen.getByTitle('chat.controls.close'));
        fireEvent.click(screen.getByTitle('chat.openTooltip'));
        await send();
        expect(requests[2].body.conversationId).toBe(firstId);
        fireEvent.click(screen.getByTitle('New chat'));
        await send();
        expect(requests[3].body.conversationId).not.toBe(firstId);
        view.rerender(<ChatAgent {...props} profileId="two" />);
        await send();
        expect(requests[4].body.conversationId).not.toBe(requests[3].body.conversationId);
    });

    it('honors saved search and agent choices, and persists an explicit search override per project', async () => {
        localStorage.setItem('chatWebSearch_one', 'false');
        localStorage.setItem('chatAgentSelections_one', JSON.stringify({ openai: true, custom: true }));
        render(<ChatAgent {...props} />);
        fireEvent.click(screen.getByTitle('chat.openTooltip'));
        const search = screen.getByRole('checkbox', { name: 'Web search (Parallel)' });
        expect(search).not.toBeChecked();
        await send();
        expect(requests[0].body.searchEnabled).toBe(false);
        expect(requests[0].body.agents).toEqual(['openai', 'custom']);
        fireEvent.click(search);
        expect(localStorage.getItem('chatWebSearch_one')).toBe('true');
        expect(localStorage.getItem('chatAgentSelections_one')).toBe('{"openai":true,"custom":true}');
        await send();
        expect(requests[1].body.searchEnabled).toBe(true);
    });

    it('cancels an in-flight turn on new chat and does not append a stale result', async () => {
        let complete;
        fetch.mockImplementation(async (url, options) => {
            if (url !== '/api/chat') return { ok: true, json: async () => url === '/api/global-settings' ? { openAIKey: 'saved' } : [] };
            requests.push({ body: JSON.parse(options.body), signal: options.signal });
            return new Promise(resolve => { complete = () => resolve({ ok: true, json: async () => ({ response: 'Stale response' }) }); });
        });
        render(<ChatAgent {...props} />);
        fireEvent.click(screen.getByTitle('chat.openTooltip'));
        fireEvent.change(screen.getByPlaceholderText('chat.inputPlaceholder'), { target: { value: 'Search now' } });
        fireEvent.click(screen.getByRole('button', { name: '📤' }));
        await waitFor(() => expect(requests).toHaveLength(1));
        fireEvent.click(screen.getByTitle('New chat'));
        expect(requests[0].signal.aborted).toBe(true);
        complete();
        await waitFor(() => expect(screen.queryByText('Stale response')).not.toBeInTheDocument());
        expect(screen.getByPlaceholderText('chat.inputPlaceholder')).not.toBeDisabled();
    });
});
