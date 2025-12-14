export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          BariPronto
        </h1>

        <p className="text-slate-600 mb-8">
          Sistema de apoio à consulta médica em avaliação bariátrica
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-xl">
            📋 Total de consultas
          </div>

          <div className="p-4 border rounded-xl">
            ⚖️ Peso, IMC e evolução
          </div>

          <div className="p-4 border rounded-xl">
            🩺 Comorbidades e medicações
          </div>

          <div className="p-4 border rounded-xl">
            📊 Exames e bioimpedância
          </div>

          <div className="p-4 border rounded-xl">
            🧠 Avaliação e linha de tratamento
          </div>

          <div className="p-4 border rounded-xl">
            📄 Relatório final em PDF
          </div>
        </div>

        <footer className="mt-10 text-sm text-slate-400">
          Uso exclusivo médico • Dados protegidos
        </footer>
      </div>
    </main>
  );
}

