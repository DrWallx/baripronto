"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Patient = {
  id: string;
  name: string;
  birth_date: string | null;
  created_at?: string;
};

function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    throw new Error(
      "Faltam variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY no Vercel."
    );
  }
  return createClient(url, anon);
}

function calcAge(birthDateISO: string | null): string {
  if (!birthDateISO) return "-";
  const d = new Date(birthDateISO);
  if (Number.isNaN(d.getTime())) return "-";
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return `${age} anos`;
}

export default function Page() {
  const supabase = useMemo(() => getSupabase(), []);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [totalVisits, setTotalVisits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBirth, setNewBirth] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const [pList, pCount, vCount] = await Promise.all([
        supabase
          .from("patients")
          .select("id,name,birth_date,created_at")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("patients").select("id", { count: "exact", head: true }),
        supabase.from("visits").select("id", { count: "exact", head: true }),
      ]);

      if (pList.error) throw pList.error;
      if (pCount.error) throw pCount.error;
      if (vCount.error) throw vCount.error;

      setPatients((pList.data ?? []) as Patient[]);
      setTotalPatients(pCount.count ?? 0);
      setTotalVisits(vCount.count ?? 0);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  async function createPatient() {
    setSaving(true);
    setError(null);

    try {
      const name = newName.trim();
      if (!name) {
        setError("Digite o nome do paciente.");
        return;
      }

      const payload: any = { name };
      if (newBirth) payload.birth_date = newBirth; // formato YYYY-MM-DD

      const { error: insErr } = await supabase.from("patients").insert(payload);
      if (insErr) throw insErr;

      setShowNew(false);
      setNewName("");
      setNewBirth("");
      await loadDashboard();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao salvar paciente.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-white">
      <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 shadow-sm" />
            <div>
              <div className="text-lg font-semibold leading-5">BariPronto</div>
              <div className="text-xs text-zinc-600">Painel clínico</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.99]"
            >
              <span className="text-base leading-none">＋</span>
              Novo paciente
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="text-sm text-zinc-600">Total de pacientes</div>
            <div className="mt-1 text-3xl font-bold text-zinc-900">
              {loading ? "…" : totalPatients}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="text-sm text-zinc-600">Total de consultas</div>
            <div className="mt-1 text-3xl font-bold text-zinc-900">
              {loading ? "…" : totalVisits}
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="text-base font-semibold text-zinc-900">
                Pacientes
              </div>
              <div className="text-xs text-zinc-600">
                Clique em um paciente (próximo passo: abrir prontuário)
              </div>
            </div>

            <button
              onClick={loadDashboard}
              className="rounded-xl border px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Atualizar
            </button>
          </div>

          <div className="p-2">
            {loading ? (
              <div className="p-4 text-sm text-zinc-600">Carregando…</div>
            ) : patients.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-sm text-zinc-600">
                  Nenhum paciente cadastrado ainda.
                </div>
                <button
                  onClick={() => setShowNew(true)}
                  className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Cadastrar primeiro paciente
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => alert("Próximo passo: abrir prontuário do paciente.")}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left hover:bg-zinc-50"
                  >
                    <div>
                      <div className="font-semibold text-zinc-900">{p.name}</div>
                      <div className="text-xs text-zinc-600">
                        Nascimento: {p.birth_date ?? "-"} • {calcAge(p.birth_date)}
                      </div>
                    </div>
                    <div className="text-zinc-400">›</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Novo Paciente */}
      {showNew && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Novo paciente</div>
                <div className="text-xs text-zinc-600">
                  (Somente nome e data de nascimento por enquanto)
                </div>
              </div>
              <button
                onClick={() => setShowNew(false)}
                className="rounded-lg px-2 py-1 text-zinc-600 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm font-semibold text-zinc-800">Nome</span>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-xl border px-3 py-2 text-sm outline-none ring-indigo-600 focus:ring-2"
                  placeholder="Ex: Andreína Oliveira"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-semibold text-zinc-800">
                  Data de nascimento
                </span>
                <input
                  type="date"
                  value={newBirth}
                  onChange={(e) => setNewBirth(e.target.value)}
                  className="rounded-xl border px-3 py-2 text-sm outline-none ring-indigo-600 focus:ring-2"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={createPatient}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
