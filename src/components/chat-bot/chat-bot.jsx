import { PaperPlaneRight, Robot, X } from "phosphor-react";
import { BsRobot } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { useMan } from "../../hooks/man-provider";
import { AjudaAIMensagem } from "../../services/ia";
import styles from "./chat-bot.module.css";

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
    introMessages,
    inputChatBot,
    setInputChatBot,
    messagesChatBot,
    setMessagesChatBot
  } = useMan();

  const chatRef = useRef(null);
  const messagesRef = useRef(null);
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
    scrollMessages()
  }, [messagesChatBot, isProcessing]);

  useEffect(() => {
    scrollMessages();
  }, [isOpenChatBot]);

  const scrollMessages = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (inputChatBot === "" && textareaChatBotRef?.current) {
      textareaChatBotRef.current.style.height = isMobile ? "20px" : "24px";
      textareaChatBotRef.current.style.overflowY = "hidden";
    }
  }, [inputChatBot, textareaChatBotRef, isMobile]);

  const sendQuestion = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isProcessing) return;

    setInputChatBot("");
    setMessagesChatBot((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, type: "user", content: trimmed },
    ]);
    setIsProcessing(true);

    const result = await AjudaAIMensagem(trimmed, agents);

    setIsProcessing(false);

    if (result.tipo === "rotear" && result.agente) {
      const agent = agents.find((a) => a.id === result.agente);
      if (agent) {
        setMessagesChatBot((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            type: "bot",
            agentColor: agent.color,
            content: result.resposta,
          },
        ]);

        handleAgentSelect(agent);
        handleSubmit({ preventDefault: () => { } }, trimmed, agent);
        setTimeout(() => setIsOpenChatBot(false), 1500);
        return;
      }
    }

    setMessagesChatBot((prev) => [
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
    sendQuestion(inputChatBot);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(inputChatBot);
    }
  };

  const showSugestoes =
    messagesChatBot.length === introMessages.length && !isProcessing;

  return (
    <div
      ref={chatRef}
      id='chat-bot-container'
      className={`${styles.container} ${isOpenChatBot ? styles.open : styles.closed
        }`}
    >
      <header className={styles.chatHeader}>
        <div className={styles.chatHeaderTitle}>
          <div className={styles.iconHeader}>
            <BsRobot size={22} color="#006FFF" weight="fill" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <strong>Ajuda AI</strong>
            <span style={{ display: "block", fontSize: isMobile ? 9 : 12, color: "#666" }}>
              Tire suas dúvidas sobre a plataforma ou seja encaminhado a um
              especialista
            </span>
          </div>
        </div>

        <button id='button-sair-chat-bot' className={styles.closeBtn} onClick={() => setIsOpenChatBot(false)}>
          <X size={20} />
        </button>
      </header>

      <div ref={messagesRef} className={styles.messages}>
        <div className={styles.messagesInner}>
          {messagesChatBot.map((m) => (
            <div
              key={m.id}
              className={`${styles.message} ${m.type === "user" ? styles.messageuser : styles.messagebot
                }`}
              style={
                m.type === "user"
                  ? { backgroundColor: "#006FFF", color: "#fdfbfbff" }
                  : {
                    backgroundColor: "#fafafaff",
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
            <div id='sugestoes-chat-bot' className={styles.chipsRow}>
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
          <div id="chat-bot-input" className={styles.inputBox}>
            <textarea
              ref={textareaChatBotRef}
              placeholder="Pergunte algo ..."
              rows={1}
              className={styles.textarea}
              value={inputChatBot}
              onChange={(e) => {
                setInputChatBot(e.target.value);
                autoResizeChatBot();
              }}
              onKeyDown={onKeyDown}
              disabled={isProcessing}
            />

            <div className={styles.containerBtn}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isProcessing || !inputChatBot.trim()}
              >
                <PaperPlaneRight size={18} weight="fill" />
              </button>
            </div>
          </div>
          <p className={styles.disclaimer}>
            O Ajuda AI pode cometer erros.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
