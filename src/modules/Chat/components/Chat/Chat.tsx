import { createChatMessagePacket, createRoomPacket } from "@/lib/websockets";
import { ChatMessage, Room, RoomType } from "@/modules/Room/types";
import { sendPacketAG } from "@/redux/actions";
import { peerSelectors } from "@/redux/slices/peer";
import {
  addChatMessage,
  addPeerToRoom,
  roomSelectors,
} from "@/redux/slices/room";
import { useAppDispatch, useAppSelector } from "@/redux/utils";
import { Field, Form, Formik } from "formik";

import * as Yup from "yup";

const chatSchema = Yup.object()
  .shape({
    content: Yup.string().default("").min(1),
  })
  .defined();

type Props = {
  roomId: Room<RoomType.CHAT>["id"];
};

const Chat: React.FC<Props> = (props) => {
  const { roomId } = props;

  const username = useAppSelector((state) => state.user.name);
  const openPeers = useAppSelector(peerSelectors.selectOpenPeers);
  const clientId = useAppSelector((state) => state.peer.clientId);
  const peerEntities = useAppSelector(peerSelectors.selectEntities);
  const room = useAppSelector(
    (state) =>
      roomSelectors.selectById(state, roomId) as
        | Room<RoomType.CHAT>
        | undefined,
  );

  const dispatch = useAppDispatch();

  if (!room) return <span>Room not found!</span>;

  return (
    <div>
      <h2>Chat</h2>
      <pre>Room ID: {room.id}</pre>
      <pre>Peer IDs: {JSON.stringify(room.connectedPeerIds)}</pre>
      {room.hostId === clientId && (
        <div>
          <h3>Add Peers:</h3>
          {openPeers.map(
            (peer) =>
              !room.connectedPeerIds.includes(peer.peerId) && (
                <button
                  key={peer.peerId}
                  onClick={() => {
                    const r: typeof room = {
                      ...room,
                      connectedPeerIds: room.connectedPeerIds.concat(
                        peer.peerId,
                      ),
                    };

                    const packet = createRoomPacket(peer.label, [r]);

                    dispatch(sendPacketAG.pend(packet));

                    dispatch(
                      addPeerToRoom({
                        roomId: room.id,
                        peerId: peer.peerId,
                      }),
                    );
                  }}
                >
                  {peer.peerId}
                </button>
              ),
          )}
        </div>
      )}
      <Formik
        initialValues={chatSchema.getDefault()}
        validationSchema={chatSchema}
        onSubmit={(values) => {
          const { content } = values;
          const message: ChatMessage = {
            from: username ?? clientId ?? "",
            content: content,
          };

          for (const peerId of room.connectedPeerIds) {
            // This also prevents sending to self
            if (peerEntities[peerId] === undefined) continue;

            const packet = createChatMessagePacket(
              peerEntities[peerId]!.label,
              {
                roomId: room.id,
                message,
              },
            );

            dispatch(sendPacketAG.pend(packet));

            dispatch(addChatMessage({ roomId: room.id, message }));
          }
          //dispatch(initiateConnectionAG.pend(hostId));
        }}
      >
        <Form>
          <Field name="content" />
          <button type="submit">Send</button>
        </Form>
      </Formik>
      {room.state.messages.map((message, i) => (
        <p key={`msg-${message.from}-${i}`}>
          <b>{message.from}: </b>
          {message.content}
        </p>
      ))}
    </div>
  );
};

export default Chat;
