export interface AuthResponse {
  status: number;
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
}

interface LoginParams {
  email: string;
  password: string;
}

interface SendCodeParams {
  email: string;
}

interface RegisterParams {
  email: string;
  code: string;
  password: string;
}

const VALID_USER = { email: "test@example.com", password: "password123" };
const LOCKED_USER = "locked@example.com";
const UNVERIFIED_USER = "unverified@example.com";
const RATELIMIT_USER = "ratelimit@example.com";

const VALID_CODE = "123456";
const EXPIRED_CODE = "000000";

export async function mockLogin({ email, password }: LoginParams): Promise<AuthResponse> {
  // Simulate network delay
  await delay(100);

  if (email === RATELIMIT_USER) {
    return { status: 429, headers: { "Retry-After": "900" } };
  }

  if (email === LOCKED_USER) {
    const lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    return { status: 423, data: { locked_until: lockedUntil } };
  }

  if (email === UNVERIFIED_USER) {
    return { status: 403, data: { error_code: "email_unverified" } };
  }

  if (email === VALID_USER.email && password === VALID_USER.password) {
    return { status: 200, data: { access_token: "mock-jwt-token-xyz" } };
  }

  return { status: 401, data: { error: "invalid_credentials" } };
}

export async function mockSendCode({ email }: SendCodeParams): Promise<AuthResponse> {
  await delay(100);

  if (email === RATELIMIT_USER) {
    return { status: 429, headers: { "Retry-After": "60" } };
  }

  return { status: 200 };
}

export async function mockRegister({ email, code }: RegisterParams): Promise<AuthResponse> {
  await delay(100);

  if (email === RATELIMIT_USER) {
    return { status: 429, headers: { "Retry-After": "3600" } };
  }

  if (code === EXPIRED_CODE) {
    return { status: 400, data: { error_code: "expired_code" } };
  }

  if (code !== VALID_CODE) {
    return { status: 400, data: { error_code: "invalid_code" } };
  }

  return { status: 201 };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
