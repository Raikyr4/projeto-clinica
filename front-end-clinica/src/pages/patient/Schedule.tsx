import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doctorsApi, agendaApi, appointmentsApi } from "@/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import { Calendar, Clock, ArrowLeft, Check } from "lucide-react";
import { dayjs, formatDate, formatTime } from "@/lib/date";
import type { AgendaSlot } from "@/types/api";

export default function Schedule() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState<AgendaSlot | null>(null);

  const startDate = dayjs().format("YYYY-MM-DD");
  const endDate = dayjs().add(30, "days").format("YYYY-MM-DD");

  const { data: doctor, isLoading: isLoadingDoctor } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: async () => {
      if (!doctorId) throw new Error("Doctor ID is required");
      const { data } = await doctorsApi.get(doctorId);
      return data;
    },
    enabled: !!doctorId,
  });

  const { data: slots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ["agenda", doctorId, startDate, endDate],
    queryFn: async () => {
      if (!doctorId) throw new Error("Doctor ID is required");
      const { data } = await agendaApi.getAgenda(doctorId, startDate, endDate);
      return data;
    },
    enabled: !!doctorId,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (slotId: string) => {
      const { data } = await appointmentsApi.create({ slot_id: slotId });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      toast.success("Consulta agendada com sucesso!");
      
      // Ask if user wants to pay now
      const shouldPay = window.confirm(
        "Consulta agendada! Deseja realizar o pagamento agora?"
      );
      
      if (shouldPay) {
        navigate(`/app/payment/${data.id}`);
      } else {
        navigate("/app/appointments");
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Erro ao agendar consulta"
      );
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const groupSlotsByDate = (slots: AgendaSlot[]) => {
    const grouped: Record<string, AgendaSlot[]> = {};
    slots.forEach((slot) => {
      const date = formatDate(slot.inicio);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    return grouped;
  };

  const getSlotColor = (status: string) => {
    switch (status) {
      case "LIVRE":
        return "bg-secondary/10 hover:bg-secondary/20 border-secondary text-secondary";
      case "RESERVADO":
        return "bg-primary/10 border-primary text-primary cursor-not-allowed";
      case "CONCLUIDO":
        return "bg-muted border-muted-foreground/20 text-muted-foreground cursor-not-allowed";
      case "CANCELADO":
        return "bg-destructive/10 border-destructive text-destructive cursor-not-allowed";
      default:
        return "bg-muted";
    }
  };

  const handleSlotClick = (slot: AgendaSlot) => {
    if (slot.status === "LIVRE") {
      setSelectedSlot(slot);
    }
  };

  const handleConfirmAppointment = () => {
    if (selectedSlot) {
      createAppointmentMutation.mutate(selectedSlot.id);
    }
  };

  if (isLoadingDoctor || isLoadingSlots) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-6">
        <EmptyState
          icon={Calendar}
          title="Médico não encontrado"
          description="O médico solicitado não foi encontrado."
          actionLabel="Voltar"
          onAction={() => navigate("/app/doctors")}
        />
      </div>
    );
  }

  const freeSlots = slots?.filter((s) => s.status === "LIVRE") || [];
  const groupedSlots = groupSlotsByDate(freeSlots);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/app/doctors")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      {/* Doctor Info */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                {getInitials(doctor.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{doctor.nome}</h2>
              {doctor.doctor_profile?.especialidade && (
                <p className="text-muted-foreground">
                  {doctor.doctor_profile.especialidade}
                </p>
              )}
              {doctor.doctor_profile?.valor_padrao_consulta && (
                <p className="text-primary font-medium mt-1">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(doctor.doctor_profile.valor_padrao_consulta)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Horários disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          {freeSlots.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhum horário disponível"
              description="Não há horários livres para este médico nos próximos 30 dias."
            />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {date}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {dateSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotClick(slot)}
                        disabled={slot.status !== "LIVRE"}
                        className={`
                          p-3 rounded-lg border-2 text-center transition-all
                          ${getSlotColor(slot.status)}
                          ${
                            selectedSlot?.id === slot.id
                              ? "ring-2 ring-secondary shadow-glow"
                              : ""
                          }
                        `}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-sm font-medium">
                            {formatTime(slot.inicio)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation */}
      {selectedSlot && (
        <Card className="shadow-elevated border-secondary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Horário selecionado:
                </p>
                <p className="text-lg font-semibold">
                  {formatDate(selectedSlot.inicio)} às {formatTime(selectedSlot.inicio)}
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleConfirmAppointment}
                disabled={createAppointmentMutation.isPending}
              >
                {createAppointmentMutation.isPending ? (
                  "Agendando..."
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirmar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
