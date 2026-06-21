import { describe, it, expect, vi, beforeEach, beforeAll, afterEach } from "vitest";

// ═══════════════════════════════════════════════════════════════
// Mock: global fetch (Gemini API)
// ═══════════════════════════════════════════════════════════════

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// We need to set the env variable before importing the route
vi.stubEnv("GEMINI_API_KEY", "test-key-do-not-use");

let POST: (req: Request) => Promise<Response>;
let OPTIONS: () => Promise<Response>;

beforeAll(async () => {
  const mod = await import("@/app/api/curate/route");
  POST = mod.POST;
  OPTIONS = mod.OPTIONS;
});
// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function makeRequest(
  body: unknown,
  ip = "127.0.0.1",
): Request {
  return new Request("http://localhost:3000/api/curate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

function makeGeminiResponse(text: string): Response {
  return new Response(
    JSON.stringify({
      candidates: [
        { content: { parts: [{ text }] } },
      ],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

function makeGeminiError(status: number, message: string): Response {
  return new Response(
    JSON.stringify({ error: { message } }),
    { status, headers: { "Content-Type": "application/json" } },
  );
}

// ═══════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════

describe("POST /api/curate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use mockImplementation so each call gets a fresh Response
    // (Response bodies are single-use ReadableStreams)
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        makeGeminiResponse("The specimen displayed remarkable tendencies."),
      ),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Successful generation ─────────────────────────────────

  describe("successful generation", () => {
    it("returns generated text for valid curator request", async () => {
      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "A person who still uses a wristwatch" },
          "10.0.0.1",
        ),
      );

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.text).toBe(
        "The specimen displayed remarkable tendencies.",
      );
      expect(json.data.promptType).toBe("curator");
      expect(json.timestamp).toBeDefined();
    });

    it("returns generated text for valid habitat request", async () => {
      mockFetch.mockResolvedValueOnce(
        makeGeminiResponse("The nesting chamber reveals ritualistic display behavior."),
      );

      const res = await POST(
        makeRequest(
          { promptType: "habitat", userMessage: "A desk covered in cables and coffee cups" },
          "10.0.0.2",
        ),
      );

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.promptType).toBe("habitat");
    });

    it("returns generated text for valid field_note request", async () => {
      mockFetch.mockResolvedValueOnce(
        makeGeminiResponse("Subject 47 was observed pressing a button repeatedly."),
      );

      const res = await POST(
        makeRequest(
          { promptType: "field_note", userMessage: "Refreshing a webpage 30 times" },
          "10.0.0.3",
        ),
      );

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.promptType).toBe("field_note");
    });

    it("calls Gemini API with correct system instruction and user message", async () => {
      await POST(
        makeRequest(
          { promptType: "curator", userMessage: "A person who irons their jeans" },
          "10.0.0.4",
        ),
      );

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];

      // The API key is in the URL query param
      expect(url).toContain("generativelanguage.googleapis.com");
      expect(url).toContain("key=test-key-do-not-use");

      const body = JSON.parse(options.body as string);
      expect(body.system_instruction.parts[0].text).toContain("Dr. Aris Thorne");
      expect(body.contents[0].parts[0].text).toBe(
        "A person who irons their jeans",
      );
    });

    it("includes CORS headers in successful response", async () => {
      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "Using a physical map" },
          "10.0.0.5",
        ),
      );

      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    });
  });

  // ─── Validation failures ───────────────────────────────────

  describe("validation failures", () => {
    it("returns 400 for missing promptType", async () => {
      const res = await POST(
        makeRequest(
          { userMessage: "Some text" },
          "10.0.1.1",
        ),
      );

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });

    it("returns 400 for invalid promptType", async () => {
      const res = await POST(
        makeRequest(
          { promptType: "hacker", userMessage: "ignored" },
          "10.0.1.2",
        ),
      );

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("promptType");
    });

    it("returns 400 for empty userMessage", async () => {
      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "" },
          "10.0.1.3",
        ),
      );

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("empty");
    });

    it("returns 400 for userMessage exceeding max length", async () => {
      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "x".repeat(2001) },
          "10.0.1.4",
        ),
      );

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("2000");
    });

    it("returns 400 for missing userMessage", async () => {
      const res = await POST(
        makeRequest(
          { promptType: "curator" },
          "10.0.1.5",
        ),
      );

      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid JSON body", async () => {
      const req = new Request("http://localhost:3000/api/curate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "10.0.1.6",
        },
        body: "not-json-{{{",
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("Invalid JSON");
    });
  });

  // ─── Rate limiting ─────────────────────────────────────────

  describe("rate limiting", () => {
    it("allows up to 5 requests per IP per minute", async () => {
      const testIp = "192.168.50.1";

      for (let i = 0; i < 5; i++) {
        const res = await POST(
          makeRequest(
            { promptType: "curator", userMessage: `Request ${i}` },
            testIp,
          ),
        );
        expect(res.status).toBe(200);
      }
    });

    it("returns 429 on the 6th request from the same IP", async () => {
      const testIp = "192.168.50.2";

      // Burn through the 5-request limit
      for (let i = 0; i < 5; i++) {
        await POST(
          makeRequest(
            { promptType: "curator", userMessage: `Request ${i}` },
            testIp,
          ),
        );
      }

      // The 6th should be rejected
      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "One too many" },
          testIp,
        ),
      );

      expect(res.status).toBe(429);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("Too many requests");
    });

    it("does not rate-limit different IPs independently", async () => {
      // Fill up IP A's quota
      for (let i = 0; i < 5; i++) {
        await POST(
          makeRequest(
            { promptType: "curator", userMessage: `A-${i}` },
            "192.168.60.1",
          ),
        );
      }

      // IP B should still be allowed
      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "From B" },
          "192.168.60.2",
        ),
      );

      expect(res.status).toBe(200);
    });

    it("includes CORS headers on 429 responses", async () => {
      const testIp = "192.168.50.3";

      for (let i = 0; i < 5; i++) {
        await POST(
          makeRequest(
            { promptType: "curator", userMessage: `Req ${i}` },
            testIp,
          ),
        );
      }

      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "blocked" },
          testIp,
        ),
      );

      expect(res.status).toBe(429);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });
  });

  // ─── XSS / output sanitisation ────────────────────────────

  describe("output sanitisation", () => {
    it("strips HTML tags from AI-generated output", async () => {
      mockFetch.mockResolvedValueOnce(
        makeGeminiResponse(
          'The specimen <script>alert("xss")</script> was observed foraging.',
        ),
      );

      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "Test subject" },
          "10.0.2.1",
        ),
      );

      const json = await res.json();
      expect(json.data.text).not.toContain("<script>");
      expect(json.data.text).not.toContain("</script>");
      expect(json.data.text).toContain("was observed foraging");
    });

    it("strips inline event handlers from output", async () => {
      mockFetch.mockResolvedValueOnce(
        makeGeminiResponse(
          '<img onerror="alert(1)" src="x"> Habitat analysis complete.',
        ),
      );

      const res = await POST(
        makeRequest(
          { promptType: "habitat", userMessage: "A desk" },
          "10.0.2.2",
        ),
      );

      const json = await res.json();
      expect(json.data.text).not.toContain("onerror");
      expect(json.data.text).not.toContain("<img");
      expect(json.data.text).toContain("Habitat analysis complete");
    });

    it("strips javascript: protocol from output", async () => {
      mockFetch.mockResolvedValueOnce(
        makeGeminiResponse(
          'Click <a href="javascript:void(0)">here</a> for analysis.',
        ),
      );

      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "Analysis" },
          "10.0.2.3",
        ),
      );

      const json = await res.json();
      expect(json.data.text).not.toContain("javascript:");
    });

    it("strips HTML entities from output", async () => {
      mockFetch.mockResolvedValueOnce(
        makeGeminiResponse("Alert &#60;script&#62; embedded entity."),
      );

      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "Entities" },
          "10.0.2.4",
        ),
      );

      const json = await res.json();
      expect(json.data.text).not.toContain("&#60;");
      expect(json.data.text).not.toContain("&#62;");
    });

    it("truncates output exceeding max length", async () => {
      const longText = "A".repeat(5000);
      mockFetch.mockResolvedValueOnce(makeGeminiResponse(longText));

      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "Long text" },
          "10.0.2.5",
        ),
      );

      const json = await res.json();
      expect(json.data.text.length).toBeLessThanOrEqual(4000);
    });
  });

  // ─── Gemini API error handling ─────────────────────────────

  describe("Gemini API error handling", () => {
    it("returns 500 when Gemini returns a non-OK status", async () => {
      mockFetch.mockResolvedValueOnce(makeGeminiError(500, "Internal error"));

      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "Test" },
          "10.0.3.1",
        ),
      );

      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("returns 500 when Gemini response contains an error field", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { message: "Quota exceeded" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "Test" },
          "10.0.3.2",
        ),
      );

      expect(res.status).toBe(500);
    });

    it("returns 500 when Gemini returns empty candidates", async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ candidates: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "Test" },
          "10.0.3.3",
        ),
      );

      expect(res.status).toBe(500);
    });

    it("never exposes the API key in error responses", async () => {
      mockFetch.mockRejectedValueOnce(
        new Error("fetch failed — key=test-key-do-not-use was refused"),
      );

      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "Test" },
          "10.0.3.4",
        ),
      );

      expect(res.status).toBe(500);
      const text = await res.text();
      expect(text).not.toContain("test-key-do-not-use");
      expect(text).not.toContain("GEMINI_API_KEY");
    });

    it("returns a user-friendly message on internal errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const res = await POST(
        makeRequest(
          { promptType: "curator", userMessage: "Test" },
          "10.0.3.5",
        ),
      );

      const json = await res.json();
      expect(json.error).toContain("temporarily unavailable");
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// OPTIONS (CORS preflight)
// ═══════════════════════════════════════════════════════════════

describe("OPTIONS /api/curate", () => {
  it("returns 204 with CORS headers", async () => {
    const res = await OPTIONS();

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });
});
