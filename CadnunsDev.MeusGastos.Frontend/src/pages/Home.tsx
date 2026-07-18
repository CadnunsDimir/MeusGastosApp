import { LogoMark } from "@/components/LogoMark";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Home Page (`/`)
 * Página pública de apresentação do MeusGastos.
 * Redireciona para /dashboard se já houver sessão válida.
 */
export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null; // evita "flash" da Home antes do redirect

  return (
    <div className="min-h-screen bg-paper text-ink font-body">
      <HomeHeader />
      <HomeHero />
      <HomeVantagens />
      <HomeComoFunciona />
      <HomeCtaFinal />
      <HomeFooter />
    </div>
  );
}

function HomeHeader() {
  return (
    <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <LogoMark />
        <span className="font-display text-lg tracking-tight">MeusGastos</span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm">
        <a href="#vantagens" className="text-ink-soft hover:text-ink">
          Vantagens
        </a>
        <a href="#como-funciona" className="text-ink-soft hover:text-ink">
          Como funciona
        </a>
      </nav>

      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm font-medium text-ink-soft hover:text-ink px-2">
          Entrar
        </Link>
        <Link
          to="/register"
          className="text-sm font-medium bg-ink text-paper px-4 py-2 rounded-full hover:bg-ink-soft transition-colors"
        >
          Criar conta
        </Link>
      </div>
    </header>
  );
}

function HomeHero() {
  return (
    <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid md:grid-cols-2 gap-14 items-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-sage mb-4">
          extrato pessoal · sempre em dia
        </p>
        <h1 className="font-display text-5xl md:text-[3.4rem] leading-[1.05] tracking-tight">
          Cada real,
          <br />
          contabilizado.
        </h1>
        <p className="mt-6 text-base md:text-lg text-ink-soft max-w-md leading-relaxed">
          Contas a pagar, movimentações e contas bancárias em um único lugar —
          sem planilha, sem esquecimento, sem susto no fim do mês.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to="/register"
            className="bg-brass text-white font-medium px-6 py-3 rounded-full hover:bg-brass-dark transition-colors"
          >
            Criar conta grátis
          </Link>
          <Link
            to="/login"
            className="font-medium px-2 py-3 border-b border-ink/30 hover:border-ink transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </div>

      <LedgerCard />
    </section>
  );
}

/** Elemento de assinatura visual: um mini-extrato com selo "PAGO" */
function LedgerCard() {
  const entries = [
    { label: "Salário", value: "+R$ 4.200,00", tone: "positive" as const },
    { label: "Aluguel", value: "−R$ 1.350,00", tone: "negative" as const },
    { label: "Energia", value: "−R$ 210,40", tone: "negative" as const },
    { label: "Mercado", value: "−R$ 486,10", tone: "negative" as const },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-4 border border-rule rounded-2xl rotate-2" aria-hidden="true" />
      <div className="relative bg-white rounded-2xl border border-rule p-6 -rotate-1">
        <div className="flex items-center justify-between pb-3 border-b border-rule">
          <span className="font-mono text-xs uppercase tracking-widest text-ink-soft">
            extrato · julho
          </span>
          <span className="font-mono text-xs text-ink-soft">saldo</span>
        </div>

        <ul className="mt-4 space-y-3 font-mono text-sm">
          {entries.map((entry) => (
            <li key={entry.label} className="flex items-center justify-between">
              <span className="leader flex-1 pr-2 pb-1">{entry.label}</span>
              <span className={entry.tone === "positive" ? "text-stamp" : "text-ink-soft"}>
                {entry.value}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 pt-3 border-t border-rule flex items-center justify-between font-mono text-sm">
          <span className="text-ink-soft">total do mês</span>
          <span className="font-medium">R$ 2.153,50</span>
        </div>

        <div
          className="absolute -right-3 top-16 -rotate-[14deg] border-[3px] border-stamp text-stamp font-display font-semibold text-lg px-3 py-0.5 rounded-md opacity-90 select-none"
          aria-hidden="true"
        >
          PAGO
        </div>
      </div>
    </div>
  );
}

const vantagens = [
  { title: "Contas a pagar", desc: "Cadastre vencimentos e nunca mais perca uma data." },
  { title: "Movimentações", desc: "Acompanhe entradas e saídas assim que acontecem." },
  { title: "Dashboard consolidado", desc: "Veja o retrato completo das suas finanças em um olhar." },
  { title: "Múltiplas contas", desc: "Bancos e carteiras diferentes, tudo no mesmo lugar." },
  { title: "Categorização", desc: "Entenda para onde o seu dinheiro realmente vai." },
  { title: "Seus dados, privados", desc: "Autenticação e isolamento total por usuário." },
];

function HomeVantagens() {
  return (
    <section id="vantagens" className="max-w-6xl mx-auto px-6 py-16 border-t border-rule">
      <p className="font-mono text-xs uppercase tracking-widest text-sage mb-2">vantagens</p>
      <h2 className="font-display text-3xl md:text-4xl tracking-tight max-w-xl mb-10">
        Tudo que sua vida financeira precisa, em uma tela só.
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {vantagens.map((item) => (
          <div key={item.title} className="perforated bg-white border border-rule rounded-xl p-5 pt-6">
            <h3 className="font-medium mb-1">{item.title}</h3>
            <p className="text-sm text-ink-soft leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const passos = [
  { n: "01", title: "Crie sua conta", desc: "Cadastro rápido, sem burocracia." },
  { n: "02", title: "Cadastre contas e movimentações", desc: "Bancos, boletos e gastos do dia a dia." },
  { n: "03", title: "Acompanhe pelo dashboard", desc: "Visão consolidada, sempre atualizada." },
];

function HomeComoFunciona() {
  return (
    <section id="como-funciona" className="max-w-6xl mx-auto px-6 py-16 border-t border-rule">
      <p className="font-mono text-xs uppercase tracking-widest text-sage mb-2">como funciona</p>
      <h2 className="font-display text-3xl md:text-4xl tracking-tight max-w-xl mb-10">
        Três passos até o controle.
      </h2>

      <div className="grid md:grid-cols-3 gap-8 relative">
        <div
          className="hidden md:block absolute top-5 left-[16%] right-[16%] border-t border-dashed border-rule"
          aria-hidden="true"
        />
        {passos.map((passo) => (
          <div key={passo.n} className="relative bg-paper">
            <span className="font-display text-3xl text-brass">{passo.n}</span>
            <h3 className="font-medium mt-3 mb-1">{passo.title}</h3>
            <p className="text-sm text-ink-soft leading-relaxed">{passo.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeCtaFinal() {
  return (
    <section className="bg-ink">
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
        <h2 className="font-display text-2xl md:text-3xl text-paper tracking-tight max-w-md">
          Comece a organizar suas finanças hoje.
        </h2>
        <Link
          to="/register"
          className="bg-brass text-white font-medium px-6 py-3 rounded-full hover:bg-brass-dark transition-colors whitespace-nowrap"
        >
          Criar conta grátis
        </Link>
      </div>
    </section>
  );
}

function HomeFooter() {
  return (
    <footer className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-soft">
      <span className="font-display">MeusGastos · Feito por <a href="https://www.linkedin.com/in/tiago-silva-do-nascimento/">Tiago Silva do Nascimento</a></span>
      <div className="flex items-center gap-6">
        <Link to="/login" className="hover:text-ink">
          Entrar
        </Link>
        <a href="#" className="hover:text-ink">
          Termos de uso
        </a>
        <a href="#" className="hover:text-ink">
          Privacidade
        </a>
      </div>
    </footer>
  );
}