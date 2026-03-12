import { useState, useEffect, useCallback } from "react";
import styles from "./tutorial.module.css";
import { useMan } from "../../hooks/man-provider";

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
    target: null,
    title: "Tudo pronto!",
    content: "Você já é um mestre no Ajuda AI. Escolha um especialista ao lado e comece a testar agora mesmo!",
  }
];

const Tutorial = () => {
  const { isMobile, isTutorialActive, setIsTutorialActive, selectedAgent, agents, handleAgentSelect, setIsExpanded, endTutorial, startTutorial } = useMan();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    // Show if manually triggered
    if (isTutorialActive) {
      setCurrentStep(0);
      setIsVisible(true);
      setIsTutorialActive(false);
    }
  }, [isTutorialActive, setIsTutorialActive]);

  useEffect(() => {
    // Show if it's the first time
    const hasSeen = localStorage.getItem("hasSeenTutorial");
    if (!hasSeen) {
      startTutorial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isVisible || !isMobile) return;
    
    if (currentStep === 1) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
  }, [currentStep, isVisible, isMobile, setIsExpanded]);

  const completeTutorial = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setIsVisible(false);
    endTutorial();
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
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX,
              width: rect.width,
              height: rect.height
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
    return () => window.removeEventListener('resize', calculatePosition);
  }, [calculatePosition]);

  if (!isVisible) return null;

  const stepInfo = steps[currentStep];
  const isCenter = !stepInfo.target || !targetRect;

  let clipPath = "none";
  if (targetRect && !isCenter) {
    const holeTop = Math.max(0, targetRect.top - 5);
    const holeLeft = Math.max(0, targetRect.left - 5);
    const holeRight = targetRect.left + targetRect.width + 5;
    const holeBottom = targetRect.top + targetRect.height + 5;

    clipPath = `polygon(
      0% 0%, 0% 100%, 
      ${holeLeft}px 100%, 
      ${holeLeft}px ${holeTop}px, 
      ${holeRight}px ${holeTop}px, 
      ${holeRight}px ${holeBottom}px, 
      ${holeLeft}px ${holeBottom}px, 
      ${holeLeft}px 100%, 
      100% 100%, 100% 0%
    )`;
  }

  const overlayStyle = isCenter ? {} : { clipPath };

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
      preLeft = targetRect.left + (targetRect.width / 2.5) - (tooltipWidth);
      if (isMobile) {
        preTop = targetRect.top - tooltipHeight - 80;
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

    const vw = window.innerWidth;
    const vh = window.innerHeight + window.scrollY;
    
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
      <div className={styles.clickBlocker} />
      
      <div
        className={`${styles.overlay} ${isCenter ? styles.overlaySolid : ''}`}
        style={overlayStyle}
      />

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
