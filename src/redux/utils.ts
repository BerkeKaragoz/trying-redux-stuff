import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type {
  AppRootState,
  AppDispatch,
  BaseReducerState,
} from "@/redux/types";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppRootState> = useSelector;

export const baseInitialState: BaseReducerState = {
  error: null,
  isLoading: false,
};

export const createInitialState = <S extends BaseReducerState>(
  state: Omit<S, keyof BaseReducerState>,
) =>
  ({
    ...baseInitialState,
    ...state,
  } as S);
