"use client";

import React, { useRef } from "react";

function ChatForm({ setChatHistory, generateBotResponse, chatHistory }) {
  const inputRef = useRef();

  const handelFormSubmit = (e) => {
    e.preventDefault();
    const clientMessage = inputRef.current.value.trim();
    if (!clientMessage) return;
    inputRef.current.value = "";

    //update chat history with client message
    setChatHistory((history) => [
      ...history,
      { role: "user", text: clientMessage },
    ]);

    // add thinking for bot response

    setTimeout(() => {
      setChatHistory((history) => [
        ...history,
        { role: "model", text: "Thinking..." },
      ]);
      generateBotResponse(
        [...chatHistory, { role: "user", text: clientMessage }],
        setChatHistory
      );
    }, 600);
  };
  return (
    <form action="" className="chat-form" onSubmit={handelFormSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Message..."
        className="message-input"
        required
      />
      <button type="submit" className="material-symbols-rounded">
        arrow_upward
      </button>
    </form>
  );
}

export default ChatForm;