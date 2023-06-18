import React, { FormEvent } from "react";
import {
  GUFTGOO_ROOMS,
  Message,
  MessageType,
  User,
  initSocket,
  processImage,
} from "./socket";
import { useOutsideAlerter } from "../util";
import { Socket } from "socket.io-client";
import { useParams, useSearchParams } from "react-router-dom";
import "./Chat.css";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { IndexedDBManager, handleDownload } from "./messages";
import { setViewHeight } from "../index";
import { capturePhoto } from "./CameraCapture";
import Cookies from "js-cookie";

export const ChatPage: React.FC = (): JSX.Element => {
  const [msg, setMsg] = React.useState<string>("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [optionsVisible, setOptionsVisible] = React.useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState<boolean>(false);
  const emojiRef = React.useRef<HTMLDivElement>(null);
  const optionsMenuRef = React.useRef<HTMLDivElement>(null);

  useOutsideAlerter(emojiRef, (): void => {
    setShowEmojiPicker(false);
  });

  useOutsideAlerter(optionsMenuRef, (): void => {
    setOptionsVisible(false);
  });

  const { room } = useParams();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");

  const socket = React.useRef<Socket>(null);

  const messageField = React.useRef<HTMLTextAreaElement>(null);
  const lastMsg = React.useRef<HTMLLIElement>(null);

  const indexedDBManager = new IndexedDBManager();

  const onNewMessage = (data: Message): void => {
    if (data) {
      // if (data.from.name !== "Admin") {
      //   alert(JSON.stringify(data.messageId));
      // }
      setMessages((m) => [...m, data]);
      if (data.from.name !== "Admin") indexedDBManager.saveMessageToDB(data);
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
  const onFile = (file: any): void => {
    console.log(file);
  };
  const onCapturePhoto = (user: User): void => {
    // setMessages((m) => [
    //   ...m,
    //   {
    //     createdAt: new Date().getTime(),
    //     from: user,
    //     liked: false,
    //     messageId: 0,
    //     text: "Capture " + JSON.stringify(user),
    //     seen: false,
    //     type: MessageType.Text,
    //   },
    // ]);
    if (user.name !== name) {
      capturePhoto((data): void => {
        socket.current!.emit(
          "createMessagePrivate",
          user,
          data,
          MessageType.File
        );
      });
    }
  };

  React.useEffect((): (() => void) => {
    const socketData = socket.current;

    if (room && name) {
      let stored_rooms_string = localStorage.getItem(GUFTGOO_ROOMS) || "[]";
      let stored_rooms = JSON.parse(stored_rooms_string);
      // console.log(stored_rooms);
      stored_rooms.push({ name, room });
      const uniqueArray = [
        ...new Set(stored_rooms.map((r: any) => JSON.stringify(r))),
      ].map((r: any) => JSON.parse(r));

      localStorage.setItem(GUFTGOO_ROOMS, JSON.stringify(uniqueArray));

      console.log("init db");
      indexedDBManager
        .openDatabase()
        .then(() => indexedDBManager.loadMessagesFromDB(room))
        .then((storedMessages) => {
          setMessages(storedMessages.sort((a, b) => a.createdAt - b.createdAt));
          return indexedDBManager.clearOldMessages();
        })
        .catch((error) => {
          console.error(error);
        });

      // console.log("initialising socket");
      initSocket(
        socket,
        name,
        room,
        onJoin,
        onNewMessage,
        onFile,
        updateUserList,
        onCapturePhoto
      ).then((): void => {});
    }

    setViewHeight();
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

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setUploading(true);
    processImage(event.currentTarget, 1)
      .then((data): void => {
        socket.current &&
          socket.current.emit("fileUpload", data, (success: boolean): void => {
            if (success) {
              setUploading(false);
            }
          });
      })
      .catch((): void => {
        alert("Error in upload");
      });
  };

  function requestCapturePhoto() {
    socket.current && socket.current.emit("capturePhoto");
    setOptionsVisible(false);
  }
  function auto_grow(element: FormEvent<HTMLTextAreaElement>) {
    element.currentTarget.style.height = "5px";
    element.currentTarget.style.height =
      element.currentTarget.scrollHeight + "px";
  }

  const getDateString = (time: number): string => {
    const date = new Date(time);

    return (
      date.getDate() +
      "/" +
      date.getMonth() +
      " " +
      date.getHours() +
      ":" +
      (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())
    );
  };
  function isAutharized() {
    const cookie = Cookies.get("guftgoo_user");
    if (cookie) {
      const user: { level: string } = JSON.parse(cookie).user;
      return user.level === "PREMIUM";
    }
    return false;
  }
  return (
    <div className="chat">
      <div className="chat_header">
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
            Guftgoo [{users.length}]
          </div>
          <div style={{ overflowX: "scroll" }}>
            {users.map((u, index): JSX.Element => {
              return (
                <span
                  key={index}
                  style={{
                    borderRadius: "10px",
                    marginRight: "5px",
                    fontSize: "12px",
                    padding: "5px",
                    background: "#7575dbc2",
                  }}
                >
                  {u.name}
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <div
            style={{
              background: "transparent",
              fontSize: "25px",
              fontWeight: "bold",
              margin: 0,
              padding: 0,
              cursor: "pointer",
            }}
            onClick={() => setOptionsVisible(true)}
          >
            &#x22EE;
          </div>
        </div>
        <div
          ref={optionsMenuRef}
          className="menu_options"
          style={{
            display: optionsVisible ? "flex" : "none",
            position: "absolute",
            zIndex: 101,
            flexDirection: "column",
          }}
        >
          {isAutharized() && (
            <div className="option_element" onClick={requestCapturePhoto}>
              Capture Photo
            </div>
          )}
        </div>
      </div>

      <div className="chat__main">
        <ol className="chat__messages">
          {messages.map((m, index): JSX.Element => {
            return (
              <li
                ref={index === messages.length - 1 ? lastMsg : undefined}
                key={index}
                className="message"
              >
                {m.from.name !== "Admin" ? (
                  <div
                    style={{
                      margin: "10px",
                      display: "flex",
                      justifyContent:
                        m.from.name === name ? "flex-end" : "flex-start",
                    }}
                  >
                    <div>
                      {m.from.name !== "Admin" && (
                        <div className="message__title">
                          <p>{m.from.name}</p>
                        </div>
                      )}
                      <div
                        className={`message__body message_box ${
                          m.from.name === name
                            ? "message_box_right"
                            : "message_box_left"
                        }`}
                      >
                        {m.type === MessageType.Text ? (
                          <div className="message_content_box">
                            <pre>{m.text}</pre>
                          </div>
                        ) : (
                          <div
                            className="image_box"
                            style={{ position: "relative" }}
                          >
                            <img src={m.text} alt="Img" />
                            <div
                              style={{
                                position: "absolute",
                                bottom: 7,
                                right: 5,
                                fontSize: "26px",
                                cursor: "pointer",
                              }}
                              onClick={(): void => handleDownload(room, m.text)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ width: "20px" }}
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </div>
                          </div>
                        )}
                        {m.from.name !== "Admin" && (
                          <span className="message_time">
                            {getDateString(m.createdAt)}
                          </span>
                        )}
                        {m.liked && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-15px",
                              left: "-10px",
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="red"
                              width="24"
                              height="24"
                              style={{
                                background: "#523a86",
                                padding: "3px",
                                borderRadius: "50%",
                              }}
                            >
                              <path d="M12 21.35l-1.79-1.61C5.4 15.28 2 12.04 2 8.5 2 5.42 4.42 3 7.5 3c1.88 0 3.63.96 4.5 2.5C12.87 3.96 14.62 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.54-3.4 6.78-8.21 11.24L12 21.35z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="admin_box">
                    <div>{m.text}</div>
                    <div style={{ fontSize: "12px" }}>
                      {getDateString(m.createdAt)}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div
        className="chat__footer"
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
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
              left: "0",
              bottom: "70px",
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
        <div id="message-form" className="input-wrapper" style={{ flex: 1 }}>
          <textarea
            ref={messageField}
            value={msg}
            placeholder="Message"
            autoFocus
            autoComplete="off"
            onInput={auto_grow}
            onChange={(e): void => {
              setMsg(e.currentTarget.value);
            }}
            // onKeyDown={(e): void => {
            //   if (e.key === "Enter") onSendMessage();
            // }}
            style={{ width: "100%" }}
          />
          {uploading ? (
            <div className="spinner"></div>
          ) : (
            <label htmlFor="upload-image-select" className="icon-wrapper">
              <input
                id="upload-image-select"
                type="file"
                accept="image/*"
                style={{ visibility: "hidden" }}
                onChange={handleFileUpload}
              />
              <p style={{ fontSize: "26px" }}>&#x1F4F7;</p>
            </label>
          )}
        </div>
        <div>
          <button
            onClick={onSendMessage}
            style={{
              background: "blue",
              marginLeft: "5px",
              borderRadius: "50%",
            }}
          >
            <div style={{ width: "24px", height: "24px" }}>
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
      </div>
    </div>
  );
};
