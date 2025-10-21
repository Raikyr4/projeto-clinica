import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus, PaymentStatus, SlotStatus } from "@/types/api";

interface StatusBadgeProps {
  status: AppointmentStatus | PaymentStatus | SlotStatus;
  type: "appointment" | "payment" | "slot";
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const getVariant = () => {
    if (type === "appointment") {
      switch (status as AppointmentStatus) {
        case "AGENDADA":
          return "default";
        case "REALIZADA":
          return "outline";
        case "CANCELADA":
          return "destructive";
      }
    }

    if (type === "payment") {
      switch (status as PaymentStatus) {
        case "APROVADO":
          return "default";
        case "PENDENTE":
          return "secondary";
        case "RECUSADO":
          return "destructive";
      }
    }

    if (type === "slot") {
      switch (status as SlotStatus) {
        case "LIVRE":
          return "outline";
        case "RESERVADO":
          return "default";
        case "CONCLUIDO":
          return "secondary";
        case "CANCELADO":
          return "destructive";
      }
    }

    return "default";
  };

  return (
    <Badge variant={getVariant()} className="font-medium">
      {status}
    </Badge>
  );
}
