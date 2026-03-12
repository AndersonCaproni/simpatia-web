import { useState, useEffect, useCallback } from "react";
import styles from "./tutorial.module.css";
import { useMan } from "../../hooks/man-provider";

const steps = [
  {
    target: null, // Modal central
    title: "Bem-vindo ao Ajuda AI! 👋",
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
    title: "Gravação de Voz",
    content: "Com preguiça de digitar? Clique aqui para falar diretamente com a IA usando o microfone do seu celular ou computador.",
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
    target: null,
    title: "Tudo pronto! 🚀",
    content: "Você já é um mestre no Ajuda AI. Escolha um especialista ao lado e comece a testar agora mesmo!",
  }
];

const Tutorial = () => {
  const { isMobile, isTutorialActive, setIsTutorialActive, selectedAgent, agents, handleAgentSelect } = useMan();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    // Show if manually triggered OR if it's the first time
    let shouldShow = false;
    if (isTutorialActive) {
      setCurrentStep(0);
      shouldShow = true;
    } else {
      const hasSeen = localStorage.getItem("hasSeenTutorial");
      if (!hasSeen) {
        shouldShow = true;
      }
    }

    if (shouldShow) {
      // Auto-select agent se estivermos no desktop e não houver um para liberar o chat
      if (!isMobile && !selectedAgent && agents.length > 0) {
        handleAgentSelect(agents[0]);
      }
      setIsVisible(true);
    }
  }, [isTutorialActive, isMobile, selectedAgent, agents, handleAgentSelect]);

  const completeTutorial = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setIsVisible(false);
    setIsTutorialActive(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculatePosition = useCallback(() => {
    if (!isVisible) return;

    // Step targets
    const step = steps[currentStep];
    if (!step.target) {
      setTargetRect(null);
      return;
    }

    // Attempt to find element
    // Special wait for .last-bot-message-actions if it's not rendered yet because of typing animation
    const tryFind = (retries) => {
      const element = document.querySelector(step.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          });
        }, 300);
      } else if (retries > 0) {
        setTimeout(() => tryFind(retries - 1), 500);
      } else {
        setTargetRect(null);
      }
    };

    tryFind(3); // Tenta 3 vezes (útil para carregar o modal)
  }, [currentStep, isVisible]);

  useEffect(() => {
    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [calculatePosition]);

  if (!isVisible) return null;

  const stepInfo = steps[currentStep];
  const isCenter = !stepInfo.target || !targetRect;

  // Montando estilos
  const overlayStyle = isCenter ? {} : {
    clipPath: `polygon(
      0% 0%, 0% 100%, 
      ${targetRect.left - 5}px 100%, 
      ${targetRect.left - 5}px ${targetRect.top - 5}px, 
      ${targetRect.left + targetRect.width + 5}px ${targetRect.top - 5}px, 
      ${targetRect.left + targetRect.width + 5}px ${targetRect.top + targetRect.height + 5}px, 
      ${targetRect.left - 5}px ${targetRect.top + targetRect.height + 5}px, 
      ${targetRect.left - 5}px 100%, 
      100% 100%, 100% 0%
    )`
  };

  let tooltipStyle = {};
  if (!isCenter && targetRect) {
    const tooltipWidth = 300; // baseado no CSS
    const tooltipHeight = 200; // altura aproximada
    const padding = 20;

    let preTop = targetRect.top;
    let preLeft = targetRect.left;

    // Basic dynamic placement
    if (stepInfo.position === "right") {
      preTop = targetRect.top;
      preLeft = targetRect.left + targetRect.width + 15;
      if (isMobile) {
        preTop = targetRect.top + targetRect.height + 15;
        preLeft = padding;
      }
    } else if (stepInfo.position === "top") {
      preTop = targetRect.top - tooltipHeight - 35;
      preLeft = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
      if (isMobile) {
        preTop = targetRect.top - tooltipHeight - 15;
        preLeft = padding;
      }
    } else if (stepInfo.position === "top-left") {
      preTop = targetRect.top - tooltipHeight - 35;
      preLeft = targetRect.left + (targetRect.width / 2.5) - (tooltipWidth);
      if (isMobile) {
        preTop = targetRect.top - tooltipHeight - 15;
        preLeft = padding;
      }
    } else if (stepInfo.position === "bottom") {
      preTop = targetRect.top + targetRect.height + 25;
      preLeft = targetRect.left + (targetRect.width / 2) - (tooltipWidth * 1.2);
      if (isMobile) {
        preLeft = padding;
      }
    } else if (stepInfo.position === "bottom-center") {
      preTop = targetRect.top + targetRect.height + 25;
      preLeft = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 1);
      if (isMobile) {
        preLeft = padding;
      }
    } else {
      preTop = targetRect.top + targetRect.height + 15;
      preLeft = targetRect.left;
    }

    // Viewport clamping (evitando que vaze da tela no PC e não cubra os botoes)
    if (!isMobile) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Limites horizontais
      if (preLeft + tooltipWidth > vw - padding) preLeft = vw - tooltipWidth - padding;
      if (preLeft < padding) preLeft = padding;

      // Limites verticais
      if (preTop + tooltipHeight > vh - padding) preTop = vh - tooltipHeight - padding;
      if (preTop < padding) preTop = padding;
    }

    tooltipStyle = { top: preTop, left: preLeft };
    if (isMobile) {
      tooltipStyle.right = padding; // Estica no mobile
    }
  }

  return (
    <div className={styles.tutorialWrapper}>
      <div
        className={`${styles.overlay} ${isCenter ? styles.overlaySolid : ''}`}
        style={overlayStyle}
      />

      <div
        className={`${styles.tooltip} ${isCenter ? styles.tooltipCenter : styles.tooltipAbsolute}`}
        style={!isCenter ? tooltipStyle : {}}
      >
        <div className={styles.progress}>Passo {currentStep + 1} de {steps.length}</div>
        <h3>{stepInfo.title}</h3>
        <p>{stepInfo.content}</p>

        <div className={styles.actions}>
          <button className={styles.skipBtn} onClick={completeTutorial}>Pular tutorial</button>

          <div className={styles.navRow}>
            {currentStep > 0 && <button className={styles.navBtn} onClick={prevStep}>Anterior</button>}
            <button className={styles.nextBtn} onClick={nextStep}>
              {currentStep === steps.length - 1 ? "Começar!" : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
