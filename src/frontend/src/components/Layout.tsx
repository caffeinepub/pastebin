import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { FilePlus, LogIn, LogOut } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function Layout({ children }: { children: React.ReactNode }) {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const navigate = useNavigate();

  const handleLogout = () => {
    clear();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background paper-texture flex flex-col">
      {/* Masthead */}
      <header className="border-b-2 border-foreground">
        <div className="max-w-5xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between py-2 rule-thin border-b border-border">
            <p className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
              Plain Text Archive
            </p>
            <div className="flex items-center gap-2">
              {!isInitializing && !isLoggedIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={login}
                  disabled={loginStatus === "logging-in"}
                  data-ocid="nav.login_button"
                  className="text-xs tracking-wider uppercase h-7 px-3 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <LogIn className="h-3 w-3 mr-1.5" />
                  {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
                </Button>
              )}
              {isLoggedIn && (
                <>
                  <Link to="/create">
                    <Button
                      size="sm"
                      data-ocid="nav.create_button"
                      className="text-xs tracking-wider uppercase h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <FilePlus className="h-3 w-3 mr-1.5" />
                      New Paste
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    data-ocid="nav.logout_button"
                    className="text-xs tracking-wider uppercase h-7 px-3"
                  >
                    <LogOut className="h-3 w-3 mr-1.5" />
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Masthead title */}
          <div className="py-5 text-center border-b-2 border-foreground">
            <Link to="/" className="block">
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
                PasteVault
              </h1>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mt-1">
                Share · Preserve · Reference
              </p>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-foreground">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground font-mono">
            PasteVault — plain text, no frills
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline underline-offset-2"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
