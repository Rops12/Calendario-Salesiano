import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Eye } from 'lucide-react';

export function LoginCredentials() {
  const credentials = [
    {
      role: 'Administrador',
      email: 'admin@salesiano.com.br',
      password: 'admin123',
      icon: Shield,
      color: 'bg-red-500',
      description: 'Acesso completo ao sistema'
    },
    {
      role: 'Coordenador',
      email: 'coordenador@salesiano.com.br',
      password: 'coord123',
      icon: User,
      color: 'bg-blue-500',
      description: 'Gerenciamento de eventos'
    },
    {
      role: 'Professor',
      email: 'professor@salesiano.com.br',
      password: 'prof123',
      icon: Eye,
      color: 'bg-green-500',
      description: 'Visualização de eventos'
    }
  ];

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-strong border-0 mt-6">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          Credenciais de Demonstração
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Use uma das contas abaixo para testar o sistema
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {credentials.map((cred, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${cred.color} rounded-lg`}>
                <cred.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{cred.role}</span>
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    {cred.role.toLowerCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{cred.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-muted-foreground">{cred.email}</p>
              <p className="text-xs font-mono text-muted-foreground">{cred.password}</p>
            </div>
          </div>
        ))}
        
        <div className="text-center pt-2 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            💡 Clique nas credenciais para copiar
          </p>
        </div>
      </CardContent>
    </Card>
  );
}