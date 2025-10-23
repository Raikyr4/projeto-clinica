import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Activity, Loader2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { handleAPIError, ERROR_MESSAGES } from "@/lib/error";

// Função para validar CPF
const validarCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/\D/g, "");
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

const registerSchema = z.object({
  nome: z.string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo")
    .trim(),
  email: z.string()
    .email("Email inválido")
    .max(255, "Email muito longo")
    .trim()
    .toLowerCase(),
  cpf: z.string()
    .regex(/^\d{11}$/, "CPF deve conter 11 dígitos")
    .refine(validarCPF, "CPF inválido"),
  password: z.string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function Register() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (isAdmin) {
        throw new Error("Apenas pacientes podem se cadastrar. Admin/Médico são criados pelo Administrador.");
      }

      // Validação local
      const validation = registerSchema.safeParse({
        nome: nome.trim(),
        email: email.trim(),
        cpf: cpf.replace(/\D/g, ""),
        password,
        confirmPassword,
      });

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        throw new Error(validation.error.errors[0].message);
      }

      // Dados para o backend (sem confirmPassword)
      const registerData = {
        nome: validation.data.nome,
        email: validation.data.email,
        cpf: validation.data.cpf,
        password: validation.data.password,
        role: "PACIENTE" as const,
      };

      const response = await authApi.register(registerData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
      navigate("/login");
    },
    onError: (error: unknown) => {
      console.error("Erro no cadastro:", error);
      
      const errorInfo = handleAPIError(error);
      
      // Tratamento para erros de conflito (email/CPF já cadastrado)
      if (errorInfo.isConflict) {
        const message = errorInfo.message.toLowerCase();
        
        if (message.includes("email")) {
          setErrors({ email: errorInfo.message });
          toast.error("Este email já está cadastrado");
        } else if (message.includes("cpf")) {
          setErrors({ cpf: errorInfo.message });
          toast.error("Este CPF já está cadastrado");
        } else {
          toast.error(errorInfo.message);
        }
        return;
      }
      
      // Tratamento para erros de validação
      if (errorInfo.isValidation && Object.keys(errorInfo.fieldErrors).length > 0) {
        setErrors(errorInfo.fieldErrors);
        toast.error(ERROR_MESSAGES.VALIDATION);
        return;
      }
      
      // Outros erros
      toast.error(errorInfo.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Limpar erros antes de cada submit
    registerMutation.mutate();
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    setCpf(numbers);
    if (errors.cpf) {
      setErrors((prev) => ({ ...prev, cpf: "" }));
    }
  };

  const formatCPFDisplay = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-secondary p-3">
              <Activity className="h-8 w-8 text-secondary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para se cadastrar como paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                placeholder="João da Silva"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (errors.nome) setErrors((prev) => ({ ...prev, nome: "" }));
                }}
                className={errors.nome ? "border-red-500" : ""}
                autoComplete="name"
                required
              />
              {errors.nome && (
                <p className="text-sm text-red-500">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={errors.email ? "border-red-500" : ""}
                autoComplete="email"
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formatCPFDisplay(cpf)}
                onChange={(e) => formatCPF(e.target.value)}
                className={errors.cpf ? "border-red-500" : ""}
                required
              />
              {errors.cpf && (
                <p className="text-sm text-red-500">{errors.cpf}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={errors.password ? "border-red-500" : ""}
                autoComplete="new-password"
                required
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                className={errors.confirmPassword ? "border-red-500" : ""}
                autoComplete="new-password"
                required
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="admin"
                checked={isAdmin}
                onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
              />
              <Label
                htmlFor="admin"
                className="text-sm font-normal cursor-pointer"
              >
                Sou Admin ou Médico
              </Label>
            </div>

            {isAdmin && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Apenas pacientes podem se auto-cadastrar. Contas de Admin e Médico são criadas exclusivamente pelo Administrador do sistema.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending || isAdmin}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}