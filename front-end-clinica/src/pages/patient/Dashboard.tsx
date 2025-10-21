import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Calendar, DollarSign, Activity, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/lib/date";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const { data: kpis, isLoading } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: async () => {
      const { data } = await dashboardApi.getKPIs();
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta! Aqui está um resumo das suas consultas.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas este mês
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.total_consultas_mes || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gasto total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(kpis?.faturamento_mes || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de ocupação
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis?.taxa_ocupacao ? `${kpis.taxa_ocupacao.toFixed(1)}%` : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card gradient-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground">
              Status
            </CardTitle>
            <Activity className="h-4 w-4 text-primary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">Ativo</div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Consultas */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Próximas consultas</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/appointments")}
            >
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!kpis?.proximos_atendimentos?.length ? (
            <EmptyState
              icon={Calendar}
              title="Nenhuma consulta agendada"
              description="Você não tem consultas próximas. Agende uma consulta com um de nossos médicos."
              actionLabel="Agendar consulta"
              onAction={() => navigate("/app/doctors")}
            />
          ) : (
            <div className="space-y-4">
              {kpis.proximos_atendimentos.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{appointment.doctor?.nome}</p>
                      <StatusBadge status={appointment.status} type="appointment" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(appointment.slot?.inicio || "")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/app/appointments")}
                  >
                    Detalhes
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => navigate("/app/doctors")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Agendar consulta</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha um médico e horário
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => navigate("/app/appointments")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-secondary/10 p-3">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Minhas consultas</h3>
                <p className="text-sm text-muted-foreground">
                  Ver histórico completo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
