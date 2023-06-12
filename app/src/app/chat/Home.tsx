import React from "react";
import "./Chat.css";
import { useNavigate } from "react-router-dom";

const Home: React.FC = (): JSX.Element => {
  const [name, setName] = React.useState<string>("");
  const [room, setRoom] = React.useState<string>("");

  const navigate = useNavigate();
  const onJoin = (e: React.MouseEvent<HTMLButtonElement> | undefined): void => {
    if (name && room) {
      navigate("/chat/" + room + "?name=" + name);
    }
    if (e) e.preventDefault();
  };

  return (
    <div className={"main_page"}>
      <div className={"centeredForm"}>
        <div className={"centeredForm__form"}>
          <div>
            <div className={"form_field"}>
              <h3>Join a Chat</h3>
            </div>
            <div className={"form_field"}>
              <label>Display name</label>
              <input
                type="text"
                value={name}
                autoFocus
                onChange={(e): void => {
                  setName(e.currentTarget.value);
                }}
              />
            </div>
            <div className={"form_field"}>
              <label>Room name</label>
              <input
                type="text"
                value={room}
                onChange={(e): void => {
                  setRoom(e.currentTarget.value);
                }}
              />
            </div>
            <div className={"form_field"}>
              <button onClick={onJoin}>Join</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
