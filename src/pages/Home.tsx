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
  Lock,
  Database,
  Printer,
  QrCode,
  Copy,
  Youtube,
  Play,
  ChevronLeft,
  ChevronRight,
  Info,
  Heart,
  Shirt,
  Download,
  Coffee,
  Mic2,
  Church,
  CalendarDays,
  MicVocal,
  Guitar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function Home() {
  // Configurações Pix
  const [paymentSettings, setPaymentSettings] = useState({
    pix_inscricao: "pix@semanademusicajijoca.com.br",
    pix_inscricao_blusa: "pix@semanademusicajijoca.com.br",
    pix_inscricao_familia: "pix@semanademusicajijoca.com.br",
    pix_inscricao_blusa_familia: "pix@semanademusicajijoca.com.br",
    pix_blusa: "pix@semanademusicajijoca.com.br",
    cartao_inscricao: "",
    cartao_inscricao_blusa: "",
    cartao_blusa: ""
  });

  React.useEffect(() => {
    const saved = localStorage.getItem("payment_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Fallbacks caso os valores venham vazios do painel
      setPaymentSettings({
        pix_inscricao: parsed.pix_inscricao || "pix@semanademusicajijoca.com.br",
        pix_inscricao_blusa: parsed.pix_inscricao_blusa || "pix@semanademusicajijoca.com.br",
        pix_inscricao_familia: parsed.pix_inscricao_familia || "pix@semanademusicajijoca.com.br",
        pix_inscricao_blusa_familia: parsed.pix_inscricao_blusa_familia || "pix@semanademusicajijoca.com.br",
        pix_blusa: parsed.pix_blusa || "pix@semanademusicajijoca.com.br",
        cartao_inscricao: parsed.cartao_inscricao || "",
        cartao_inscricao_blusa: parsed.cartao_inscricao_blusa || "",
        cartao_blusa: parsed.cartao_blusa || ""
      });
    }
  }, []);

  const getCurrentPixKey = () => {
    const op = formData.opcao_escolhida;
    const isFamilia = formData.membro_familia === "Sim" && formData.membro_principal.length > 2;
    if (op === "Apenas Camisa Oficial") return paymentSettings.pix_blusa;
    if (op.includes("Camisa Oficial")) return isFamilia ? paymentSettings.pix_inscricao_blusa_familia : paymentSettings.pix_inscricao_blusa;
    return isFamilia ? paymentSettings.pix_inscricao_familia : paymentSettings.pix_inscricao;
  };

  const getCurrentCartaoLink = () => {
    const op = formData.opcao_escolhida;
    if (op === "Apenas Camisa Oficial") return paymentSettings.cartao_blusa;
    if (op.includes("Camisa Oficial")) return paymentSettings.cartao_inscricao_blusa;
    return paymentSettings.cartao_inscricao;
  };

  // Estados do formulário de inscrição
  const [step, setStep] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState("PIX");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    data_nascimento: "",
    cidade: "Jijoca de Jericoacoara",
    estado: "CE",
    igreja: "",
    hospedagem: "Não",
    membro_familia: "Não",
    membro_principal: "",
    opcao_escolhida: "Primeiro Lote", // Default
    tipo_participacao: "Coral",
    detalhe_participacao: "",
    descricao_experiencia: "",
    camisa_estilo: "Verde",
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
      let localVideos = JSON.parse(localStorage.getItem("videos_apresentacao") || "[]");
      
      // Limpa os vídeos antigos do localStorage se contiverem os IDs falsificados/inválidos
      if (localVideos.some((v: any) => v.youtube_id === "A2vEv2d34aY")) {
        localVideos = [];
        localStorage.removeItem("videos_apresentacao");
      }

      if (localVideos.length > 0) {
        setVideos(localVideos);
      } else {
        // Vídeos reais padrão (Gaither Vocal Band e Handel Hallelujah Chorus)
        const defaultVideos = [
          {
            id: "default-1",
            titulo: "Because He Lives - Gaither Vocal Band",
            descricao: "Execução emocionante e inspiradora do hino clássico 'Because He Lives'.",
            url: "https://www.youtube.com/watch?v=wX-b4hT-w0s",
            youtube_id: "wX-b4hT-w0s",
            created_at: new Date().toISOString()
          },
          {
            id: "default-2",
            titulo: "Handel - Hallelujah Chorus (Virtual Choir)",
            descricao: "Apresentação clássica e grandiosa do Coro do Tabernáculo com mais de 2.000 vozes virtuais.",
            url: "https://www.youtube.com/watch?v=VI6dsMeABpU",
            youtube_id: "VI6dsMeABpU",
            created_at: new Date().toISOString()
          },
          {
            id: "default-3",
            titulo: "Because He Lives - Gaither Vocal Band (Live)",
            descricao: "Interpretação ao vivo do clássico de louvor e adoração.",
            url: "https://www.youtube.com/watch?v=Jm0j10S-k7Q",
            youtube_id: "Jm0j10S-k7Q",
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
    return opcao.includes("Lote") || opcao === "Apenas Inscrição" || opcao === "Inscrição + Camisa Oficial";
  };

  const hasShirt = (opcao: string) => {
    return opcao.includes("Camisa");
  };

  // Obter valor total baseado na opção escolhida
  const getValorTotal = () => {
    let baseValue = 0;
    if (formData.opcao_escolhida === "Primeiro Lote") baseValue = 110;
    else if (formData.opcao_escolhida === "Primeiro Lote + Camisa Oficial") baseValue = 155;
    else if (formData.opcao_escolhida === "Apenas Camisa Oficial") baseValue = 45;
    else if (formData.opcao_escolhida === "Segundo Lote") baseValue = 120;
    else if (formData.opcao_escolhida === "Terceiro Lote") baseValue = 130;
    
    // Promoção Família: R$ 10 de desconto se for o 2º ou mais membro
    if (formData.membro_familia === "Sim" && baseValue > 10) {
      baseValue -= 10;
    }
    return baseValue;
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
      
      if (hasParticipation(formData.opcao_escolhida)) {
        if (!formData.data_nascimento) return "Data de nascimento é obrigatória.";
        if (!formData.cidade.trim()) return "Cidade é obrigatória.";
        if (!formData.estado.trim()) return "Estado é obrigatório.";
        if (formData.membro_familia === "Sim" && !formData.membro_principal.trim()) return "Informe o nome do membro principal da família.";
      }
    }
    if (step === 2) {
      if (hasParticipation(formData.opcao_escolhida)) {
        if (!formData.tipo_participacao) return "Selecione como deseja participar.";
        if (!formData.detalhe_participacao) {
          return formData.tipo_participacao === "Coral" 
            ? "Selecione o seu naipe vocal." 
            : "Selecione o seu instrumento.";
        }
        if (!formData.descricao_experiencia.trim()) return "Conte um pouco sobre sua experiência musical.";
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
    navigator.clipboard.writeText(getCurrentPixKey());
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
      nome: formData.membro_familia === "Sim" 
        ? `${formData.nome} (Família de: ${formData.membro_principal})`
        : formData.nome,
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
    <div className="min-h-screen bg-[#F5F3EE] text-foreground transition-colors duration-300 relative">
      {/* Background Fixo Global (Textura Partitura) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src="/bg-partitura.png" 
          alt="Textura Partitura" 
          className="absolute left-0 top-0 w-full md:w-[70%] h-full object-cover opacity-[0.40] mix-blend-multiply"
          style={{ maskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)", WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)" }}
        />
      </div>
      {/* Header */}
      {/* Header (80px height) */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md h-[80px] flex items-center">
        <div className="container mx-auto px-4 lg:px-[120px] flex items-center justify-between w-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("home")}>
            {/* Logo com máscara CSS para pegar a exata cor 'primary' do tema */}
            <div className="w-10 h-10 bg-[#6B705C]" style={{ maskImage: "url(/logo.png)", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center", WebkitMaskImage: "url(/logo.png)", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center" }} aria-label="Logo"></div>
            <div>
              <span className="font-display font-bold text-sm sm:text-base leading-tight block text-[#5E654C]">
                IV Semana de Música Cristã de Jijoca
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6B705C]">
            <button onClick={() => scrollToSection("sobre")} className="hover:text-[#5E654C] transition-colors">Sobre</button>
            <button onClick={() => scrollToSection("cronograma")} className="hover:text-[#5E654C] transition-colors">Programação</button>
            <button onClick={() => scrollToSection("oficinas")} className="hover:text-[#5E654C] transition-colors">Oficinas</button>
            <button onClick={() => scrollToSection("videos")} className="hover:text-[#5E654C] transition-colors">Vídeos</button>
            <button onClick={() => scrollToSection("inscricao")} className="hover:text-[#5E654C] transition-colors">Inscrição</button>
          </nav>

          <div className="flex items-center gap-3">
            <Button onClick={() => scrollToSection("inscricao")} className="bg-[#5E654C] hover:bg-[#5E654C]/90 text-white h-10 rounded-full px-6">
              Inscrever-se
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden print:hidden">
        {/* Imagem de Fundo Consolidada (Art Direction para Mobile e Desktop) */}
        <div className="absolute inset-0 z-0">
          <img src="/hero-definitivo..jpeg" alt="Background Paisagem Desktop" className="hidden md:block w-full h-full object-cover object-[30%_center] opacity-100 transition-transform duration-[20s] hover:scale-105 ease-out" />
          <img src="/hero-mobile.png" alt="Background Paisagem Mobile" className="block md:hidden w-full h-full object-cover object-bottom opacity-100 transition-transform duration-[20s] hover:scale-105 ease-out" />
        </div>

        {/* O uso do lg:px-[120px] alinha o texto ESQUERDO milimetricamente com a logo do cabeçalho! */}
        <div className="container mx-auto px-4 lg:px-[120px] relative z-20">
          <div className="max-w-[500px] lg:max-w-[550px] xl:max-w-[650px] text-left mt-[-5vh] md:mt-8">
            
            {/* Badge */}
            <div className="mb-4 md:mb-5 lg:mb-6 animate-fade-in">
              <span className="inline-flex items-center px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-[10px] lg:text-[11px] font-semibold tracking-widest text-[#6B705C] bg-[#F5F3EE] shadow-sm border border-[#6B705C]/10">
                IV EDIÇÃO • 07 A 13 DE SETEMBRO
              </span>
            </div>
            
            {/* Logo Permanecei Nele */}
            <div className="mb-3 md:mb-6 lg:mb-6 animate-fade-in [animation-delay:100ms] -ml-1">
              <img 
                src="/logo-permanecei.png" 
                alt="Permanecei Nele" 
                className="w-auto h-[170px] sm:h-[190px] md:h-[180px] lg:h-[220px] xl:h-[260px] max-w-full object-contain object-left mix-blend-multiply"
              />
            </div>
            
            {/* Referência Bíblica */}
            <div className="flex items-center gap-3 lg:gap-4 mb-3 md:mb-4 animate-fade-in [animation-delay:200ms]">
              <div className="h-px w-6 lg:w-8 bg-[#6B705C]/60"></div>
              <p className="text-[#6B705C] font-bold tracking-[0.3em] lg:tracking-[0.4em] uppercase text-xs lg:text-sm">1 JOÃO</p>
            </div>

            {/* Texto de apoio */}
            <p className="font-sans max-w-[260px] md:max-w-none text-base md:text-lg lg:text-[22px] xl:text-[24px] leading-[1.4] text-[#6B705C] mb-6 md:mb-8 animate-fade-in [animation-delay:300ms] font-normal">
              Uma semana para crescer em louvor, adoração e comunhão, para a glória de Deus.
            </p>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in [animation-delay:400ms]">
              <Button 
                onClick={() => scrollToSection("inscricao")} 
                className="h-[50px] lg:h-[55px] w-full sm:w-[220px] lg:w-[240px] rounded-[14px] bg-[#5E654C] hover:bg-[#4A503A] text-white text-base lg:text-lg font-medium shadow-xl shadow-[#5E654C]/20 transition-all hover:-translate-y-1"
              >
                Quero Participar <ArrowRight className="w-4 lg:w-5 h-4 lg:h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => scrollToSection("cronograma")} 
                className="h-[50px] lg:h-[55px] w-full sm:w-[200px] lg:w-[220px] rounded-[14px] bg-white/80 backdrop-blur-sm border-[#E5E7EB] text-[#6B705C] text-base lg:text-lg font-medium hover:bg-white hover:text-[#5E654C] transition-all hover:-translate-y-1"
              >
                Ver Programação
              </Button>
            </div>
          </div>
        </div>

        {/* Mouse Scroll Indicator do Mockup */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center animate-bounce opacity-70 hidden sm:flex cursor-pointer" onClick={() => scrollToSection("sobre")}>
          <div className="w-[28px] h-[42px] rounded-full border-[1.5px] border-[#6B705C] flex justify-center p-1.5 mb-1.5">
            <div className="w-1 h-2.5 rounded-full bg-[#6B705C] animate-pulse"></div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B705C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </section>

      {/* Sobre o Evento e Valores */}
      <section id="sobre" className="py-24 relative overflow-hidden bg-[#FDFBF7] print:hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Coluna Esquerda - Texto */}
            <div className="pl-4 md:pl-8">
              <div className="relative">
                <span className="absolute -top-6 -left-6 md:-top-10 md:-left-12 text-6xl md:text-8xl font-serif text-[#B38C53] opacity-60 leading-none">“</span>
                <h2 className="text-3xl md:text-[2.75rem] leading-[1.2] md:leading-[1.1] font-serif font-bold mb-6 text-[#2E3B2A] tracking-tight relative z-10">
                  Louvem ao Senhor,<br/>todas as nações;<br/>exaltem-no, todos os<br/>povos!
                </h2>
              </div>
              
              <div className="flex items-center gap-4 mb-8 mt-4">
                <div className="w-12 h-[1px] bg-[#B38C53]"></div>
                <span className="text-[#B38C53] font-medium text-lg">Salmo 117.1</span>
              </div>
              
              <p className="text-[#4D5A42] text-[15px] mb-6 leading-[1.7]">
                Comprometida com a reverência e a excelência na adoração ao Senhor, a Igreja Bíblica de Jijoca promove anualmente a Semana de Música Cristã. Nosso objetivo é incentivar músicos e coralistas a buscarem o aperfeiçoamento de suas habilidades por meio de um repertório focado em cânticos saudáveis e arranjos vocais e instrumentais, oferecendo ao Senhor uma adoração genuína e bela.
              </p>
              
              <p className="text-[#4D5A42] text-[15px] mb-12 leading-[1.7]">
                Nesta edição, uniremos a teoria à prática, abordando temas teológicos que fundamentam a adoração e promovem o crescimento espiritual. Nossa semana culminará em um grande concerto de encerramento, reunindo nossa orquestra e o grande coral.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-[#2E3B2A] flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-[#2E3B2A]" strokeWidth={2} />
                  </div>
                  <span className="text-xs text-[#2E3B2A] font-medium leading-tight max-w-[100px]">Aulas práticas coletivas com especialistas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-[#2E3B2A] flex items-center justify-center shrink-0">
                    <Printer className="w-4 h-4 text-[#2E3B2A]" strokeWidth={2} />
                  </div>
                  <span className="text-xs text-[#2E3B2A] font-medium leading-tight max-w-[100px]">Material didático de apoio impresso</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-[#2E3B2A] flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4 text-[#2E3B2A]" strokeWidth={2} />
                  </div>
                  <span className="text-xs text-[#2E3B2A] font-medium leading-tight max-w-[100px]">Recital de encerramento no último dia</span>
                </div>
              </div>
            </div>

            {/* Coluna Direita - Valores */}
            <div className="relative">
              <div className="bg-[#FCFAF8] p-5 sm:p-8 md:p-12 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-[#E8E4D9]">
                
                {/* Header do Card */}
                <div className="flex flex-col items-center mb-10">
                  <div className="w-12 h-12 rounded-full border-2 border-[#B38C53] flex items-center justify-center mb-6">
                    <Music className="w-5 h-5 text-[#B38C53]" strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center w-full justify-center gap-3 sm:gap-6">
                    <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-[#B38C53] to-transparent"></div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2E3B2A] text-center">Valores da Edição IV</h3>
                    <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-[#B38C53] to-transparent"></div>
                  </div>
                  <div className="mt-3 text-[#B38C53]">
                     {/* Leaf decoration simple svg */}
                     <svg width="40" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6C23 6 25 3 25 3C25 3 24 8 20 8C16 8 15 3 15 3C15 3 17 6 20 6Z" fill="currentColor"/>
                        <path d="M12 7C14 7 16 5 16 5C16 5 15 9 12 9C9 9 8 5 8 5C8 5 10 7 12 7Z" fill="currentColor"/>
                        <path d="M28 7C25 7 23 5 23 5C23 5 24 9 28 9C31 9 32 5 32 5C32 5 30 7 28 7Z" fill="currentColor"/>
                        <path d="M5 8.5C7 8.5 8 7 8 7C8 7 7 10.5 5 10.5C3 10.5 2 7 2 7C2 7 3 8.5 5 8.5Z" fill="currentColor"/>
                        <path d="M35 8.5C33 8.5 32 7 32 7C32 7 33 10.5 35 10.5C37 10.5 38 7 38 7C38 7 37 8.5 35 8.5Z" fill="currentColor"/>
                        <rect x="18" y="7" width="4" height="1" fill="currentColor"/>
                     </svg>
                  </div>
                </div>

                {/* Lista de Valores */}
                <div className="space-y-3">
                  
                  {/* Item 1 */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center bg-white p-4 rounded-xl border border-[#E8E4D9]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#5C6652] text-white flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#2E3B2A] font-bold text-sm">Apenas Inscrição</span>
                        <span className="text-[#2E3B2A] text-xs">(1º Lote – até 31/07)</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#4D5A42] self-end sm:self-auto">R$ 110,00</span>
                  </div>



                  {/* Item 3 */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E8E4D9]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#5C6652] text-white flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#2E3B2A] font-bold text-sm">Apenas Inscrição</span>
                        <span className="text-[#2E3B2A] text-xs">(2º Lote – até 23/08)</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#4D5A42] whitespace-nowrap">R$ 120,00</span>
                  </div>

                  {/* Item 4 */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E8E4D9]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#5C6652] text-white flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#2E3B2A] font-bold text-sm">Apenas Inscrição</span>
                        <span className="text-[#2E3B2A] text-xs">(3º Lote – a partir de 24/08)</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#4D5A42] whitespace-nowrap">R$ 130,00</span>
                  </div>

                  {/* Item 5 */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E8E4D9]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#5C6652] text-white flex items-center justify-center shrink-0">
                        <Shirt className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#2E3B2A] font-bold text-sm">Apenas Camisa Oficial</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#4D5A42] whitespace-nowrap">R$ 45,00</span>
                  </div>

                </div>
              </div>
            </div>

          </div>

          {/* Seção Exclusiva de Promoções */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-primary block mb-3">Vantagens</span>
              <h2 className="text-3xl font-display font-bold">Promoções Especiais</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {/* Card Promoção Família */}
              <div className="glass-card p-6 rounded-3xl border-l-4 border-l-primary relative overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  R$ 10 de Desconto
                </div>
                <h3 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Promoção Família
                </h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Traga sua família para louvar a Deus junto com você! O segundo membro da família (e os seguintes) ganham <strong>R$ 10,00 de desconto</strong> na inscrição. <span className="block mt-1 text-xs opacity-80">(Válido somente para Cônjuges, Filhos e Irmãos. Exclusivo para pagamentos via PIX)</span>
                </p>
                
                <div className="bg-white/40 dark:bg-black/10 rounded-xl p-4 border border-border/50">
                  <h4 className="text-xs font-bold uppercase text-primary mb-3">Como participar:</h4>
                  <ol className="space-y-3 text-xs text-muted-foreground relative border-l-2 border-primary/20 ml-2 pl-4">
                    <li className="relative">
                      <span className="absolute -left-[23px] top-0 bg-background border-2 border-primary/50 text-primary w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold">1</span>
                      O 1º membro da família faz a inscrição <strong className="text-foreground">normalmente</strong>.
                    </li>
                    <li className="relative">
                      <span className="absolute -left-[23px] top-0 bg-background border-2 border-primary/50 text-primary w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold">2</span>
                      Os demais membros acessam o formulário e marcam <strong className="text-foreground">"Sim"</strong> para Membro de Família.
                    </li>
                    <li className="relative">
                      <span className="absolute -left-[23px] top-0 bg-background border-2 border-primary/50 text-primary w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold">3</span>
                      No formulário, informe o nome do 1º membro (o Membro Principal). O desconto é <strong className="text-foreground">automático</strong>!
                    </li>
                  </ol>
                </div>
              </div>

              {/* Card Caravana */}
              <div className="glass-card p-6 rounded-3xl border-l-4 border-l-accent relative overflow-hidden shadow-lg hover:shadow-xl transition-all group">
                <div className="absolute top-0 right-0 bg-accent/10 text-accent text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Inscrição Grátis
                </div>
                <h3 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-accent" /> Caravana da Igreja
                </h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  Organize um grupo na sua igreja local e venham juntos aprender e crescer musicalmente! A cada 10 inscrições fechadas em grupo, a <strong>11ª inscrição é totalmente por nossa conta</strong>.
                </p>
                
                <div className="bg-white/40 dark:bg-black/10 rounded-xl p-4 border border-border/50">
                  <h4 className="text-xs font-bold uppercase text-accent mb-3">Como organizar:</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Reúna o pessoal, faça a lista dos membros e entre em contato diretamente com nossa organização pelo WhatsApp para validarmos a cortesia da sua caravana.
                  </p>
                  <a 
                    href="https://wa.me/5588997808104" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex w-full justify-center items-center gap-2 text-sm font-semibold bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    <Phone className="w-4 h-4" /> Entrar em contato via WhatsApp
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Cronograma / Programação */}
      <section id="cronograma" className="py-20 border-t bg-secondary/10 print:hidden">
        <div className="container mx-auto px-4 max-w-5xl text-center relative">
          
          <div className="flex flex-col items-center mb-8">
            <Music className="w-8 h-8 text-[#B38C53] mb-4" strokeWidth={1.5} />
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-[#2E3B2A] tracking-tight">Cronograma da Semana</h2>
            <p className="text-[#4D5A42] text-sm max-w-xl mx-auto leading-relaxed">
              Confira o cronograma completo das atividades da IV Semana de Música Cristã <br className="hidden sm:block"/>(07 a 13 de Setembro de 2026).
            </p>
          </div>
          
          <Tabs defaultValue="segunda" className="w-full mx-auto text-left">
            <div className="bg-[#FCFAF8] p-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-[#E8E4D9] mb-8 overflow-x-auto scrollbar-hide">
              <TabsList className="flex md:grid md:grid-cols-7 h-auto bg-transparent min-w-[600px] gap-2">
                {[
                  { id: "segunda", dia: "Segunda", data: "07/Set", icon: CalendarDays },
                  { id: "terca", dia: "Terça", data: "08/Set", icon: BookOpen },
                  { id: "quarta", dia: "Quarta", data: "09/Set", icon: Mic2 },
                  { id: "quinta", dia: "Quinta", data: "10/Set", icon: Music },
                  { id: "sexta", dia: "Sexta", data: "11/Set", icon: MicVocal },
                  { id: "sabado", dia: "Sábado", data: "12/Set", icon: Guitar },
                  { id: "domingo", dia: "Domingo", data: "13/Set", icon: Church }
                ].map((item) => (
                  <TabsTrigger 
                    key={item.id}
                    value={item.id} 
                    className="py-3 px-4 md:px-2 rounded-xl border-none
                    data-[state=active]:bg-[#5C6652] data-[state=active]:text-white data-[state=active]:shadow-lg
                    data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#2E3B2A] data-[state=inactive]:hover:bg-[#f5f3ed]
                    transition-all flex flex-col gap-1 items-center relative group"
                  >
                    <item.icon className={`w-5 h-5 mb-1 ${item.id === 'segunda' ? '' : 'text-[#B38C53]'} group-data-[state=active]:text-[#B38C53]`} strokeWidth={1.5} />
                    <span className="font-bold text-sm">{item.dia}</span>
                    <span className="text-[11px] opacity-80">{item.data}</span>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#5C6652] opacity-0 data-[state=active]:opacity-100 group-data-[state=active]:opacity-100 transition-opacity"></div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {[
              { id: "segunda", dia: "Segunda-feira", dataEx: "07 de Setembro", data: "07/Set", eventos: [
                { h: "18:00", icon: Users, t: "Credenciamento" }, { h: "18:15", icon: Church, t: "Culto" }, { h: "19:15", icon: Coffee, t: "Lanche" }, { h: "19:30", icon: Music, t: "Ensaio" }, { h: "22:00", icon: Heart, t: "Encerramento" }
              ]},
              { id: "terca", dia: "Terça-feira", dataEx: "08 de Setembro", data: "08/Set", eventos: [
                { h: "18:00", icon: BookOpen, t: "Oficinas / Prática" }, { h: "19:00", icon: Coffee, t: "Lanche" }, { h: "19:15", icon: Music, t: "Ensaio" }, { h: "22:00", icon: Heart, t: "Encerramento" }
              ]},
              { id: "quarta", dia: "Quarta-feira", dataEx: "09 de Setembro", data: "09/Set", eventos: [
                { h: "18:00", icon: Mic2, t: "Oficinas / Prática" }, { h: "19:00", icon: Coffee, t: "Lanche" }, { h: "19:15", icon: Music, t: "Ensaio" }, { h: "22:00", icon: Heart, t: "Encerramento" }
              ]},
              { id: "quinta", dia: "Quinta-feira", dataEx: "10 de Setembro", data: "10/Set", eventos: [
                { h: "18:00", icon: Church, t: "Culto" }, { h: "19:00", icon: Coffee, t: "Lanche" }, { h: "19:15", icon: Music, t: "Ensaio Geral" }, { h: "22:00", icon: Heart, t: "Encerramento" }
              ]},
              { id: "sexta", dia: "Sexta-feira", dataEx: "11 de Setembro", data: "11/Set", eventos: [
                { h: "18:00", icon: Church, t: "Culto" }, { h: "19:00", icon: Coffee, t: "Lanche" }, { h: "19:15", icon: Music, t: "Ensaio Geral" }, { h: "22:00", icon: Heart, t: "Encerramento" }
              ]},
              { id: "sabado", dia: "Sábado", dataEx: "12 de Setembro", data: "12/Set", eventos: [
                { h: "19:00", icon: Trophy, t: "Concerto Oficial de Encerramento" }
              ]},
              { id: "domingo", dia: "Domingo", dataEx: "13 de Setembro", data: "13/Set", eventos: [
                { h: "08:00", icon: Church, t: "Culto Matinal" }, { h: "18:00", icon: Users, t: "Culto Noturno e Apresentação" }
              ]}
            ].map(dia => (
              <TabsContent key={dia.id} value={dia.id} className="animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-[#FCFAF8] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-[#E8E4D9] p-6 md:p-10 relative">
                  
                  <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#E8E4D9]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#f4ebd9] flex items-center justify-center shrink-0">
                         <CalendarDays className="w-6 h-6 text-[#2E3B2A]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-3xl font-serif font-bold text-[#2E3B2A]">{dia.dia}</h3>
                        <p className="text-[#B38C53] text-sm md:text-base font-medium">{dia.dataEx}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-[#f4ebd9] px-4 py-2 rounded-full text-[#2E3B2A] font-semibold text-sm">
                      <CalendarDays className="w-4 h-4" />
                      {dia.data}
                    </div>
                  </div>

                  <div className="relative">
                    {/* Linha vertical principal */}
                    <div className="absolute left-[9px] top-4 bottom-4 w-[2px] bg-[#B38C53]/30"></div>
                    
                    <div className="space-y-0">
                      {dia.eventos.map((ev, i) => (
                        <div key={i} className="relative flex items-center py-6 border-b border-[#E8E4D9]/60 last:border-0 group">
                          {/* Bolinha na linha */}
                          <div className="absolute left-[4.5px] w-[11px] h-[11px] rounded-full border-2 border-[#B38C53] bg-[#FCFAF8] z-10"></div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center flex-1 pl-8 md:pl-12 gap-2 sm:gap-4 md:gap-8">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 bg-[#f4ebd9]/60 px-3 sm:px-4 py-2 rounded-xl text-[#4D5A42] font-semibold text-xs sm:text-sm shrink-0 justify-center">
                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {ev.h}
                              </div>
                              
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f4ebd9]/60 flex items-center justify-center shrink-0">
                                <ev.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#4D5A42]" strokeWidth={2} />
                              </div>
                            </div>
                            
                            <span className="font-bold text-[#2E3B2A] text-base sm:text-lg">
                              {ev.t}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Oficinas */}
      <section id="oficinas" className="py-24 border-t relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tighter">Escolha a sua Área de Atuação</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Você pode participar ativamente na grande orquestra ou no coral de vozes que se apresentará no recital final.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
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
                }} className="w-full text-primary hover:text-primary hover:bg-primary/5 font-semibold flex items-center justify-center gap-1 active:scale-[0.98] transition-transform">
                  Escolher Coral <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
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
                }} className="w-full text-primary hover:text-primary hover:bg-primary/5 font-semibold flex items-center justify-center gap-1 active:scale-[0.98] transition-transform">
                  Escolher Orquestra <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Galeria de Fotos (Cinematic Marquee) */}
      <section id="galeria" className="py-24 border-t bg-white/30 backdrop-blur-sm relative overflow-hidden flex flex-col justify-center">
        {/* Glow de fundo para profundidade */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tighter">Nossos Registros</h2>

            </div>
            <Badge variant="outline" className="hidden md:inline-flex rounded-full px-4 py-1.5 border-primary/20 text-primary">
              <Sparkles className="w-3.5 h-3.5 mr-2" /> Galeria Oficial
            </Badge>
          </div>
        </div>

        {/* Linha 1: Deslizando para a Esquerda (Fotos 1 a 5, duplicadas para loop infinito) */}
        <div className="relative flex overflow-hidden group/marquee mb-6 mask-image-linear-horizontal w-full">
          <div className="flex animate-marquee gap-6 whitespace-nowrap w-max px-3">
            {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((num, i) => (
              <div key={i} className="w-[280px] h-[350px] md:w-[400px] md:h-[450px] rounded-3xl overflow-hidden shrink-0 shadow-lg border border-border/50 group relative bg-secondary/20">
                <img 
                  src={`/galeria/${num}.jpg`} 
                  alt={`Momento ${num}`} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => e.currentTarget.src = `https://placehold.co/400x450/1f2937/ffffff?text=Sua+Foto+${num}.jpg`}
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px] flex items-center justify-center">
                   <Heart className="w-8 h-8 text-primary shadow-sm transform scale-50 group-hover:scale-100 transition-transform duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Linha 2: Deslizando para a Direita (Fotos 6 a 10, duplicadas para loop infinito) */}
        <div className="relative flex overflow-hidden group/marquee w-full">
          <div className="flex animate-marquee-reverse gap-6 whitespace-nowrap w-max px-3 -ml-[150px]">
            {[6, 7, 8, 9, 10, 6, 7, 8, 9, 10].map((num, i) => (
              <div key={i} className="w-[280px] h-[350px] md:w-[400px] md:h-[450px] rounded-3xl overflow-hidden shrink-0 shadow-lg border border-border/50 group relative bg-secondary/20">
                <img 
                  src={`/galeria/${num}.jpg`} 
                  alt={`Momento ${num}`} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => e.currentTarget.src = `https://placehold.co/400x450/1f2937/ffffff?text=Sua+Foto+${num}.jpg`}
                />
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px] flex items-center justify-center">
                   <Heart className="w-8 h-8 text-primary shadow-sm transform scale-50 group-hover:scale-100 transition-transform duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Galeria de Vídeos / Edições Anteriores */}
      <section id="videos" className="py-20 border-t bg-secondary/30 relative overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="container mx-auto px-4 max-w-[1320px] relative z-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-widest">EDIÇÕES ANTERIORES</h2>
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
                            id: "Primeiro Lote", 
                            nome: "Apenas Inscrição (1º Lote)", 
                            valor: "R$ 110,00", 
                            desc: "Garante sua entrada na IV Semana de Música." 
                          },
                          { 
                            id: "Primeiro Lote + Camisa Oficial", 
                            nome: "Inscrição + Camisa Oficial", 
                            valor: "R$ 155,00", 
                            desc: "Inscrição (1º Lote) e a Camisa oficial do evento." 
                          },
                          { 
                            id: "Apenas Camisa Oficial", 
                            nome: "Apenas Camisa Oficial", 
                            valor: "R$ 45,00", 
                            desc: "Somente a blusa comemorativa (não inclui entrada)." 
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
                        <Label htmlFor="telefone">Número do WhatsApp <span className="text-red-500">*</span></Label>
                        <Input 
                          id="telefone" 
                          name="telefone" 
                          placeholder="Ex: (88) 99999-9999" 
                          value={formData.telefone} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {hasParticipation(formData.opcao_escolhida) && (
                        <>
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
                        </>
                      )}
                    </div>

                    {hasParticipation(formData.opcao_escolhida) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="membro_familia">Faz parte de uma família já inscrita?</Label>
                          <Select
                            value={formData.membro_familia}
                            onValueChange={(val) => handleSelectChange("membro_familia", val)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border text-foreground">
                              <SelectItem value="Não" className="hover:bg-accent focus:bg-accent">Não (Inscrição Única / Principal)</SelectItem>
                              <SelectItem value="Sim" className="hover:bg-accent focus:bg-accent">Sim, sou o 2º (ou mais) membro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {formData.membro_familia === "Sim" ? (
                          <div className="space-y-2 animate-fade-in">
                            <Label htmlFor="membro_principal">Nome do Titular da Família <span className="text-red-500">*</span></Label>
                            <Input 
                              id="membro_principal" 
                              name="membro_principal" 
                              placeholder="Quem pagará o valor integral?" 
                              value={formData.membro_principal} 
                              onChange={handleInputChange} 
                              className="border-primary/50 focus-visible:ring-primary"
                            />
                            <p className="text-[10px] text-primary font-medium mt-1">
                              Você ganhará R$ 10 de desconto automático!
                            </p>
                          </div>
                        ) : (
                          <div></div>
                        )}
                      </div>
                    )}

                    {formData.hospedagem === "Sim" && (
                      <div className="mt-4 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 text-xs text-muted-foreground space-y-2.5 animate-fade-in">
                        <div className="flex items-start gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                          <Info className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>Informações importantes sobre a hospedagem:</span>
                        </div>
                        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
                          A hospedagem será organizada no prédio da igreja ou em residências de irmãos que gentilmente se disponibilizarem para acolher os participantes durante o evento. Pedimos que cada participante venha preparado para custear sua própria alimentação ao longo do dia.
                        </p>
                        <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
                          Ressaltamos que, em alguns casos, o anfitrião (host) poderá oferecer as refeições ao hospedado como forma de cuidado e hospitalidade. No entanto, isso não é uma garantia, por isso é importante que todos se planejem para arcar com suas próprias refeições durante o período do evento.
                        </p>
                        <p className="leading-relaxed font-semibold text-blue-600 dark:text-blue-400">
                          Agradecemos pela compreensão e colaboração.
                        </p>
                      </div>
                    )}

                    {hasParticipation(formData.opcao_escolhida) && (
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
                    )}

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
                      <Label htmlFor="descricao_experiencia">Experiência Musical <span className="text-red-500">*</span></Label>
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
                      <img src="/camisas.jpg" alt="Modelos das Blusas" className="w-full h-auto object-cover rounded-xl border border-border/50 mb-4" />
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: "Verde", nome: "Blusa Verde", desc: "Cor verde com estampa clássica", hex: "#4C5F38" },
                          { id: "OffWhite", nome: "Blusa OffWhite", desc: "Cor OffWhite com estampa clássica", hex: "#F5F5F0" }
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

                    {/* Seleção de Método de Pagamento */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Forma de Pagamento</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          type="button"
                          variant={metodoPagamento === "PIX" ? "default" : "outline"}
                          className={`h-12 ${metodoPagamento === "PIX" ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-background" : ""}`}
                          onClick={() => setMetodoPagamento("PIX")}
                        >
                          PIX (Sem Taxas)
                        </Button>
                        <Button 
                          type="button"
                          variant={metodoPagamento === "CARTAO" ? "default" : "outline"}
                          className={`h-12 ${metodoPagamento === "CARTAO" ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-background" : ""}`}
                          onClick={() => setMetodoPagamento("CARTAO")}
                        >
                          Cartão de Crédito
                        </Button>
                      </div>
                    </div>

                    {metodoPagamento === "PIX" && (
                      <>
                        {/* QR Code PIX */}
                        <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
                          <div className="w-40 h-40 bg-white p-2.5 rounded-xl border flex items-center justify-center relative overflow-hidden">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getCurrentPixKey())}&margin=0`}
                              alt="QR Code PIX"
                              className="w-full h-full object-contain"
                            />
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
                              value={getCurrentPixKey()} 
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
                      </>
                    )}

                    {metodoPagamento === "CARTAO" && (
                      <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-2xl border border-border text-center space-y-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">Pagamento Seguro via Cartão</h4>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                            Você será redirecionado para o nosso ambiente de pagamento seguro (Mercado Pago/PagSeguro).
                          </p>
                        </div>
                        <Button 
                          type="button"
                          onClick={() => window.open(getCurrentCartaoLink(), "_blank")}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
                        >
                          PAGAR COM CARTÃO AGORA
                        </Button>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
                          Retorne aqui e clique em Concluir após o pagamento.
                        </p>
                      </div>
                    )}

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
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-center space-y-2 print:hidden">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1 animate-pulse">
                        <Clock className="w-6 h-6" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-primary">Inscrição em análise</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Será enviado um e-mail com a confirmação da sua inscrição assim que validarmos o pagamento do PIX de <strong>R$ {inscricaoConfirmada.valor_total.toFixed(2)}</strong>.
                      </p>
                    </div>

                    {/* Voucher de Inscrição */}
                    <div id="voucher-print" className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-6 text-zinc-900 dark:text-zinc-50 shadow-md relative overflow-hidden print:shadow-none print:border-none print:p-0">
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent print:hidden"></div>
                      
                      <div className="text-center border-b pb-4 space-y-2">
                        <div className="flex items-center justify-center gap-4">
                          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" style={{ filter: "brightness(0) invert(26%) sepia(26%) saturate(1637%) hue-rotate(180deg) brightness(97%) contrast(88%)" }} />
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
                        <div className="w-20 h-20 bg-zinc-100 p-1.5 rounded-lg border flex items-center justify-center">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${inscricaoConfirmada.id}&margin=0`}
                            alt="QR Code de Credenciamento"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[8px] text-zinc-400 font-semibold mt-2 uppercase tracking-widest text-center">
                          A confirmação da sua inscrição será enviada via whatsapp
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </CardContent>

              <CardFooter className="flex justify-between border-t pt-4 print:hidden">
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
                        camisa_estilo: "Verde",
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
      <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-800 print:hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 items-start">
            {/* Coluna 1: Logo Principal */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                <span className="font-display font-bold text-white text-lg leading-tight">IV Semana<br/>de Música</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px]">
                Dedicado à capacitação e adoração através da música cristã.
              </p>
            </div>
            
            {/* Coluna 2: Realização */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-widest">Realização Oficial</h4>
              <div className="bg-white p-3 rounded-xl inline-block shadow-md hover:scale-[1.03] transition-all duration-200 border border-zinc-200">
                <img src="/logo-igreja.png" alt="Igreja Bíblica de Jijoca" className="h-10 object-contain" />
              </div>
            </div>
            
            {/* Coluna 3: Info */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-widest">Informações</h4>
              <ul className="space-y-3">
                <li className="text-sm flex items-center gap-2.5 justify-center sm:justify-start"><Calendar className="w-4 h-4 text-zinc-500 shrink-0" /> 07 a 13 de Setembro</li>
                <li className="text-sm flex items-center gap-2.5 justify-center sm:justify-start text-left"><MapPin className="w-4 h-4 text-zinc-500 shrink-0" /> Jijoca de Jericoacoara, CE</li>
              </ul>
            </div>

            {/* Coluna 4: Contato */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-widest">Contato / Dúvidas</h4>
              <ul className="space-y-3">
                <li className="text-sm flex items-center gap-2.5 justify-center sm:justify-start"><Mail className="w-4 h-4 text-zinc-500 shrink-0" /> ibjjlouvor@gmail.com</li>
                <li className="text-sm flex items-center gap-2.5 justify-center sm:justify-start"><Phone className="w-4 h-4 text-zinc-500 shrink-0" /> (88) 99780-8104</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-xs text-zinc-600 flex items-center justify-center gap-2">
            <p>© {new Date().getFullYear()} IV Semana de Música Cristã de Jijoca. Todos os direitos reservados.</p>
            <Link to="/dashboard" className="text-zinc-800 hover:text-zinc-500 transition-colors" title="Acesso Administrativo">
              <Lock className="w-3 h-3" />
            </Link>
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
