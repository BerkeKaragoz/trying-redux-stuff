import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import Peer, { DataConnection } from "peerjs";
import { AppRootState, BaseReducerState } from "@/redux/types";
import { createInitialState } from "@/redux/utils";
import { ConnectionMapId } from "@/redux/sagas/peer";

export type PeerConnectionInfo = {
  isOpen: boolean;
  label: DataConnection["label"];
  peerId: DataConnection["peer"];
};

const peerAdapter = createEntityAdapter<PeerConnectionInfo>({
  selectId: (entity) => entity.peerId,
});

interface PeerState extends BaseReducerState {
  clientId: Peer["id"] | null;
  isOpen: boolean;
}

const peerSlice = createSlice({
  name: "peer",
  initialState: peerAdapter.getInitialState(
    createInitialState<PeerState>({
      clientId: null,
      isOpen: false,
    }),
  ),
  reducers: {
    openPeer: (state, action) => {
      state.clientId = action.payload;
      state.isOpen = true;
    },
    closePeer: (state) => {
      state.clientId = null;
      state.isOpen = false;
    },
    addPeerConnection: peerAdapter.addOne,
    openConnection: (state, action: PayloadAction<ConnectionMapId>) => {
      peerAdapter.updateOne(state, {
        id: action.payload,
        changes: { isOpen: true },
      });
    },
    closeConnection: (state, action: PayloadAction<ConnectionMapId>) => {
      peerAdapter.updateOne(state, {
        id: action.payload,
        changes: { isOpen: false },
      });
    },
  },
});

const adapterSelectors = peerAdapter.getSelectors<AppRootState>(
  (state) => state.peer,
);

export const peerSelectors = {
  ...adapterSelectors,
  selectOpenPeers: createSelector(adapterSelectors.selectAll, (peers) =>
    peers.filter((p) => p.isOpen),
  ),
};

export const {
  closePeer,
  openPeer,
  addPeerConnection,
  openConnection,
  closeConnection,
} = peerSlice.actions;

export default peerSlice;
