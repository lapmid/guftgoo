import { Message, MessageType } from "./socket";

const DB_NAME = "GUFTGOO_DB";
const STORE_NAME = "messages";
const DB_VERSION = 2;

export class IndexedDBManager {
  private db: IDBDatabase | null = null;

  public openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject("Error opening database");
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result as IDBDatabase;

        // Check if the existing object store needs to be modified or a new object store needs to be created
        if (db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = (
            event.currentTarget as IDBOpenDBRequest
          ).transaction!.objectStore(STORE_NAME);

          // Modify the existing object store structure if needed
          objectStore.createIndex("liked", "liked", { unique: false });
          objectStore.createIndex("seen", "seen", { unique: false });
        } else {
          // Create a new object store if needed
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "messageId",
          });
          store.createIndex("name", "name", { unique: false });
          store.createIndex("from", "from", { unique: false });
          store.createIndex("type", "type", { unique: false });
          store.createIndex("createdAt", "createdAt", {
            unique: false,
          });
        }
      };
    });
  }

  public loadMessagesFromDB(room: string): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readonly");
      const store = transaction!.objectStore(STORE_NAME);
      const request: IDBRequest<Message[]> = store!.getAll();

      request.onsuccess = () => {
        resolve(request.result.filter((m) => m.from.room === room) || []);
      };

      request.onerror = () => {
        reject("Error loading messages from IndexedDB");
      };
    });
  }

  public saveMessageToDB(message: Message): void {
    const transaction = this.db!.transaction(STORE_NAME, "readwrite");
    const store = transaction!.objectStore(STORE_NAME);
    const request = store!.add(message);

    request.onerror = () => {
      console.error("Error saving message to IndexedDB");
    };
  }

  public clearOldMessages(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readwrite");
      const store = transaction!.objectStore(STORE_NAME);
      const request = store!.openCursor();
      const fiveDaysAgo = new Date();
      const oneDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      oneDaysAgo.setDate(fiveDaysAgo.getDate() - 1);

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const message: Message = cursor.value;
          const messageDate = new Date(message.createdAt);

          if (messageDate < fiveDaysAgo) {
            const deleteRequest = cursor.delete();
            deleteRequest.onsuccess = () => cursor.continue();
          } else if (
            messageDate < oneDaysAgo &&
            message.type === MessageType.File
          ) {
            const deleteRequest = cursor.delete();
            deleteRequest.onsuccess = () => cursor.continue();
          } else {
            cursor.continue();
          }
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject("Error clearing old messages from IndexedDB");
      };
    });
  }
}

export const handleDownload = (
  room: string | undefined,
  base64Image: string
): void => {
  if (!room) return;
  const link = document.createElement("a");
  link.href = `${base64Image}`;
  link.download = "Guftgoo_" + room;
  link.click();
};
