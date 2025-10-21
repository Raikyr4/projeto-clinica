import { useQuery } from "@tanstack/react-query";
import { doctorsApi } from "@/api/endpoints";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Stethoscope, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Doctors() {
  const navigate = useNavigate();

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data } = await doctorsApi.list();
      return data;
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nossos Médicos</h1>
        <p className="text-muted-foreground mt-1">
          Escolha um médico e agende sua consulta
        </p>
      </div>

      {!doctors?.length ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Stethoscope}
              title="Nenhum médico disponível"
              description="Não há médicos cadastrados no momento."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                      {getInitials(doctor.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{doctor.nome}</h3>
                    {doctor.doctor_profile?.especialidade && (
                      <p className="text-sm text-muted-foreground">
                        {doctor.doctor_profile.especialidade}
                      </p>
                    )}
                    {doctor.doctor_profile?.crm_crp && (
                      <p className="text-xs text-muted-foreground">
                        {doctor.doctor_profile.crm_crp}
                      </p>
                    )}
                    {doctor.doctor_profile?.valor_padrao_consulta && (
                      <p className="text-sm font-medium text-primary">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(doctor.doctor_profile.valor_padrao_consulta)}
                      </p>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/app/schedule/${doctor.id}`)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver agenda
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
