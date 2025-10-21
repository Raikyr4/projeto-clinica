import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { agendaApi, appointmentsApi } from "@/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toast } from "sonner";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { dayjs, formatDate, formatTime } from "@/lib/date";
import type { AgendaSlot } from "@/types/api";

export default function Agenda() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const startDate = dayjs().format("YYYY-MM-DD");
  const endDate = dayjs().add(30, "days").format("YYYY-MM-DD");

  const { data: slots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ["doctor-agenda", user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user?.id) throw new Error("User ID is required");
      const { data } = await agendaApi.getAgenda(user.id, startDate, endDate);
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ["doctor-appointments-full"],
    queryFn: async () => {
      const { data } = await appointmentsApi.list();
      return data;
    },
  });

  const createSlotMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User ID is required");
      if (!inicio || !fim) throw new Error("Data e hora são obrigatórios");

      const { data } = await agendaApi.createSlot(user.id, { inicio, fim });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-agenda"] });
      toast.success("Horário criado com sucesso!");
      setIsCreateDialogOpen(false);
      setInicio("");
      setFim("");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || error.message || "Erro ao criar horário"
      );
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      await agendaApi.deleteSlot(slotId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-agenda"] });
      toast.success("Horário removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Erro ao remover horário"
      );
    },
  });

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    createSlotMutation.mutate();
  };

  const handleDeleteSlot = (slot: AgendaSlot) => {
    if (slot.status !== "LIVRE") {
      toast.error("Só é possível remover horários livres");
      return;
    }

    if (window.confirm("Tem certeza que deseja remover este horário?")) {
      deleteSlotMutation.mutate(slot.id);
    }
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

  const getAppointmentForSlot = (slotId: string) => {
    return appointmentsData?.items.find((a) => a.slot_id === slotId);
  };

  if (isLoadingSlots) {
    return <LoadingSpinner size="lg" />;
  }

  const groupedSlots = groupSlotsByDate(slots || []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minha Agenda</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus horários disponíveis
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo horário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar novo horário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSlot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inicio">Data e hora de início</Label>
                <Input
                  id="inicio"
                  type="datetime-local"
                  value={inicio}
                  onChange={(e) => setInicio(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fim">Data e hora de fim</Label>
                <Input
                  id="fim"
                  type="datetime-local"
                  value={fim}
                  onChange={(e) => setFim(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createSlotMutation.isPending}
              >
                {createSlotMutation.isPending ? "Criando..." : "Criar horário"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Próximos horários</CardTitle>
        </CardHeader>
        <CardContent>
          {!slots?.length ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum horário cadastrado. Crie um novo horário para começar.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {date}
                  </h3>
                  <div className="space-y-2">
                    {dateSlots.map((slot) => {
                      const appointment = getAppointmentForSlot(slot.id);
                      return (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatTime(slot.inicio)} - {formatTime(slot.fim)}
                              </span>
                              <StatusBadge status={slot.status} type="slot" />
                            </div>
                            {appointment && (
                              <p className="text-sm text-muted-foreground ml-7">
                                Paciente: {appointment.patient?.nome}
                              </p>
                            )}
                          </div>
                          {slot.status === "LIVRE" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSlot(slot)}
                              disabled={deleteSlotMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
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
