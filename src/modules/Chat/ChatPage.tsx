import Copyer from "@/components/Copyer";
import Main from "@/components/Main";
import { initiateConnectionAG } from "@/redux/actions";
import { createChatRoom, roomSelectors } from "@/redux/slices/room";
import { setUserName } from "@/redux/slices/user";
import { useAppDispatch, useAppSelector } from "@/redux/utils";
import { Field, Form, Formik } from "formik";
import debounce from "lodash.debounce";
import * as Yup from "yup";

import Chat from "./components/Chat/Chat";

const connectionSchema = Yup.object()
  .shape({
    hostId: Yup.string().default("").required("Host ID is required"),
  })
  .defined();

const ChatPage = () => {
  const dispatch = useAppDispatch();

  const username = useAppSelector((state) => state.user.name);
  const clientId = useAppSelector((state) => state.peer.clientId);
  const chatRooms = useAppSelector(roomSelectors.selectChatRooms);

  const changeUsernameHandler = debounce(
    ((event) => {
      const { value } = event.target;

      dispatch(setUserName(value));
    }) as React.ChangeEventHandler<HTMLInputElement>,
    500,
  );

  const createChatRoomHandler = () => {
    if (!clientId) return;

    dispatch(createChatRoom(clientId));
  };

  return (
    <Main>
      <Copyer text={clientId} />
      <div>
        <hr />
        <div style={{ display: "inline-block" }}>
          <h2>
            Name: <span>{username}</span>
          </h2>
          <input
            type="text"
            onChange={changeUsernameHandler}
            placeholder={username ?? "Enter a name"}
          />
        </div>
        {" | "}
        <div style={{ display: "inline-block" }}>
          <h2>Connect to Host</h2>
          <Formik
            initialValues={connectionSchema.getDefault()}
            validationSchema={connectionSchema}
            onSubmit={(values) => {
              const { hostId } = values;

              dispatch(initiateConnectionAG.pend(hostId));
            }}
          >
            <Form>
              <Field name="hostId" placeholder="Host ID" />
              <button type="submit">Connect</button>
            </Form>
          </Formik>
        </div>
        <hr />
      </div>
      <button onClick={createChatRoomHandler}>Create Chat Room</button>
      {chatRooms.map((room) => (
        <Chat roomId={room.id} key={room.id} />
      ))}
    </Main>
  );
};

export default ChatPage;
