import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    followers: [],
    following: [],
};

const socialSlice = createSlice({
    name: "social",
    initialState,
    reducers: {
        setFollowers: (state, action) => {
            state.followers = action.payload;
        },

        setFollowing: (state, action) => {
            state.following = action.payload;
        },

        clearSocialData: (state) => {
            state.followers = [];
            state.following = [];
        },
    },
});

export const {
    setFollowers,
    setFollowing,
    clearSocialData,
} = socialSlice.actions;

export default socialSlice.reducer;