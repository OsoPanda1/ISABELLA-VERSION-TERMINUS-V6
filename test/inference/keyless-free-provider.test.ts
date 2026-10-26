import { describe, expect, it } from "vitest";
import { buildKeylessFreeMessages, extractKeylessFreeText, resolveKeylessFreeProvider, resolveLocalOllamaProvider } from "../../src/inference/provider-policy";

describe("keyless free provider policy", () => {
  it("stays off unless the operator explicitly enables it", () => {
    expect(resolveKeylessFreeProvider({})).toBeNull();
    expect(resolveKeylessFreeProvider({ ISABELLA_KEYLESS_FREE_PROVIDER: "" })).toBeNull();
    expect(resolveKeylessFreeProvider({ ISABELLA_KEYLESS_FREE_PROVIDER: "off" })).toBeNull();
    expect(resolveKeylessFreeProvider({ ISABELLA_KEYLESS_FREE_PROVIDER: "false" })).toBeNull();
  });

  it("accepts the documented opt-in aliases case-insensitively", () => {
    for (const flag of ["pollinations", "on", "ON", "true", "1", "  pollinations  "]) {
      const config = resolveKeylessFreeProvider({ ISABELLA_KEYLESS_FREE_PROVIDER: flag });
      expect(config, flag).not.toBeNull();
      expect(config?.name).toBe("pollinations");
      expect(config?.endpoint).toBe("https://text.pollinations.ai");
      expect(config?.model).toBe("openai");
    }
  });

  it("honors endpoint and model overrides and normalizes trailing slashes", () => {
    const config = resolveKeylessFreeProvider({
      ISABELLA_KEYLESS_FREE_PROVIDER: "on",
      KEYLESS_FREE_PROVIDER_URL: "https://example.invalid/free///",
      KEYLESS_FREE_PROVIDER_MODEL: "  mistral  ",
    });
    expect(config?.endpoint).toBe("https://example.invalid/free");
    expect(config?.model).toBe("mistral");
    expect(Object.isFrozen(config)).toBe(true);
  });

  it("builds a bounded system + history + user message list", () => {
    const history = Array.from({ length: 12 }, (_, index) => ({
      role: (index % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `turn-${index}`,
    }));
    const messages = buildKeylessFreeMessages("system", "current", history);
    expect(messages).toHaveLength(10);
    expect(messages[0]).toEqual({ role: "system", content: "system" });
    expect(messages[1]?.content).toBe("turn-4");
    expect(messages.at(-1)).toEqual({ role: "user", content: "current" });
  });

  it("bounds forwarded content so no single field is unbounded", () => {
    const [system, user] = buildKeylessFreeMessages("x".repeat(5_000), "y".repeat(9_000));
    expect(system?.content).toHaveLength(2_000);
    expect(user?.content).toHaveLength(4_000);
  });

  it("normalizes provider plain text and rejects empty output", () => {
    expect(extractKeylessFreeText("  hola\r\nmundo  ")).toBe("hola\nmundo");
    expect(extractKeylessFreeText("   ")).toBeNull();
    expect(extractKeylessFreeText("abcdef", 3)).toBe("abc");
  });
});

describe("local Ollama provider policy", () => {
  it("stays off unless enabled with an explicit model", () => {
    expect(resolveLocalOllamaProvider({})).toBeNull();
    expect(resolveLocalOllamaProvider({ OLLAMA_ENABLED: "true" })).toBeNull();
    expect(resolveLocalOllamaProvider({ OLLAMA_ENABLED: "false", OLLAMA_MODEL: "qwen2.5:0.5b" })).toBeNull();
  });

  it("defaults to the loopback Ollama API and normalizes trailing slashes", () => {
    const config = resolveLocalOllamaProvider({
      OLLAMA_ENABLED: "true",
      OLLAMA_MODEL: "  qwen2.5:0.5b  ",
      OLLAMA_BASE_URL: "http://127.0.0.1:11434///",
    });
    expect(config).toEqual({
      name: "ollama-local",
      endpoint: "http://127.0.0.1:11434/api/chat",
      model: "qwen2.5:0.5b",
    });
    expect(Object.isFrozen(config)).toBe(true);
  });

  it("rejects remote hosts unless the operator explicitly allows them", () => {
    const remote = {
      OLLAMA_ENABLED: "true",
      OLLAMA_MODEL: "qwen2.5:0.5b",
      OLLAMA_BASE_URL: "https://ollama.example.com",
    };
    expect(resolveLocalOllamaProvider(remote)).toBeNull();
    expect(resolveLocalOllamaProvider({ ...remote, OLLAMA_ALLOW_REMOTE: "true" })?.endpoint).toBe(
      "https://ollama.example.com/api/chat",
    );
  });

  it("rejects malformed and non-HTTP endpoints", () => {
    expect(
      resolveLocalOllamaProvider({
        OLLAMA_ENABLED: "true",
        OLLAMA_MODEL: "m",
        OLLAMA_BASE_URL: "file:///etc/passwd",
      }),
    ).toBeNull();
    expect(
      resolveLocalOllamaProvider({
        OLLAMA_ENABLED: "true",
        OLLAMA_MODEL: "m",
        OLLAMA_BASE_URL: "not a url",
      }),
    ).toBeNull();
  });
});
