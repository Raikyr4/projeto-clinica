import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi, reportsApi } from "@/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { dayjs } from "@/lib/date";

export default function AdminDashboard() {
  const [year] = useState(dayjs().year());

  const { data: kpis, isLoading: isLoadingKPIs } = useQuery({
    queryKey: ["admin-kpis"],
    queryFn: async () => {
      const { data } = await dashboardApi.getKPIs();
      return data;
    },
  });

  const { data: monthlyRevenue } = useQuery({
    queryKey: ["admin-revenue", year],
    queryFn: async () => {
      const { data } = await reportsApi.adminMonthlyRevenue(year);
      return data;
    },
  });

  if (isLoadingKPIs) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalRevenue = monthlyRevenue?.reduce((acc, curr) => acc + Number(curr.valor_total), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema e relatórios
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
              Faturamento anual
            </CardTitle>
            <DollarSign className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalRevenue)}
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
              {kpis?.taxa_ocupacao ? `${kpis.taxa_ocupacao.toFixed(1)}%` : "0%"}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card gradient-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground">
              Usuários ativos
            </CardTitle>
            <Users className="h-4 w-4 text-primary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-foreground">
              {kpis?.total_usuarios_ativos || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Faturamento mensal - {year}</CardTitle>
        </CardHeader>
        <CardContent>
          {!monthlyRevenue?.length ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum dado de faturamento disponível
            </p>
          ) : (
            <div className="space-y-4">
              {monthlyRevenue.map((data) => (
                <div
                  key={`${data.mes}`}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(data.mes + '-01').toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(Number(data.valor_total))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}