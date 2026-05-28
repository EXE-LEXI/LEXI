import { Button } from "../components/ui/Button";

type AuthPageProps = {
  mode: "login" | "register";
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (payload: {
    email: string;
    password: string;
    fullName?: string;
  }) => Promise<void>;
  onModeChange: (mode: "login" | "register") => void;
};

export function LoginPage({
  mode,
  isSubmitting,
  error,
  onSubmit,
  onModeChange,
}: AuthPageProps) {
  const isRegister = mode === "register";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await onSubmit({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      fullName: String(formData.get("fullName") ?? ""),
    });
  }

  return (
    <main className="page narrow-page">
      <p className="eyebrow">LEXI Account</p>
      <h1>{isRegister ? "Create account" : "Login"}</h1>
      <form className="form" onSubmit={handleSubmit}>
        {isRegister ? (
          <label>
            Full name
            <input name="fullName" autoComplete="name" required />
          </label>
        ) : null}
        <label>
          Email
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            minLength={6}
            required
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : isRegister ? "Register" : "Login"}
        </Button>
        <button
          className="link-button form-switch"
          type="button"
          onClick={() => onModeChange(isRegister ? "login" : "register")}
        >
          {isRegister
            ? "Already have an account? Login"
            : "Need an account? Register"}
        </button>
      </form>
    </main>
  );
}
