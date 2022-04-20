import { Nullable } from "@/lib/types";
import store from "@/redux/store";
import { PayloadAction } from "@reduxjs/toolkit";

export type AppDispatch = typeof store.dispatch;
export type AppRootState = ReturnType<typeof store.getState>;

export type BaseReducerState<T = never> = {
  error: null | string;
  isLoading: boolean;
} & ([T] extends [never]
  ? {}
  : {
      data: Nullable<T>;
    });

export type AppReducerName = Exclude<keyof AppRootState, symbol>;

//
// ACTIONS
//

export type SagaConst = "saga";
export type SagaName = string;

// Type Names
//
/** @example "reducerName/THIS_PART/pending" */
export type ActionTypeName<T extends string = string> = T;

// Prefixes
//
/** @example "saga/sagaName" */
export type SagaActionTypePrefix = `${SagaConst}/${SagaName}`;

/**
 * "_persist" is substituted with "persist"
 * because redux-persist fires actions that way
 * @example "reducerName" or "saga/sagaName" */
export type ActionTypePrefix =
  | Exclude<AppReducerName, "_persist">
  | "persist"
  | SagaActionTypePrefix;

// Action Types
//
/** @example "user/actionName" or "saga/sagaName/actionName" */
export type ActionType<Prefix extends ActionTypePrefix = ActionTypePrefix> =
  `${Prefix}/${ActionTypeName}`;

// Promise Action Types
//
export type PromiseActionTypeStatus = "pending" | "fulfilled" | "rejected";
export type PromiseActionTypeStatusVerb = "pend" | "fulfill" | "reject";

/** @example "user/actionName/pending" or "saga/sagaName/actionName/pending" */
export type PromiseActionType<
  Prefix extends ActionTypePrefix = ActionTypePrefix,
  Status extends PromiseActionTypeStatus = PromiseActionTypeStatus,
> = `${ActionType<Prefix>}/${Status}`;

/** @example "saga/sagaName/actionName/pending" */
export type SagaActionType = PromiseActionType<SagaActionTypePrefix>;

// Action Type Objects
//
/**
 * @example {
 *    pending: "user/fetchUser/pending",
 *    fulfilled: "user/fetchUser/fulfilled",
 *    rejected: "user/fetchUser/rejected"
 * }
 */
export type PromiseActionTypesObject<
  Prefix extends ActionTypePrefix = ActionTypePrefix,
> = {
  [K in PromiseActionTypeStatus]: `${ActionType<Prefix>}/${K}`;
};

/**
 * @example {
 *    pending: "saga/sagaName/fetchUser/pending",
 *    fulfilled: "saga/sagaName/fetchUser/fulfilled",
 *    rejected: "saga/sagaName/fetchUser/rejected"
 * }
 */
export type SagaActionTypesObject = {
  [K in PromiseActionTypeStatus]: `${ActionType<SagaActionTypePrefix>}/${K}`;
};

//
//

/**
 * @template AT The type of the action's type.
 * @template Payload The type of the action's payload.
 * @template M The type of the action's meta (optional)
 * @template E The type of the action's error (optional)
 */
export type ConstrainedPayloadAction<
  Payload = never,
  AT extends ActionType = ActionType,
  M = never,
  E = never,
> = PayloadAction<Payload, AT, M, E>;

// Action Generators
//
export type ActionGenerator<AT extends ActionType = ActionType, P = undefined> =
  P extends undefined
    ? () => ConstrainedPayloadAction<never, AT>
    : (payload: P) => ConstrainedPayloadAction<typeof payload, AT>;

export type PromiseActionGenerators<
  P = undefined,
  F = undefined,
  R = undefined,
  ATPrefix extends ActionTypePrefix = ActionTypePrefix,
> = {
  pend: ActionGenerator<PromiseActionType<ATPrefix, "pending">, P>;
  fulfill: ActionGenerator<PromiseActionType<ATPrefix, "fulfilled">, F>;
  reject: ActionGenerator<PromiseActionType<ATPrefix, "rejected">, R>;
} & PromiseActionTypesObject<ATPrefix>;

export type SagaActionGenerators<P = undefined, F = undefined, R = undefined> =
  PromiseActionGenerators<P, F, R, SagaActionTypePrefix>;

//
//
//
