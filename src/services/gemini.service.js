import { env } from "../config/env.js";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const textCache = new Map();
const inFlightTextRequests = new Map();

function assertGeminiConfigured() {
  if (!env.gemini.apiKey) {
    const error = new Error("Gemini API key is not configured. Set GEMINI_API_KEY in the backend environment.");
    error.status = 503;
    throw error;
  }
}

function extractText(payload) {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim() || ""
  );
}

function getPromptBlockReason(payload) {
  return payload?.promptFeedback?.blockReason || null;
}

function getCandidate(payload) {
  return payload?.candidates?.[0] || null;
}

function getCandidateFinishReason(payload) {
  return getCandidate(payload)?.finishReason || null;
}

function getCandidateFinishMessage(payload) {
  return getCandidate(payload)?.finishMessage || null;
}

function getGeminiFailureDetails(payload) {
  const promptBlockReason = getPromptBlockReason(payload);
  const finishReason = getCandidateFinishReason(payload);
  const finishMessage = getCandidateFinishMessage(payload);
  return { promptBlockReason, finishReason, finishMessage };
}

function createGeminiPayloadError(payload, model) {
  const { promptBlockReason, finishReason, finishMessage } = getGeminiFailureDetails(payload);
  const reason = promptBlockReason || finishReason || "EMPTY_RESPONSE";
  const message =
    finishMessage ||
    (promptBlockReason
      ? `Gemini blocked the prompt (${promptBlockReason}).`
      : finishReason
        ? `Gemini returned no text output (${finishReason}).`
        : "Gemini returned no text output.");

  const error = new Error(message);
  error.status = reason === "SAFETY" || promptBlockReason ? 400 : 502;
  error.code = reason === "SAFETY" || promptBlockReason ? "GEMINI_BLOCKED" : "GEMINI_EMPTY_RESPONSE";
  error.providerModel = model;
  error.providerReason = reason;
  return error;
}

function parseDurationMs(value) {
  const match = String(value || "").match(/(\d+(?:\.\d+)?)s/);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) : null;
}

function getRetryDelayMs(payload) {
  const retryInfo = payload?.error?.details?.find((detail) => String(detail?.["@type"] || "").endsWith("RetryInfo"));
  return parseDurationMs(retryInfo?.retryDelay) ?? parseDurationMs(payload?.error?.message);
}

function buildRequestParts({ prompt, inlineData }) {
  const parts = [{ text: prompt }];
  if (inlineData?.data && inlineData?.mimeType) {
    parts.push({
      inlineData: {
        mimeType: inlineData.mimeType,
        data: inlineData.data,
      },
    });
  }
  return parts;
}

async function requestGeminiContent({ model, parts, temperature }) {
  const response = await fetch(
    `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${encodeURIComponent(env.gemini.apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature, topP: 0.9 },
      }),
    }
  );

  const payload = await response.json().catch(() => null);
  return { response, payload };
}

function createGeminiError(response, payload, model) {
  const isQuotaError = response.status === 429;
  const isTransientError = response.status === 500 || response.status === 503;
  const error = new Error(
    isQuotaError
      ? "Gemini is temporarily busy or quota-limited. Please try again in a moment."
      : isTransientError
        ? payload?.error?.message || "Gemini is temporarily unavailable. Please try again in a moment."
      : payload?.error?.message || "Gemini request failed."
  );
  error.status = response.status;
  error.providerStatus = response.status;
  error.providerModel = model;
  error.retryAfterMs = getRetryDelayMs(payload);
  if (isQuotaError) {
    error.code = "GEMINI_BUSY";
  } else if (isTransientError) {
    error.code = "GEMINI_UNAVAILABLE";
  }
  return error;
}

function getTextCacheKey({ prompt, temperature }) {
  return `${env.gemini.models.join(",")}:${temperature}:${prompt}`;
}

function getCachedText(cacheKey, { allowExpired = false } = {}) {
  const cached = textCache.get(cacheKey);
  if (!cached) {
    return null;
  }

  if (!allowExpired && cached.expiresAt <= Date.now()) {
    textCache.delete(cacheKey);
    return null;
  }

  return cached.value;
}

function setCachedText(cacheKey, value) {
  if (!env.gemini.cacheTtlMs || env.gemini.maxCacheEntries <= 0) return;
  textCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + env.gemini.cacheTtlMs,
  });

  while (textCache.size > env.gemini.maxCacheEntries) {
    const oldestKey = textCache.keys().next().value;
    textCache.delete(oldestKey);
  }
}

async function generateWithGeminiModels({ prompt, inlineData, temperature }) {
  const parts = buildRequestParts({ prompt, inlineData });
  const models = env.gemini.models.length ? env.gemini.models : [env.gemini.model];
  let lastError = null;

  for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
    const model = models[modelIndex];

    for (let attempt = 0; attempt <= env.gemini.maxRetries; attempt += 1) {
      const { response, payload } = await requestGeminiContent({ model, parts, temperature });

      if (response.ok) {
        const text = extractText(payload);
        if (text) {
          return { text, raw: payload, model };
        }

        throw createGeminiPayloadError(payload, model);
      }

      const error = createGeminiError(response, payload, model);
      lastError = error;

      if (response.status !== 429 && response.status !== 500 && response.status !== 503) {
        throw error;
      }

      const hasFallbackModel = modelIndex < models.length - 1;
      if (hasFallbackModel) break;

      const retryDelayMs = error.retryAfterMs ?? 2 ** attempt * 1000;
      if (attempt >= env.gemini.maxRetries || retryDelayMs > env.gemini.retryMaxDelayMs) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  throw lastError || new Error("Gemini request failed.");
}

export async function generateGeminiContent({ prompt, inlineData, temperature = 0.4 }) {
  assertGeminiConfigured();

  const shouldCache = !inlineData?.data && env.gemini.cacheTtlMs > 0;
  if (!shouldCache) {
    return generateWithGeminiModels({ prompt, inlineData, temperature });
  }

  const cacheKey = getTextCacheKey({ prompt, temperature });
  const cached = getCachedText(cacheKey);
  if (cached) return cached;

  const pending = inFlightTextRequests.get(cacheKey);
  if (pending) return pending;

  const request = generateWithGeminiModels({ prompt, inlineData, temperature })
    .then((result) => {
      setCachedText(cacheKey, result);
      return result;
    })
    .catch((error) => {
      if (error?.code === "GEMINI_BUSY") {
        const stale = getCachedText(cacheKey, { allowExpired: true });
        if (stale) {
          return { ...stale, degraded: true, stale: true };
        }
      }
      throw error;
    })
    .finally(() => {
      inFlightTextRequests.delete(cacheKey);
    });

  inFlightTextRequests.set(cacheKey, request);
  return request;
}
