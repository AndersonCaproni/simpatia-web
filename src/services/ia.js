import axios from "axios";
import { MANUAL_SIMPATIA } from "../data/manual-simpatia";

export async function ChatMensagem(pergunta, specialties) {
  try {

    const data = `${JSON.stringify(
      pergunta
    )} - RESPONDA SEMPRE MINHA ÚLTIMA PERGUNTA, PORÉM LEVE EM CONTA TODAS AS OUTRAS PERGUNTAS E RESPOSTA QUE EXISTEM NA LISTA. VOCÊ DEVE SER UM AGENTE DE IA TREINADO EM ${specialties}, NÃO PODE SAIR DO SEU TEMA. É EXTREMAMENTE PROIBIDO VOCÊ DAR A RESPOSTA PARA O ALUNO, VOCÊ DEVE EXPLICAR COMO O ALUNO CHEGA NO SEU OBJETIVO, SEJA CORTEZ.`;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        contents: [
          {
            role: "user",
            parts: [{ text: data }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.REACT_APP_GEMINI_API_KEY,
        },
      }
    );

    if (
      !response.data ||
      !response.data.candidates?.[0]?.content?.parts?.[0]?.text
    ) {
      throw new Error("Resposta inválida da API Gemini");
    }

    const respostaTexto = response.data.candidates[0].content.parts[0].text;

    return respostaTexto;
  } catch (erro) {
    console.error("Erro ao consultar Gemini:", erro);
    return "Houve um erro ao consultar a IA. Tente novamente em instantes.";
  }
}

export async function AjudaAIMensagem(pergunta, agents) {
  try {
    const lista = agents
      .map(
        (a) =>
          `- ${a.id} | ${a.name} | especialidades: ${a.specialties.join(", ")}`
      )
      .join("\n");

    const prompt = `Você é o "Ajuda AI", assistente oficial de navegação e suporte da plataforma educacional Simpatia (Unifenas). Você tem dois papéis:

1. RESPONDER perguntas sobre a própria plataforma Simpatia — propósito, criação, recursos, como usar, regras, limites — usando apenas o MANUAL abaixo como fonte. Tom profissional, cordial e direto, em português brasileiro. Nunca invente informações fora do manual.

2. ENCAMINHAR o aluno ao agente especialista certo quando a pergunta for uma dúvida acadêmica de uma matéria. Você NUNCA responde a dúvida acadêmica em si — apenas confirma o encaminhamento.

Responda SEMPRE em JSON puro, sem texto fora do JSON, no formato:
{ "tipo": "info" | "rotear", "resposta": "...", "agente": "id_do_agente_ou_null" }

Regras:
- "info": pergunta sobre a plataforma, saudação, agradecimento ou pergunta vaga. Em "resposta" coloque a explicação. "agente" é null.
- "rotear": pergunta acadêmica (ex.: "quem foi Tiradentes?", "como resolvo essa integral?", "como conjugar verbos em inglês?"). Em "agente" coloque o id exato do especialista mais adequado da LISTA DE AGENTES. Em "resposta" escreva uma frase curta e profissional confirmando o encaminhamento, citando o nome do agente.
- Se a dúvida acadêmica for genérica e não couber em um especialista, use "agente": "general".
- Não use markdown na "resposta", apenas texto simples.

MANUAL DA SIMPATIA:
${MANUAL_SIMPATIA}

LISTA DE AGENTES:
${lista}

PERGUNTA DO ALUNO:
"${pergunta}"`;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.REACT_APP_GEMINI_API_KEY,
        },
      }
    );

    const texto =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsed;
    try {
      parsed = JSON.parse(texto);
    } catch {
      return {
        tipo: "info",
        resposta:
          "Desculpe, não consegui processar sua pergunta agora. Pode reformular?",
        agente: null,
      };
    }

    const tipo = parsed.tipo === "rotear" ? "rotear" : "info";
    const respostaBruta =
      typeof parsed.resposta === "string" ? parsed.resposta.trim() : "";
    const agenteValido =
      tipo === "rotear" && agents.some((a) => a.id === parsed.agente)
        ? parsed.agente
        : null;

    if (tipo === "rotear" && !agenteValido) {
      return {
        tipo: "info",
        resposta:
          respostaBruta ||
          "Não consegui identificar o assunto exato. Pode descrever um pouco mais a sua dúvida?",
        agente: null,
      };
    }

    return {
      tipo,
      agente: agenteValido,
      resposta:
        respostaBruta ||
        (tipo === "rotear"
          ? "Te encaminhei ao agente especialista. Ele já está respondendo no chat principal."
          : "Posso te ajudar a entender melhor a plataforma. Qual é a sua dúvida?"),
    };
  } catch (erro) {
    console.error("Erro no Ajuda AI:", erro);
    return {
      tipo: "info",
      resposta:
        "Tive um problema para responder agora. Tente novamente em instantes.",
      agente: null,
    };
  }
}
