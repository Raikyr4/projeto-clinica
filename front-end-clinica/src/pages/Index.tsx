import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, Shield, Stethoscope } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectMap = {
        ADMIN: "/admin/dashboard",
        MEDICO: "/doctor/dashboard",
        PACIENTE: "/app/dashboard",
      };
      navigate(redirectMap[user.role], { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-white/10 p-4 backdrop-blur-sm">
              <Activity className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Clínica Saúde
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Gestão completa de consultas médicas. Agende, gerencie e acompanhe seus atendimentos de forma simples e eficiente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/register")}
              className="text-lg"
            >
              Criar conta
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="text-lg bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Fazer login
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Funcionalidades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border bg-card shadow-card">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Agendamento Fácil</h3>
              <p className="text-muted-foreground">
                Agende consultas de forma rápida e intuitiva, visualizando horários disponíveis em tempo real.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card shadow-card">
              <div className="inline-flex items-center justify-center rounded-full bg-secondary/10 p-4 mb-4">
                <Stethoscope className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Médicos Qualificados</h3>
              <p className="text-muted-foreground">
                Acesso a diversos especialistas com informações detalhadas sobre cada profissional.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg border bg-card shadow-card">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seguro e Confiável</h3>
              <p className="text-muted-foreground">
                Sistema seguro com controle de acesso e proteção de dados pessoais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-secondary py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Crie sua conta gratuitamente e tenha acesso completo ao sistema.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/register")}
            className="text-lg"
          >
            Cadastrar agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 Clínica Saúde. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
