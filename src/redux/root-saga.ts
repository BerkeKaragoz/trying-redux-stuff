import { watchPeer } from "@/redux/sagas/peer";
import { all } from "redux-saga/effects";

export default function* rootSaga() {
  yield all([watchPeer()]);
}
