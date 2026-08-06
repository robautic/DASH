import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Key, Webhook, Bell, Database, CheckCircle2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ConfiguracoesPage() {
  const [apiToken, setApiToken] = useState<string>(
    "dc_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  );
  const [webhookUrl] = useState<string>(
    "https://api.g1.datacrazy.io/api/v1/webhooks/next-leads"
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <div className="space-y-6 stagger-enter">
      <DashboardHeader
        title="Configurações do Sistema"
        subtitle="Gerencie integrações com DataCrazy, Webhooks e preferências de automação"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DataCrazy API Token Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-glow/10 border border-emerald-glow/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-emerald-glow" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Token API DataCrazy</h3>
              <p className="text-xs text-muted-foreground">Utilizado para autenticação segura no backend Express</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Chave de Acesso (Bearer Token)</label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="bg-[oklch(0.12_0.02_260)] border-[oklch(0.3_0.02_260/0.4)] text-foreground text-xs"
              />
              <button
                onClick={() => handleCopy(apiToken)}
                className="px-3 py-2 bg-emerald-glow/10 border border-emerald-glow/20 text-emerald-glow rounded-lg hover:bg-emerald-glow/20 text-xs font-medium transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-glow">
            <CheckCircle2 className="w-4 h-4" />
            <span>Integrado via backend seguro (Environment variable)</span>
          </div>
        </div>

        {/* Webhooks Integration Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Endpoint de Webhook</h3>
              <p className="text-xs text-muted-foreground">Receba eventos em tempo real do CRM DataCrazy</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">URL do Webhook Recebedor</label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="bg-[oklch(0.12_0.02_260)] border-[oklch(0.3_0.02_260/0.4)] text-foreground text-xs font-mono"
              />
              <button
                onClick={() => handleCopy(webhookUrl)}
                className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 text-xs font-medium transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Escutando eventos: <code className="text-emerald-glow font-mono">lead.created</code>, <code className="text-emerald-glow font-mono">lead.stage_changed</code>
          </div>
        </div>
      </div>
    </div>
  );
}
