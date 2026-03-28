import { Link, useNavigate } from "@tanstack/react-router";
import { useTheme } from "../context/ThemeContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Layout({ children }: { children: React.ReactNode }) {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { darkMode, toggleDarkMode } = useTheme();
  const isLoggedIn = !!identity;
  const navigate = useNavigate();

  const handleLogout = () => {
    clear();
    navigate({ to: "/" });
  };

  const authStatus = isInitializing
    ? "STATUS: INIT..."
    : isLoggedIn
      ? "STATUS: AUTHENTICATED"
      : "STATUS: GUEST";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono">
      {/* Terminal Header */}
      <header className="w-full">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          {/* Top border */}
          <div className="text-foreground text-sm leading-none">
            <div>┌{"─".repeat(68)}┐</div>
            <div className="flex items-center">
              <span>│</span>
              <span className="flex-1 px-2 tracking-widest text-primary font-bold">
                PASTEVAULT :: PLAIN TEXT ARCHIVE
              </span>
              <span className="px-2 text-muted-foreground text-xs">
                {authStatus}
              </span>
              <span>│</span>
            </div>
            <div>├{"─".repeat(68)}┤</div>
            {/* Nav row */}
            <div className="flex items-center">
              <span>│</span>
              <span className="flex-1 flex items-center gap-1 px-2 py-0.5">
                <Link
                  to="/"
                  data-ocid="nav.home_link"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  [HOME]
                </Link>
                {isLoggedIn && (
                  <Link
                    to="/create"
                    data-ocid="nav.create_button"
                    className="ml-2 text-foreground hover:text-primary transition-colors"
                  >
                    [NEW PASTE]
                  </Link>
                )}
              </span>
              <span className="px-2 flex items-center gap-2">
                {/* Dark/Light mode toggle */}
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  data-ocid="nav.toggle"
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  title={
                    darkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  {darkMode ? "[LIGHT]" : "[DARK]"}
                </button>
                {!isInitializing && !isLoggedIn && (
                  <button
                    type="button"
                    onClick={login}
                    disabled={loginStatus === "logging-in"}
                    data-ocid="nav.login_button"
                    className="text-foreground hover:text-primary transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {loginStatus === "logging-in"
                      ? "[SIGNING IN...]"
                      : "[SIGN IN]"}
                  </button>
                )}
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    data-ocid="nav.logout_button"
                    className="text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    [SIGN OUT]
                  </button>
                )}
              </span>
              <span>│</span>
            </div>
            <div>└{"─".repeat(68)}┘</div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Footer status bar */}
      <footer className="w-full">
        <div className="max-w-5xl mx-auto px-4 pb-4">
          <div className="text-muted-foreground text-xs text-center">
            ┤{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              PASTEVAULT v1.0 · BUILT WITH ♥ USING CAFFEINE.AI
            </a>
            {" ├"}
          </div>
        </div>
      </footer>
    </div>
  );
}
