import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { getSystemPrompt } from "@/lib/prompts";
import type { PromptType } from "@/lib/prompts";

export const runtime = "edge";

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** Max length of generated text returned to the client */
const MAX_OUTPUT_LENGTH = 4000;

/** Rate-limit window in milliseconds (1 minute) */
const RATE_LIMIT_WINDOW_MS = 60_000;

/** Maximum requests per IP within the window */
const RATE_LIMIT_MAX_REQUESTS = 5;

/** How often the stale-entry cleanup runs (every 2 minutes) */
const CLEANUP_INTERVAL_MS = 120_000;

// ═══════════════════════════════════════════════════════════════
// CORS headers
// ═══════════════════════════════════════════════════════════════

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

// ═══════════════════════════════════════════════════════════════
// Request validation (Zod)
// ═══════════════════════════════════════════════════════════════

const VALID_PROMPT_TYPES: [PromptType, ...PromptType[]] = [
  "curator",
  "habitat",
  "field_note",
];

const curateRequestSchema = z.object({
  promptType: z.enum(VALID_PROMPT_TYPES, {
    errorMap: () => ({
      message:
        "promptType must be one of: curator, habitat, field_note",
    }),
  }),
  userMessage: z
    .string()
    .min(1, "userMessage must not be empty")
    .max(2000, "userMessage must not exceed 2000 characters")
    .transform((s) => s.trim()),
});

export type CurateRequest = z.infer<typeof curateRequestSchema>;

// ═══════════════════════════════════════════════════════════════
// In-memory rate limiter
// ═══════════════════════════════════════════════════════════════

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

/**
 * Evict entries whose most-recent timestamp is older than the window.
 * Called lazily on each request, but throttled to run at most once
 * every CLEANUP_INTERVAL_MS.
 */
function cleanupStaleEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  Array.from(rateLimitStore.entries()).forEach(([ip, entry]) => {
    const newest = entry.timestamps[entry.timestamps.length - 1];
    if (newest === undefined || newest < cutoff) {
      rateLimitStore.delete(ip);
    }
  });
}

/**
 * Returns `true` if the request should be allowed.
 * Mutates the store as a side-effect.
 */
function checkRateLimit(ip: string): boolean {
  cleanupStaleEntries();

  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  const entry = rateLimitStore.get(ip);
  if (!entry) {
    rateLimitStore.set(ip, { timestamps: [now] });
    return true;
  }

  // Prune timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.timestamps.push(now);
  return true;
}

// ═══════════════════════════════════════════════════════════════
// Output sanitisation
// ═══════════════════════════════════════════════════════════════

/**
 * Strip ALL HTML tags, HTML entities, and enforce a hard length cap.
 * This runs on the server so we cannot use DOMPurify — regex-based
 * stripping is sufficient for plain-text AI output.
 */
function sanitizeOutput(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")       // Strip HTML tags
    .replace(/&#?\w+;/g, "")       // Strip HTML entities
    .replace(/on\w+\s*=/gi, "")    // Strip inline event handlers
    .replace(/javascript:/gi, "")  // Strip JS protocol
    .slice(0, MAX_OUTPUT_LENGTH)
    .trim();
}

// ═══════════════════════════════════════════════════════════════
// Gemini REST API caller
// ═══════════════════════════════════════════════════════════════

interface GeminiResponseCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

interface GeminiResponse {
  candidates?: GeminiResponseCandidate[];
  error?: { message?: string };
}

async function callGemini(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Gemini API returned status ${response.status}`,
    );
  }

  const data = (await response.json()) as GeminiResponse;

  if (data.error) {
    throw new Error("Gemini generation failed");
  }

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned no text");
  }

  return text;
}

// ═══════════════════════════════════════════════════════════════
// Route: OPTIONS (CORS preflight)
// ═══════════════════════════════════════════════════════════════

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

// ═══════════════════════════════════════════════════════════════
// Route: POST — generate museum-quality prose via Gemini
// ═══════════════════════════════════════════════════════════════

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // ── Rate limiting ───────────────────────────────────────
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please wait a moment before trying again.",
          timestamp: new Date().toISOString(),
        },
        { status: 429, headers: CORS_HEADERS },
      );
    }

    // ── Parse + validate ────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body.",
          timestamp: new Date().toISOString(),
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const parsed = curateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors
            .map((e) => e.message)
            .join("; "),
          timestamp: new Date().toISOString(),
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const { promptType, userMessage } = parsed.data;

    // ── Call Gemini ──────────────────────────────────────────
    const systemPrompt = getSystemPrompt(promptType);
    const generatedText = await callGemini(systemPrompt, userMessage);

    // ── Sanitise + return ───────────────────────────────────
    const sanitized = sanitizeOutput(generatedText);

    return NextResponse.json(
      {
        success: true,
        data: { text: sanitized, promptType },
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (err) {
    // NEVER leak internal details or the API key
    // In production, this would use a structured logger (e.g. Sentry)
    logger.error("[curate] Internal error:", err);

    return NextResponse.json(
      {
        success: false,
        error:
          "The museum's AI systems are temporarily unavailable. Please try again later.",
        timestamp: new Date().toISOString(),
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
