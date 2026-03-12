import Button from "../components/button";
import ChatContainer from "../components/chat-container/chat-container";
import Container from "../components/container";
import ModuleIA from "../components/modules-ia/modules-ia";
import SideBar from "../components/side-bar/side-bar";
import TopBar from "../components/top-bar/top-bar";
import Tutorial from "../components/tutorial/tutorial";

const Chat = () => {
  return (
    <Container>
      <TopBar />
      <Container
        style={{
          flexDirection: "row",
          height: "100%",
          width: "100%",
          padding: 0,
        }}
      >
        <SideBar />
        <ChatContainer />
      </Container>
      <Tutorial />
    </Container>
  );
};

export default Chat;
