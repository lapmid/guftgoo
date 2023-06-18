import React from "react";
import Cookies from "js-cookie";
import Modal from "react-modal";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { AUTH_SERVER } from "./socket";

interface AuthPageProps {
  isOpen: boolean;
  toggleVisibility: () => void;
}
export const AuthPage: React.FC<AuthPageProps> = (props): JSX.Element => {
  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [processing, setProcessing] = React.useState<boolean>(false);

  const handleLogin = (): void => {
    setProcessing(true);
    if (username && password && password.length > 5) {
      const endpoint = window.location.origin + "/auth/login";
      console.log("login", AUTH_SERVER);
      const creds = { username, password };
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(creds),
      })
        .then((data): void => {
          if (data.status === 200) {
            props.toggleVisibility();
            alert("Logged in , Use Premium features now");
          }
          data
            .json()
            .then((d) => {
              Cookies.set("guftgoo_user", JSON.stringify(d), {
                secure: true,
                sameSite: "strict",
                expires: 10,
              });
            })
            .finally(() => {
              const user = Cookies.get("guftgoo_user");
              console.log("cookie", user);
            });
        })
        .catch((e): void => {
          alert(JSON.stringify(e));
        })
        .finally(() => {
          setProcessing(false);
        });
    }
  };

  const handleRegister = (): void => {
    setProcessing(true);
    if (username && password && password.length > 5) {
      const endpoint = window.location.origin + "/auth/register";
      const creds = { username, password };
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(creds),
      })
        .then((data): void => {
          if (data.status === 201) {
            alert("Registered, wait for verification then try logging in");
          }
        })
        .catch((e): void => {
          alert(JSON.stringify(e));
        })
        .finally(() => {
          setProcessing(false);
        });
    }
  };
  return (
    <Modal
      isOpen={props.isOpen}
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        <button
          onClick={props.toggleVisibility}
          style={{
            color: "black",
            fontWeight: "bold",
            background: "transparent",
          }}
        >
          X
        </button>
      </div>
      <Tabs>
        <TabList>
          <Tab>Login</Tab>
          <Tab>Register</Tab>
        </TabList>

        <TabPanel>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              rowGap: "10px",
            }}
          >
            <div>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ width: "100%" }}>
              <button
                disabled={!username || !password}
                onClick={handleLogin}
                style={{ width: "100%", background: "blue" }}
              >
                {processing ? <div className="spinner"></div> : <>Login</>}
              </button>
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              rowGap: "10px",
            }}
          >
            <div>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ width: "100%" }}>
              <button
                disabled={!username || !password || processing}
                onClick={handleRegister}
                style={{ width: "100%", background: "blue" }}
              >
                {processing ? <div className="spinner"></div> : <>Register</>}
              </button>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </Modal>
  );
};
