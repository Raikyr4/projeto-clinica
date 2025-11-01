import { useQuery } from "@tanstack/react-query";
import { dashboardApi, appointmentsApi } from "@/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Calendar, DollarSign, TrendingUp, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/lib/date";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const { data: kpis, isLoading: isLoadingKPIs } = useQuery({
    queryKey: ["doctor-kpis"],
    queryFn: async () => {
      const { data } = await dashboardApi.getKPIs();
      return data;
    },
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: async () => {
      const { data } = await appointmentsApi.list(0, 10);
      return data;
    },
  });

  const appointments = appointmentsData || [];

  if (isLoadingKPIs) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Médico</h1>
        <p className="text-muted-foreground">
          Visão geral das suas consultas e agenda
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas este mês
            </CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.total_consultas_mes || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento
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
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis?.taxa_ocupacao ? `${kpis.taxa_ocupacao.toFixed(1)}%` : "0%"}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card gradient-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-secondary-foreground">
              Pacientes ativos
            </CardTitle>
            <Users className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-foreground">
              {appointments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Consultas recentes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/doctor/agenda")}>
              Ver agenda
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma consulta agendada
            </p>
          ) : (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{appointment.patient?.nome}</p>
                      <StatusBadge status={appointment.status} type="appointment" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(appointment.slot?.inicio || "")}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
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
        <Card
          className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer"
          onClick={() => navigate("/doctor/agenda")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-secondary/10 p-3">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Gerenciar agenda</h3>
                <p className="text-sm text-muted-foreground">
                  Criar e editar horários disponíveis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-elevated transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-secondary/10 p-3">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Meus pacientes</h3>
                <p className="text-sm text-muted-foreground">
                  Ver histórico de atendimentos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
