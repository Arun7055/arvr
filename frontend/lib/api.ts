const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const token = typeof window !== "undefined" ? localStorage.getItem("atelier_token") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const errJson = await res.json();
      message = errJson.detail || message;
    } catch {
      const errText = await res.text();
      if (errText) message = errText;
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  health: () => request<{ status: string; database: string }>("/health"),

  auth: {
    signup: (data: { full_name: string; email: string; password: string }) =>
      request<{ access_token: string; user: { id: string; full_name: string; email: string } }>(
        "/api/auth/signup",
        { method: "POST", body: JSON.stringify(data) }
      ),
    login: (data: { email: string; password: string }) =>
      request<{ access_token: string; user: { id: string; full_name: string; email: string } }>(
        "/api/auth/login",
        { method: "POST", body: JSON.stringify(data) }
      ),
    forgotPassword: (data: { email: string }) =>
      request<{ message: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    resetPassword: (data: { email: string; otp_code: string; new_password: string }) =>
      request<{ message: string }>("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<{ id: string; full_name: string; email: string }>("/api/auth/me"),
  },

  studio: {
    customize: (data: { base_garment: string; user_prompt: string }) =>
      request<any>("/api/studio/customize", { method: "POST", body: JSON.stringify(data) }),
    listDesigns: () => request<any[]>("/api/studio/designs"),
  },

  shopper: {
    getCatalog: () => request<any[]>("/api/shopper/catalog"),
    recommend: (data: { user_prompt: string; budget_inr: number }) =>
      request<any>("/api/shopper/recommend", { method: "POST", body: JSON.stringify(data) }),
  },

  tryon: {
    getAssets: () => request<any[]>("/api/tryon/assets"),
    fitAdvice: (data: { garment_name: string; user_question: string }) =>
      request<any>("/api/tryon/fit-advice", { method: "POST", body: JSON.stringify(data) }),
  },

  wardrobe: {
    listItems: () => request<any[]>("/api/wardrobe/items"),
    addItem: (formData: FormData) =>
      request<any>("/api/wardrobe/items", { method: "POST", body: formData }),
    dailyOutfit: (data: { occasion: string; latitude?: number; longitude?: number }) =>
      request<any>("/api/wardrobe/daily-outfit", { method: "POST", body: JSON.stringify(data) }),
  },
};