import {
  ArrowsCounterClockwise,
  CircleNotch,
  PaperPlaneRight,
  Robot,
  User,
  ClipboardText,
  Checks,
  Microphone,
  Stop,
} from "phosphor-react";
import { useMan } from "../../hooks/man-provider";
import { formatDate } from "../../utils/format-date";
import TypingMessage from "../typing-message/typing-message";
import styles from "./chat-container.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useState, useEffect } from "react";

const ChatContainer = () => {
  const {
    selectedAgent,
    scrollRef,
    isLoading,
    handleSubmit,
    textareaRef,
    inputValue,
    setInputValue,
    autoResize,
    reload,
    limparStorage,
    isMobile,
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    isAtBottomRef,
  } = useMan();

  const Icon = selectedAgent?.icon;
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (inputValue === "" && textareaRef.current) {
      textareaRef.current.style.height = "36px";
      textareaRef.current.style.overflowY = "hidden";
    }
  }, [inputValue, textareaRef]);

  const handleCopy = async (id, text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  return (
    <div className={styles.chatContainer}>
      {selectedAgent ? (
        <>
          <header className={styles.chatHeader}>
            <div className={styles.chatHeaderTitle}>
              {Icon && <Icon size={20} color={selectedAgent.color} />}
              <div>
                <strong>{selectedAgent.name}</strong>
                {!isMobile && <p>{selectedAgent.description}</p>}
              </div>
            </div>
            {
              selectedAgent?.messages?.length <= 11 &&
              <button className={styles.buttonTop} onClick={limparStorage}>
                <ArrowsCounterClockwise
                  size={isMobile ? 16 : 20}
                  color="white"
                  className={reload ? styles.spinTop : ""}
                />
              </button>
            }
          </header>

          <div className={styles.messages} ref={scrollRef}>
            <div className={styles.messagesInner}>
              {selectedAgent.messages.map((msg) => {
                const isBot = msg.type === "bot";

                return (
                  <div
                    key={msg.id}
                    className={`${styles.message} ${styles[`message${msg.type}`]}`}
                    style={{
                      backgroundColor: isBot ? "#F8F8FC" : selectedAgent.color,
                      color: isBot ? "#000" : "#fff",
                      position: "relative",
                    }}
                  >
                    {isBot &&
                      selectedAgent?.messages[selectedAgent.messages.length - 1].id === msg.id &&
                      Date.now() - new Date(msg.timestamp).getTime() <= 5000 ? (
                      <TypingMessage content={msg.content} scrollRef={scrollRef} isAtBottomRef={isAtBottomRef} />
                    ) : isBot ? (
                      <div className={styles.markdownContainer}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <>{msg.content}</>
                    )}

                    <small>{formatDate(msg.timestamp)}</small>
                    {isBot &&
                      <button
                        className={styles.copyButton}
                        onClick={() => handleCopy(msg.id, msg.content)}
                        title="Copiar mensagem"
                      >

                        {copiedId === msg.id ?
                          <div style={{ backgroundColor: '#e8ebf0', borderRadius: '100%', minWidth: '25px', minHeight: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
                            <Checks size={18} color={"#000"} />
                          </div>
                          :
                          <ClipboardText
                            size={18}
                            color={isBot ? "#000" : "#fff"}
                          />
                        }

                      </button>
                    }

                  </div>
                );
              })}

              {isLoading && (
                <div className={`${styles.messagebot} ${styles.message} ${styles.loadingContainer}`}>
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
            <form onSubmit={handleSubmit} className={styles.inputArea}>
              {
                selectedAgent?.messages?.length > 11 ?
                  <div style={{ display: 'flex', textAlign: 'center', gap: isMobile ? 0 : '4rem', flexDirection: isMobile ? 'column-reverse' : 'row', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <p>Você chegou no limite do seu agente, recarregue e continue aproveitando!</p>

                    <button className={styles.buttonTop} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', minHeight: '40px' }} onClick={limparStorage}>
                      <ArrowsCounterClockwise
                        size={20}
                        color="white"
                        className={reload ? styles.spinTop : ""}
                      />
                    </button>
                  </div>
                  :
                  <>
                    <div className={styles.inputBox}>
                      <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          autoResize();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (!isLoading && inputValue.trim()) {
                              handleSubmit(e);
                            }
                          }
                        }}
                        placeholder={
                          isRecording
                            ? "Ouvindo..."
                            : isTranscribing
                              ? "Transcrevendo..."
                              : `Pergunte algo ao ${selectedAgent.name}...`
                        }
                        rows={1}
                        disabled={isRecording || isTranscribing}
                        className={`${styles.textarea} ${isRecording || isTranscribing ? styles.textareaDisabled : ""
                          }`}
                      />

                      {/* Botão de mic: aparece quando vazio OU quando está gravando/transcrevendo */}
                      {(!inputValue.trim() || isRecording || isTranscribing) && !isLoading && (
                        <button
                          type="button"
                          onClick={isRecording ? stopRecording : startRecording}
                          disabled={isTranscribing}
                          className={`${styles.micBtn} ${isRecording ? styles.micBtnRecording : ""
                            }`}
                          title={isRecording ? "Parar gravação" : "Gravar áudio"}
                        >
                          {isTranscribing ? (
                            <CircleNotch size={18} className={styles.spin} />
                          ) : isRecording ? (
                            <Stop size={18} weight="fill" />
                          ) : (
                            <Microphone size={18} weight="fill" />
                          )}
                          {isRecording && <span className={styles.pulseDot} />}
                        </button>
                      )}

                      {/* Botão de enviar: só aparece quando há texto E não está gravando */}
                      {!isRecording && !isTranscribing && (isLoading || inputValue.trim()) && (
                        <button type="submit" className={styles.submitBtn} disabled={isLoading || !inputValue.trim()}>
                          {isLoading ? (
                            <CircleNotch size={18} className={styles.spin} />
                          ) : (
                            <PaperPlaneRight size={18} weight="fill" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className={styles.disclaimer}>
                      O Ajuda AI pode cometer erros. Por isso, lembre-se de conferir as informações geradas.
                    </p>
                  </>
              }
            </form>
          </div>
        </>
      ) : (
        <div className={styles.emptyChat}>
          <Robot size={40} />
          <p>Selecione um agente para começar</p>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
