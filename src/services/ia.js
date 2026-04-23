import axios from "axios";
import { MANUAL_SIMPATIA } from "../data/manual-simpatia";

export async function ChatMensagem(pergunta, specialties) {
  try {
    const response = await axios.post(
      "https://simpatia-api-112480462744.europe-west1.run.app/chat",
      {
        pergunta, 
        specialties
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data || !response.data.resposta) {
      console.error("Resposta da API em formato inesperado:", response.data);
      throw new Error("Resposta inválida da API");
    }

    return response.data.resposta;

  } catch (erro) {
    console.error("Erro ao consultar Gemini:", erro);
    return "Houve um erro ao consultar a IA. Tente novamente em instantes.";
  }
}

export async function AjudaAIMensagem(pergunta, agents) {
  try {
    const response = await axios.post(
      "https://simpatia-api-112480462744.europe-west1.run.app/ajuda-ai",
      { pergunta, agents },
      { headers: { "Content-Type": "application/json" } }
    );

    const data = response.data;

    const tipo = data.tipo === "rotear" ? "rotear" : "info";
    const respostaBruta = typeof data.resposta === "string" ? data.resposta.trim() : "";
    const agenteValido =
      tipo === "rotear" && agents.some((a) => a.id === data.agente)
        ? data.agente
        : null;

    if (tipo === "rotear" && !agenteValido) {
      return {
        tipo: "info",
        resposta: respostaBruta || "Não consegui identificar o assunto exato. Pode descrever um pouco mais a sua dúvida?",
        agente: null,
      };
    }

    return {
      tipo,
      agente: agenteValido,
      resposta: respostaBruta || (
        tipo === "rotear"
          ? "Te encaminhei ao agente especialista. Ele já está respondendo no chat principal."
          : "Posso te ajudar a entender melhor a plataforma. Qual é a sua dúvida?"
      ),
    };

  } catch (erro) {
    console.error("Erro no Ajuda AI:", erro);
    return {
      tipo: "info",
      resposta: "Tive um problema para responder agora. Tente novamente em instantes.",
      agente: null,
    };
  }
}