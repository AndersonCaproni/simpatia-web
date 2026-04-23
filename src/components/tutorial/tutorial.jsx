import { useState, useEffect, useCallback } from "react";
import styles from "./tutorial.module.css";
import { useMan } from "../../hooks/man-provider";

const GAP = 8;
const RADIUS = 12;

const Tutorial = () => {
  const {
    isMobile,
    isTutorialActive,
    setIsTutorialActive,
    setIsExpanded,
    endTutorial,
    startTutorial,
    setIsOpenBarra,
    setIsOpenChatBot
  } = useMan();
  const steps = [
    {
      target: null,
      title: "Bem-vindo ao Ajuda AI!",
      content: "Preparei um tour rápido para você conhecer todas as incríveis funcionalidades da nossa plataforma. Vamos lá?",
    },
    {
      target: "#sidebar-agents",
      title: "Especialistas em IA",
      content: "Aqui você encontra nossa equipe de IAs especialistas. Cada um domina uma área diferente: Exatas, Humanas, Programação e muito mais!",
      position: "right",
    },
    {
      target: "#chat-input-area",
      title: "Caixa de Mensagens",
      content: "É por aqui que você conversa! Digite suas dúvidas, peca resumos ou explique o problema que você precisa resolver.",
      position: "top",
    },
    {
      target: "#mic-button",
      title: "Gravação e Envio",
      content: "Com preguiça de digitar? Clique aqui para falar diretamente com a IA usando o microfone do seu celular ou computador. Porém se preferir digitar, clique aqui para enviar sua mensagem.",
      position: "top-left",
    },
    {
      target: "#clear-chat-button",
      title: "Limpar a Conversa",
      content: "Apertando aqui, você apaga as mensagens e começa um papo novo do zero com o mesmo agente.",
      position: "bottom",
    },
    {
      target: ".last-bot-message-actions",
      title: "Lendo e Copiando",
      content: "Sempre que a IA responder, você verá dois botões embaixo da mensagem dela: um para copiar o texto (útil para provas!) e outro para ouvir a resposta.",
      position: "bottom-center",
    },
    {
      target: "#barra-inferior",
      title: "Tutorial e Suporte",
      content: "Aqui você encontra toda ajuda necessária para navegar pelo sistema. Podendo rever todo tutorial, ou tirar sua dúvida sobre algo dentro do Ajuda Ai.",
      position: "top-left",
    },
    {
      target: "#chat-bot-container",
      title: "ChatBot Ajuda Ai",
      content: "Selecionando o Ajuda Ai, você sera direcionado para este novo chat de mensagens. Aqui você poderá tirar suas dúvidas sobr o sistema.",
      position: "center",
    },
    {
      target: "#sugestoes-chat-bot",
      title: "Tire sua Dúvida",
      content: "Ao iniciar, serão exibidas algumas sugestões de perguntas pré-definidas.",
      position: "top-center",
    },
    {
      target: "#chat-bot-input",
      title: "Área da Pergunta",
      content: "Neste campo, você pode inserir suas dúvidas. Digite sua pergunta para que possamos solucioná-la o mais rápido possível.",
      position: "top-center-alto",
    },
    {
      target: "#button-sair-chat-bot",
      title: "Sair e Navegar",
      content: `Ao clicar neste botão${!isMobile ? ' ou em qualquer parte da tela' : ''}, o chatbot será fechado e você poderá continuar navegando pelos nossos agentes de IA.`,
      position: "bottom",
    },
    {
      target: null,
      title: "Tudo pronto!",
      content: "Você já é um mestre no Ajuda AI. Escolha um especialista ao lado e comece a testar agora mesmo!",
    }
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const [vpSize, setVpSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add('tutorial-active');
    } else {
      document.body.classList.remove('tutorial-active');
    }
    return () => document.body.classList.remove('tutorial-active');
  }, [isVisible]);

  useEffect(() => {
    if (isTutorialActive) {
      setCurrentStep(0);
      setIsVisible(true);
      setIsTutorialActive(false);
    }
  }, [isTutorialActive, setIsTutorialActive]);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenTutorial");
    if (!hasSeen) startTutorial();
  }, []);

  useEffect(() => {
    if (!isVisible || !isMobile) return;
    if (currentStep === 1) setIsExpanded(true);
    else setIsExpanded(false);
  }, [currentStep, isVisible, isMobile, setIsExpanded]);

  const completeTutorial = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setIsVisible(false);
    endTutorial();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
    else completeTutorial();
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const calculatePosition = useCallback(() => {
    if (!isVisible) return;

    setVpSize({ w: window.innerWidth, h: window.innerHeight });

    const step = steps[currentStep];
    if (!step.target) {
      setTargetRect(null);
      return;
    }

    const tryFind = (retries) => {
      const element = document.querySelector(step.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setTargetRect({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            });
          } else if (retries > 0) {
            setTimeout(() => tryFind(retries - 1), 500);
          } else {
            setTargetRect(null);
          }
        }, 300);
      } else if (retries > 0) {
        setTimeout(() => tryFind(retries - 1), 500);
      } else {
        setTargetRect(null);
      }
    };

    tryFind(3);
  }, [currentStep, isVisible]);

  useEffect(() => {
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [calculatePosition]);

  useEffect(() => {
    if (currentStep === 6) {
      setIsOpenBarra(true);
    } else {
      setIsOpenBarra(false);
    }
  }, [currentStep, setIsOpenBarra, calculatePosition]);

  useEffect(() => {
    if (currentStep > 6 && currentStep < 11) {
      setIsOpenChatBot(true);
    } else {
      setIsOpenChatBot(false);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isVisible) return;

    const blockEvent = (e) => {
      const isInsideButton = e.target.closest('.tutorial-btn');
      if (isInsideButton) return;
      e.stopPropagation();
      e.preventDefault();
    };

    const options = { capture: true, passive: false };

    window.addEventListener('mousedown', blockEvent, options);
    window.addEventListener('mouseup', blockEvent, options);
    window.addEventListener('click', blockEvent, options);
    window.addEventListener('touchstart', blockEvent, options);
    window.addEventListener('touchmove', blockEvent, options);
    window.addEventListener('touchend', blockEvent, options);

    return () => {
      window.removeEventListener('mousedown', blockEvent, options);
      window.removeEventListener('mouseup', blockEvent, options);
      window.removeEventListener('click', blockEvent, options);
      window.removeEventListener('touchstart', blockEvent, options);
      window.removeEventListener('touchmove', blockEvent, options);
      window.removeEventListener('touchend', blockEvent, options);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const stepInfo = steps[currentStep];
  const isCenter = !stepInfo.target || !targetRect;

  const W = vpSize.w;
  const H = vpSize.h;
  let svgMask = null;
  if (!isCenter && targetRect) {
    const hx = targetRect.left - GAP;
    const hy = targetRect.top - GAP;
    const hw = targetRect.width + GAP * 2;
    const hh = targetRect.height + GAP * 2;
    svgMask = { hx, hy, hw, hh };
  }

  let tooltipStyle = {};
  if (!isCenter && targetRect) {
    const tooltipWidth = 300;
    const tooltipHeight = 200;
    const padding = 20;

    let preTop = targetRect.top;
    let preLeft = targetRect.left;

    if (stepInfo.position === "right") {
      preTop = targetRect.top;
      preLeft = targetRect.left + targetRect.width + 15;
      if (isMobile) {
        preTop = targetRect.top + targetRect.height / 2;
        preLeft = padding;
      }
    } else if (stepInfo.position === "top") {
      preTop = targetRect.top - tooltipHeight - 55;
      preLeft = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
      if (isMobile) {
        preTop = targetRect.top - tooltipHeight - 60;
        preLeft = padding;
      }
    } else if (stepInfo.position === "top-left") {
      preTop = targetRect.top - tooltipHeight - 105;
      preLeft = targetRect.left + (targetRect.width / 2.5) - tooltipWidth;
      if (isMobile) {
        preTop = targetRect.top - tooltipHeight - 80;
        preLeft = padding;
      }
    } else if (stepInfo.position === "top-center") {
      preTop = targetRect.top - tooltipHeight - 55;
      preLeft = targetRect.left + (targetRect.width / 2) - tooltipWidth / 1.7;
      if (isMobile) {
        preTop = targetRect.top - tooltipHeight - 30;
        preLeft = padding;
      }
    } else if (stepInfo.position === "top-center-alto") {
      preTop = targetRect.top - tooltipHeight - 85;
      preLeft = targetRect.left + (targetRect.width / 2) - tooltipWidth / 1.7;
      if (isMobile) {
        preTop = targetRect.top - tooltipHeight - 50;
        preLeft = padding;
      }
    } else if (stepInfo.position === "bottom") {
      preTop = targetRect.top + targetRect.height + 25;
      preLeft = targetRect.left + (targetRect.width / 2) - (tooltipWidth * 1.2);
      if (isMobile) preLeft = padding;
    } else if (stepInfo.position === "bottom-center") {
      preTop = targetRect.top + targetRect.height + 25;
      preLeft = targetRect.left + (targetRect.width / 2) - tooltipWidth;
      if (isMobile) preLeft = padding;
    } else if (stepInfo.position === "center") {
      preTop = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      preLeft = targetRect.left + (targetRect.width / 2) - tooltipWidth / 1.75;
      if (isMobile) preLeft = padding;
    } else {
      preTop = targetRect.top + targetRect.height + 15;
      preLeft = targetRect.left;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (preLeft + tooltipWidth > vw - padding) preLeft = vw - tooltipWidth - padding;
    if (preLeft < padding) preLeft = padding;
    if (preTop + tooltipHeight > vh - padding) preTop = vh - tooltipHeight - padding;
    if (preTop < padding) preTop = padding;

    tooltipStyle = { top: preTop, left: preLeft };
    if (isMobile) {
      tooltipStyle.width = "85%";
      tooltipStyle.left = "50%";
      tooltipStyle.transform = "translateX(-50%)";
    }
  }

  return (
    <div className={styles.tutorialWrapper}>
      <div
        className={styles.clickBlocker}
        onTouchStart={e => e.stopPropagation()}
        onTouchMove={e => { e.stopPropagation(); e.preventDefault(); }}
        onTouchEnd={e => e.stopPropagation()}
      />

      {isCenter ? (
        <div className={styles.overlaySolid} />
      ) : svgMask && (
        <svg
          className={styles.overlaySvg}
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id="spotlight-mask">
              {/* Tudo branco = visível (escuro) */}
              <rect x="0" y="0" width={W} height={H} fill="white" />
              {/* Buraco preto = transparente (deixa ver o conteúdo) */}
              <rect
                x={svgMask.hx}
                y={svgMask.hy}
                width={svgMask.hw}
                height={svgMask.hh}
                rx={RADIUS}
                ry={RADIUS}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0" y="0"
            width={W} height={H}
            fill="rgba(0,0,0,0.7)"
            mask="url(#spotlight-mask)"
          />
          {/* Anel de highlight arredondado */}
          <rect
            x={svgMask.hx}
            y={svgMask.hy}
            width={svgMask.hw}
            height={svgMask.hh}
            rx={RADIUS}
            ry={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="3"
          />
        </svg>
      )}

      <div
        className={`${styles.tooltip} ${isCenter ? styles.tooltipCenter : styles.tooltipAbsolute}`}
        style={!isCenter ? tooltipStyle : {}}
      >
        <div className={styles.progressContainer}>
          <div className={styles.progressText}>Passo {currentStep + 1} de {steps.length}</div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        <h3>{stepInfo.title}</h3>
        <p>{stepInfo.content}</p>

        <div className={styles.actions}>
          <button className={`${styles.skipBtn} tutorial-btn`} onClick={completeTutorial}>Pular tutorial</button>
          <div className={styles.navRow}>
            {currentStep > 0 && <button className={`${styles.navBtn} tutorial-btn`} onClick={prevStep}>Anterior</button>}
            <button className={`${styles.nextBtn} tutorial-btn`} onClick={nextStep}>
              {currentStep === steps.length - 1 ? "Começar!" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;