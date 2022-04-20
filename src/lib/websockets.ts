import { nanoid } from "nanoid";

import { ConnectionMapId } from "@/redux/sagas/peer";
import { ChatMessage, Room } from "@/modules/Room/types";
import Peer from "peerjs";

/******************************** Types ********************************/

/** Will be shaped */
export enum WSPacketType {
  PING,
  OPEN,
  CLOSE,
  DATA,
  RESPONSE,
}

export enum WSDataType {
  UNKNOWN,
  NONE,
  RESPONSE,
  PEER_ID,
  CHAT_MESSAGE,
  ROOM,
}

export enum WSResponseCode {
  SUCCESS,
  FAIL,
}

export type WSPacket<T extends WSDataType = WSDataType> = {
  packetId: string;
  packetType: WSPacketType;
  connectionId: ConnectionMapId;
  dataType: T;
  data: WSData[T];
};

export type WSData = {
  [WSDataType.UNKNOWN]: unknown;
  [WSDataType.NONE]: undefined;
  [WSDataType.RESPONSE]: {
    for: WSPacket["packetId"];
    code: WSResponseCode;
    data?: any;
  };
  [WSDataType.PEER_ID]: Peer["id"];
  [WSDataType.CHAT_MESSAGE]: {
    roomId: Room["id"];
    message: ChatMessage;
  };
  [WSDataType.ROOM]: Room[];
};

/***********************************************************************/

const createPacket = <T extends WSDataType = WSDataType>(
  packetType: WSPacketType,
  connectionId: ConnectionMapId,
  dataType: T,
  data: WSData[T],
  packetId?: WSPacket["packetId"],
): WSPacket<T> => ({
  packetId: packetId === undefined ? nanoid() : packetId,
  packetType,
  connectionId,
  dataType,
  data,
});

export const createPeerOpenPacket = (
  connectionId: ConnectionMapId,
  data: WSData[WSDataType.PEER_ID],
  packetId?: WSPacket["packetId"],
) =>
  createPacket(
    WSPacketType.OPEN,
    connectionId,
    WSDataType.PEER_ID,
    data,
    packetId,
  );

export const createPeerClosePacket = (
  connectionId: ConnectionMapId,
  data: WSData[WSDataType.PEER_ID],
  packetId?: WSPacket["packetId"],
) =>
  createPacket(
    WSPacketType.CLOSE,
    connectionId,
    WSDataType.PEER_ID,
    data,
    packetId,
  );

export const createChatMessagePacket = (
  connectionId: ConnectionMapId,
  data: WSData[WSDataType.CHAT_MESSAGE],
  packetId?: WSPacket["packetId"],
) =>
  createPacket(
    WSPacketType.DATA,
    connectionId,
    WSDataType.CHAT_MESSAGE,
    data,
    packetId,
  );

export const createRoomPacket = (
  connectionId: ConnectionMapId,
  data: WSData[WSDataType.ROOM],
  packetId?: WSPacket["packetId"],
) =>
  createPacket<WSDataType.ROOM>(
    WSPacketType.DATA,
    connectionId,
    WSDataType.ROOM,
    data,
    packetId,
  );

export const createDataResponsePacket = (
  connectionId: ConnectionMapId,
  data: WSData[WSDataType.RESPONSE],
  packetId?: WSPacket["packetId"],
) =>
  createPacket<WSDataType.RESPONSE>(
    WSPacketType.RESPONSE,
    connectionId,
    WSDataType.RESPONSE,
    data,
    packetId,
  );
