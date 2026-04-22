import { PaperPlaneRight, Robot } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import { useMan } from "../../hooks/man-provider";
import { AjudaAIMensagem } from "../../services/ia";
import styles from "./chat-bot.module.css";

const INTRO_MESSAGES = [
  {
    id: "ajudaai-intro",
    type: "bot",
    content:
      "Olá! Eu sou o Ajuda AI, assistente de navegação da Simpatia. Posso explicar o propósito da plataforma, seus recursos e como usá-la.",
  },
  {
    id: "ajudaai-intro-2",
    type: "bot",
    content:
      "Se você tiver uma dúvida específica sobre uma matéria, é só me perguntar — eu te encaminho para o agente especialista responsável.",
  },
];

const SUGESTOES = [
  "Para que o Simpatia foi criado?",
  "Como envio uma pergunta?",
  "Quais especialistas estão disponíveis?",
  "Posso ditar por voz?",
];

const ChatBot = () => {
  const {
    isMobile,
    isOpenChatBot,
    setIsOpenChatBot,
    agents,
    handleAgentSelect,
    handleSubmit,
    textareaChatBotRef,
  } = useMan();

  const chatRef = useRef(null);
  const messagesRef = useRef(null);

  const [messages, setMessages] = useState(INTRO_MESSAGES);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatRef.current &&
        !chatRef.current.contains(event.target) &&
        isOpenChatBot
      ) {
        setIsOpenChatBot(false);
      }
    };

    if (isOpenChatBot) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenChatBot, setIsOpenChatBot]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  useEffect(() => {
    if (input === "" && textareaChatBotRef?.current) {
      textareaChatBotRef.current.style.height = isMobile ? "20px" : "24px";
      textareaChatBotRef.current.style.overflowY = "hidden";
    }
  }, [input, textareaChatBotRef, isMobile]);

  const sendQuestion = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isProcessing) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, type: "user", content: trimmed },
    ]);
    setIsProcessing(true);

    const result = await AjudaAIMensagem(trimmed, agents);

    setIsProcessing(false);

    if (result.tipo === "rotear" && result.agente) {
      const agent = agents.find((a) => a.id === result.agente);
      if (agent) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            type: "bot",
            agentColor: agent.color,
            content: result.resposta,
          },
        ]);

        handleAgentSelect(agent);
        handleSubmit({ preventDefault: () => {} }, trimmed, agent);
        setTimeout(() => setIsOpenChatBot(false), 1500);
        return;
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        type: "bot",
        content: result.resposta,
      },
    ]);
  };

  const autoResizeChatBot = () => {
    const textarea = textareaChatBotRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 240;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  const onSubmit = (e) => {
    e.preventDefault();
    sendQuestion(input);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(input);
    }
  };

  if (isMobile) return null;

  const showSugestoes =
    messages.length === INTRO_MESSAGES.length && !isProcessing;

  return (
    <div
      ref={chatRef}
      className={`${styles.container} ${
        isOpenChatBot ? styles.open : styles.closed
      }`}
    >
      <header className={styles.chatHeader}>
        <div className={styles.chatHeaderTitle}>
          <Robot size={22} color="#006FFF" weight="fill" />
          <div>
            <strong>Ajuda AI</strong>
            <span style={{ display: "block", fontSize: 12, color: "#666" }}>
              Tire suas dúvidas sobre a plataforma ou seja encaminhado a um
              especialista
            </span>
          </div>
        </div>
      </header>

      <div ref={messagesRef} className={styles.messages}>
        <div className={styles.messagesInner}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={`${styles.message} ${
                m.type === "user" ? styles.messageuser : styles.messagebot
              }`}
              style={
                m.type === "user"
                  ? { backgroundColor: "#006FFF", color: "#fff" }
                  : {
                      backgroundColor: "#fff",
                      color: "#222",
                      borderLeft: m.agentColor
                        ? `3px solid ${m.agentColor}`
                        : undefined,
                    }
              }
            >
              {m.content}
            </div>
          ))}

          {showSugestoes && (
            <div className={styles.chipsRow}>
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={styles.chip}
                  onClick={() => sendQuestion(s)}
                  disabled={isProcessing}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {isProcessing && (
            <div
              className={`${styles.messagebot} ${styles.message} ${styles.loadingContainer}`}
              style={{ backgroundColor: "#fff" }}
            >
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.inputAreaWrapper}>
        <form className={styles.inputArea} onSubmit={onSubmit}>
          <div className={styles.inputBox}>
            <textarea
              ref={textareaChatBotRef}
              placeholder="Pergunte algo ..."
              rows={1}
              className={styles.textarea}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResizeChatBot();
              }}
              onKeyDown={onKeyDown}
              disabled={isProcessing}
            />

            <div className={styles.containerBtn}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isProcessing || !input.trim()}
              >
                <PaperPlaneRight size={18} weight="fill" />
              </button>
            </div>
          </div>
          <p className={styles.disclaimer}>
            O Ajuda AI pode cometer erros. Por isso, lembre-se de conferir as
            informações geradas.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
