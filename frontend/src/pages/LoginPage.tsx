import { Button } from "../components/ui/Button";

export function LoginPage() {
  return (
    <main className="page narrow-page">
      <h1>Login</h1>
      <form className="form">
        <label>
          Email
          <input type="email" name="email" autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" name="password" autoComplete="current-password" />
        </label>
        <Button type="submit">Login</Button>
      </form>
    </main>
  );
}
