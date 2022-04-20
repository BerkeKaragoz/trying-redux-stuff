import roomSlice from "@/redux/slices/room";
import peerSlice from "@/redux/slices/peer";
import userSlice from "@/redux/slices/user";
import { combineReducers, configureStore, Middleware } from "@reduxjs/toolkit";
import { CurriedGetDefaultMiddleware } from "@reduxjs/toolkit/dist/getDefaultMiddleware";
import { createLogger } from "redux-logger";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import createSagaMiddleware from "redux-saga";

const reducers = {
  /****************************** REDUCER ******************************/
  [userSlice.name]: userSlice.reducer,
  [peerSlice.name]: peerSlice.reducer,
  [roomSlice.name]: roomSlice.reducer,
  /*********************************************************************/
} as const;

const combinedReducers = combineReducers(reducers);

const persistedReducer = persistReducer(
  {
    key: "root",
    storage,
    whitelist: [userSlice.name],
  },
  combinedReducers,
);

export const sagaMiddleware = createSagaMiddleware();

/**
 * logger must be the last middleware in chain,
 * otherwise it will log thunk and promise, not actual actions
 */
const logger = createLogger({
  collapsed: true,
  level: "info",
});

const defaultMiddlewareOptions: Parameters<CurriedGetDefaultMiddleware>[0] = {
  thunk: false,
  serializableCheck: {
    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  },
};

const additionalMiddlewares: Middleware[] = [
  sagaMiddleware,
  logger, // should stay last
];

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(defaultMiddlewareOptions).concat(
      additionalMiddlewares,
    ),
});

export const persistor = persistStore(store);

export default store;

//
//
//
// Redux Logger Options:
// {
//   predicate, // if specified this function will be called before each action is processed with this middleware.
//   collapsed, // takes a Boolean or optionally a Function that receives `getState` function for accessing current store state and `action` object as parameters. Returns `true` if the log group should be collapsed, `false` otherwise.
//   duration = false: Boolean, // print the duration of each action?
//   timestamp = true: Boolean, // print the timestamp with each action?
//
//   level = 'log': 'log' | 'console' | 'warn' | 'error' | 'info', // console's level
//   colors: ColorsObject, // colors for title, prev state, action and next state: https://github.com/evgenyrodionov/redux-logger/blob/master/src/defaults.js#L12-L18
//   titleFormatter, // Format the title used when logging actions.
//
//   stateTransformer, // Transform state before print. Eg. convert Immutable object to plain JSON.
//   actionTransformer, // Transform action before print. Eg. convert Immutable object to plain JSON.
//   errorTransformer, // Transform error before print. Eg. convert Immutable object to plain JSON.
//
//   logger = console: LoggerObject, // implementation of the `console` API.
//   logErrors = true: Boolean, // should the logger catch, log, and re-throw errors?
//
//   diff = false: Boolean, // (alpha) show diff between states?
//   diffPredicate // (alpha) filter function for showing states diff, similar to `predicate`
// }
