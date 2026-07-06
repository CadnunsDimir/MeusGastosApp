import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError('Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Meus Gastos</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">Bem-vindo de volta</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Acesse sua conta para ver suas finanças.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="email">Email</label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Mail className="h-5 w-5 text-slate-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="password">Senha</label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Lock className="h-5 w-5 text-slate-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Ainda não tem conta?{' '}
        <Link to="/register" className="font-semibold text-slate-900 underline decoration-slate-400 decoration-2 underline-offset-4 dark:text-slate-100">
          Criar nova conta
        </Link>
      </p>
    </div>
  );
}
