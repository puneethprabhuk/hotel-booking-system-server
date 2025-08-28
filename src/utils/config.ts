export const config = {
  jwtSecret: process.env.JWT_SECRET as string,
  bcryptSaltRounds: 10
};

if (!config.jwtSecret) {
  throw new Error("JWT_SECRET is missing in environment variables");
}
