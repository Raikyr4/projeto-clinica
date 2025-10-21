import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { appointmentsApi, paymentsApi } from "@/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Calendar, CreditCard, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/lib/date";
import type { Appointment, AppointmentStatus } from "@/types/api";

export default function Appointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "agendadas" | "realizadas" | "canceladas" | "pagas">("all");

  const { data: appointmentsData, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data } = await appointmentsApi.list();
      return data;
    },
  });

  const { data: paymentsData } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data } = await paymentsApi.list();
      return data;
    },
  });

  const appointments = appointmentsData?.items || [];
  const payments = paymentsData?.items || [];

  const getFilteredAppointments = () => {
    if (activeTab === "all") return appointments;
    if (activeTab === "pagas") {
      const paidAppointmentIds = payments
        .filter((p) => p.status === "APROVADO")
        .map((p) => p.appointment_id);
      return appointments.filter((a) => paidAppointmentIds.includes(a.id));
    }
    return appointments.filter((a) => a.status === activeTab.toUpperCase() as AppointmentStatus);
  };

  const filteredAppointments = getFilteredAppointments();

  const isPaid = (appointmentId: string) => {
    return payments.some(
      (p) => p.appointment_id === appointmentId && p.status === "APROVADO"
    );
  };

  if (isLoadingAppointments) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Consultas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas consultas e pagamentos
          </p>
        </div>
        <Button onClick={() => navigate("/app/doctors")}>
          <Calendar className="mr-2 h-4 w-4" />
          Nova consulta
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="agendadas">Agendadas</TabsTrigger>
          <TabsTrigger value="realizadas">Realizadas</TabsTrigger>
          <TabsTrigger value="canceladas">Canceladas</TabsTrigger>
          <TabsTrigger value="pagas">Pagas</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={Calendar}
                  title="Nenhuma consulta encontrada"
                  description={`Você não tem consultas ${activeTab === "all" ? "" : activeTab}.`}
                  actionLabel="Agendar consulta"
                  onAction={() => navigate("/app/doctors")}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">
                            {appointment.doctor?.nome || "Médico não especificado"}
                          </h3>
                          <StatusBadge status={appointment.status} type="appointment" />
                          {isPaid(appointment.id) && (
                            <StatusBadge status="APROVADO" type="payment" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDateTime(appointment.slot?.inicio || "")}
                            </span>
                          </div>
                          {appointment.observacoes && (
                            <p className="text-sm">{appointment.observacoes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Detalhes
                        </Button>
                        {appointment.status === "AGENDADA" && !isPaid(appointment.id) && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/app/payment/${appointment.id}`)}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
