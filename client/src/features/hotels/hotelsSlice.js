import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

export const fetchHotels = createAsyncThunk("hotels/fetchHotels", async (params, thunkAPI) => {
  try {
    const response = await api.get("/hotels", { params });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Could not load hotels.");
  }
});

export const fetchHotelById = createAsyncThunk("hotels/fetchHotelById", async (id, thunkAPI) => {
  try {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Could not load this hotel.");
  }
});

export const saveHotel = createAsyncThunk("hotels/saveHotel", async ({ id, formData }, thunkAPI) => {
  try {
    const response = id
      ? await api.put(`/hotels/${id}`, formData)
      : await api.post("/hotels", formData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || { message: "Could not save hotel." });
  }
});

export const deleteHotel = createAsyncThunk("hotels/deleteHotel", async (id, thunkAPI) => {
  try {
    const response = await api.delete(`/hotels/${id}`);
    return { id, message: response.data.message };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Could not delete hotel.");
  }
});

const hotelsSlice = createSlice({
  name: "hotels",
  initialState: {
    items: [],
    total: 0,
    selected: null,
    loading: false,
    error: null
  },
  reducers: {
    clearSelected(state) {
      state.selected = null;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.hotels;
        state.total = action.payload.total;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHotelById.pending, (state) => {
        state.loading = true;
        state.selected = null;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.items = state.items.filter((hotel) => hotel.id !== action.payload.id);
        state.total = Math.max(0, state.total - 1);
      });
  }
});

export const { clearSelected } = hotelsSlice.actions;
export default hotelsSlice.reducer;
