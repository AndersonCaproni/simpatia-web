import { useEffect, useState } from "react";
import { useMan } from "../../hooks/man-provider";
import AgentButton from "../agent-button/agent-button";
import styles from "./side-bar.module.css";

const SideBar = ({ children }) => {
  const { isExpanded, agents, handleAgentSelect, selectedAgent } = useMan();

  useEffect(() => {
    console.log(isExpanded)
  }, [isExpanded])

  return (
    <div className={`${styles.sidebar} ${isExpanded ? styles["sidebar-expanded"] : ""}`}>
      <div className={styles["sidebar-header"]}>Agentes {isExpanded && "Especializados"}</div>
      <div className={styles["sidebar-content"]}>
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
