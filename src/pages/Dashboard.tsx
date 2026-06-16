import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Users, 
  Music, 
  Trash2, 
  Check, 
  Award,
  Database,
  Search,
  BadgeAlert,
  Clock,
  CheckCircle2,
  LogOut,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Calendar as CalendarIcon,
  Tag,
  BarChart2,
  Church,
  Shirt,
  Download,
  Printer,
  Filter,
  PackageCheck,
  Package,
  Youtube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase, isUsingPlaceholder } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import * as XLSX from "xlsx";

export default function Dashboard() {
  const [inscricoes, setInscricoes] = useState<any[]>([]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [finSearchTerm, setFinSearchTerm] = useState("");
  const [centroFiltro, setCentroFiltro] = useState("Todos");
  const [camisaFiltroEstilo, setCamisaFiltroEstilo] = useState("Todos");
  const [camisaFiltroTipo, setCamisaFiltroTipo] = useState("Todos");
  const [camisaFiltroStatus, setCamisaFiltroStatus] = useState("Todos");
  const [camisaFiltroEntrega, setCamisaFiltroEntrega] = useState("Todos");
  const [camisaSearch, setCamisaSearch] = useState("");
  const [opcaoFiltro, setOpcaoFiltro] = useState("Todos");
  
  const [videos, setVideos] = useState<any[]>([]);
  const [videoForm, setVideoForm] = useState({
    titulo: "",
    descricao: "",
    url: ""
  });

  const navigate = useNavigate();

  // Estados do Formulário Financeiro
  const [finForm, setFinForm] = useState({
    descricao: "",
    tipo: "Entrada",
    centro_custo: "Semana de Musica",
    valor: "",
    data: new Date().toISOString().split("T")[0]
  });

  const handleToggleEntrega = async (id: string, nomeParticipante: string, jaEntregue: boolean) => {
    const novoValor = !jaEntregue;
    try {
      if (!isUsingPlaceholder) {
        const { error } = await supabase
          .from("inscricoes")
          .update({ camisa_entregue: novoValor })
          .eq("id", id);
        if (error) throw error;
      } else {
        const localData = JSON.parse(localStorage.getItem("inscricoes") || "[]");
        const atualizados = localData.map((i: any) =>
          i.id === id ? { ...i, camisa_entregue: novoValor } : i
        );
        localStorage.setItem("inscricoes", JSON.stringify(atualizados));
      }
      toast.success(novoValor ? `✅ Camisa de ${nomeParticipante} marcada como entregue!` : `📦 Camisa de ${nomeParticipante} marcada como pendente.`);
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao atualizar entrega: " + error.message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Carregar Inscrições
      if (!isUsingPlaceholder) {
        const { data, error } = await supabase
          .from("inscricoes")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setInscricoes(data || []);
      } else {
        const localData = JSON.parse(localStorage.getItem("inscricoes") || "[]");
        localData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setInscricoes(localData);
      }

      // 2. Carregar Transações Financeiras
      if (!isUsingPlaceholder) {
        const { data, error } = await supabase
          .from("financeiro")
          .select("*")
          .order("data", { ascending: false })
          .order("created_at", { ascending: false });
        if (error) throw error;
        setTransacoes(data || []);
      } else {
        const localFin = JSON.parse(localStorage.getItem("financeiro_transacoes") || "[]");
        localFin.sort((a: any, b: any) => {
          const dataDiff = new Date(b.data).getTime() - new Date(a.data).getTime();
          if (dataDiff !== 0) return dataDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setTransacoes(localFin);
      }

      // 3. Carregar Vídeos da Galeria
      if (!isUsingPlaceholder) {
        const { data, error } = await supabase
          .from("videos_apresentacao")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setVideos(data || []);
      } else {
        const localVideos = JSON.parse(localStorage.getItem("videos_apresentacao") || "[]");
        localVideos.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setVideos(localVideos);
      }

    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("semana_musica_admin");
    toast.info("Sessão encerrada.");
    navigate("/login");
  };

  // Lançamento automático de PIX ao aprovar inscrição
  // Separa o valor da inscrição (Semana de Musica) do valor da camisa (LOJA)
  const createPixTransaction = async (nomeParticipante: string, opcaoEscolhida: string) => {
    const data = new Date().toISOString().split("T")[0];
    const transactions: any[] = [];

    const temInscricao = opcaoEscolhida !== "Apenas Camisa Oficial";
    const temCamisa = opcaoEscolhida !== "Apenas Inscrição";

    if (temInscricao) {
      transactions.push({
        id: crypto.randomUUID().substring(0, 8).toUpperCase(),
        descricao: `Inscrição - ${nomeParticipante} (PIX)`,
        tipo: "Entrada",
        centro_custo: "Semana de Musica",
        valor: 20.00,
        data,
        created_at: new Date().toISOString(),
      });
    }

    if (temCamisa) {
      transactions.push({
        id: crypto.randomUUID().substring(0, 8).toUpperCase(),
        descricao: `Camisa Oficial - ${nomeParticipante} (PIX)`,
        tipo: "Entrada",
        centro_custo: "Loja",
        valor: 45.00,
        data,
        created_at: new Date().toISOString(),
      });
    }

    try {
      if (!isUsingPlaceholder) {
        const { error } = await supabase.from("financeiro").insert(transactions);
        if (error) throw error;
      } else {
        const antigas = JSON.parse(localStorage.getItem("financeiro_transacoes") || "[]");
        localStorage.setItem("financeiro_transacoes", JSON.stringify([...antigas, ...transactions]));
      }
      const msgs: string[] = [];
      if (temInscricao) msgs.push("R$ 20,00 → Semana de Musica");
      if (temCamisa)    msgs.push("R$ 45,00 → Loja");
      toast.success(`Lançamentos automáticos: ${msgs.join(" · ")}`);
    } catch (err: any) {
      console.error("Erro ao criar transação automática:", err);
      toast.error("A inscrição foi aprovada, mas houve um erro ao lançar a receita automática.");
    }
  };

  // Confirmar/Aprovar Inscrição e lançar PIX automático (inscrição → Semana de Musica, camisa → Loja)
  const handleApprove = async (id: string, nomeParticipante: string, opcaoEscolhida: string) => {
    try {
      if (!isUsingPlaceholder) {
        const { error } = await supabase
          .from("inscricoes")
          .update({ status: "Confirmada" })
          .eq("id", id);
        if (error) throw error;
      } else {
        const localData = JSON.parse(localStorage.getItem("inscricoes") || "[]");
        const atualizados = localData.map((i: any) => {
          if (i.id === id) {
            return { ...i, status: "Confirmada" };
          }
          return i;
        });
        localStorage.setItem("inscricoes", JSON.stringify(atualizados));
      }
      toast.success(`Inscrição de ${nomeParticipante} confirmada!`);
      
      // Lançar transações separadas: inscrição (Semana de Musica) e/ou camisa (Loja)
      await createPixTransaction(nomeParticipante, opcaoEscolhida);
      
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao aprovar inscrição: " + error.message);
    }
  };

  // Excluir Inscrição
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta inscrição?")) return;

    try {
      if (!isUsingPlaceholder) {
        const { error } = await supabase.from("inscricoes").delete().eq("id", id);
        if (error) throw error;
      } else {
        const localData = JSON.parse(localStorage.getItem("inscricoes") || "[]");
        const filtrados = localData.filter((i: any) => i.id !== id);
        localStorage.setItem("inscricoes", JSON.stringify(filtrados));
      }
      toast.success("Inscrição removida com sucesso!");
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao remover inscrição: " + error.message);
    }
  };

  // --- MÉTODOS FINANCEIROS ---

  // Alterações de inputs financeiro
  const handleFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFinForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFinSelectChange = (name: string, value: string) => {
    setFinForm((prev) => ({ ...prev, [name]: value }));
  };

  // Adicionar lançamento financeiro manual
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finForm.descricao) return toast.error("A descrição é obrigatória.");
    if (!finForm.valor || parseFloat(finForm.valor) <= 0) return toast.error("Insira um valor maior que zero.");

    const transaction = {
      id: crypto.randomUUID().substring(0, 8).toUpperCase(),
      descricao: finForm.descricao,
      tipo: finForm.tipo,
      centro_custo: finForm.centro_custo,
      valor: parseFloat(finForm.valor),
      data: finForm.data,
      created_at: new Date().toISOString()
    };

    try {
      if (!isUsingPlaceholder) {
        const { error } = await supabase.from("financeiro").insert([transaction]);
        if (error) throw error;
      } else {
        const antigas = JSON.parse(localStorage.getItem("financeiro_transacoes") || "[]");
        localStorage.setItem("financeiro_transacoes", JSON.stringify([...antigas, transaction]));
      }

      toast.success("Lançamento financeiro adicionado!");
      setFinForm({
        descricao: "",
        tipo: "Entrada",
        centro_custo: "Semana de Musica",
        valor: "",
        data: new Date().toISOString().split("T")[0]
      });
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao adicionar lançamento: " + err.message);
    }
  };

  // Excluir lançamento financeiro
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

    try {
      if (!isUsingPlaceholder) {
        const { error } = await supabase.from("financeiro").delete().eq("id", id);
        if (error) throw error;
      } else {
        const localData = JSON.parse(localStorage.getItem("financeiro_transacoes") || "[]");
        const filtrados = localData.filter((t: any) => t.id !== id);
        localStorage.setItem("financeiro_transacoes", JSON.stringify(filtrados));
      }
      toast.success("Lançamento excluído com sucesso!");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao excluir lançamento: " + err.message);
    }
  };

  // Adicionar Inscrição Fictícia
  const handleAddMock = () => {
    const nomes = ["Gleison Silva", "Renata Lima", "Moisés Alencar", "Débora Rodrigues", "Emanuel Santos"];
    const opcoesList = [
      { opcao: "Apenas Inscrição", valor: 20 },
      { opcao: "Inscrição + Camisa Oficial", valor: 65 },
      { opcao: "Apenas Camisa Oficial", valor: 45 },
    ];
    const tiposParticipacao = ["Coral", "Orquestra"];
    const detalhesCorais = ["Soprano", "Contralto", "Tenor", "Baixo"];
    const detalhesOrq = ["Violino I", "Violoncelo", "Trompete", "Flauta"];
    const cidades = ["Jijoca de Jericoacoara", "Cruz", "Acaraú"];
    const tamanhos = ["P", "M", "G", "GG"];
    const estilos = ["Azul Royal - OFICIAL", "Azul Marinho - OFICIAL"];
    const tiposCamisa = ["Masculino", "Feminino (Baby Look)"];

    const opcaoItem = opcoesList[Math.floor(Math.random() * opcoesList.length)];
    const tipoParticipacao = tiposParticipacao[Math.floor(Math.random() * tiposParticipacao.length)];
    const detalhe = tipoParticipacao === "Coral"
      ? detalhesCorais[Math.floor(Math.random() * detalhesCorais.length)]
      : detalhesOrq[Math.floor(Math.random() * detalhesOrq.length)];
    const temInscricao = opcaoItem.opcao !== "Apenas Camisa Oficial";
    const temCamisa = opcaoItem.opcao !== "Apenas Inscrição";

    const mock = {
      id: crypto.randomUUID().substring(0, 8).toUpperCase(),
      nome: nomes[Math.floor(Math.random() * nomes.length)] + " (Teste)",
      email: "teste" + Math.floor(Math.random() * 100) + "@email.com",
      telefone: "(88) 99999-1234",
      data_nascimento: "1998-04-12",
      cidade: cidades[Math.floor(Math.random() * cidades.length)],
      estado: "CE",
      igreja: "Igreja Local IBJJ",
      hospedagem: Math.random() > 0.5 ? "Sim" : "Não",
      opcao_escolhida: opcaoItem.opcao,
      tipo_participacao: temInscricao ? tipoParticipacao : null,
      detalhe_participacao: temInscricao ? detalhe : null,
      descricao_experiencia: temInscricao ? "Canto há 2 anos na minha igreja." : null,
      camisa_estilo: temCamisa ? estilos[Math.floor(Math.random() * estilos.length)] : null,
      camisa_tipo: temCamisa ? tiposCamisa[Math.floor(Math.random() * tiposCamisa.length)] : null,
      camisa_tamanho: temCamisa ? tamanhos[Math.floor(Math.random() * tamanhos.length)] : null,
      camisa_obs: null,
      valor_total: opcaoItem.valor,
      instrumento_oficina: temInscricao ? `${tipoParticipacao} (${detalhe})` : "Apenas Camisa",
      nivel_experiencia: temInscricao ? "Participante" : "N/A",
      status: "Pendente",
      created_at: new Date().toISOString(),
    };

    const localData = JSON.parse(localStorage.getItem("inscricoes") || "[]");
    localStorage.setItem("inscricoes", JSON.stringify([...localData, mock]));
    toast.success("Participante teste adicionado!");
    loadData();
  };

  // Adicionar Lançamento Fictício
  const handleAddMockFin = () => {
    const descricoes = ["Venda Camisa Oficial G", "Venda Boné IBJJ", "Lanches Recital", "Compra de Pilhas Microfone", "Cabo XLR 5 metros"];
    const tipos = ["Entrada", "Entrada", "Entrada", "Saída", "Saída"];
    const centros = ["Loja", "Loja", "Semana de Musica", "Semana de Musica", "Semana de Musica"];
    const valores = [40, 35, 120, 25, 68];
    const index = Math.floor(Math.random() * descricoes.length);

    const mock = {
      id: crypto.randomUUID().substring(0, 8).toUpperCase(),
      descricao: descricoes[index] + " (Simulado)",
      tipo: tipos[index],
      centro_custo: centros[index],
      valor: valores[index],
      data: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString()
    };

    const localData = JSON.parse(localStorage.getItem("financeiro_transacoes") || "[]");
    localStorage.setItem("financeiro_transacoes", JSON.stringify([...localData, mock]));
    toast.success("Lançamento financeiro teste adicionado!");
    loadData();
  };

  // --- MÉTODOS DE VÍDEOS ---
  const handleVideoFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVideoForm((prev) => ({ ...prev, [name]: value }));
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.titulo.trim()) return toast.error("O título é obrigatório.");
    if (!videoForm.url.trim()) return toast.error("O link do YouTube é obrigatório.");

    const youtube_id = getYouTubeId(videoForm.url);
    if (!youtube_id) {
      return toast.error("Link do YouTube inválido. Ex: https://www.youtube.com/watch?v=VIDEO_ID ou https://youtu.be/VIDEO_ID");
    }

    const novoVideo = {
      id: crypto.randomUUID(),
      titulo: videoForm.titulo,
      descricao: videoForm.descricao,
      url: videoForm.url,
      youtube_id,
      created_at: new Date().toISOString()
    };

    try {
      if (!isUsingPlaceholder) {
        const { error } = await supabase.from("videos_apresentacao").insert([novoVideo]);
        if (error) throw error;
      } else {
        const antigas = JSON.parse(localStorage.getItem("videos_apresentacao") || "[]");
        localStorage.setItem("videos_apresentacao", JSON.stringify([...antigas, novoVideo]));
      }

      toast.success("Vídeo adicionado com sucesso!");
      setVideoForm({ titulo: "", descricao: "", url: "" });
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao adicionar vídeo: " + err.message);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este vídeo da galeria?")) return;

    try {
      if (!isUsingPlaceholder) {
        const { error } = await supabase.from("videos_apresentacao").delete().eq("id", id);
        if (error) throw error;
      } else {
        const localData = JSON.parse(localStorage.getItem("videos_apresentacao") || "[]");
        const filtrados = localData.filter((v: any) => v.id !== id);
        localStorage.setItem("videos_apresentacao", JSON.stringify(filtrados));
      }
      toast.success("Vídeo removido com sucesso!");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao remover vídeo: " + err.message);
    }
  };

  // --- ESTATÍSTICAS ---
  // Inscrições
  const totalInscritos = inscricoes.length;
  const totalConfirmados = inscricoes.filter((i) => i.status === "Confirmada").length;
  const totalPendentes = inscricoes.filter((i) => i.status === "Pendente").length;

  // Financeiro
  const receitasTotais = transacoes
    .filter((t) => t.tipo === "Entrada")
    .reduce((sum, curr) => sum + parseFloat(curr.valor), 0);

  const despesasTotais = transacoes
    .filter((t) => t.tipo === "Saída")
    .reduce((sum, curr) => sum + parseFloat(curr.valor), 0);

  const saldoGeral = receitasTotais - despesasTotais;

  // Filtros de listagem
  const filteredInscricoes = inscricoes
    .filter((ins) => {
      if (opcaoFiltro === "Todos") return true;
      if (opcaoFiltro === "Inscricao") {
        const op = ins.opcao_escolhida || "";
        return op === "Apenas Inscrição" || op === "inscricao" || (!ins.camisa_tamanho && !!ins.tipo_participacao);
      }
      if (opcaoFiltro === "Camisa") {
        const op = ins.opcao_escolhida || "";
        return op === "Apenas Camisa Oficial" || (!ins.tipo_participacao && !!ins.camisa_tamanho);
      }
      if (opcaoFiltro === "Combo") {
        const op = ins.opcao_escolhida || "";
        return op === "Inscrição + Camisa Oficial" || (!!ins.tipo_participacao && !!ins.camisa_tamanho);
      }
      return true;
    })
    .filter((ins) =>
      ins.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ins.instrumento_oficina || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ins.opcao_escolhida || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredTransacoes = transacoes
    .filter((t) => centroFiltro === "Todos" ? true : t.centro_custo === centroFiltro)
    .filter((t) => 
      t.descricao.toLowerCase().includes(finSearchTerm.toLowerCase()) ||
      t.tipo.toLowerCase().includes(finSearchTerm.toLowerCase())
    );

  // --- DADOS PARA GRÁFICOS ---
  
  // Naipes (somente inscritos no Coral)
  const naipesCounts: Record<string, number> = {};
  inscricoes
    .filter((i) => i.tipo_participacao === "Coral" && i.detalhe_participacao)
    .forEach((i) => {
      const naipe = i.detalhe_participacao as string;
      naipesCounts[naipe] = (naipesCounts[naipe] || 0) + 1;
    });
  const naipesData = Object.entries(naipesCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Instrumentos (somente inscritos na Orquestra)
  const instrumentosCounts: Record<string, number> = {};
  inscricoes
    .filter((i) => i.tipo_participacao === "Orquestra" && i.detalhe_participacao)
    .forEach((i) => {
      const inst = i.detalhe_participacao as string;
      instrumentosCounts[inst] = (instrumentosCounts[inst] || 0) + 1;
    });
  const instrumentosData = Object.entries(instrumentosCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Igrejas (todos os inscritos com igreja preenchida)
  const igrejasCounts: Record<string, number> = {};
  inscricoes
    .filter((i) => i.igreja && i.igreja.trim() !== "")
    .forEach((i) => {
      const ig = (i.igreja as string).trim();
      igrejasCounts[ig] = (igrejasCounts[ig] || 0) + 1;
    });
  const igrejasData = Object.entries(igrejasCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15); // top 15

  // Opções de inscrição (pie chart)
  const opcoesCounts: Record<string, number> = {};
  inscricoes.forEach((i) => {
    const op = i.opcao_escolhida || "Inscrição";
    opcoesCounts[op] = (opcoesCounts[op] || 0) + 1;
  });
  const opcoesData = Object.entries(opcoesCounts).map(([name, value]) => ({ name, value }));

  // Cores do design
  const COLORS_PRIMARY = ["hsl(var(--primary))", "hsl(var(--accent))", "#6B21A8", "#0891b2", "#d97706", "#16a34a", "#dc2626", "#ea580c"];
  const COLORS_NAIPES = { Soprano: "#f472b6", Contralto: "#c084fc", Tenor: "#60a5fa", Baixo: "#4ade80", "Não sei": "#94a3b8" };

  // --- DADOS DE CAMISAS ---
  const todasCamisas = inscricoes.filter((i) => i.camisa_tamanho != null);

  const filteredCamisas = todasCamisas
    .filter((i) => camisaFiltroEstilo === "Todos" || i.camisa_estilo === camisaFiltroEstilo)
    .filter((i) => camisaFiltroTipo === "Todos" || i.camisa_tipo === camisaFiltroTipo)
    .filter((i) => camisaFiltroStatus === "Todos" || i.status === camisaFiltroStatus)
    .filter((i) => {
      if (camisaFiltroEntrega === "Entregue") return !!i.camisa_entregue;
      if (camisaFiltroEntrega === "Pendente") return !i.camisa_entregue;
      return true;
    })
    .filter((i) =>
      camisaSearch === "" ||
      (i.nome || "").toLowerCase().includes(camisaSearch.toLowerCase()) ||
      (i.igreja || "").toLowerCase().includes(camisaSearch.toLowerCase()) ||
      (i.camisa_obs || "").toLowerCase().includes(camisaSearch.toLowerCase())
    );

  const totalEntregues = todasCamisas.filter((i) => !!i.camisa_entregue).length;
  const totalPendentesEntrega = todasCamisas.length - totalEntregues;

  // Totais por tamanho
  const tamanhoOrder = ["PP", "P", "M", "G", "GG", "XG"];
  const tamanhoTotais = tamanhoOrder.map((tam) => ({
    tamanho: tam,
    azulRoyal: todasCamisas.filter((i) => i.camisa_tamanho === tam && i.camisa_estilo === "Azul Royal - OFICIAL" && i.camisa_tipo === "Masculino").length,
    azulRoyalBaby: todasCamisas.filter((i) => i.camisa_tamanho === tam && i.camisa_estilo === "Azul Royal - OFICIAL" && i.camisa_tipo === "Feminino (Baby Look)").length,
    azulMarinho: todasCamisas.filter((i) => i.camisa_tamanho === tam && i.camisa_estilo === "Azul Marinho - OFICIAL" && i.camisa_tipo === "Masculino").length,
    azulMarinhoBaby: todasCamisas.filter((i) => i.camisa_tamanho === tam && i.camisa_estilo === "Azul Marinho - OFICIAL" && i.camisa_tipo === "Feminino (Baby Look)").length,
  }));

  const totalAzulRoyal = todasCamisas.filter((i) => i.camisa_estilo === "Azul Royal - OFICIAL" && i.camisa_tipo === "Masculino").length;
  const totalAzulRoyalBaby = todasCamisas.filter((i) => i.camisa_estilo === "Azul Royal - OFICIAL" && i.camisa_tipo === "Feminino (Baby Look)").length;
  const totalAzulMarinho = todasCamisas.filter((i) => i.camisa_estilo === "Azul Marinho - OFICIAL" && i.camisa_tipo === "Masculino").length;
  const totalAzulMarinhoBaby = todasCamisas.filter((i) => i.camisa_estilo === "Azul Marinho - OFICIAL" && i.camisa_tipo === "Feminino (Baby Look)").length;

  // XLSX export function
  const exportCSV = () => {
    const wb = XLSX.utils.book_new();

    // --- ABA 1: Planilha Detalhada ---
    const headers = ["#", "Código", "Nome", "Igreja", "Estilo", "Tipo", "Tamanho", "Observações", "Status Pagamento", "Entregue"];
    const rows = filteredCamisas.map((i, idx) => [
      idx + 1,
      i.id,
      i.nome,
      i.igreja || "",
      i.camisa_estilo || "",
      i.camisa_tipo || "",
      i.camisa_tamanho || "",
      i.camisa_obs || "",
      i.status,
      i.camisa_entregue ? "Sim" : "Não",
    ]);
    const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    // Column widths
    ws1["!cols"] = [
      { wch: 4 }, { wch: 10 }, { wch: 28 }, { wch: 28 },
      { wch: 18 }, { wch: 22 }, { wch: 8 }, { wch: 22 }, { wch: 18 }, { wch: 10 }
    ];
    XLSX.utils.book_append_sheet(wb, ws1, "Planilha Detalhada");

    // --- ABA 2: Resumo por Modelo e Tamanho ---
    const resumoHeaders = ["Tamanho", "Tulip - Masculino", "Tulip - Baby Look", "Clássica - Masculino", "Clássica - Baby Look", "Total por Tamanho"];
    const resumoRows = tamanhoTotais.map((r) => [
      r.tamanho,
      r.azulRoyal,
      r.azulRoyalBaby,
      r.azulMarinho,
      r.azulMarinhoBaby,
      r.azulRoyal + r.azulRoyalBaby + r.azulMarinho + r.azulMarinhoBaby,
    ]);
    resumoRows.push(["TOTAL", totalAzulRoyal, totalAzulRoyalBaby, totalAzulMarinho, totalAzulMarinhoBaby, todasCamisas.length]);
    const ws2 = XLSX.utils.aoa_to_sheet([resumoHeaders, ...resumoRows]);
    ws2["!cols"] = [{ wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Resumo Gráfica");

    // --- ABA 3: Controle de Entrega ---
    const entregaHeaders = ["Nome", "Estilo", "Tipo", "Tamanho", "Status Pagamento", "Entregue"];
    const entregaRows = todasCamisas.map((i) => [
      i.nome,
      i.camisa_estilo || "",
      i.camisa_tipo || "",
      i.camisa_tamanho || "",
      i.status,
      i.camisa_entregue ? "✅ Sim" : "❌ Não",
    ]);
    const ws3 = XLSX.utils.aoa_to_sheet([entregaHeaders, ...entregaRows]);
    ws3["!cols"] = [{ wch: 28 }, { wch: 18 }, { wch: 22 }, { wch: 10 }, { wch: 18 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Controle de Entrega");

    // Save file
    const fileName = `camisas-semana-musica-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    toast.success("Planilha Excel (.xlsx) exportada com sucesso!");
  };

  const exportResumoPedido = () => {
    const lines: string[] = [];
    lines.push("PEDIDO DE CAMISAS - IV SEMANA DE MÚSICA CRISTÃ DE JIJOCA");
    lines.push(`Gerado em: ${new Date().toLocaleString("pt-BR")}`);
    lines.push("");
    lines.push("=== RESUMO POR MODELO E TAMANHO ===");
    lines.push("");
    lines.push("AZUL ROYAL - OFICIAL (Masculino)");
    tamanhoTotais.forEach((t) => { if (t.azulRoyal > 0) lines.push(`  ${t.tamanho}: ${t.azulRoyal} un.`); });
    lines.push(`  TOTAL: ${totalAzulRoyal} un.`);
    lines.push("");
    lines.push("AZUL ROYAL - OFICIAL (Baby Look / Feminino)");
    tamanhoTotais.forEach((t) => { if (t.azulRoyalBaby > 0) lines.push(`  ${t.tamanho}: ${t.azulRoyalBaby} un.`); });
    lines.push(`  TOTAL: ${totalAzulRoyalBaby} un.`);
    lines.push("");
    lines.push("AZUL MARINHO - OFICIAL (Masculino)");
    tamanhoTotais.forEach((t) => { if (t.azulMarinho > 0) lines.push(`  ${t.tamanho}: ${t.azulMarinho} un.`); });
    lines.push(`  TOTAL: ${totalAzulMarinho} un.`);
    lines.push("");
    lines.push("AZUL MARINHO - OFICIAL (Baby Look / Feminino)");
    tamanhoTotais.forEach((t) => { if (t.azulMarinhoBaby > 0) lines.push(`  ${t.tamanho}: ${t.azulMarinhoBaby} un.`); });
    lines.push(`  TOTAL: ${totalAzulMarinhoBaby} un.`);
    lines.push("");
    lines.push(`TOTAL GERAL: ${todasCamisas.length} camisas`);
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + lines.join("\n")], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedido-grafica-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resumo para gráfica exportado!");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      {/* Header */}
      <div className="container mx-auto max-w-6xl mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar para o Site
          </Link>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">Painel Administrativo</h1>
              <p className="text-xs text-muted-foreground">
                Controle de participantes e fluxo de caixa da IV Semana de Música Cristã de Jijoca.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isUsingPlaceholder && (
            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/5 font-mono mr-2 hidden md:inline-flex">
              MODO LOCAL ATIVO
            </Badge>
          )}
          <Button variant="outline" onClick={loadData}>
            Recarregar
          </Button>
          <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="container mx-auto max-w-6xl">
        <Tabs defaultValue="inscricoes" className="w-full">
          <TabsList className="bg-secondary/40 w-fit p-1 rounded-xl mb-6 flex gap-1">
            <TabsTrigger value="inscricoes" className="rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-semibold">
              <Users className="w-4 h-4" /> Inscrições
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-semibold">
              <DollarSign className="w-4 h-4" /> Caixa & Finanças
            </TabsTrigger>
            <TabsTrigger value="resumos" className="rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-semibold">
              <BarChart2 className="w-4 h-4" /> Resumos
            </TabsTrigger>
            <TabsTrigger value="camisas" className="rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-semibold">
              <Shirt className="w-4 h-4" /> Camisas
            </TabsTrigger>
            <TabsTrigger value="videos" className="rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-semibold">
              <Youtube className="w-4 h-4" /> Vídeos Galeria
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: GERENCIAMENTO DE INSCRIÇÕES */}
          <TabsContent value="inscricoes" className="space-y-6">
            
            {/* Cards de Métricas de Inscrições */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" /> Total Inscritos
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold font-display">{totalInscritos}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Inscrições recebidas</p>
                </CardContent>
              </Card>

              <Card className="border-amber-500/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Clock className="w-4 h-4 text-amber-500" /> Em Análise (Aguardando PIX)
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold font-display text-amber-600 dark:text-amber-400">{totalPendentes}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Aguardando comprovação</p>
                </CardContent>
              </Card>

              <Card className="border-green-500/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Inscrições Confirmadas
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold font-display text-green-600 dark:text-green-400">{totalConfirmados}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Participantes garantidos nas salas</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Inscrições */}
            <Card className="glass-card">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Inscritos Cadastrados</CardTitle>
                    <CardDescription>Confirme os pagamentos PIX recebidos e libere os certificados.</CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isUsingPlaceholder && (
                      <Button variant="outline" size="sm" onClick={handleAddMock} className="border-dashed text-xs flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Falso Inscrito
                      </Button>
                    )}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input 
                        placeholder="Pesquisar..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Carregando dados...</div>
                ) : filteredInscricoes.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {searchTerm ? "Nenhum resultado encontrado para a busca." : "Nenhuma inscrição registrada."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
                        <tr>
                          <th className="px-4 py-3">Código</th>
                          <th className="px-4 py-3">Participante</th>
                          <th className="px-4 py-3">Opção / Participação</th>
                          <th className="px-4 py-3">Camisa / Hospedagem</th>
                          <th className="px-4 py-3">Valor</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredInscricoes.map((ins) => (
                          <tr key={ins.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs font-bold text-primary">#{ins.id}</td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-sm">{ins.nome}</div>
                              <div className="text-xs text-muted-foreground">{ins.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-xs sm:text-sm">{ins.instrumento_oficina}</div>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1 uppercase font-semibold">
                                {ins.nivel_experiencia}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-xs">
                              <div>{ins.telefone}</div>
                              <div className="text-muted-foreground italic truncate max-w-[150px] mt-0.5">{ins.igreja || "Sem igreja"}</div>
                            </td>
                            <td className="px-6 py-4">
                              {ins.status === "Confirmada" ? (
                                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-green-500/20 flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmada (Paga)
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/20 flex items-center gap-1 w-fit">
                                  <Clock className="w-3.5 h-3.5" /> Em Análise (PIX)
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end items-center gap-2">
                                {ins.status === "Pendente" && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleApprove(ins.id, ins.nome, ins.opcao_escolhida || ins.instrumento_oficina || 'Inscrição', parseFloat(ins.valor_total || '20'))}
                                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 text-xs px-2.5 h-8 active:scale-95"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Confirmar PIX
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDelete(ins.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2: CONTROLE FINANCEIRO */}
          <TabsContent value="financeiro" className="space-y-6">
            
            {/* Cards de Métricas Financeiras */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="border-green-500/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4 text-green-500" /> Receita Total (Entradas)
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold font-display text-green-600 dark:text-green-400">
                    R$ {receitasTotais.toFixed(2)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
                    <span>Semana de Música: <strong>R$ {transacoes.filter(t => t.tipo === "Entrada" && t.centro_custo === "Semana de Musica").reduce((s,c)=>s+parseFloat(c.valor), 0).toFixed(2)}</strong></span>
                    <span>Loja: <strong>R$ {transacoes.filter(t => t.tipo === "Entrada" && t.centro_custo === "Loja").reduce((s,c)=>s+parseFloat(c.valor), 0).toFixed(2)}</strong></span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-destructive">
                    <TrendingDown className="w-4 h-4 text-destructive" /> Despesa Total (Saídas)
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold font-display text-destructive">
                    R$ {despesasTotais.toFixed(2)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col text-xs text-muted-foreground gap-0.5">
                    <span>Semana de Música: <strong>R$ {transacoes.filter(t => t.tipo === "Saída" && t.centro_custo === "Semana de Musica").reduce((s,c)=>s+parseFloat(c.valor), 0).toFixed(2)}</strong></span>
                    <span>Loja: <strong>R$ {transacoes.filter(t => t.tipo === "Saída" && t.centro_custo === "Loja").reduce((s,c)=>s+parseFloat(c.valor), 0).toFixed(2)}</strong></span>
                  </div>
                </CardContent>
              </Card>

              <Card className={saldoGeral >= 0 ? "border-primary/20" : "border-destructive/20"}>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-primary" /> Saldo Caixa Geral
                  </CardDescription>
                  <CardTitle className={`text-4xl font-bold font-display ${saldoGeral >= 0 ? "text-primary" : "text-destructive"}`}>
                    R$ {saldoGeral.toFixed(2)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Total em caixa disponível</p>
                </CardContent>
              </Card>
            </div>

            {/* Layout em 2 Colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Coluna da Esquerda: Adicionar Lançamento */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Novo Lançamento</CardTitle>
                  <CardDescription>Adicione receitas ou despesas aos centros de custo.</CardDescription>
                </CardHeader>
                <form onSubmit={handleAddTransaction}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input 
                        id="descricao" 
                        name="descricao" 
                        placeholder="Ex: Aluguel do Som do Teatro" 
                        value={finForm.descricao} 
                        onChange={handleFinChange} 
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select 
                          value={finForm.tipo} 
                          onValueChange={(val) => handleFinSelectChange("tipo", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border text-foreground">
                            <SelectItem value="Entrada" className="hover:bg-accent focus:bg-accent">Entrada (+)</SelectItem>
                            <SelectItem value="Saída" className="hover:bg-accent focus:bg-accent">Saída (-)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Centro de Custo</Label>
                        <Select 
                          value={finForm.centro_custo} 
                          onValueChange={(val) => handleFinSelectChange("centro_custo", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border text-foreground">
                            <SelectItem value="Semana de Musica" className="hover:bg-accent focus:bg-accent">Semana de Música</SelectItem>
                            <SelectItem value="Loja" className="hover:bg-accent focus:bg-accent">Loja</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="valor">Valor (R$)</Label>
                        <Input 
                          id="valor" 
                          name="valor" 
                          type="number" 
                          step="0.01" 
                          placeholder="0,00" 
                          value={finForm.valor} 
                          onChange={handleFinChange} 
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data">Data</Label>
                        <Input 
                          id="data" 
                          name="data" 
                          type="date" 
                          value={finForm.data} 
                          onChange={handleFinChange} 
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full flex items-center justify-center gap-1">
                      <Plus className="w-4 h-4" /> Registrar Lançamento
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Coluna da Direita: Histórico de Fluxo de Caixa */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>Histórico de Caixa</CardTitle>
                      <CardDescription>Fluxo de entradas e saídas financeiras.</CardDescription>
                    </div>

                    {/* Filtros de Centro de Custo */}
                    <div className="flex items-center gap-2">
                      {["Todos", "Semana de Musica", "Loja"].map((centro) => (
                        <Button 
                          key={centro}
                          size="sm"
                          variant={centroFiltro === centro ? "default" : "outline"}
                          onClick={() => setCentroFiltro(centro)}
                          className="text-xs h-8"
                        >
                          {centro === "Todos" && "Todos"}
                          {centro === "Semana de Musica" && "Semana de Música"}
                          {centro === "Loja" && "Loja"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Busca e Mock Fin */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {isUsingPlaceholder && (
                      <Button variant="outline" size="sm" onClick={handleAddMockFin} className="border-dashed text-xs flex items-center gap-1 self-start">
                        <Plus className="w-3.5 h-3.5" /> Falso Lançamento
                      </Button>
                    )}
                    <div className="relative w-full sm:w-64 ml-auto">
                      <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input 
                        placeholder="Buscar por descrição..." 
                        value={finSearchTerm} 
                        onChange={(e) => setFinSearchTerm(e.target.value)}
                        className="pl-9 h-8 text-xs"
                      />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Carregando dados...</div>
                  ) : filteredTransacoes.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      {finSearchTerm ? "Nenhum resultado encontrado para a busca." : "Nenhum lançamento registrado neste centro de custo."}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
                          <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Descrição</th>
                            <th className="px-6 py-3">Centro de Custo</th>
                            <th className="px-6 py-3">Valor</th>
                            <th className="px-6 py-3 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredTransacoes.map((trans) => (
                            <tr key={trans.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-6 py-4 text-xs font-medium whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                                  {new Date(trans.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-sm">{trans.descricao}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">#{trans.id}</div>
                              </td>
                              <td className="px-6 py-4 text-xs">
                                <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-secondary/80">
                                  <Tag className="w-3 h-3" />
                                  {trans.centro_custo === "Semana de Musica" ? "Semana de Música" : "Loja"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 font-mono font-bold whitespace-nowrap">
                                {trans.tipo === "Entrada" ? (
                                  <span className="text-green-600 dark:text-green-400">
                                    + R$ {parseFloat(trans.valor).toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-destructive">
                                    - R$ {parseFloat(trans.valor).toFixed(2)}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteTransaction(trans.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        {/* ABA 3: RESUMOS COM GRÁFICOS */}
          <TabsContent value="resumos" className="space-y-6">
            
            {/* Cards de resumo rápido */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Users className="w-3.5 h-3.5 text-primary" /> Total Inscritos
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold font-display text-primary">{totalInscritos}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[10px] text-muted-foreground">{totalConfirmados} confirmados · {totalPendentes} pendentes</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Music className="w-3.5 h-3.5 text-primary" /> No Coral
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold font-display text-primary">
                    {inscricoes.filter(i => i.tipo_participacao === "Coral").length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[10px] text-muted-foreground">{naipesData.length} naipes distintos</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Music className="w-3.5 h-3.5 text-primary" /> Na Orquestra
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold font-display text-primary">
                    {inscricoes.filter(i => i.tipo_participacao === "Orquestra").length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[10px] text-muted-foreground">{instrumentosData.length} instrumentos distintos</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Church className="w-3.5 h-3.5 text-primary" /> Igrejas
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold font-display text-primary">
                    {igrejasData.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[10px] text-muted-foreground">congregações representadas</p>
                </CardContent>
              </Card>
            </div>

            {/* Linha 1: Naipes + Opções */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Naipes do Coral */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Music className="w-4 h-4 text-primary" /> Naipes do Coral
                  </CardTitle>
                  <CardDescription>Distribuição de vozes entre os inscritos</CardDescription>
                </CardHeader>
                <CardContent>
                  {naipesData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                      Nenhum inscrito no Coral ainda.
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={naipesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {naipesData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={(COLORS_NAIPES as any)[entry.name] || COLORS_PRIMARY[index % COLORS_PRIMARY.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                            formatter={(value: any, name: any) => [value + " inscrito(s)", name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-2 min-w-[130px]">
                        {naipesData.map((entry, idx) => (
                          <div key={entry.name} className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: (COLORS_NAIPES as any)[entry.name] || COLORS_PRIMARY[idx % COLORS_PRIMARY.length] }} />
                            <span className="text-muted-foreground">{entry.name}</span>
                            <span className="font-bold ml-auto">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Opções de Inscrição */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" /> Opções Adquiridas
                  </CardTitle>
                  <CardDescription>Distribuição por tipo de pacote contratado</CardDescription>
                </CardHeader>
                <CardContent>
                  {opcoesData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                      Nenhuma inscrição registrada ainda.
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={opcoesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {opcoesData.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS_PRIMARY[index % COLORS_PRIMARY.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                            formatter={(value: any, name: any) => [value + " inscrito(s)", name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        {opcoesData.map((entry, idx) => (
                          <div key={entry.name} className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS_PRIMARY[idx % COLORS_PRIMARY.length] }} />
                            <span className="text-muted-foreground truncate max-w-[120px]" title={entry.name}>{entry.name}</span>
                            <span className="font-bold ml-auto">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Instrumentos da Orquestra */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" /> Instrumentos da Orquestra
                </CardTitle>
                <CardDescription>Quantidade de inscritos por naipe instrumental</CardDescription>
              </CardHeader>
              <CardContent>
                {instrumentosData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    Nenhum inscrito na Orquestra ainda.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(200, instrumentosData.length * 40)}>
                    <BarChart
                      data={instrumentosData}
                      layout="vertical"
                      margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(value: any) => [value + " inscrito(s)", "Quantidade"]}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}>
                        {instrumentosData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_PRIMARY[index % COLORS_PRIMARY.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Igrejas */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Church className="w-4 h-4 text-primary" /> Igrejas Representadas
                </CardTitle>
                <CardDescription>Quantidade de inscritos por congregação (top 15)</CardDescription>
              </CardHeader>
              <CardContent>
                {igrejasData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                    Nenhuma igreja registrada ainda.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={Math.max(250, igrejasData.length * 44)}>
                    <BarChart
                      data={igrejasData}
                      layout="vertical"
                      margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={130}
                        tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                      />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(value: any) => [value + " inscrito(s)", "Participantes"]}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}>
                        {igrejasData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS_PRIMARY[index % COLORS_PRIMARY.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

          </TabsContent>

        {/* ABA 4: CAMISAS PARA GRÁFICA */}
          <TabsContent value="camisas" className="space-y-6">

            {/* Header com botões de export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-display font-bold flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-primary" /> Pedido de Camisas
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Planilha completa para envio à gráfica. Total: <strong>{todasCamisas.length}</strong> camisas.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={exportResumoPedido} className="flex items-center gap-2">
                  <Download className="w-4 h-4" /> Resumo p/ Gráfica (.txt)
                </Button>
                <Button size="sm" onClick={exportCSV} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4" /> Exportar Excel (.xlsx)
                </Button>
              </div>
            </div>

            {/* Cards de progresso de entrega */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="glass-card border-green-500/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <PackageCheck className="w-3.5 h-3.5" /> Entregues
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold font-display text-green-600 dark:text-green-400">{totalEntregues}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                    <div
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: todasCamisas.length > 0 ? `${Math.round((totalEntregues / todasCamisas.length) * 100)}%` : "0%" }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {todasCamisas.length > 0 ? Math.round((totalEntregues / todasCamisas.length) * 100) : 0}% do total
                  </p>
                </CardContent>
              </Card>
              <Card className="glass-card border-amber-500/20">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <Package className="w-3.5 h-3.5" /> Pendentes
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold font-display text-amber-600 dark:text-amber-400">{totalPendentesEntrega}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[10px] text-muted-foreground">aguardando retirada</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Shirt className="w-3.5 h-3.5 text-primary" /> Total Geral
                  </CardDescription>
                  <CardTitle className="text-3xl font-bold font-display text-primary">{todasCamisas.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[10px] text-muted-foreground">camisas no pedido</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de resumo por modelo/tamanho */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">Resumo por Modelo e Tamanho</CardTitle>
                <CardDescription>Quantidade a pedir por estilo, corte e numeração</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-center">
                  <thead className="bg-secondary/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">Tamanho</th>
                      <th className="px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#6B1D2F"}}></span>
                          Tulip (Masc.)
                        </span>
                      </th>
                      <th className="px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#6B1D2F"}}></span>
                          Tulip (Baby Look)
                        </span>
                      </th>
                      <th className="px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#18181B"}}></span>
                          Clássica (Masc.)
                        </span>
                      </th>
                      <th className="px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full inline-block" style={{backgroundColor:"#18181B"}}></span>
                          Clássica (Baby Look)
                        </span>
                      </th>
                      <th className="px-4 py-3 font-bold text-foreground">Total / Tam.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tamanhoTotais.map((row) => {
                      const rowTotal = row.azulRoyal + row.azulRoyalBaby + row.azulMarinho + row.azulMarinhoBaby;
                      return (
                        <tr key={row.tamanho} className={rowTotal > 0 ? "hover:bg-secondary/20" : "opacity-40"}>
                          <td className="px-4 py-3 font-bold text-left text-primary font-mono">{row.tamanho}</td>
                          <td className="px-4 py-3">
                            {row.azulRoyal > 0 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-900/20 text-rose-700 dark:text-rose-300 font-bold text-sm">{row.azulRoyal}</span> : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {row.azulRoyalBaby > 0 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-900/20 text-rose-700 dark:text-rose-300 font-bold text-sm">{row.azulRoyalBaby}</span> : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {row.azulMarinho > 0 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 font-bold text-sm">{row.azulMarinho}</span> : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {row.azulMarinhoBaby > 0 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 font-bold text-sm">{row.azulMarinhoBaby}</span> : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 font-bold text-base">{rowTotal > 0 ? rowTotal : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t bg-secondary/30">
                    <tr className="font-bold text-sm">
                      <td className="px-4 py-3 text-left uppercase tracking-wider text-xs">TOTAL</td>
                      <td className="px-4 py-3 text-primary">{totalAzulRoyal || "—"}</td>
                      <td className="px-4 py-3 text-primary">{totalAzulRoyalBaby || "—"}</td>
                      <td className="px-4 py-3 text-primary">{totalAzulMarinho || "—"}</td>
                      <td className="px-4 py-3 text-primary">{totalAzulMarinhoBaby || "—"}</td>
                      <td className="px-4 py-3 text-lg text-primary">{todasCamisas.length}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            {/* Filtros da planilha detalhada */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Filter className="w-4 h-4 text-primary" /> Planilha Detalhada por Inscrito
                    </CardTitle>
                    <CardDescription>
                      Exibindo {filteredCamisas.length} de {todasCamisas.length} camisas
                    </CardDescription>
                  </div>
                  {/* Filtros */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Filtro Estilo */}
                    <Select value={camisaFiltroEstilo} onValueChange={setCamisaFiltroEstilo}>
                      <SelectTrigger className="h-8 text-xs w-[160px]">
                        <SelectValue placeholder="Estilo..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border text-foreground">
                        <SelectItem value="Todos" className="hover:bg-accent focus:bg-accent text-xs">Todos os estilos</SelectItem>
                        <SelectItem value="Azul Royal - OFICIAL" className="hover:bg-accent focus:bg-accent text-xs">🟤 Azul Royal - OFICIAL</SelectItem>
                        <SelectItem value="Azul Marinho - OFICIAL" className="hover:bg-accent focus:bg-accent text-xs">⚫ Azul Marinho - OFICIAL</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Filtro Tipo */}
                    <Select value={camisaFiltroTipo} onValueChange={setCamisaFiltroTipo}>
                      <SelectTrigger className="h-8 text-xs w-[150px]">
                        <SelectValue placeholder="Tipo..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border text-foreground">
                        <SelectItem value="Todos" className="hover:bg-accent focus:bg-accent text-xs">Todos os tipos</SelectItem>
                        <SelectItem value="Masculino" className="hover:bg-accent focus:bg-accent text-xs">Masculino</SelectItem>
                        <SelectItem value="Feminino (Baby Look)" className="hover:bg-accent focus:bg-accent text-xs">Baby Look</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Filtro Status */}
                    <Select value={camisaFiltroStatus} onValueChange={setCamisaFiltroStatus}>
                      <SelectTrigger className="h-8 text-xs w-[140px]">
                        <SelectValue placeholder="Status..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border text-foreground">
                        <SelectItem value="Todos" className="hover:bg-accent focus:bg-accent text-xs">Todos os status</SelectItem>
                        <SelectItem value="Confirmada" className="hover:bg-accent focus:bg-accent text-xs">✅ Confirmada</SelectItem>
                        <SelectItem value="Pendente" className="hover:bg-accent focus:bg-accent text-xs">⏳ Pendente PIX</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Filtro Entrega */}
                    <Select value={camisaFiltroEntrega} onValueChange={setCamisaFiltroEntrega}>
                      <SelectTrigger className="h-8 text-xs w-[140px]">
                        <SelectValue placeholder="Entrega..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border text-foreground">
                        <SelectItem value="Todos" className="hover:bg-accent focus:bg-accent text-xs">Toda entrega</SelectItem>
                        <SelectItem value="Entregue" className="hover:bg-accent focus:bg-accent text-xs">📦 Entregue</SelectItem>
                        <SelectItem value="Pendente" className="hover:bg-accent focus:bg-accent text-xs">⏳ A Entregar</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Busca */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <Input
                        placeholder="Buscar nome..."
                        value={camisaSearch}
                        onChange={(e) => setCamisaSearch(e.target.value)}
                        className="h-8 pl-8 text-xs w-[150px]"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                ) : filteredCamisas.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground">
                    <Shirt className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Nenhuma camisa encontrada com esses filtros.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
                        <tr>
                          <th className="px-4 py-3 w-8">#</th>
                          <th className="px-4 py-3">Nome / Igreja</th>
                          <th className="px-4 py-3">Estilo</th>
                          <th className="px-4 py-3">Tipo</th>
                          <th className="px-4 py-3">Tam.</th>
                          <th className="px-4 py-3">Observações</th>
                          <th className="px-4 py-3">Pag.</th>
                          <th className="px-4 py-3">Entrega</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredCamisas.map((ins, idx) => (
                          <tr key={ins.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-sm">{ins.nome}</div>
                              <div className="text-xs text-muted-foreground italic">{ins.igreja || "—"}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 border"
                                  style={{ backgroundColor: ins.camisa_estilo === "Azul Royal - OFICIAL" ? "#6B1D2F" : "#18181B" }}
                                />
                                <span className="text-xs font-medium">
                                  {ins.camisa_estilo === "Azul Royal - OFICIAL" ? "TULIP" : "CLÁSSICA"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {ins.camisa_tipo === "Feminino (Baby Look)" ? (
                                <Badge variant="secondary" className="text-[10px] bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20">Baby Look</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px]">Masculino</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-sm border border-primary/20">
                                {ins.camisa_tamanho}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px]">
                              {ins.camisa_obs ? (
                                <span className="italic text-amber-600 dark:text-amber-400">⚠ {ins.camisa_obs}</span>
                              ) : (
                                <span className="opacity-40">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {ins.status === "Confirmada" ? (
                                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-[10px] flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3" /> Pago
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] flex items-center gap-1 w-fit">
                                  <Clock className="w-3 h-3" /> PIX
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleToggleEntrega(ins.id, ins.nome, !!ins.camisa_entregue)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                                  ins.camisa_entregue
                                    ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 hover:bg-green-500/25"
                                    : "bg-secondary text-muted-foreground border-border hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30"
                                }`}
                              >
                                {ins.camisa_entregue ? (
                                  <><PackageCheck className="w-3.5 h-3.5" /> Entregue</>
                                ) : (
                                  <><Package className="w-3.5 h-3.5" /> Entregar</>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

          </TabsContent>

          {/* ABA 5: GERENCIAMENTO DE VÍDEOS */}
          <TabsContent value="videos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulário de Adicionar Vídeo */}
              <Card className="glass-card h-fit lg:col-span-1">
                <CardHeader>
                  <CardTitle>Adicionar Vídeo</CardTitle>
                  <CardDescription>Cadastre um novo vídeo de apresentações passadas.</CardDescription>
                </CardHeader>
                <form onSubmit={handleAddVideo}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título do Vídeo</Label>
                      <Input
                        id="titulo"
                        name="titulo"
                        placeholder="Ex: Coral de Abertura - Edição III"
                        value={videoForm.titulo}
                        onChange={handleVideoFormChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">Link do YouTube</Label>
                      <Input
                        id="url"
                        name="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={videoForm.url}
                        onChange={handleVideoFormChange}
                        required
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Suporta links comuns (watch?v=...) e encurtados (youtu.be/...).
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição (Opcional)</Label>
                      <Input
                        id="descricao"
                        name="descricao"
                        placeholder="Ex: Hino Alpha e Omega apresentado no encerramento."
                        value={videoForm.descricao}
                        onChange={handleVideoFormChange}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> Adicionar Vídeo
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Lista de Vídeos Cadastrados */}
              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>Galeria de Vídeos Ativa</CardTitle>
                  <CardDescription>Estes são os vídeos que os visitantes veem na página inicial.</CardDescription>
                </CardHeader>
                <CardContent>
                  {videos.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Nenhum vídeo cadastrado. Adicione um vídeo ao lado.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((video) => (
                        <div 
                          key={video.id} 
                          className="flex flex-col border border-border bg-card/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="relative aspect-video w-full bg-black">
                            <img 
                              src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} 
                              alt={video.titulo} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 text-white rounded-md px-1.5 py-0.5 text-[10px] font-mono">
                              ID: {video.youtube_id}
                            </div>
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-sm line-clamp-1">{video.titulo}</h4>
                              {video.descricao ? (
                                <p className="text-xs text-muted-foreground line-clamp-2">{video.descricao}</p>
                              ) : (
                                <p className="text-xs text-muted-foreground/40 italic">Sem descrição</p>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/60">
                              <a 
                                href={video.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[10px] text-primary hover:underline truncate max-w-[150px]"
                              >
                                Ver no YouTube ↗
                              </a>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDeleteVideo(video.id)}
                                className="h-7 px-2.5 text-xs flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
