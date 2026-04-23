import { useState, useEffect, useRef } from "react";
import { CaretUp,  } from "phosphor-react";
import styles from "./barra-inferior.module.css";
import { useMan } from "../../hooks/man-provider";
import { BsRobot  } from "react-icons/bs";
import { FaQuestion } from "react-icons/fa";

const BarraInferior = () => {
  const { isMobile, startTutorial, setIsOpenChatBot, isOpenBarra, setIsOpenBarra } = useMan();
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        isOpenBarra
      ) {
        setIsOpenBarra(false);
      }
    };

    if (isOpenBarra) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenBarra]);


  return (
    <div
      ref={containerRef}
      id="barra-inferior"
      className={`${styles.container} ${isOpenBarra ? styles.open : styles.closed}`}
    >
      <div className={styles.handleSection} onClick={() => setIsOpenBarra(!isOpenBarra)}>
        <CaretUp size={18} weight="bold" className={`${styles.arrowIcon} ${isOpenBarra ? styles.arrowDown : ""}`} />
      </div>
      <div className={styles.content}>
        <button className={styles.btn} onClick={() => { setIsOpenBarra(false); startTutorial(); }} >
          <FaQuestion  size={18} weight="bold" />
        </button>
        <button className={styles.btn} onClick={() => { setIsOpenBarra(false); setIsOpenChatBot(true) }} >
          <BsRobot size={22} />
        </button>
      </div>
    </div>
  );
};

export default BarraInferior;
