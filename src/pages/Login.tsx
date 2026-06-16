import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Senha padrão local (pode ser customizada)
const DEFAULT_PASSWORD = "adminJijoca2026";

export default function Login() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Pequeno delay para simulação elegante
    setTimeout(() => {
      if (password === DEFAULT_PASSWORD) {
        sessionStorage.setItem("semana_musica_admin", "true");
        toast.success("Login efetuado com sucesso!");
        navigate("/dashboard");
      } else {
        toast.error("Senha incorreta. Tente novamente.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Glows de fundo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full border border-primary/20 bg-card/60 backdrop-blur-md flex items-center justify-center p-2 mb-4 shadow-lg animate-float">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-display font-bold">Painel do Organizador</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Entre com a credencial administrativa para gerenciar os inscritos.
          </p>
        </div>

        <Card className="glass-card shadow-2xl border-white/20">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="text-lg">Autenticação</CardTitle>
              <CardDescription>Digite a senha de acesso ao painel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha Administrativa</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite a senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
                {loading ? "Entrando..." : "Acessar Painel"} <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-[10px] text-center text-muted-foreground">
          Dica de desenvolvimento: Use a senha padrão <code>adminJijoca2026</code>
        </p>
      </div>
    </div>
  );
}
