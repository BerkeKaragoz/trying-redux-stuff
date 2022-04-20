import {
  createDataResponsePacket,
  createPeerClosePacket,
  createPeerOpenPacket,
  WSData,
  WSDataType,
  WSPacket,
  WSPacketType,
  WSResponseCode,
} from "@/lib/websockets";
import {
  incomingConnectionAG,
  initiateConnectionAG,
  receivePacketAG,
  sendPacketAG,
  setupPeerAG,
} from "@/redux/actions";
import {
  addPeerConnection,
  closeConnection,
  closePeer,
  openConnection,
  openPeer,
  PeerConnectionInfo,
} from "@/redux/slices/peer";
import { addChatMessage, upsertRooms } from "@/redux/slices/room";
import { AnyAction } from "@reduxjs/toolkit";
import type { DataConnection } from "peerjs";
import Peer from "peerjs";
import { END, eventChannel } from "redux-saga";
import {
  all,
  call,
  put,
  spawn,
  take,
  takeEvery,
  takeLatest,
} from "typed-redux-saga";

/** Types **/

export type ConnectionMapId = DataConnection["label"];

type ActionEmitter = (input: AnyAction) => void;

/***********/

// Because connections are unserializable
const connectionsMap = new Map<ConnectionMapId, DataConnection>();

const addToConnectionsMap = (connection: DataConnection) => {
  connectionsMap.set(connection.label, connection); //mb conn.peer later
};

const createConnectionInfo = (
  connection: DataConnection,
  isOpen: PeerConnectionInfo["isOpen"] = false,
): PeerConnectionInfo => ({
  label: connection.label,
  peerId: connection.peer,
  isOpen,
});

// Events Channels

export const getPeerEventsChannel = (peer: Peer) => {
  return eventChannel((emit: ActionEmitter) => {
    peer.on("open", (id) => {
      emit(openPeer(id));
    });

    peer.on("connection", (connection) => {
      addToConnectionsMap(connection);
      emit(incomingConnectionAG.pend(connection.label));
    });

    peer.on("disconnected", () => {
      emit({ type: "PEER_DISCONNECTED" });
      emit(closePeer());
      emit(END);
    });

    peer.on("call", (mediaConnection) => {
      emit({ type: "PEER_CALL", payload: mediaConnection });
    });

    peer.on("close", () => {
      emit(closePeer());
      emit(END);
    });

    peer.on("error", (error) => {
      emit({
        type: "PEER_ERROR",
        payload: error instanceof Error ? error.message : error,
      });
      emit(closePeer());
      emit(END);
    });

    return () => {
      peer.destroy();
    };
    //
  });
};

export const getConnectionEventsChannel = (connection: DataConnection) => {
  return eventChannel((emit: ActionEmitter) => {
    connection.on("data", (rawData) => {
      if (rawData.packetType && rawData.packetId) {
        const packet = rawData as WSPacket;

        emit(receivePacketAG.pend(packet));
      } else {
        console.error("Recieved an unknown packet.");
      }
    });

    connection.on("open", () => {
      const packet = createPeerOpenPacket(connection.label, connection.peer);

      emit(receivePacketAG.pend(packet));
    });

    connection.on("close", () => {
      const packet = createPeerClosePacket(connection.label, connection.peer);

      emit(receivePacketAG.pend(packet));
      emit(END);
    });

    connection.on("error", (error) => {
      emit({
        type: "CONNECTION_ERROR",
        payload: { connectionId: connection.label, error },
      });
      emit(END);
    });

    return () => {
      connectionsMap.delete(connection.label);
      connection.close();
    };
  });
};

// Watch Events

export function* watchPeerEvents(peer: Peer) {
  try {
    const peerEvents = yield* call(getPeerEventsChannel, peer);

    while (true) {
      const emittedAction = yield* take(peerEvents);
      yield* put(emittedAction);
    }
  } catch (error) {
    console.error({ error }); //TODO
  }
}

export function* watchConnectionEvents(connection: DataConnection) {
  try {
    const connectionEvents = yield* call(
      getConnectionEventsChannel,
      connection,
    );

    while (true) {
      const emittedAction = yield* take(connectionEvents);
      yield* put(emittedAction);
    }
  } catch (error) {
    console.error({ error }); //TODO
  }
}

// Watch Actions

export function* incomingConnection(
  action: ReturnType<typeof incomingConnectionAG.pend>,
) {
  try {
    const { payload: connectionId } = action;

    const connection = connectionsMap.get(connectionId);

    if (!connection) {
      /**
       * generally unexpected because this func gets activated
       * immediately after adding the connection
       */
      throw new Error(`Connection ${connectionId} does not exist!`);
    }

    const peerConnectionInfo = createConnectionInfo(connection, false);

    yield spawn(watchConnectionEvents, connection);

    yield put(addPeerConnection(peerConnectionInfo));

    yield put(incomingConnectionAG.fulfill(connection.label));
  } catch (error) {
    yield put(
      incomingConnectionAG.reject(
        error instanceof Error ? error.message : error,
      ),
    );
  }
}

export function* initiateConnection(
  clientPeer: Peer,
  action: ReturnType<typeof initiateConnectionAG.pend>,
) {
  try {
    const { payload: idOfConnecting } = action;

    // connect
    const connection = clientPeer.connect(idOfConnecting);

    addToConnectionsMap(connection);

    const peerConnectionInfo = createConnectionInfo(connection, false);

    yield* spawn(watchConnectionEvents, connection);

    yield* put(addPeerConnection(peerConnectionInfo));

    yield* put(initiateConnectionAG.fulfill(connection.label));
  } catch (error) {
    yield* put(
      initiateConnectionAG.reject(
        error instanceof Error ? error.message : error,
      ),
    );
  }
}

export function* receivePacket(
  action: ReturnType<typeof receivePacketAG.pend>,
) {
  // categorize packets here
  const { packetType, connectionId, packetId, dataType, data } = action.payload;

  try {
    switch (packetType) {
      case WSPacketType.CLOSE: {
        const peerId = data as WSData[WSDataType.PEER_ID];

        connectionsMap.delete(connectionId);

        yield* put(closeConnection(peerId));
        break;
      }

      case WSPacketType.OPEN: {
        const peerId = data as WSData[WSDataType.PEER_ID];
        yield* put(openConnection(peerId));
        break;
      }

      case WSPacketType.DATA: {
        //
        switch (dataType) {
          case WSDataType.ROOM:
            const rooms = data as WSData[WSDataType.ROOM];

            yield* put(upsertRooms(rooms));

            break;

          case WSDataType.CHAT_MESSAGE:
            const { roomId, message } = data as WSData[WSDataType.CHAT_MESSAGE];

            yield* put(addChatMessage({ roomId, message }));

            break;
        }
        //

        const responsePacket = createDataResponsePacket(connectionId, {
          for: packetId,
          code: WSResponseCode.SUCCESS,
        });

        yield* put(sendPacketAG.pend(responsePacket));

        break;
      }

      case WSPacketType.RESPONSE: {
        const responseData = data as WSData[WSDataType.RESPONSE];

        yield* put(sendPacketAG.fulfill(responseData));

        break;
      }
    }

    yield* put(receivePacketAG.fulfill(packetId));
  } catch (error) {
    yield* put(
      receivePacketAG.reject(error instanceof Error ? error.message : error),
    );

    const responsePacket = createDataResponsePacket(connectionId, {
      for: packetId,
      code: WSResponseCode.FAIL,
    });

    yield* put(sendPacketAG.pend(responsePacket));
  }
}

export function* sendPacket(action: ReturnType<typeof sendPacketAG.pend>) {
  try {
    const { connectionId: toId, packetId, packetType } = action.payload;

    const connection = connectionsMap.get(toId);

    if (!connection) throw new Error(`Connection ${toId} does not exist!`);

    connection.send(action.payload);

    // Does packet await for a response?
    if (packetType !== WSPacketType.DATA)
      yield* put(
        sendPacketAG.fulfill({
          for: packetId,
          code: WSResponseCode.SUCCESS,
        }),
      );
  } catch (error) {
    yield* put(
      sendPacketAG.reject(error instanceof Error ? error.message : error),
    );
  }
}

//

export function* setupPeer() {
  try {
    const clientPeer = new Peer(undefined, {
      host: "localhost",
      port: 9000,
    });

    yield* spawn(watchPeerEvents, clientPeer);

    yield* put(setupPeerAG.fulfill());

    yield* all([
      takeEvery(initiateConnectionAG.pending, initiateConnection, clientPeer),
      takeEvery(incomingConnectionAG.pending, incomingConnection),
      takeEvery(sendPacketAG.pending, sendPacket),
      takeEvery(receivePacketAG.pending, receivePacket),
    ]);
  } catch (error) {
    yield* put(
      setupPeerAG.reject(error instanceof Error ? error.message : error),
    );
  }
}

export function* watchPeer() {
  yield* takeLatest(setupPeerAG.pending, setupPeer);
}
