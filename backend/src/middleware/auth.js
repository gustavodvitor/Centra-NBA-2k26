import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "troque-essa-chave-secreta-em-producao";

/**
 * Protege uma rota exigindo um token JWT valido no header Authorization.
 * Formato esperado: Authorization: Bearer <token>
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Token nao informado. Faca login novamente." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, name: payload.name, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalido ou expirado." });
  }
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}
