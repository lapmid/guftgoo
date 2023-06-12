import React from "react";
import { Message, User, initSocket } from "./socket";
import { useOutsideAlerter } from "../util";
import { Socket } from "socket.io-client";
import { useParams, useSearchParams } from "react-router-dom";
import "./Chat.css";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { IconBase } from "react-icons";

export const ChatPage: React.FC = (): JSX.Element => {
  const [msg, setMsg] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);

  const [showEmojiPicker, setShowEmojiPicker] = React.useState<boolean>(false);
  const emojiRef = React.useRef<HTMLDivElement>(null);
  useOutsideAlerter(emojiRef, (): void => {
    setShowEmojiPicker(false);
  });

  const { room } = useParams();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");

  const socket = React.useRef<Socket>(null);

  const messageField = React.useRef<HTMLInputElement>(null);
  const lastMsg = React.useRef<HTMLLIElement>(null);

  const onNewMessage = (data: Message): void => {
    if (data) {
      setMessages((m) => [...m, data]);
    }
    setTimeout((): void => {
      lastMsg.current && lastMsg.current.scrollIntoView();
    }, 500);
  };
  const onJoin = (data: User): void => {
    console.log("new user joined", data);
  };
  const updateUserList = (data: User[]): void => {
    setUsers((u) => [...data]);
  };

  React.useEffect((): (() => void) => {
    const socketData = socket.current;

    if (room && name) {
      console.log("initialising socket");
      initSocket(socket, onJoin, onNewMessage, updateUserList);
      if (socket.current) {
        socket.current.on("connected", function () {
          if (socket.current && socket.current.id) {
            console.log("socket connected", socket.current.id);
            socket.current.emit("join", { name, room });
          }
        });
      }
    }

    return (): void => {
      if (socketData) {
        socketData.disconnect();
      }
    };
  }, []);

  const onSendMessage = (): void => {
    if (msg && room && name && socket.current && messageField.current) {
      socket.current.emit("createMessage", { text: msg });
      setMsg("");
      messageField.current.focus();
    }
  };
  return (
    <div className="chat">
      <div
        style={{
          background: "#4d4dae",
          height: "24px",
          width: "100%",
          padding: "20px 10px",
          color: "white",
          fontWeight: "bold",
        }}
      >
        Room
      </div>
      {/* <div className="chat__sidebar">
        <h3>People</h3>
        <div id="users">
          <ol>
            {users.map((u, index) => {
              return <li key={index}>{u.name}</li>;
            })}
          </ol>
        </div>
      </div> */}

      <div className="chat__main">
        <ol className="chat__messages">
          {messages.map((m, index): JSX.Element => {
            return (
              <li
                ref={index === messages.length - 1 ? lastMsg : undefined}
                key={index}
                className="message"
              >
                <div className="message__title">
                  <h4>{m.from.name}</h4>
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <div className="message__body">
                  <p>{m.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div
        className="chat__footer"
        style={{ display: "flex", flexDirection: "row" }}
      >
        <div id="message-form" style={{ flex: 1 }}>
          <input
            ref={messageField}
            type="text"
            value={msg}
            placeholder="Message"
            autoFocus
            autoComplete="off"
            onChange={(e): void => {
              setMsg(e.currentTarget.value);
            }}
            onKeyDown={(e): void => {
              if (e.key === "Enter") onSendMessage();
            }}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <button onClick={onSendMessage} style={{ background: "transparent" }}>
            <div style={{ width: "24px", height: "24px", color: "blue" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 12L4 2L12 12L4 22L20 12Z" />
              </svg>
            </div>
          </button>
        </div>
        <div style={{ position: "relative" }}>
          <button
            onClick={(): void => {
              setShowEmojiPicker(!showEmojiPicker);
            }}
            style={{ background: "transparent" }}
          >
            <p style={{ fontSize: "26px" }}>&#128512;</p>
          </button>
          <div
            ref={emojiRef}
            style={{
              position: "absolute",
              display: showEmojiPicker ? "inline-block" : "none",
              right: "0",
              bottom: "0",
            }}
          >
            <Picker
              data={data}
              previewPosition="none"
              onEmojiSelect={(data: any): void => {
                setMsg(msg + String.fromCodePoint(parseInt(data.unified, 16)));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
