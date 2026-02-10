const STORAGE_KEY = "shipment_api_config";

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
}

export function getApiConfig(): ApiConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { baseUrl: "", apiKey: "" };
}

export function saveApiConfig(config: ApiConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const config = getApiConfig();
  if (!config.baseUrl || !config.apiKey) {
    throw new Error("API not configured. Please set your Base URL and API Key in Settings.");
  }

  const url = `${config.baseUrl.replace(/\/+$/, "")}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": config.apiKey,
    ...(options.headers as Record<string, string> || {}),
  };

  return fetch(url, { ...options, headers });
}
