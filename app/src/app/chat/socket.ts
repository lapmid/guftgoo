import { Socket, io } from "socket.io-client";

export interface User {
  id: string;
  name: string;
  room: string;
}
export interface Message {
  text: string;
  from: User;
  createdAt: number;
}

export const initSocket = async (
  socket: React.MutableRefObject<Socket | null>,
  onJoin: (data: User) => void,
  onMessage: (data: Message) => void,
  updateUserList: (data: User[]) => void
): Promise<void> => {
  // if (socket.current === null) return;
  console.log("socket client connect");
  socket.current = io("http://192.168.1.6:8080");
  //   socket.current.connect();

  socket.current.on("joined", (data) => {
    onJoin(data);
  });
  socket.current.on("newMessage", (data) => {
    onMessage(data);
  });
  socket.current.on("updateUserList", (data: User[]): void => {
    updateUserList(data);
  });
};
