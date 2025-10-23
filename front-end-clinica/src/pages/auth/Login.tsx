import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/endpoints";
import { useAuthStore } from "@/store/auth";
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

const loginSchema = z.object({
  email: z.string().email("Email inválido").trim().toLowerCase(),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginVars = { email: string; password: string };

export default function Login() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginMutation = useMutation({
    mutationKey: ["login"],
    retry: false,

    // Recebe os valores como "variables" para evitar closures com estado antigo
    mutationFn: async (vars: LoginVars) => {
      // zera erros antigos
      setErrors({});

      // validação local (Zod)
      const parsed = loginSchema.safeParse({
        email: vars.email.trim(),
        password: vars.password,
      });

      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        parsed.error.errors.forEach((err) => {
          const key = err.path?.[0] as string | undefined;
          if (key) fieldErrors[key] = err.message;
        });
        setErrors(fieldErrors);

        // marca como erro de validação (sem retry)
        const e: any = new Error(parsed.error.errors[0]?.message ?? "Dados inválidos");
        e.isValidation = true;
        throw e;
      }

      // Login
      const { data: authData } = await authApi.login({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      setTokens(authData.access_token, authData.refresh_token);

      // Buscar dados do usuário logado
      const { data: userData } = await authApi.me();
      setUser(userData);

      return userData;
    },

    onMutate: () => {
      setErrors({});
    },

    onSuccess: (userData) => {
      toast.success(`Bem-vindo, ${userData.nome}!`);

      const redirectMap: Record<string, string> = {
        ADMIN: "/admin/dashboard",
        MEDICO: "/doctor/dashboard",
        PACIENTE: "/app/dashboard",
      };

      const redirectPath = redirectMap[userData.role] || "/app/dashboard";
      navigate(redirectPath);
    },

    onError: (error: unknown) => {
      console.error("Erro no login:", error);

      // handleAPIError não lança; ainda assim protegemos o uso
      const errorInfo = handleAPIError(error);

      // Erros de autenticação (401, etc.)
      if (errorInfo.isAuth) {
        toast.error(ERROR_MESSAGES.UNAUTHORIZED);
        setErrors({
          email: "",
          password: "Credenciais inválidas",
        });
        return;
      }

      // Erros de validação vindos da API
      if (errorInfo.isValidation && Object.keys(errorInfo.fieldErrors).length > 0) {
        setErrors(errorInfo.fieldErrors);
        toast.error(ERROR_MESSAGES.VALIDATION);
        return;
      }

      // Outros erros
      toast.error(errorInfo.message ?? "Falha ao entrar. Tente novamente.");
    },

    onSettled: () => {
      // Se houver qualquer loading externo, zere aqui.
      // (O botão usa isPending, então não é estritamente necessário)
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Evita duplo submit (Enter rápido) ou segunda chamada durante isPending
    if (loginMutation.isPending) return;

    setErrors({});
    loginMutation.reset(); // limpa estado anterior (error/data) antes de nova tentativa

    const vars: LoginVars = { email, password };

    try {
      await loginMutation.mutateAsync(vars);
    } catch {
      // Erro já tratado em onError
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary p-3">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(errors.email || errors.password) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Verifique suas credenciais e tente novamente
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
              {errors.email && errors.email.trim() && (
                <p className="text-sm text-red-500">{errors.email}</p>
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
                autoComplete="current-password"
                required
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Lembrar de mim
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link to="/register" className="text-primary hover:underline font-medium">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
