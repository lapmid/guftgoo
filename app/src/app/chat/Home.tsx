import React from "react";
import "./Chat.css";
import { useNavigate } from "react-router-dom";
import { GUFTGOO_ROOMS, User } from "./socket";
import { setViewHeight } from "../index";

const Home: React.FC = (): JSX.Element => {
  const [name, setName] = React.useState<string>("");
  const [room, setRoom] = React.useState<string>("");
  const [storedRooms, setStoredRooms] = React.useState<User[]>([]);
  const navigate = useNavigate();
  const onJoin = (e: React.MouseEvent<HTMLButtonElement> | undefined): void => {
    if (name && room) {
      navigate("/chat/" + room + "?name=" + name);
    }
    if (e) e.preventDefault();
  };

  React.useEffect((): void => {
    const stored_rooms_string = localStorage.getItem(GUFTGOO_ROOMS) || "[]";
    const stored_rooms = JSON.parse(stored_rooms_string);
    setStoredRooms(stored_rooms);
    setViewHeight();
  }, []);

  return (
    <div className={"main_page"}>
      <div className={"centeredForm"}>
        <div style={{ marginTop: "15px", flex: "0.25" }}>
          <img
            width={"100%"}
            src="logo.png"
            alt="Guftgoo"
            style={{ transform: "translateX(-20px)" }}
          />
        </div>
        <div style={{ flex: "0.25" }}>
          <div>
            <div className={"form_field"}>
              <label>Your name</label>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                autoFocus
                onChange={(e): void => {
                  setName(e.currentTarget.value);
                }}
              />
            </div>
            <div className={"form_field"}>
              <label>Secret room name</label>
              <input
                type="text"
                placeholder="Secret room name"
                value={room}
                onChange={(e): void => {
                  if (e.currentTarget.value.includes(" ")) {
                  } else {
                    setRoom(e.currentTarget.value);
                  }
                }}
              />
            </div>
            <div className={"form_field"}>
              <button disabled={!name || !room} onClick={onJoin}>
                Start
              </button>
            </div>
          </div>
        </div>
        <div className="recent_rooms">
          <div>Recent rooms</div>
          <div
            style={{
              display: "flex",
              flexFlow: "wrap",
              columnGap: "10px",
              height: "90%",
              overflowY: "scroll",
            }}
          >
            {storedRooms.map((r): JSX.Element => {
              return (
                <a
                  href={
                    window.location.origin +
                    "/chat/" +
                    r.room +
                    "?name=" +
                    r.name
                  }
                  style={{ textDecoration: "none", color: "black" }}
                >
                  <div
                    style={{
                      background: "white",
                      padding: "10px",
                      borderRadius: "5px",
                      margin: "5px",
                    }}
                  >
                    <div>{r.room}</div>
                    <div style={{ fontSize: "14px", color: "#514f4fc4" }}>
                      {r.name}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
