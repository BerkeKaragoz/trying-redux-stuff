import { cco } from "@/lib/utils";
import { WSData, WSDataType, WSPacket } from "@/lib/websockets";
import { ConnectionMapId } from "@/redux/sagas/peer";
import {
  ActionGenerator,
  ActionType,
  ActionTypeName,
  ActionTypePrefix,
  PromiseActionGenerators,
  PromiseActionType,
  PromiseActionTypesObject,
  SagaActionGenerators,
  SagaActionTypePrefix,
  SagaName,
} from "@/redux/types";
import Peer from "peerjs";

/************ Only create action types here (if manually) ************/
/**
 *  @returns
 *   - pending: `${actionTypeName}/pending`
 *   - fulfilled: `${actionTypeName}/fulfilled`
 *   - rejected: `${actionTypeName}/rejected`
 * */
const createPromiseAT = <ATPrefix extends ActionTypePrefix = ActionTypePrefix>(
  actionTypeName: ActionType<ATPrefix>,
): PromiseActionTypesObject<ATPrefix> => {
  return {
    pending: `${actionTypeName}/pending`,
    fulfilled: `${actionTypeName}/fulfilled`,
    rejected: `${actionTypeName}/rejected`,
  };
};

/**
 *
 * @param actionTypeName "user/actionName"
 * @returns
 *   - pend: (payload?) => ({type: `${actionTypeName}/pending`, payload})
 *   - fulfill: (payload?) => ({type: `${actionTypeName}/fulfilled`, payload})
 *   - reject: (payload?) => ({type: `${actionTypeName}/rejected`, payload})
 *   - pending: `${actionTypeName}/pending`
 *   - fulfilled: `${actionTypeName}/fulfilled`
 *   - rejected: `${actionTypeName}/rejected`
 */
const createPromiseActionGenerators = <
  P = undefined,
  F = undefined,
  R = undefined,
  ATPrefix extends ActionTypePrefix = ActionTypePrefix,
>(
  actionTypeName: ActionType<ATPrefix>,
) => {
  type _AnyGenerator = (p: any) => {};

  const pend: _AnyGenerator = (payload) =>
    cco(
      ["type", `${actionTypeName}/pending`],
      ["payload", payload, payload != undefined],
    );

  const fulfill: _AnyGenerator = (payload) =>
    cco(
      ["type", `${actionTypeName}/fulfilled`],
      ["payload", payload, payload != undefined],
    );

  const reject: _AnyGenerator = (payload) =>
    cco(
      ["type", `${actionTypeName}/rejected`],
      ["payload", payload, payload != undefined],
    );

  const actions: PromiseActionGenerators<P, F, R, ATPrefix> = {
    pend: pend as ActionGenerator<PromiseActionType<ATPrefix, "pending">, P>,
    fulfill: fulfill as ActionGenerator<
      PromiseActionType<ATPrefix, "fulfilled">,
      F
    >,
    reject: reject as ActionGenerator<
      PromiseActionType<ATPrefix, "rejected">,
      R
    >,
    ...createPromiseAT<ATPrefix>(actionTypeName),
  };

  return actions;
};

const createSagaActionGenerators = <
  P = undefined,
  F = undefined,
  R = undefined,
>(
  actionTypeName: `${SagaName}/${ActionTypeName}`,
): SagaActionGenerators<P, F, R> =>
  createPromiseActionGenerators<P, F, R, SagaActionTypePrefix>(
    `saga/${actionTypeName}`,
  );

/*********************************************************************/

type TempError = any;

// Peer

export const setupPeerAG =
  createSagaActionGenerators<undefined, undefined, any>("peer/setup");

export const initiateConnectionAG = createSagaActionGenerators<
  Peer["id"],
  ConnectionMapId,
  TempError
>("peer/initiateConnection");

export const incomingConnectionAG = createSagaActionGenerators<
  ConnectionMapId,
  ConnectionMapId,
  TempError
>("peer/incomingConnection");

export const sendPacketAG =
  createSagaActionGenerators<WSPacket, WSData[WSDataType.RESPONSE], TempError>(
    "peer/sendPacket",
  );

export const receivePacketAG =
  createSagaActionGenerators<WSPacket, WSPacket["packetId"], TempError>(
    "peer/receivePacket",
  );

//
