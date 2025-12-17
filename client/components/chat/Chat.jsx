"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatForm from "./ChatForm";
import ChatBotIcon from "./ChatBotIcon";

function Chat() {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatBot, setShowChatBot] = useState(false);
  const chatBodyRef = useRef();
const generateBotResponse = async (history) => {
  const updateHistory = (text, isError = false) => {
    setChatHistory((prev) => [
      ...prev.filter((msg) => msg.text !== "Thinking..."),
      { role: "model", text, isError },
    ]);
  };

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: history.map(({ role, text }) => ({
        role,
        parts: [{ text }],
      })),
    }),
  };

  try {
    const response = await fetch(apiUrl,
      requestOptions
    );
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Trop de requêtes. Veuillez patienter quelques instants.");
      }
      throw new Error(data.error?.message || "Une erreur s'est produite");
    }

    const apiResponse = data.candidates[0].content.parts[0].text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();
    updateHistory(apiResponse);
  } catch (error) {
    console.error(error);
    updateHistory(error.message, true);
  }
};

  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);
  return (
    <div className={`container ${showChatBot ? "show-chatbot" : ""}`}>
      <button
        onClick={() => setShowChatBot((prev) => !prev)}
        id="chatbot-toggle"
      >
        <span className="material-symbols-rounded">chat_bubble</span>
        <span className="material-symbols-rounded">close</span>
      </button>
      {/*chatbot header*/}
      <div className="chatbot-popup">
        <div className="chatbot-header">
          <div className="header-info">
            <ChatBotIcon className="x" />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button
            onClick={() => setShowChatBot((prev) => !prev)}
            className="material-symbols-rounded"
          >
            keyboard_arrow_down
          </button>
        </div>

        {/*chatbot body*/}
        <div ref={chatBodyRef} className="chatbot-body">
          <div className="message bot-message">
            <ChatBotIcon />
            <p className="message-text">
              Salut 👋 Comment puis-je t'aider aujourd'hui ?
            </p>
          </div>

          {/*render client message dynamically */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/*chatbot footer*/}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
}

export default Chat;