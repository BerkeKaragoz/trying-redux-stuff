import Peer from "peerjs";

export type Room<T extends RoomType = RoomType> = {
  id: string;
  type: T;
  connectedPeerIds: Peer["id"][];
  hostId: Peer["id"];
  stateKey: string;
  state: RoomState[T];
};

export enum RoomType {
  ANY,
  CHAT,
}

export type RoomState = {
  [RoomType.ANY]: any;
  [RoomType.CHAT]: { messages: ChatMessage[] };
};

export type ChatMessage = { from: string; content: string }; //TODO add timestamp
