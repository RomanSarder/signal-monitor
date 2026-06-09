export interface AuthBody {
  email: string;
  password: string;
}

export const authBodySchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string" },
  },
} as const;
