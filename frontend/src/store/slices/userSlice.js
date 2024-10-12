import { createSlice } from "@reduxjs/toolkit";
import axios from "axios"
import { toast } from "react-toastify";

const userSlice = createSlice({
    name: "user",
    initialState: {
        loading: false,
        isAuthenticated: false,
        user: {},
        leaderboard: [],
        //error:null,
    },
    reducers: {
        registerRequest(state, action) {
            state.loading = true;
            state.isAuthenticated = false;
            state.user = {};
        },
        registerSuccess(state, action) {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
        },
        registerFailed(state, action) {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = {};
        },
        



       loginRequest(state, action) {
            state.loading = true;
            state.isAuthenticated = false;
            state.user = {};
        },

        loginSuccess(state, action) {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
        },
        loginFailed(state, action) {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = {};
        },

        
        fetchLeaderboardRequest(state,action){
            state.loading = true;
            state.leaderboard=[];
        },
        fetchLeaderboardSuccess(state,action){
            state.loading = false;
            state.leaderboard=action.payload;
        },
        fetchLeaderboardFailed(state,action){
            state.loading = false;
            state.leaderboard=[];
        },

        fetchUserRequest(state,action){
            state.loading = true;
            state.isAuthenticated = false;
            state.user = {};
        },
        fetchUserSuccess(state, action) {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        },
        fetchUserFailed(state, action) {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = {};
        },
        



        logoutSuccess(state, action) {
            state.isAuthenticated = false;
            state.user = {};
        },
        logoutFailed(state, action) {
            state.loading = false;
            state.isAuthenticated = state.isAuthenticated;
            state.user = state.user;
        },
        cleaAllErrors(state, action) {
            state.user = state.user;
            state.isAuthenticated = state.isAuthenticated;
            state.leaderboard = state.leaderboard;
            state.loading = false;
        },
    },
});

export const register = (data) => async (dispatch) => {
    dispatch(userSlice.actions.registerRequest());
    try {
        const response = await axios.post("http://localhost:5000/api/v1/user/register", data, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(response);
        
        dispatch(userSlice.actions.registerSuccess(response.data));
        toast.success(response.data.message);
        dispatch(userSlice.actions.cleaAllErrors());
    } catch (error) {
        dispatch(userSlice.actions.registerFailed());
        console.log(error.response);
        //toast.error(error.response.data.message)
        toast.error(error.response?.data?.message || "An error occurred");
        dispatch(userSlice.actions.cleaAllErrors())
    }
}

export const login = (data) => async (dispatch) => {
    dispatch(userSlice.actions.loginRequest());
    try {
        const response = await axios.post("http://localhost:5000/api/v1/user/login", data, {
            withCredentials: true,
            //application/json:=only text data
            headers: { "Content-Type": "application/json" },
        });
        console.log(response);
        
        dispatch(userSlice.actions.loginSuccess(response.data));
        toast.success(response.data.message);
        dispatch(userSlice.actions.cleaAllErrors());
    } catch (error) {
        dispatch(userSlice.actions.loginFailed());
        console.log(error.response);
        //toast.error(error.response.data.message)
        toast.error(error.response?.data?.message || "An error occurred");
        dispatch(userSlice.actions.cleaAllErrors())
    }
}


export const logout = () => async (dispatch) => {
    try {
        const response = await axios.get("http://localhost:5000/api/v1/user/logout", { withCredentials: true });
        dispatch(userSlice.actions.logoutSuccess());
        toast.success(response.data.message);
        dispatch(userSlice.actions.cleaAllErrors());


    } catch (error) {
        dispatch(userSlice.actions.logoutFailed())
        toast.error(error.response.data.message)
        dispatch(userSlice.actions.cleaAllErrors())
    }
}

export const fetchUser = () => async (dispatch) => {
    dispatch(userSlice.actions.fetchUserRequest())
    try {
        const response = await axios.get("http://localhost:5000/api/v1/user/me", { withCredentials: true });
        dispatch(userSlice.actions.fetchUserSuccess(response.data.user));
        toast.success(response.data.message);
        dispatch(userSlice.actions.cleaAllErrors());


    } catch (error) {
        dispatch(userSlice.actions.fetchUserFailed())
        toast.error(error.response.data.message)
        dispatch(userSlice.actions.cleaAllErrors())
        console.error(error);
    }
}

export const fetchLeaderboard = () => async (dispatch) => {
    dispatch(userSlice.actions.fetchLeaderboardRequest())
    try {
        const response = await axios.get("http://localhost:5000/api/v1/user/leaderboard", { withCredentials: true });
        dispatch(userSlice.actions.fetchLeaderboardSuccess(response.data.leaderboard));
        toast.success(response.data.leaderboard);
        dispatch(userSlice.actions.cleaAllErrors());


    } catch (error) {
        dispatch(userSlice.actions.fetchLeaderboardFailed())
        toast.error(error.response.data.message)
        dispatch(userSlice.actions.cleaAllErrors())
        console.error(error);
    }
}

export default userSlice.reducer;