import { useEffect, useRef } from "react";
import { useMan } from "../../hooks/man-provider";
import AgentButton from "../agent-button/agent-button";
import styles from "./side-bar.module.css";

const SideBar = () => {
  const { isExpanded, setIsExpanded, agents, handleAgentSelect, selectedAgent } = useMan();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isExpanded && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  return (
    <div ref={sidebarRef} className={`${styles.sidebar} ${isExpanded ? styles["sidebar-expanded"] : ""}`}>
      <div className={styles["sidebar-header"]}>Agentes {isExpanded && "Especializados"}</div>
      <div id="sidebar-agents" className={styles["sidebar-content"]}>
        {agents?.map((agent, index) => {
          const isSelected = selectedAgent?.id === agent.id;
          return (
            <AgentButton
              key={index}
              isSelected={isSelected}
              handleAgentSelect={handleAgentSelect}
              agent={agent}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SideBar;