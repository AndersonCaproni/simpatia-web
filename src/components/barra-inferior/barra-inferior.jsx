import { useState, useEffect, useRef } from "react";
import Logo from "../../assets/logo.svg";
import Unifenas from "../../assets/unifenas.png";
import { CircleWavyQuestion, Question, CaretUp } from "phosphor-react";
import Button from "../button";
import styles from "./barra-inferior.module.css";
import ModuleIA from "../modules-ia/modules-ia";
import { useNavigate } from "react-router-dom";
import { useMan } from "../../hooks/man-provider";

const BarraInferior = () => {
  const { isMobile, startTutorial } = useMan();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Se for mobile, não renderiza essa barra inferior
  if (isMobile) return null;

  return (
    <div 
      ref={containerRef} 
      className={`${styles.container} ${isOpen ? styles.open : styles.closed}`}
    >
      <div className={styles.handleSection} onClick={() => setIsOpen(!isOpen)}>
        <CaretUp size={18} weight="bold" className={`${styles.arrowIcon} ${isOpen ? styles.arrowDown : ""}`} />
      </div>
      <button className={styles.btnTutorial} onClick={() => { setIsOpen(false); startTutorial(); }} >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="23"
          height="23"
          fill="var(--neutro-100)"
          viewBox="0 0 256 256">
          <path
            d="M192,96c0,28.51-24.47,52.11-56,55.56V160a8,8,0,0,1-16,0V144a8,8,0,0,1,8-8c26.47,0,48-17.94,48-40s-21.53-40-48-40S80,73.94,80,96a8,8,0,0,1-16,0c0-30.88,28.71-56,64-56S192,65.12,192,96Zm-64,96a16,16,0,1,0,16,16A16,16,0,0,0,128,192Z">
          </path>
        </svg>
      </button>
    </div>
  );
};

export default BarraInferior;
