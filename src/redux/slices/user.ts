import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BaseReducerState } from "@/redux/types";
import { createInitialState } from "@/redux/utils";

interface UserState extends BaseReducerState {
  name: string | null;
}

const userSlice = createSlice({
  name: "user",
  initialState: createInitialState<UserState>({
    name: null,
  }),
  reducers: {
    setUserName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
  },
});

export const { setUserName } = userSlice.actions;

export default userSlice;
