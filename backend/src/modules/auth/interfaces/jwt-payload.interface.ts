export interface JwtPayload {
  sub: string;
  email: string;
}

export interface RefreshJwtPayload extends JwtPayload {
  type: "refresh";
  jti: string;
}
