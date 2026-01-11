export const config = {
  backendURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000",
  frontendURL: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001",
  apiKey: process.env.NEXT_PUBLIC_API_KEY || "",
  environment: process.env.NODE_ENV || "development",
};
