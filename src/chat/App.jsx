import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import { useContext, useState } from "react";
import "./index.css";
import "./i18n.js";
import BinModal from "./components/ChatWindow/Modal/BinModal";
import RegistrationModal from "./components/ChatWindow/Modal/RegistrationModal.jsx";
import { ChatContext } from "./context/ChatContext";
import { useTranslation } from "react-i18next";
import chatI18n from "./i18n";

function AppChat() {
  const { t } = useTranslation(undefined, { i18n: chatI18n });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBinModalOpen, setBinModalOpen] = useState(false);
  const [isRegistrationModalOpen, setRegistrationModalOpen] = useState(false);
  const showSpecialButton = import.meta.env.VITE_SHOW_SPECIAL_BUTTON === "true";

  const {
    currentChatId,
    addBotMessage,
    setIsInBinFlow,
    fetchFormsByBin,
    setIsTyping,
    setChats,
  } = useContext(ChatContext);

  // Функция для переключения состояния боковой панели
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const openSpecialFormsModal = () => {
    setBinModalOpen(true);
  };

  const openRegistrationModal = () => {
    setRegistrationModalOpen(true);
  };

  const handleBinSubmit = async (bin, year) => {
    setBinModalOpen(false);
    setIsInBinFlow(true);

    setChats((prev) =>
      prev.map((chat) => {
        const isCurrent =
          String(chat.id) === String(currentChatId) ||
          (chat.id === null && currentChatId === null);
        return isCurrent ? { ...chat, isBinChat: true } : chat;
      }),
    );

    setChats((prev) =>
      prev.map((chat) => {
        const isCurrent =
          String(chat.id) === String(currentChatId) ||
          (chat.id === null && currentChatId === null);
        if (!isCurrent) return chat;
        return {
          ...chat,
          isEmpty: false,
          messages: chat.messages.filter((msg) => !msg.isButton),
        };
      }),
    );

    addBotMessage(t("binModal.foundForms", { bin }));
    setIsTyping(true);

    try {
      const forms = await fetchFormsByBin(bin, year);

      setChats((prev) =>
        prev.map((chat) => {
          const isCurrent =
            String(chat.id) === String(currentChatId) ||
            (chat.id === null && currentChatId === null);
          if (!isCurrent) return chat;

          const msgs = [...chat.messages];
          const lastIdx = msgs.length - 1;
          msgs[lastIdx] = {
            ...msgs[lastIdx],
            attachments: forms,
            runnerBin: bin,
          };
          return { ...chat, messages: msgs, isBinChat: true };
        }),
      );
    } catch (err) {
      console.error(err);
      addBotMessage(t("binModal.fetchError"));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="flex wrapper relative items-stretch">
        {/* Передаём состояние и функцию в Sidebar */}
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          showSpecialButton={showSpecialButton}
          onOpenSpecialForms={openSpecialFormsModal}
          onOpenRegistration={openRegistrationModal}
        />
        <ChatWindow
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </div>
      <BinModal
        isOpen={isBinModalOpen}
        onClose={() => setBinModalOpen(false)}
        onSubmitBin={handleBinSubmit}
      />
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        title={t("feedback.registrationTitle")}
        currentChatId={currentChatId}
        addBotMessage={addBotMessage}
        sendSuccessMessageToChat={false}
      />
    </>
  );
}

export default AppChat;
