import { Socket, io } from "socket.io-client";

export const GUFTGOO_ROOMS = "GUFTGOO_ROOMS";
export const SOCKET_SERVER = process.env.SOCKET_SERVER;
export const AUTH_SERVER = process.env.AUTH_SERVER;

export interface User {
  userId: string;
  socketId: string;
  name: string;
  room: string;
}
export enum MessageType {
  Text = "Text",
  File = "File",
}
export interface Message {
  messageId: number;
  text: string;
  from: User;
  type: MessageType;
  createdAt: number;
  liked: boolean;
  seen: boolean;
}

export const initSocket = async (
  socket: React.MutableRefObject<Socket | null>,
  name: string,
  room: string,
  onJoin: (data: User) => void,
  onMessage: (data: Message) => void,
  onFile: (data: any) => void,
  updateUserList: (data: User[]) => void,
  onCapturePhoto: (user: User) => void
): Promise<void> => {
  console.log("socket client connect");
  socket.current = io();

  socket.current.on("connected", function () {
    if (socket.current && socket.current.id) {
      console.log("socket connected", socket.current.id);
      socket.current.emit("join", { name, room });
    }
  });

  socket.current.on("joined", (data) => {
    onJoin(data);
  });
  socket.current.on("newMessage", (data) => {
    onMessage(data);
  });
  socket.current.on("newFile", (data) => {
    onFile(data);
  });
  socket.current.on("updateUserList", (data: User[]): void => {
    updateUserList(data);
  });

  socket.current.on("capturePhoto", (user: User): void => {
    console.log("capture photo", user);
    onCapturePhoto(user);
  });
};

export function processImage(
  inputElement: HTMLInputElement,
  desiredFileSizeInMB: number
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (!inputElement.files || inputElement.files.length === 0) {
      reject(new Error("No image selected"));
      return;
    }

    const file = inputElement.files[0];

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx === null) {
          resolve(event.target?.result as string);
          return;
        }
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        let quality = 0.9; // Initial quality value
        let base64Data = canvas.toDataURL("image/jpeg", quality);
        let previousSize = base64Data.length;
        console.log(previousSize);
        // Check if the image is already smaller than the desired size
        if (previousSize <= desiredFileSizeInMB * 1024 * 1024) {
          resolve(base64Data);
          return;
        }

        // Decrease quality iteratively until the desired size is obtained
        while (
          previousSize > desiredFileSizeInMB * 1024 * 1024 &&
          quality > 0
        ) {
          quality -= 0.1;
          base64Data = canvas.toDataURL("image/jpeg", quality);
          previousSize = base64Data.length;
          console.log(previousSize);
        }
        resolve(base64Data);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = (event: ProgressEvent<FileReader>) => {
      reject(new Error("Error reading image file"));
    };

    reader.readAsDataURL(file);
  });
}
