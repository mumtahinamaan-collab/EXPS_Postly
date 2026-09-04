import {configureStore} from "@reduxjs/toolkit"
import socialReducer from "../features/social/socialSlice";
import messagesReducer from "../features/messages/MesaagesSlice";
import userReducer from "../features/users/usersSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    social: socialReducer,
    messages: messagesReducer,
  },
  
})