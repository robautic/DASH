import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { Shield, User, KeyRound, Mail, ArrowRight, CheckCircle2, Lock, Sparkles, Building2, Eye } from "lucide-react";
import { toast } from "sonner";

interface LoginPageProps {
  onSuccess?: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const { login, forgotPassword } = useAuth();
  const [email, setEmail] = useState("admin@datacrazy.com");
  const [password, setPassword] = useState("admin123");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    const ok = await login(email, password, remember);
    setLoading(false);
    if (ok) {
      toast.success("Login realizado com sucesso!");
      if (onSuccess) onSuccess();
    } else {
      toast.error("E-mail ou senha incorretos.");
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoRoleLabel: string) => {
    setEmail(demoEmail);
    setPassword("123456");
    setLoading(true);
    const ok = await login(demoEmail, "123456", true);
    setLoading(false);
    if (ok) {
      toast.success(`Conectado como ${demoRoleLabel}!`);
      if (onSuccess) onSuccess();
    } else {
      toast.error("Erro ao realizar login de demonstração.");
    }
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Informe seu e-mail cadastrado.");
      return;
    }
    setForgotLoading(true);
    await forgotPassword(forgotEmail);
    setForgotLoading(false);
    toast.success("Instruções de redefinição enviadas para " + forgotEmail);
    setForgotModalOpen(false);
    setForgotEmail("");
  };

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.02_260)] text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Logo and header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-xl shadow-blue-500/20 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sigma Assessoria</h1>
          <p className="text-xs text-muted-foreground">Sistema de Gestão & Distribuição Inteligente de Leads</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-6 rounded-2xl border border-[oklch(0.3_0.02_260/0.4)] shadow-2xl backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-glow" />
              Acessar Plataforma
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-glow border border-emerald-500/20 font-mono">
              v2.5 SLA Live
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground block">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-xl text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-emerald-glow/60 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground block">Senha</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-xl text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-emerald-glow/60 transition-colors"
                />
              </div>
            </div>

            {/* Remember & Forgot options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-[oklch(0.3_0.02_260)] bg-[oklch(0.14_0.02_260)] text-emerald-glow focus:ring-emerald-glow"
                />
                Lembrar acesso neste dispositivo
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-emerald-glow hover:underline text-xs font-medium cursor-pointer"
              >
                Esqueci minha senha
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Profile Demo Selector */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Acesso Rápido por Perfil (Demo)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickDemoLogin("admin@datacrazy.com", "Administrador")}
                className="p-2 rounded-xl bg-[oklch(0.16_0.02_260)] border border-emerald-500/30 hover:border-emerald-500/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400 group-hover:text-emerald-300">
                  <Shield className="w-3.5 h-3.5" />
                  Administrador
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Visão Geral & Configurações</div>
              </button>

              <button
                onClick={() => handleQuickDemoLogin("carlos.sup@datacrazy.com", "Supervisor")}
                className="p-2 rounded-xl bg-[oklch(0.16_0.02_260)] border border-blue-500/30 hover:border-blue-500/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-blue-400 group-hover:text-blue-300">
                  <Building2 className="w-3.5 h-3.5" />
                  Supervisor
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Gestão do Departamento</div>
              </button>

              <button
                onClick={() => handleQuickDemoLogin("anacarol@datacrazy.com", "Atendente (Ana Carol)")}
                className="p-2 rounded-xl bg-[oklch(0.16_0.02_260)] border border-purple-500/30 hover:border-purple-500/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-purple-400 group-hover:text-purple-300">
                  <User className="w-3.5 h-3.5" />
                  Atendente
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Ana Carol (Leads próprios)</div>
              </button>

              <button
                onClick={() => handleQuickDemoLogin("viewer@datacrazy.com", "Visualizador")}
                className="p-2 rounded-xl bg-[oklch(0.16_0.02_260)] border border-amber-500/30 hover:border-amber-500/60 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400 group-hover:text-amber-300">
                  <Eye className="w-3.5 h-3.5" />
                  Visualizador
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Apenas Leitura / Relatórios</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground/60">
          Integrado com a API DataCrazy • SLA & Analytics em Tempo Real
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-sm w-full p-6 rounded-2xl border border-[oklch(0.3_0.02_260/0.4)] space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-glow" />
              Recuperar Senha
            </h3>
            <p className="text-xs text-muted-foreground">
              Digite seu e-mail cadastrado. Enviaremos um link de redefinição de senha para você.
            </p>

            <form onSubmit={handleSendResetLink} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="w-full px-3 py-2 text-xs bg-[oklch(0.14_0.02_260)] border border-[oklch(0.3_0.02_260/0.4)] rounded-xl text-white focus:outline-none focus:border-emerald-glow"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium cursor-pointer"
                >
                  {forgotLoading ? "Enviando..." : "Enviar Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
