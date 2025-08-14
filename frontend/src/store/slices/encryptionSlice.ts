import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { encryptionAPI } from '../../services/encryptionAPI';

export interface EncryptionOperation {
  id: string;
  operation_type: 'encrypt' | 'decrypt';
  algorithm: string;
  input_data: string;
  output_data: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

export interface EncryptionState {
  operations: EncryptionOperation[];
  currentOperation: EncryptionOperation | null;
  algorithms: Array<{
    name: string;
    value: string;
    type: string;
  }>;
  loading: boolean;
  error: string | null;
}

const initialState: EncryptionState = {
  operations: [],
  currentOperation: null,
  algorithms: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAlgorithms = createAsyncThunk(
  'encryption/fetchAlgorithms',
  async () => {
    const response = await encryptionAPI.getAlgorithms();
    return response.algorithms;
  }
);

export const encryptData = createAsyncThunk(
  'encryption/encryptData',
  async (data: { data: string; algorithm: string; key_id?: string }) => {
    const response = await encryptionAPI.encrypt(data);
    return response;
  }
);

export const decryptData = createAsyncThunk(
  'encryption/decryptData',
  async (data: { encrypted_data: string; algorithm: string; key_id?: string }) => {
    const response = await encryptionAPI.decrypt(data);
    return response;
  }
);

const encryptionSlice = createSlice({
  name: 'encryption',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOperation: (state, action: PayloadAction<EncryptionOperation>) => {
      state.currentOperation = action.payload;
    },
    clearCurrentOperation: (state) => {
      state.currentOperation = null;
    },
    addOperation: (state, action: PayloadAction<EncryptionOperation>) => {
      state.operations.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch algorithms
      .addCase(fetchAlgorithms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlgorithms.fulfilled, (state, action) => {
        state.loading = false;
        state.algorithms = action.payload;
      })
      .addCase(fetchAlgorithms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch algorithms';
      })
      // Encrypt data
      .addCase(encryptData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(encryptData.fulfilled, (state, action) => {
        state.loading = false;
        const operation: EncryptionOperation = {
          id: Date.now().toString(),
          operation_type: 'encrypt',
          algorithm: action.payload.algorithm,
          input_data: action.payload.input_data || '',
          output_data: action.payload.encrypted_data,
          status: 'completed',
          timestamp: action.payload.timestamp,
        };
        state.operations.unshift(operation);
        state.currentOperation = operation;
      })
      .addCase(encryptData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Encryption failed';
      })
      // Decrypt data
      .addCase(decryptData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(decryptData.fulfilled, (state, action) => {
        state.loading = false;
        const operation: EncryptionOperation = {
          id: Date.now().toString(),
          operation_type: 'decrypt',
          algorithm: action.payload.algorithm,
          input_data: action.payload.encrypted_data || '',
          output_data: action.payload.decrypted_data,
          status: 'completed',
          timestamp: action.payload.timestamp,
        };
        state.operations.unshift(operation);
        state.currentOperation = operation;
      })
      .addCase(decryptData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Decryption failed';
      });
  },
});

export const { clearError, setCurrentOperation, clearCurrentOperation, addOperation } = encryptionSlice.actions;
export default encryptionSlice.reducer;
