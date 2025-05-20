# Implementation Plan: Assistant UI Plan Context & Streaming

## 1. **Directory & File Structure**

- Use: `app/.state/plan/`
  - `plan.yaml` — stores system prompt and context file list
  - `context_files/` — stores uploaded markdown/context files

## 2. **Service Layer**

- **Extend/Create**: `app/lib/services/plan-service.ts`
  - Methods to:
    - Get/set system prompt
    - Add/remove/list context files
    - Update YAML config
    - Read all context for prompt construction
    - (Optional) Validate file types/extensions

## 3. **API Endpoints**

- **Create API routes** (e.g. in `app/api/plan/`)
  - `GET /api/plan/config` — get current config (system prompt, file list)
  - `POST /api/plan/system-prompt` — update system prompt
  - `POST /api/plan/context-file` — upload new context file
  - `DELETE /api/plan/context-file` — remove context file
  - `GET /api/plan/context-file/:name` — download/view context file

## 4. **Frontend UI (Plan Page/Assistant UI)**

- **Add a "Plan Context" tab or modal** in the Assistant UI (on the plan page):
  - Upload markdown files (drag & drop or file picker)
  - View/delete uploaded files
  - Edit system prompt (textarea)
  - Show current context file list
  - Save/Update actions

- **Integrate with API**:
  - On upload, POST file to API, update YAML
  - On delete, remove file and update YAML
  - On system prompt edit, POST to API

- **Display current system prompt and context files in the UI** for transparency

## 5. **LLM Streaming Integration**

- **Backend**: Ensure your LLM API endpoint supports streaming (e.g. using Server-Sent Events or chunked responses)
- **Frontend**: Use assistant-ui's `ChatModelAdapter` with streaming support:
  - Implement the `run` method as an `async *run()` generator that yields partial results as they arrive
  - See [assistant-ui custom backend streaming example](https://github.com/assistant-ui/assistant-ui/blob/main/apps/docs/content/docs/runtimes/custom/local.mdx) for reference

- **Wiring**:
  - When user sends a message, construct the full prompt using the current system prompt + all context files (via the service)
  - Pass this to the backend, stream the response back to the UI

## 6. **Integration on Plan Page**

- **Wrap the plan page** (or just the Assistant UI modal) in a custom runtime provider that uses your backend adapter
- **Ensure** the runtime provider is aware of the current plan context (system prompt + files)

## 7. **Persistence & Local State**

- All uploads/edits are persisted in `app/.state/plan/`
- On app start, load the YAML and files to restore state

## 8. **(Optional) Plan Switching**

- If you want multiple "plans", extend the service to support multiple YAMLs/folders and add a plan selector UI

---

## Example: `plan.yaml` Format

```yaml
system_prompt: |
  You are a helpful AI assistant. Please answer the user's questions.
context_file_names:
  - overview.md
  - brand-guidelines.md
```

---

## Example: Service API

```ts
// plan-service.ts
async setSystemPrompt(prompt: string): Promise<void>
async addContextFile(file: File): Promise<void>
async removeContextFile(fileName: string): Promise<void>
async getFullPrompt(userMessage: string): Promise<string>
```

---

## Example: Streaming Adapter (Frontend)

```ts
const MyModelAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    const response = await fetch("/api/llm", {
      method: "POST",
      body: JSON.stringify({ messages }),
      signal: abortSignal,
    });
    const reader = response.body.getReader();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += new TextDecoder().decode(value);
      yield { content: [{ type: "text", text }] };
    }
  }
};
```

---

## 9. **Testing & UX**

- Test uploading, deleting, and editing context/system prompt
- Test streaming works with large responses
- Ensure error handling for file I/O and streaming interruptions

---

## 10. **Documentation**

- Document how to add context, edit the system prompt, and how streaming works for future maintainers

---

# Next Steps

- **Review this plan**
- Approve or request changes
- Once approved, implementation will proceed step-by-step 