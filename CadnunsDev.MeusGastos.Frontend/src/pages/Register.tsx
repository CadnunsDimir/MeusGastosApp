import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock } from 'lucide-react';
import { LogoMark } from '@/components/LogoMark';

export function Register() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({ userName, password });
      navigate('/dashboard');
    } catch (err) {
      setError('Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <Link to="/" className="flex items-center gap-2 justify-center scale-150 pt-7 pb-7">
          <LogoMark />
          <span className="font-display text-lg tracking-tight text-ink dark:text-paper">MeusGastos</span>
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink dark:text-paper">Crie sua conta</h1>
        <p className="mt-2 text-ink-soft dark:text-stone">Comece a controlar suas despesas e receitas agora.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-3 rounded-2xl border border-rule bg-paper-dark/30 p-4 dark:border-rule-dark dark:bg-night">
          <label className="text-sm font-medium text-ink-soft dark:text-stone" htmlFor="userName">Nome de usuário</label>
          <div className="flex items-center gap-3 rounded-2xl border border-rule bg-white px-4 py-3 dark:border-rule-dark dark:bg-panel">
            <UserPlus className="h-5 w-5 text-ink-soft/60 dark:text-stone/60" />
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60 dark:text-paper dark:placeholder:text-stone/60"
              placeholder="nome de usuário"
              required
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-rule bg-paper-dark/30 p-4 dark:border-rule-dark dark:bg-night">
          <label className="text-sm font-medium text-ink-soft dark:text-stone" htmlFor="password">Senha</label>
          <div className="flex items-center gap-3 rounded-2xl border border-rule bg-white px-4 py-3 dark:border-rule-dark dark:bg-panel">
            <Lock className="h-5 w-5 text-ink-soft/60 dark:text-stone/60" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60 dark:text-paper dark:placeholder:text-stone/60"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-brick dark:text-brick-light">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-full bg-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brass-dark disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft dark:text-stone">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-ink underline decoration-rule decoration-2 underline-offset-4 dark:text-paper dark:decoration-rule-dark">
          Entrar
        </Link>
      </p>
    </div>
  );
}
