import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../services/profile';
import type { ProfileDTO, UpdateProfileDTO } from '../types/profile';
import { uiClasses } from '@/styles/theme';

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [formData, setFormData] = useState<UpdateProfileDTO>({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
        setFormData({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } catch (err) {
        setError('Não foi possível carregar os dados do perfil.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);
      await updateProfile(formData);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError('Erro ao atualizar perfil. Tente novamente.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 min-h-screen items-center justify-center">
        <div className="text-slate-500">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex items-center gap-3 rounded-2xl border border-rule bg-white p-6 shadow-sm dark:border-rule-dark dark:bg-panel">
        <button
          onClick={() => navigate('/dashboard')}
          className={uiClasses.pageBackButton}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <p className="font-mono text-sm font-semibold uppercase tracking-widest text-sage dark:text-sage-light">Configurações</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink dark:text-paper">Perfil</h1>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-brick/30 bg-brick/10 p-4 text-sm text-brick dark:border-brick-light/30 dark:bg-brick-light/10 dark:text-brick-light">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-stamp/30 bg-stamp/10 p-4 text-sm text-stamp dark:border-stamp-light/30 dark:bg-stamp-light/10 dark:text-stamp-light">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-rule bg-white p-6 shadow-sm dark:border-rule-dark dark:bg-panel">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft dark:text-stone mb-2">
              Usuário
            </label>
            <input
              type="text"
              value={profile?.userName || ''}
              disabled
              className="w-full rounded-lg border border-rule bg-paper-dark/40 px-3 py-2 text-sm text-ink-soft dark:border-rule-dark dark:bg-night-soft dark:text-stone cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-ink-soft dark:text-stone">Não pode ser alterado</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-soft dark:text-stone mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-rule px-3 py-2 text-sm text-ink placeholder-ink-soft/60 transition dark:border-rule-dark dark:bg-night dark:text-paper dark:placeholder-stone/60"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-soft dark:text-stone mb-2">
              Nome
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-rule px-3 py-2 text-sm text-ink placeholder-ink-soft/60 transition dark:border-rule-dark dark:bg-night dark:text-paper dark:placeholder-stone/60"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-soft dark:text-stone mb-2">
              Sobrenome
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-rule px-3 py-2 text-sm text-ink placeholder-ink-soft/60 transition dark:border-rule-dark dark:bg-night dark:text-paper dark:placeholder-stone/60"
              placeholder="Seu sobrenome"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-brass px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-lg border border-rule px-4 py-2 text-sm font-semibold text-ink-soft transition hover:border-brass/40 dark:border-rule-dark dark:text-stone dark:hover:border-brass-light/40"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
