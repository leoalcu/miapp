import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Crown, Trophy, History, LogIn, LogOut, User } from "lucide-react";

export default function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors">
              <Crown className="w-6 h-6" />
              Kingdoms
            </a>
          </Link>
          
          <div className="hidden md:flex items-center gap-4">
            <Link href="/rankings">
              <a className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Trophy className="w-4 h-4" />
                Rankings
              </a>
            </Link>
            <Link href="/history">
              <a className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <History className="w-4 h-4" />
                Historial
              </a>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{user.displayName}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </Button>
            </>
          ) : (
            <Link href="/login">
              <a>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </Button>
              </a>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}