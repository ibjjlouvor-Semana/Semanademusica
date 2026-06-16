import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Music, 
  Calendar, 
  MapPin, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Clock,
  Phone,
  Mail,
  User,
  Map,
  BookOpen,
  Trophy,
  Activity,
  Award,
  Database,
  Printer,
  QrCode,
  Copy,
  Youtube,
  Play,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase, isUsingPlaceholder } from "@/integrations/supabase/client";

// Oficinas do evento
const OFICINAS = [
  { id: "canto", nome: "Técnica Vocal & Canto Coral", professor: "Profª. Sara Lemos", descricao: "Respiração, afinação, dicção e prática de canto em coro." },
  { id: "teclado", nome: "Teclado & Piano no Louvor", professor: "Prof. Samuel Costa", descricao: "Harmonia, improvisação, escalas e acompanhamento prático." },
  { id: "violao", nome: "Violão & Guitarra Base/Solo", professor: "Prof. Marcos André", descricao: "Técnicas de dedilhado, acordes, solos e timbragem." },
  { id: "bateria", nome: "Bateria & Ritmos Congregacionais", professor: "Prof. Daniel Lima", descricao: "Rudimentos, grooves, dinâmicas e andamento." },
  { id: "baixo", nome: "Contrabaixo Elétrico", professor: "Prof. Thiago Santos", descricao: "Condução, escalas, criação de linhas de baixo e groove." },
  { id: "regencia", nome: "Regência Coral & Teoria Musical", professor: "Prof. Lucas Rocha", descricao: "Leitura de partitura, gestos de regência e harmonia." },
];

const CHAVE_PIX = "pix@semanademusicajijoca.com.br";

export default function Home() {
  // Estados do formulário de inscrição
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    cidade: "Jijoca de Jericoacoara",
    estado: "CE",
    igreja: "",
    hospedagem: "Não",
    opcao_escolhida: "Inscrição + Camisa Oficial", // Default
    tipo_participacao: "Coral",
    detalhe_participacao: "",
    descricao_experiencia: "",
    camisa_estilo: "Azul Royal - OFICIAL",
    camisa_tipo: "Masculino",
    camisa_tamanho: "M",
    camisa_obs: "",
    instrumento_oficina: "",
    nivel_experiencia: "",
  });
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inscricaoConfirmada, setInscricaoConfirmada] = useState<any>(null);

  const [videos, setVideos] = useState<any[]>([]);
  const [playingVideo, setPlayingVideo] = useState<any | null>(null);

  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play do carrossel de vídeos
  React.useEffect(() => {
    if (videos.length <= 3 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentStartIndex((prev) => (prev + 1) % videos.length);
    }, 4000); // Troca o vídeo a cada 4 segundos

    return () => clearInterval(interval);
  }, [videos, isPaused]);

  // Carregar Vídeos da Galeria
  React.useEffect(() => {
    const loadVideos = async () => {
      try {
        if (!isUsingPlaceholder) {
          const { data, error } = await supabase
            .from("videos_apresentacao")
            .select("*")
            .order("created_at", { ascending: false });
          if (error) throw error;
          if (data && data.length > 0) {
            setVideos(data);
            return;
          }
        }
      } catch (err) {
        console.error("Erro ao carregar vídeos do Supabase:", err);
      }
      
      // Fallback para localStorage
      const localVideos = JSON.parse(localStorage.getItem("videos_apresentacao") || "[]");
      if (localVideos.length > 0) {
        setVideos(localVideos);
      } else {
        // Vídeos padrão caso não haja nenhum cadastrado
        const defaultVideos = [
          {
            id: "default-1",
            titulo: "Recital de Encerramento - III Semana de Música",
            descricao: "Apresentação emocionante da Orquestra e Coral da edição anterior.",
            url: "https://www.youtube.com/watch?v=A2vEv2d34aY",
            youtube_id: "A2vEv2d34aY",
            created_at: new Date().toISOString()
          },
          {
            id: "default-2",
            titulo: "Oficina de Canto Coral - Melhores Momentos",
            descricao: "Prática vocal, técnicas de respiração e harmonia em conjunto.",
            url: "https://www.youtube.com/watch?v=F3P49z8nUes",
            youtube_id: "F3P49z8nUes",
            created_at: new Date().toISOString()
          },
          {
            id: "default-3",
            titulo: "Apresentação da Orquestra - Hino de Louvor",
            descricao: "Execução instrumental dos alunos e professores no recital.",
            url: "https://www.youtube.com/watch?v=lT2YtN9Tq84",
            youtube_id: "lT2YtN9Tq84",
            created_at: new Date().toISOString()
          }
        ];
        localStorage.setItem("videos_apresentacao", JSON.stringify(defaultVideos));
        setVideos(defaultVideos);
      }
    };
    loadVideos();
  }, []);

  const getVisibleVideos = () => {
    if (videos.length === 0) return [];
    if (videos.length <= 3) return videos;
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const idx = (currentStartIndex + i) % videos.length;
      visible.push(videos[idx]);
    }
    return visible;
  };

  const handlePrevSlide = () => {
    setCurrentStartIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleNextSlide = () => {
    setCurrentStartIndex((prev) => (prev + 1) % videos.length);
  };

  // Rolagem suave
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const hasParticipation = (opcao: string) => {
    return opcao === "Apenas Inscrição" || opcao === "Inscrição + Camisa Oficial";
  };

  const hasShirt = (opcao: string) => {
    return opcao === "Apenas Camisa Oficial" || opcao === "Inscrição + Camisa Oficial";
  };

  // Obter valor total baseado na opção escolhida
  const getValorTotal = () => {
    if (formData.opcao_escolhida === "Inscrição + Camisa Oficial") return 65;
    if (formData.opcao_escolhida === "Apenas Camisa Oficial") return 45;
    return 20;
  };

  // Obter o passo visual atual e total baseado no caminho condicional
  const getStepVisualNumber = () => {
    if (step === 1) return 1;
    if (step === 2) return 2; // Só chega aqui se tem participação
    if (step === 3) return hasParticipation(formData.opcao_escolhida) ? 3 : 2;
    if (step === 4) {
      let active = 2; // Passo 1 e Passo 4 são obrigatórios
      if (hasParticipation(formData.opcao_escolhida)) active++;
      if (hasShirt(formData.opcao_escolhida)) active++;
      return active;
    }
    return step;
  };

  const getStepVisualTotal = () => {
    let total = 2; // Passo 1 (Dados) e Passo 4 (Pagamento)
    if (hasParticipation(formData.opcao_escolhida)) total++;
    if (hasShirt(formData.opcao_escolhida)) total++;
    return total;
  };

  // Validações por etapa
  const validateStep = () => {
    if (step === 1) {
      if (!formData.nome.trim()) return "Nome completo é obrigatório.";
      if (!formData.email.trim()) return "E-mail é obrigatório.";
      if (!/\S+@\S+\.\S+/.test(formData.email)) return "E-mail inválido.";
      if (!formData.telefone.trim()) return "WhatsApp / Telefone é obrigatório.";
      if (!formData.data_nascimento) return "Data de nascimento é obrigatória.";
      if (!formData.cidade.trim()) return "Cidade é obrigatória.";
      if (!formData.estado.trim()) return "Estado é obrigatório.";
    }
    if (step === 2) {
      if (hasParticipation(formData.opcao_escolhida)) {
        if (!formData.tipo_participacao) return "Selecione como deseja participar.";
        if (!formData.detalhe_participacao) {
          return formData.tipo_participacao === "Coral" 
            ? "Selecione o seu naipe vocal." 
            : "Selecione o seu instrumento.";
        }
      }
    }
    if (step === 3) {
      if (hasShirt(formData.opcao_escolhida)) {
        if (!formData.camisa_estilo) return "Selecione o estilo da blusa.";
        if (!formData.camisa_tipo) return "Selecione o tipo/corte da camisa.";
        if (!formData.camisa_tamanho) return "Selecione o tamanho da camisa.";
      }
    }
    return null;
  };

  const nextStep = () => {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }

    if (step === 1) {
      if (hasParticipation(formData.opcao_escolhida)) {
        setStep(2);
      } else if (hasShirt(formData.opcao_escolhida)) {
        setStep(3);
      } else {
        setStep(4);
      }
    } else if (step === 2) {
      if (hasShirt(formData.opcao_escolhida)) {
        setStep(3);
      } else {
        setStep(4);
      }
    } else if (step === 3) {
      setStep(4);
    }
  };

  const prevStep = () => {
    if (step === 4) {
      if (hasShirt(formData.opcao_escolhida)) {
        setStep(3);
      } else if (hasParticipation(formData.opcao_escolhida)) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else if (step === 3) {
      if (hasParticipation(formData.opcao_escolhida)) {
        setStep(2);
      } else {
        setStep(1);
      }
    } else if (step === 2) {
      setStep(1);
    }
  };

  // Copiar chave PIX
  const handleCopyPix = () => {
    navigator.clipboard.writeText(CHAVE_PIX);
    toast.success("Chave PIX copiada com sucesso!");
  };

  // Finalizar Inscrição (Status inicial sempre "Pendente")
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Você precisa aceitar os termos de consentimento para finalizar.");
      return;
    }

    setLoading(true);

    const valor = getValorTotal();
    const temInscricao = hasParticipation(formData.opcao_escolhida);
    const temCamisa = hasShirt(formData.opcao_escolhida);

    const dataInscricao = {
      id: crypto.randomUUID().substring(0, 8).toUpperCase(),
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      data_nascimento: formData.data_nascimento,
      cidade: formData.cidade,
      estado: formData.estado,
      igreja: formData.igreja || null,
      hospedagem: formData.hospedagem,
      opcao_escolhida: formData.opcao_escolhida,
      
      tipo_participacao: temInscricao ? formData.tipo_participacao : null,
      detalhe_participacao: temInscricao ? formData.detalhe_participacao : null,
      descricao_experiencia: temInscricao ? formData.descricao_experiencia : null,
      
      camisa_estilo: temCamisa ? formData.camisa_estilo : null,
      camisa_tipo: temCamisa ? formData.camisa_tipo : null,
      camisa_tamanho: temCamisa ? formData.camisa_tamanho : null,
      camisa_obs: temCamisa ? formData.camisa_obs : null,
      
      valor_total: valor,
      status: "Pendente", // Salvo inicialmente como Pendente
      created_at: new Date().toISOString(),

      // Mapeamento compatível para campos legados no banco
      instrumento_oficina: temInscricao 
        ? `${formData.tipo_participacao} (${formData.detalhe_participacao})`
        : "Apenas Camisa",
      nivel_experiencia: temInscricao ? "Participante" : "N/A",
    };

    try {
      if (!isUsingPlaceholder) {
        // Enviar para o Supabase real
        const { error } = await supabase.from("inscricoes").insert([dataInscricao]);
        if (error) throw error;
        toast.success("Inscrição salva com sucesso no banco de dados!");
      } else {
        // Simular localmente no localStorage
        const antigas = JSON.parse(localStorage.getItem("inscricoes") || "[]");
        localStorage.setItem("inscricoes", JSON.stringify([...antigas, dataInscricao]));
        toast.info("Modo Local: Inscrição salva localmente no navegador.");
      }

      setInscricaoConfirmada(dataInscricao);
      toast.success("Dados enviados para análise!");
      setStep(5); // Passo 5 é o Voucher de Sucesso
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar inscrição: " + (err.message || "Erro de conexão"));
    } finally {
      setLoading(false);
    }
  };

  const printVoucher = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("home")}>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
              <div className="h-5 w-[1px] bg-border hidden sm:block"></div>
              <div className="bg-white p-0.5 rounded border border-zinc-200 hidden sm:block">
                <img src="/logo-igreja.png" alt="Igreja Bíblica de Jijoca" className="h-6 object-contain" />
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-base leading-none block">IV Semana de Música</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">Realização: Igreja Bíblica</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => scrollToSection("sobre")} className="hover:text-primary transition-colors">Sobre</button>
            <button onClick={() => scrollToSection("cronograma")} className="hover:text-primary transition-colors">Programação</button>
            <button onClick={() => scrollToSection("oficinas")} className="hover:text-primary transition-colors">Oficinas</button>
            <button onClick={() => scrollToSection("videos")} className="hover:text-primary transition-colors">Vídeos</button>
            <button onClick={() => scrollToSection("inscricao")} className="hover:text-primary transition-colors">Inscrição</button>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                <Database className="w-4 h-4" />
                Painel
              </Button>
            </Link>
            <Button size="sm" onClick={() => scrollToSection("inscricao")} className="bg-primary hover:bg-primary/90">
              Inscrever-se
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-12 pb-20 md:py-32 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="w-24 h-24 rounded-full border border-primary/20 bg-card/60 backdrop-blur-md flex items-center justify-center p-2.5 mx-auto mb-6 shadow-xl animate-fade-in animate-float">
            <img src="/logo.png" alt="Semana de Música Logo" className="w-full h-full object-contain" />
          </div>
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary border-primary/20 bg-primary/5 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> IV Edição • Jijoca de Jericoacoara
          </Badge>
          
          <h1 className="text-4xl md:text-7xl font-display font-bold max-w-4xl mx-auto leading-[1.15] mb-6 animate-fade-in">
            Aprimore o seu talento para a <span className="gradient-text">Glória de Deus</span>
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in [animation-delay:100ms]">
            Junte-se a dezenas de instrumentistas e vocalistas na IV Semana de Música Cristã. Escolha sua opção de participação ou adquira a blusa oficial.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:200ms]">
            <Button size="lg" onClick={() => scrollToSection("inscricao")} className="w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 text-base">
              Iniciar Inscrição <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToSection("sobre")} className="w-full sm:w-auto h-12 px-8 text-base">
              Saber mais
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto animate-fade-in [animation-delay:300ms]">
            <div className="glass-card p-4 rounded-2xl flex flex-col items-center">
              <Calendar className="w-6 h-6 text-primary mb-2" />
              <span className="font-semibold text-sm">07 a 13 de Setembro</span>
              <span className="text-xs text-muted-foreground">Data do evento</span>
            </div>
            <div className="glass-card p-4 rounded-2xl flex flex-col items-center">
              <MapPin className="w-6 h-6 text-primary mb-2" />
              <span className="font-semibold text-sm">Jijoca de Jericoacoara</span>
              <span className="text-xs text-muted-foreground">Local das aulas</span>
            </div>
            <div className="glass-card p-4 rounded-2xl flex flex-col items-center">
              <Users className="w-6 h-6 text-primary mb-2" />
              <span className="font-semibold text-sm">Coral & Orquestra</span>
              <span className="text-xs text-muted-foreground">Inscrições abertas</span>
            </div>
            <div className="glass-card p-4 rounded-2xl flex flex-col items-center">
              <Award className="w-6 h-6 text-primary mb-2" />
              <span className="font-semibold text-sm">Certificado Digital</span>
              <span className="text-xs text-muted-foreground">Incluso na participação</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o Evento */}
      <section id="sobre" className="py-20 border-t bg-secondary/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-3">Sobre o Evento</span>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 leading-tight">
                Um encontro focado no crescimento musical e espiritual
              </h2>
              <p className="text-muted-foreground mb-4">
                A Semana de Música Cristã de Jijoca nasceu com o propósito de capacitar músicos locais, regentes e ministros de louvor das igrejas da região.
              </p>
              <p className="text-muted-foreground mb-6">
                Em nossa quarta edição, trazemos professores experientes para oferecer capacitação intensiva. As inscrições são validadas individualmente após confirmação do PIX da taxa correspondente.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm font-medium">Aulas práticas coletivas com especialistas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm font-medium">Material didático de apoio em PDF</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm font-medium">Recital de encerramento no último dia</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-2xl filter blur-xl opacity-70"></div>
              <div className="glass-card p-6 rounded-3xl relative z-10 shadow-2xl space-y-6">
                <h3 className="font-display font-bold text-xl mb-4 text-center">Valores da Edição IV</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Carga Horária</span>
                    <span className="font-semibold text-sm">20 horas/aula</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> Apenas Inscrição</span>
                    <span className="font-semibold text-sm text-primary">R$ 20,00</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> Apenas Camisa Oficial</span>
                    <span className="font-semibold text-sm text-primary">R$ 45,00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> Combo (Inscrição + Camisa)</span>
                    <span className="font-semibold text-sm text-primary">R$ 65,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cronograma / Programação */}
      <section id="cronograma" className="py-20 border-t bg-secondary/10">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-3">Cronograma</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Como será a Semana de Música?</h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-12">
            Confira o cronograma completo das atividades da IV Semana de Música Cristã (07 a 13 de Setembro de 2026).
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            {/* Segunda-feira (07/Set) */}
            <Card className="glass-card flex flex-col justify-between border-white/10 overflow-hidden shadow-md">
              <CardHeader className="pb-3 border-b border-white/5 bg-secondary/40">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold">Segunda-feira</CardTitle>
                  <Badge className="bg-primary/20 text-primary border-primary/20 font-mono text-[10px]">07/Set</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20">
                  <span className="font-bold font-mono">18:00</span>
                  <span className="font-semibold">Credenciamento</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="font-bold font-mono">18:15</span>
                  <span className="font-semibold">Culto</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                  <span className="font-bold font-mono">19:15</span>
                  <span className="font-semibold">Lanche</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                  <span className="font-bold font-mono">19:30</span>
                  <span className="font-semibold">Ensaio</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                  <span className="font-bold font-mono">22:00</span>
                  <span className="font-semibold">Encerramento</span>
                </div>
              </CardContent>
            </Card>

            {/* Terça-feira (08/Set) */}
            <Card className="glass-card flex flex-col justify-between border-white/10 overflow-hidden shadow-md">
              <CardHeader className="pb-3 border-b border-white/5 bg-secondary/40">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold">Terça-feira</CardTitle>
                  <Badge className="bg-primary/20 text-primary border-primary/20 font-mono text-[10px]">08/Set</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20">
                  <span className="font-bold font-mono">18:00</span>
                  <span className="font-semibold">Oficinas / Prática</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                  <span className="font-bold font-mono">19:00</span>
                  <span className="font-semibold">Lanche</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                  <span className="font-bold font-mono">19:15</span>
                  <span className="font-semibold">Ensaio</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                  <span className="font-bold font-mono">22:00</span>
                  <span className="font-semibold">Encerramento</span>
                </div>
              </CardContent>
            </Card>

            {/* Quarta-feira (09/Set) */}
            <Card className="glass-card flex flex-col justify-between border-white/10 overflow-hidden shadow-md">
              <CardHeader className="pb-3 border-b border-white/5 bg-secondary/40">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold">Quarta-feira</CardTitle>
                  <Badge className="bg-primary/20 text-primary border-primary/20 font-mono text-[10px]">09/Set</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20">
                  <span className="font-bold font-mono">18:00</span>
                  <span className="font-semibold">Oficinas / Prática</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                  <span className="font-bold font-mono">19:00</span>
                  <span className="font-semibold">Lanche</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                  <span className="font-bold font-mono">19:15</span>
                  <span className="font-semibold">Ensaio</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                  <span className="font-bold font-mono">22:00</span>
                  <span className="font-semibold">Encerramento</span>
                </div>
              </CardContent>
            </Card>

            {/* Quinta-feira (10/Set) */}
            <Card className="glass-card flex flex-col justify-between border-white/10 overflow-hidden shadow-md">
              <CardHeader className="pb-3 border-b border-white/5 bg-secondary/40">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold">Quinta-feira</CardTitle>
                  <Badge className="bg-primary/20 text-primary border-primary/20 font-mono text-[10px]">10/Set</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="font-bold font-mono">18:00</span>
                  <span className="font-semibold">Culto</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                  <span className="font-bold font-mono">19:00</span>
                  <span className="font-semibold">Lanche</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                  <span className="font-bold font-mono">19:15</span>
                  <span className="font-semibold">Ensaio Geral</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                  <span className="font-bold font-mono">22:00</span>
                  <span className="font-semibold">Encerramento</span>
                </div>
              </CardContent>
            </Card>

            {/* Sexta-feira (11/Set) */}
            <Card className="glass-card flex flex-col justify-between border-white/10 overflow-hidden shadow-md">
              <CardHeader className="pb-3 border-b border-white/5 bg-secondary/40">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold">Sexta-feira</CardTitle>
                  <Badge className="bg-primary/20 text-primary border-primary/20 font-mono text-[10px]">11/Set</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="font-bold font-mono">18:00</span>
                  <span className="font-semibold">Culto</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
                  <span className="font-bold font-mono">19:00</span>
                  <span className="font-semibold">Lanche</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                  <span className="font-bold font-mono">19:15</span>
                  <span className="font-semibold">Ensaio Geral</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                  <span className="font-bold font-mono">22:00</span>
                  <span className="font-semibold">Encerramento</span>
                </div>
              </CardContent>
            </Card>

            {/* Sábado (12/Set) */}
            <Card className="glass-card flex flex-col justify-start border-white/10 overflow-hidden shadow-md">
              <CardHeader className="pb-3 border-b border-white/5 bg-secondary/40">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold">Sábado</CardTitle>
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/20 font-mono text-[10px]">12/Set</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs p-3.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <span className="font-bold font-mono text-sm">17:30</span>
                  <span className="font-bold text-sm">Concerto de Encerramento</span>
                </div>
                <p className="text-xs text-muted-foreground p-3 border border-dashed rounded-lg bg-secondary/10">
                  Apresentação oficial de encerramento de todas as oficinas, orquestra e coral para a comunidade de Jijoca.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Oficinas */}
      <section id="oficinas" className="py-20 border-t bg-secondary/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-3">Nossos Focos</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Escolha a sua Área de Atuação</h2>
            <p className="text-muted-foreground text-sm">
              Você pode participar ativamente na grande orquestra ou no coral de vozes que se apresentará no recital final.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                    Coral de Vozes
                  </Badge>
                  <Music className="w-4 h-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">Canto Coral</CardTitle>
                <CardDescription className="font-medium text-primary text-xs mt-1">
                  Técnica Vocal & Harmonia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Aprenda respiração, dicção, afinação e divisão de vozes (Soprano, Contralto, Tenor e Baixo) sob a condução de professores experientes.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" onClick={() => {
                  handleSelectChange("opcao_escolhida", "Inscrição + Camisa Oficial");
                  handleSelectChange("tipo_participacao", "Coral");
                  scrollToSection("inscricao");
                  setStep(1);
                  toast.success("Opção 'Inscrição + Camisa' e foco 'Coral' selecionados!");
                }} className="w-full text-primary hover:text-primary hover:bg-primary/5 font-semibold flex items-center justify-center gap-1">
                  Escolher Coral <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20">
                    Grande Orquestra
                  </Badge>
                  <Music className="w-4 h-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">Orquestra de Instrumentos</CardTitle>
                <CardDescription className="font-medium text-primary text-xs mt-1">
                  Prática de Conjunto Instrumental
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Una-se a instrumentistas de cordas, sopros e metais no grande ensaio. Focado em harmonia, leitura, dinâmica e prática de orquestra.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" onClick={() => {
                  handleSelectChange("opcao_escolhida", "Inscrição + Camisa Oficial");
                  handleSelectChange("tipo_participacao", "Orquestra");
                  scrollToSection("inscricao");
                  setStep(1);
                  toast.success("Opção 'Inscrição + Camisa' e foco 'Orquestra' selecionados!");
                }} className="w-full text-primary hover:text-primary hover:bg-primary/5 font-semibold flex items-center justify-center gap-1">
                  Escolher Orquestra <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Galeria de Vídeos / Edições Anteriores */}
      <section id="videos" className="py-20 border-t bg-secondary/30 relative overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="container mx-auto px-4 max-w-[1320px] relative z-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-3">Edições Anteriores</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Apresentações Passadas</h2>
            <p className="text-muted-foreground text-sm">
              Assista a momentos especiais de louvor, recitais de encerramento e oficinas de nossas edições anteriores.
            </p>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum vídeo cadastrado no momento.
            </div>
          ) : (
            <div 
              className="relative group/carousel max-w-[1320px] mx-auto px-4 md:px-12"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Botão Anterior */}
              {videos.length > 3 && (
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center text-foreground shadow-md transition-all z-20 opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Grid de Vídeos (3 colunas fixo) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500">
                {getVisibleVideos().map((video) => (
                  <Card 
                    key={video.id} 
                    className="hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden glass-card group cursor-pointer border-white/10" 
                    onClick={() => setPlayingVideo(video)}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/10">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`} 
                        alt={video.titulo} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base font-bold line-clamp-1">{video.titulo}</CardTitle>
                      {video.descricao && (
                        <CardDescription className="text-xs line-clamp-2 mt-1 min-h-[2.5rem]">
                          {video.descricao}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 text-[10px] text-muted-foreground flex justify-end">
                      <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                        Assistir apresentação <Play className="w-2.5 h-2.5 text-primary" />
                      </span>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Botão Próximo */}
              {videos.length > 3 && (
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center text-foreground shadow-md transition-all z-20 opacity-0 group-hover/carousel:opacity-100 hidden md:flex"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Indicadores de Paginação / Pontos */}
              {videos.length > 3 && (
                <div className="flex justify-center gap-1.5 mt-8">
                  {videos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentStartIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentStartIndex === idx 
                          ? "bg-primary w-5" 
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Formulário de Inscrição */}
      <section id="inscricao" className="py-20 border-t relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-xl relative z-10">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-3">Inscrições</span>
            <h2 className="text-3xl font-display font-bold">Formulário de Inscrição</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Complete os passos abaixo. O pagamento garante sua vaga e camisa oficial.
            </p>
          </div>

          {/* Card Principal */}
          <Card className="glass-card shadow-2xl border-white/20 dark:border-white/10 relative overflow-hidden">
            
            {/* Barra de Progresso */}
            {step < 5 && (
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                  style={{ width: `${(getStepVisualNumber() / getStepVisualTotal()) * 100}%` }}
                ></div>
              </div>
            )}

            <CardHeader className="pt-8">
              {step < 5 && (
                <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold mb-2">
                  <span>Passo {getStepVisualNumber()} de {getStepVisualTotal()}</span>
                  <span>
                    {step === 1 && "Dados & Opção"}
                    {step === 2 && "Área de Foco"}
                    {step === 3 && "Detalhes da Camisa"}
                    {step === 4 && "Pagamento PIX"}
                  </span>
                </div>
              )}
              <CardTitle>
                {step === 1 && "Selecione seu Pacote e Dados"}
                {step === 2 && "Qual sua área de foco musical?"}
                {step === 3 && "Escolha sua Camisa Oficial"}
                {step === 4 && "Confirmação e Pagamento (PIX)"}
                {step === 5 && "Inscrição em Análise!"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Escolha o que deseja adquirir e digite seus dados básicos."}
                {step === 2 && "Selecione sua participação no Coral ou Orquestra."}
                {step === 3 && "Especifique estilo, tipo de corte e tamanho."}
                {step === 4 && "Efetue o pagamento PIX e valide os termos para concluir."}
                {step === 5 && "Seu voucher provisório está pronto. Aguarde a validação."}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                
                {/* ETAPA 1: DADOS PESSOAIS & OPÇÃO DE ENTRADA */}
                {step === 1 && (
                  <div className="space-y-5">
                    {/* Opções de Entrada */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Escolha sua Opção</Label>
                      <div className="grid grid-cols-1 gap-2.5">
                        {[
                          { 
                            id: "Inscrição + Camisa Oficial", 
                            nome: "Inscrição + Camisa Oficial", 
                            valor: "R$ 65,00", 
                            desc: "Inscrição no evento + Blusa oficial (Tulip/Clássica)." 
                          },
                          { 
                            id: "Apenas Inscrição", 
                            nome: "Apenas Inscrição", 
                            valor: "R$ 20,00", 
                            desc: "Inscrição nas oficinas, palestras e certificado." 
                          },
                          { 
                            id: "Apenas Camisa Oficial", 
                            nome: "Apenas Camisa Oficial", 
                            valor: "R$ 45,00", 
                            desc: "Blusa oficial comemorativa da IV Semana de Música." 
                          }
                        ].map((opcao) => (
                          <div
                            key={opcao.id}
                            onClick={() => handleSelectChange("opcao_escolhida", opcao.id)}
                            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none flex flex-col justify-between ${
                              formData.opcao_escolhida === opcao.id
                                ? "bg-primary/10 border-primary shadow-sm"
                                : "hover:bg-secondary/40 border-input"
                            }`}
                          >
                            <div className="flex justify-between items-center w-full mb-1">
                              <span className="font-bold text-sm">{opcao.nome}</span>
                              <span className="font-mono text-primary font-bold text-sm">{opcao.valor}</span>
                            </div>
                            <span className="text-xs text-muted-foreground leading-snug">{opcao.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input 
                        id="nome" 
                        name="nome" 
                        placeholder="Digite seu nome completo" 
                        value={formData.nome} 
                        onChange={handleInputChange} 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="exemplo@email.com" 
                          value={formData.email} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefone">WhatsApp / Telefone</Label>
                        <Input 
                          id="telefone" 
                          name="telefone" 
                          placeholder="(88) 99999-9999" 
                          value={formData.telefone} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                        <Input 
                          id="data_nascimento" 
                          name="data_nascimento" 
                          type="date" 
                          value={formData.data_nascimento} 
                          onChange={handleInputChange} 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hospedagem">Precisa de Hospedagem?</Label>
                        <Select
                          value={formData.hospedagem}
                          onValueChange={(val) => handleSelectChange("hospedagem", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border text-foreground">
                            <SelectItem value="Sim" className="hover:bg-accent focus:bg-accent">Sim, preciso de abrigo</SelectItem>
                            <SelectItem value="Não" className="hover:bg-accent focus:bg-accent">Não, tenho local próprio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input 
                          id="cidade" 
                          name="cidade" 
                          value={formData.cidade} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado</Label>
                        <Input 
                          id="estado" 
                          name="estado" 
                          value={formData.estado} 
                          maxLength={2} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="igreja">Igreja / Congregação (Opcional)</Label>
                      <Input 
                        id="igreja" 
                        name="igreja" 
                        placeholder="Nome da igreja que você congrega" 
                        value={formData.igreja} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                )}

                {/* ETAPA 2: DETALHES DE PARTICIPAÇÃO (Coral vs Orquestra) */}
                {step === 2 && (
                  <div className="space-y-5">
                    {/* Coral vs Orquestra Toggle */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Como deseja participar?</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: "Coral", nome: "Coral de Vozes", desc: "Soprano, Contralto, Tenor, Baixo" },
                          { id: "Orquestra", nome: "Orquestra de Instrumentos", desc: "Violino, Viola, Sopros, Metais, etc." }
                        ].map((t) => (
                          <div 
                            key={t.id}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                tipo_participacao: t.id,
                                detalhe_participacao: "" // Reset
                              }));
                            }}
                            className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-200 select-none ${
                              formData.tipo_participacao === t.id
                                ? "bg-primary text-white border-primary shadow-md"
                                : "hover:bg-secondary border-input"
                            }`}
                          >
                            <span className="font-bold text-sm block">{t.nome}</span>
                            <span className="text-[10px] opacity-80 block mt-0.5">{t.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sub-itens baseados no tipo de participação */}
                    {formData.tipo_participacao === "Coral" ? (
                      <div className="space-y-2">
                        <Label>Selecione o seu Naipe Vocal</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {["Soprano", "Contralto", "Tenor", "Baixo", "Não sei"].map((naipe) => (
                            <div 
                              key={naipe}
                              onClick={() => handleSelectChange("detalhe_participacao", naipe)}
                              className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all duration-150 text-xs font-semibold select-none ${
                                formData.detalhe_participacao === naipe 
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "hover:bg-secondary/60 border-input"
                              }`}
                            >
                              {naipe}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="detalhe_participacao">Selecione seu Instrumento</Label>
                        <Select 
                          value={formData.detalhe_participacao} 
                          onValueChange={(val) => handleSelectChange("detalhe_participacao", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu instrumento..." />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border text-foreground">
                            {[
                              "Violino I", "Violino II", "Viola", "Violoncelo", 
                              "Contrabaixo", "Flauta", "Clarinete", 
                              "Saxofone", "Trompete", "Trombone", "Outro"
                            ].map((inst) => (
                              <SelectItem key={inst} value={inst} className="hover:bg-accent focus:bg-accent">
                                {inst}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="descricao_experiencia">Experiência Musical (Opcional)</Label>
                      <textarea
                        id="descricao_experiencia"
                        name="descricao_experiencia"
                        placeholder="Conte um pouco se você já canta/toca em alguma igreja, há quanto tempo, ou se está iniciando do zero."
                        value={formData.descricao_experiencia}
                        onChange={handleInputChange}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* ETAPA 3: DETALHES DA CAMISA (Tulip / Clássica) */}
                {step === 3 && (
                  <div className="space-y-5">
                    {/* Estilo da Blusa */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Selecione o Estilo da Blusa</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: "Azul Royal - OFICIAL", nome: "Azul Royal (OFICIAL)", desc: "Cor Azul Royal com estampa branca", hex: "#1E3E8C" },
                          { id: "Azul Marinho - OFICIAL", nome: "Azul Marinho (OFICIAL)", desc: "Cor Azul Marinho com estampa branca", hex: "#0F2D59" }
                        ].map((estilo) => (
                          <div
                            key={estilo.id}
                            onClick={() => handleSelectChange("camisa_estilo", estilo.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 text-left select-none flex flex-col justify-between ${
                              formData.camisa_estilo === estilo.id
                                ? "bg-primary/10 border-primary shadow-sm"
                                : "hover:bg-secondary/40 border-input"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: estilo.hex }} />
                              <span className="font-bold text-sm">{estilo.nome}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{estilo.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tipo/Corte de Camisa */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Tipo de Modelagem</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: "Masculino", nome: "Masculino / Tradicional" },
                          { id: "Feminino (Baby Look)", nome: "Feminino (Baby Look)" }
                        ].map((corte) => (
                          <div
                            key={corte.id}
                            onClick={() => handleSelectChange("camisa_tipo", corte.id)}
                            className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all duration-150 text-xs font-semibold select-none ${
                              formData.camisa_tipo === corte.id
                                ? "bg-primary/20 border-primary text-primary"
                                : "hover:bg-secondary border-input"
                            }`}
                          >
                            {corte.nome}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tamanho da Blusa */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Tamanho da Blusa</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {["PP", "P", "M", "G", "GG", "XG"].map((tam) => (
                          <div
                            key={tam}
                            onClick={() => handleSelectChange("camisa_tamanho", tam)}
                            className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all duration-150 text-xs font-bold select-none ${
                              formData.camisa_tamanho === tam
                                ? "bg-primary text-white border-primary"
                                : "hover:bg-secondary border-input"
                            }`}
                          >
                            {tam}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Observações da Camisa */}
                    <div className="space-y-2">
                      <Label htmlFor="camisa_obs">Observações / Tamanho Especial (Opcional)</Label>
                      <Input 
                        id="camisa_obs" 
                        name="camisa_obs" 
                        placeholder="Ex: Blusa infantil (Tamanho 10), mangas mais compridas..." 
                        value={formData.camisa_obs} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                )}

                {/* ETAPA 4: PAGAMENTO PIX & CONCORDÂNCIA */}
                {step === 4 && (
                  <div className="space-y-5">
                    {/* Resumo da Inscrição */}
                    <div className="p-4 bg-secondary/50 rounded-xl border text-xs space-y-2">
                      <h4 className="font-bold text-sm border-b pb-1 mb-1">Resumo do Pedido</h4>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inscrito:</span> <span className="font-bold">{formData.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Opção Escolhida:</span> <span className="font-bold">{formData.opcao_escolhida}</span>
                      </div>
                      {hasParticipation(formData.opcao_escolhida) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Foco:</span> <span className="font-bold">{formData.tipo_participacao} ({formData.detalhe_participacao || "Não definido"})</span>
                        </div>
                      )}
                      {hasShirt(formData.opcao_escolhida) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Camisa:</span> <span className="font-bold">{formData.camisa_estilo} ({formData.camisa_tipo} - {formData.camisa_tamanho})</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Precisa de Hospedagem:</span> <span className="font-bold">{formData.hospedagem}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-1">
                        <span className="text-muted-foreground font-semibold text-sm">Valor Total:</span> 
                        <span className="font-bold text-primary text-base font-mono">R$ {getValorTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    {/* QR Code PIX */}
                    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
                      <div className="w-40 h-40 bg-zinc-50 p-2.5 rounded-xl border flex items-center justify-center relative">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                          <QrCode className="w-24 h-24" />
                        </div>
                        <svg className="w-full h-full text-zinc-900" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="0" y="0" width="22" height="22" />
                          <rect x="6" y="6" width="10" height="10" fill="white" />
                          <rect x="0" y="78" width="22" height="22" />
                          <rect x="6" y="84" width="10" height="10" fill="white" />
                          <rect x="78" y="0" width="22" height="22" />
                          <rect x="84" y="6" width="10" height="10" fill="white" />
                          <rect x="35" y="10" width="8" height="8" />
                          <rect x="50" y="15" width="15" height="6" />
                          <rect x="35" y="35" width="12" height="12" />
                          <rect x="15" y="45" width="8" height="18" />
                          <rect x="55" y="35" width="10" height="25" />
                          <rect x="75" y="45" width="15" height="10" />
                          <rect x="35" y="60" width="10" height="10" />
                          <rect x="45" y="78" width="12" height="15" />
                          <rect x="70" y="70" width="20" height="20" />
                          <rect x="76" y="76" width="8" height="8" fill="white" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">
                        Escaneie para Pagar
                      </span>
                    </div>

                    {/* Copia e Cola */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Chave PIX Copia e Cola:</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value={CHAVE_PIX} 
                          className="font-mono text-xs h-9 bg-secondary/30 select-all"
                        />
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="outline" 
                          onClick={handleCopyPix}
                          className="h-9 w-9 shrink-0 active:scale-95"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Termo de Consentimento */}
                    <div className="flex items-start space-x-2.5 pt-2">
                      <input 
                        type="checkbox" 
                        id="consent" 
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary mt-0.5 cursor-pointer"
                      />
                      <label htmlFor="consent" className="text-xs text-muted-foreground leading-normal cursor-pointer select-none">
                        Autorizo o uso de minha imagem e voz gravados em fotos ou vídeos da IV Semana de Música Cristã de Jijoca para divulgação de futuras edições e atividades da Igreja IBJJ.
                      </label>
                    </div>

                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex gap-2 items-start text-xs text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        Realize o PIX e clique em <strong>Concluir Inscrição</strong>. Sua inscrição entrará em análise e será confirmada após conciliação bancária da nossa equipe.
                      </span>
                    </div>
                  </div>
                )}

                {/* ETAPA 5: ANÁLISE / VOUCHER COMPLETO */}
                {step === 5 && inscricaoConfirmada && (
                  <div className="space-y-6">
                    {/* Mensagem Principal */}
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1 animate-pulse">
                        <Clock className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-primary">Inscrição em análise</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Será enviado um e-mail com a confirmação da sua inscrição assim que validarmos o pagamento do PIX de <strong>R$ {inscricaoConfirmada.valor_total.toFixed(2)}</strong>.
                      </p>
                    </div>

                    {/* Voucher de Inscrição */}
                    <div id="voucher-print" className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-6 text-zinc-900 dark:text-zinc-50 shadow-md relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent"></div>
                      
                      <div className="text-center border-b pb-4 space-y-2">
                        <div className="flex items-center justify-center gap-4">
                          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                          <div className="bg-white p-1 rounded border border-zinc-200 inline-block">
                            <img src="/logo-igreja.png" alt="Igreja Bíblica de Jijoca" className="h-10 object-contain" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-base leading-tight">IV Semana de Música Cristã</h3>
                          <p className="text-[10px] text-zinc-500">Realização: Igreja Bíblica de Jijoca</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                        <div>
                          <span className="text-zinc-400 block font-semibold text-[9px] uppercase tracking-wider">INSCRITO</span>
                          <span className="font-bold text-sm block truncate">{inscricaoConfirmada.nome}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-400 block font-semibold text-[9px] uppercase tracking-wider">CÓDIGO</span>
                          <span className="font-mono font-bold text-sm text-primary">#{inscricaoConfirmada.id}</span>
                        </div>

                        <div>
                          <span className="text-zinc-400 block font-semibold text-[9px] uppercase tracking-wider">OPÇÃO ADQUIRIDA</span>
                          <span className="font-bold block">{inscricaoConfirmada.opcao_escolhida}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-zinc-400 block font-semibold text-[9px] uppercase tracking-wider">VALOR TOTAL</span>
                          <span className="font-bold block text-primary font-mono">R$ {inscricaoConfirmada.valor_total.toFixed(2)}</span>
                        </div>

                        {hasParticipation(inscricaoConfirmada.opcao_escolhida) && (
                          <>
                            <div>
                              <span className="text-zinc-400 block font-semibold text-[9px] uppercase tracking-wider">PARTICIPAÇÃO</span>
                              <span className="font-bold block">{inscricaoConfirmada.tipo_participacao}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-zinc-400 block font-semibold text-[9px] uppercase tracking-wider">FOCO / DETALHE</span>
                              <span className="font-bold block">{inscricaoConfirmada.detalhe_participacao || "Não definido"}</span>
                            </div>
                          </>
                        )}

                        {hasShirt(inscricaoConfirmada.opcao_escolhida) && (
                          <>
                            <div>
                              <span className="text-zinc-400 block font-semibold text-[9px] uppercase tracking-wider">BLUSA (ESTILO/TIPO)</span>
                              <span className="font-bold block text-[11px] truncate">{inscricaoConfirmada.camisa_estilo} ({inscricaoConfirmada.camisa_tipo})</span>
                            </div>
                            <div className="text-right">
                              <span className="text-zinc-400 block font-semibold text-[9px] uppercase tracking-wider">TAMANHO</span>
                              <span className="font-bold block">{inscricaoConfirmada.camisa_tamanho}</span>
                            </div>
                          </>
                        )}

                        <div className="col-span-2">
                          <span className="text-zinc-400 block font-semibold text-[9px] uppercase tracking-wider">HOSPEDAGEM</span>
                          <span className="font-bold block">{inscricaoConfirmada.hospedagem === "Sim" ? "Precisa de Hospedagem (Solicitado)" : "Não precisa de Hospedagem"}</span>
                        </div>

                        <div className="col-span-2 pt-2.5 border-t flex justify-between items-center text-[10px]">
                          <span>DATA: 07 a 13 de Setembro de 2026</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400 uppercase">AGUARDANDO VALIDAÇÃO DO PIX</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center pt-2">
                        <div className="w-20 h-20 bg-zinc-100 p-2 rounded-lg border flex items-center justify-center">
                          <svg className="w-full h-full text-zinc-800" viewBox="0 0 100 100" fill="currentColor">
                            <rect x="0" y="0" width="20" height="20" />
                            <rect x="0" y="80" width="20" height="20" />
                            <rect x="80" y="0" width="20" height="20" />
                            <rect x="25" y="25" width="10" height="10" />
                            <rect x="45" y="10" width="10" height="30" />
                            <rect x="10" y="45" width="30" height="10" />
                            <rect x="65" y="45" width="25" height="10" />
                            <rect x="45" y="65" width="10" height="25" />
                            <rect x="65" y="65" width="20" height="20" />
                          </svg>
                        </div>
                        <span className="text-[8px] text-zinc-400 font-semibold mt-2 uppercase tracking-widest text-center">
                          Apresente este código no credenciamento <br /> ou verifique seu e-mail
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>

              <CardFooter className="flex justify-between border-t pt-4">
                {step === 1 && (
                  <>
                    <div></div>
                    <Button type="button" onClick={nextStep} className="flex items-center gap-1">
                      Avançar <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <Button type="button" variant="outline" onClick={prevStep} className="flex items-center gap-1">
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                    <Button type="button" onClick={nextStep} className="flex items-center gap-1">
                      Avançar <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {step === 3 && (
                  <>
                    <Button type="button" variant="outline" onClick={prevStep} className="flex items-center gap-1">
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                    <Button type="button" onClick={nextStep} className="flex items-center gap-1">
                      Avançar <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {step === 4 && (
                  <>
                    <Button type="button" variant="outline" onClick={prevStep} className="flex items-center gap-1">
                      <ArrowLeft className="w-4 h-4" /> Voltar
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 flex items-center gap-1">
                      {loading ? "Processando..." : "Concluir Inscrição"}
                    </Button>
                  </>
                )}

                {step === 5 && (
                  <>
                    <Button type="button" variant="outline" onClick={() => {
                      setStep(1);
                      setFormData({
                        nome: "",
                        email: "",
                        telefone: "",
                        data_nascimento: "",
                        cidade: "Jijoca de Jericoacoara",
                        estado: "CE",
                        igreja: "",
                        hospedagem: "Não",
                        opcao_escolhida: "Inscrição + Camisa Oficial",
                        tipo_participacao: "Coral",
                        detalhe_participacao: "",
                        descricao_experiencia: "",
                        camisa_estilo: "Azul Royal - OFICIAL",
                        camisa_tipo: "Masculino",
                        camisa_tamanho: "M",
                        camisa_obs: "",
                        instrumento_oficina: "",
                        nivel_experiencia: "",
                      });
                      setConsent(false);
                      setInscricaoConfirmada(null);
                    }} className="w-full sm:w-auto">
                      Nova Inscrição
                    </Button>
                    <Button type="button" onClick={printVoucher} className="w-full sm:w-auto flex items-center justify-center gap-2">
                      <Printer className="w-4 h-4" />
                      Imprimir Comprovante
                    </Button>
                  </>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="font-display font-bold text-white text-base">IV Semana de Música</span>
              </div>
              <p className="text-xs text-zinc-500">
                Uma realização voluntária das igrejas evangélicas de Jijoca de Jericoacoara - CE. Dedicado à capacitação e adoração.
              </p>
              <div className="pt-4 border-t border-zinc-800/60 mt-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2">Realização Oficial</span>
                <div className="bg-white p-3 rounded-xl inline-block shadow-md hover:scale-[1.03] transition-all duration-200 border border-zinc-200">
                  <img src="/logo-igreja.png" alt="Igreja Bíblica de Jijoca" className="h-10 object-contain" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Informações</h4>
              <p className="text-xs flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> 07 a 13 de Setembro de 2026</p>
              <p className="text-xs flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Jijoca de Jericoacoara, Ceará</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-sm">Contato / Dúvidas</h4>
              <p className="text-xs flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> contato@semanademusicajijoca.com.br</p>
              <p className="text-xs flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> (88) 99999-1234</p>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-xs text-zinc-600">
            <p>© {new Date().getFullYear()} IV Semana de Música Cristã de Jijoca. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Lightbox do Player de Vídeo */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300" onClick={() => setPlayingVideo(null)}>
          <div className="relative w-full max-w-4xl bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setPlayingVideo(null)} 
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors text-lg font-bold"
            >
              ×
            </button>
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500 fill-current" />
              <h3 className="font-semibold text-lg line-clamp-1 pr-10 text-white">{playingVideo.titulo}</h3>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${playingVideo.youtube_id}?autoplay=1`}
                title={playingVideo.titulo}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            {playingVideo.descricao && (
              <div className="p-4 bg-zinc-950/40">
                <p className="text-sm text-zinc-400">{playingVideo.descricao}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
