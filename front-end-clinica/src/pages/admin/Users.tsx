import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/endpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Users as UsersIcon, Plus, Pencil } from "lucide-react";
import { formatDate } from "@/lib/date";
import { toast } from "sonner";
import type { UserResponse, UserRole } from "@/types/api";

export default function Users() {
  const queryClient = useQueryClient();
  
  // Estados para edição
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  
  // Estados para criação
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createNome, setCreateNome] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createCpf, setCreateCpf] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<UserRole>("PACIENTE");
  const [createCrm, setCreateCrm] = useState("");
  const [createEspecialidade, setCreateEspecialidade] = useState("");
  const [createValorConsulta, setCreateValorConsulta] = useState("");

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await usersApi.list();
      return data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error("Nenhum usuário selecionado");
      
      const { data } = await usersApi.update(selectedUser.id, {
        nome: editNome.trim(),
        email: editEmail.trim(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário atualizado com sucesso!");
      handleCloseEditDialog();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Erro ao atualizar usuário"
      );
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const userData: any = {
        nome: createNome.trim(),
        email: createEmail.trim(),
        cpf: createCpf.replace(/\D/g, ""),
        password: createPassword,
        role: createRole,
      };

      // Se for médico, adicionar dados adicionais
      if (createRole === "MEDICO") {
        if (createCrm) userData.crm_crp = createCrm.trim();
        if (createEspecialidade) userData.especialidade = createEspecialidade.trim();
        if (createValorConsulta) userData.valor_padrao_consulta = parseFloat(createValorConsulta);
      }

      const { data } = await usersApi.create(userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuário criado com sucesso!");
      handleCloseCreateDialog();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.detail || "Erro ao criar usuário"
      );
    },
  });

  const handleEditClick = (user: UserResponse) => {
    setSelectedUser(user);
    setEditNome(user.nome);
    setEditEmail(user.email);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    setEditNome("");
    setEditEmail("");
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setCreateNome("");
    setCreateEmail("");
    setCreateCpf("");
    setCreatePassword("");
    setCreateRole("PACIENTE");
    setCreateCrm("");
    setCreateEspecialidade("");
    setCreateValorConsulta("");
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate();
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate();
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    setCreateCpf(numbers);
  };

  const formatCPFDisplay = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  const users = usersData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        {/* Atualizado: botão laranja */}
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-tertiary text-tertiary-foreground hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo usuário
        </Button>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Todos os usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{user.nome}</p>
                    <Badge variant={user.role === "ADMIN" ? "destructive" : user.role === "MEDICO" ? "secondary" : "default"}>
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.cpf && (
                    <p className="text-sm text-muted-foreground">CPF: {formatCPFDisplay(user.cpf)}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Criado em {formatDate(user.created_at)}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditClick(user)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome completo</Label>
              <Input
                id="edit-nome"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                placeholder="Nome do usuário"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseEditDialog}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateUserMutation.isPending}
                className="flex-1"
              >
                {updateUserMutation.isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Criação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-nome">Nome completo</Label>
              <Input
                id="create-nome"
                value={createNome}
                onChange={(e) => setCreateNome(e.target.value)}
                placeholder="Nome do usuário"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-cpf">CPF</Label>
              <Input
                id="create-cpf"
                value={formatCPFDisplay(createCpf)}
                onChange={(e) => formatCPF(e.target.value)}
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-password">Senha</Label>
              <Input
                id="create-password"
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-role">Tipo de Usuário</Label>
              <Select value={createRole} onValueChange={(value) => setCreateRole(value as UserRole)}>
                <SelectTrigger id="create-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PACIENTE">Paciente</SelectItem>
                  <SelectItem value="MEDICO">Médico</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseCreateDialog}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="flex-1"
              >
                {createUserMutation.isPending ? "Criando..." : "Criar usuário"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
