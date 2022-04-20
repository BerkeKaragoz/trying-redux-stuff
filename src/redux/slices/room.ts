import { ValueOf } from "@/lib/types";
import { ChatMessage, Room, RoomType } from "@/modules/Room/types";
import { AppRootState, BaseReducerState } from "@/redux/types";
import { createInitialState } from "@/redux/utils";
import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { nanoid } from "nanoid";
import Peer from "peerjs";

const roomAdapter = createEntityAdapter<Room>();

interface RoomSliceState extends BaseReducerState {}

const roomSlice = createSlice({
  name: "room",
  initialState: roomAdapter.getInitialState(
    createInitialState<RoomSliceState>({}),
  ),
  reducers: {
    upsertRooms: roomAdapter.upsertMany,
    setRoomState: (
      state,
      action: PayloadAction<{
        roomId: Room["id"];
        state: ValueOf<Room["state"]>;
      }>,
    ) => {
      const { roomId, state: roomState } = action.payload;
      if (!state.entities[roomId]) return;

      roomAdapter.updateOne(state, {
        id: roomId,
        changes: { state: roomState, stateKey: nanoid() },
      });
    },
    addChatMessage: (
      state,
      action: PayloadAction<{ roomId: Room["id"]; message: ChatMessage }>,
    ) => {
      const { roomId, message } = action.payload;
      if (!state.entities[roomId]) return;
      if (state.entities[roomId]!.type !== RoomType.CHAT) return;

      const roomState = state.entities[roomId]!
        .state as Room<RoomType.CHAT>["state"];

      const s: typeof roomState = {
        ...roomState,
        messages: roomState.messages.concat(message),
      };

      roomAdapter.updateOne(state, {
        id: roomId,
        changes: { state: s, stateKey: nanoid() },
      });
    },
    createChatRoom: (state, action: PayloadAction<Peer["id"]>) => {
      const room: Room<RoomType.CHAT> = {
        id: nanoid(),
        stateKey: nanoid(),
        connectedPeerIds: [action.payload],
        hostId: action.payload,
        type: RoomType.CHAT,
        state: {
          messages: [],
        },
      };

      roomAdapter.addOne(state, room);
    },
    addPeerToRoom: (
      state,
      action: PayloadAction<{ roomId: Room["id"]; peerId: Peer["id"] }>,
    ) => {
      const { roomId, peerId } = action.payload;
      if (!state.entities[roomId]) return;

      roomAdapter.updateOne(state, {
        id: roomId,
        changes: {
          connectedPeerIds:
            state.entities[roomId]!.connectedPeerIds.concat(peerId),
        },
      });
    },
  },
});

const adapterSelectors = roomAdapter.getSelectors<AppRootState>(
  (state) => state.room,
);

export const roomSelectors = {
  ...adapterSelectors,
  selectChatRooms: createSelector(
    adapterSelectors.selectAll,
    (rooms) =>
      rooms.filter((r) => r.type === RoomType.CHAT) as Room<RoomType.CHAT>[],
  ),
};

export const {
  createChatRoom,
  addChatMessage,
  addPeerToRoom,
  setRoomState,
  upsertRooms,
} = roomSlice.actions;

export default roomSlice;
