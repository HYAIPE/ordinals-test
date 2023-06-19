import { createAction, createReducer } from "@reduxjs/toolkit";

export enum AsyncStatus {
  IDLE = "idle",
  PENDING = "pending",
  FULFILLED = "fulfilled",
  REJECTED = "rejected",
}

export interface XverseState {
  paymentAddress?: string;
  paymentPublicKey?: string;
  ordinalsAddress?: string;
  ordinalsPublicKey?: string;
  errorMessage?: string;
  connectionStatus: AsyncStatus;
}
export const initialState: XverseState = {
  connectionStatus: AsyncStatus.IDLE,
};
const connectInit = createAction("xverse/connect");
const connectFulfilled = createAction(
  "xverse/connect/fulfilled",
  ({
    paymentAddress,
    paymentPublicKey,
    ordinalsAddress,
    ordinalsPublicKey,
  }: {
    paymentAddress: string;
    paymentPublicKey: string;
    ordinalsAddress: string;
    ordinalsPublicKey: string;
  }) => ({
    payload: {
      paymentAddress,
      paymentPublicKey,
      ordinalsAddress,
      ordinalsPublicKey,
    },
  })
);
const connectRejected = createAction(
  "xverse/connect/rejected",
  (errorMessage: string) => ({
    payload: {
      errorMessage,
    },
  })
);

export const xverseReducer = createReducer<XverseState>(
  initialState,
  (builder) => {
    builder.addCase(connectInit, (state) => {
      state.connectionStatus = AsyncStatus.PENDING;
    });
    builder.addCase(connectFulfilled, (state, action) => {
      state.connectionStatus = AsyncStatus.FULFILLED;
      state.paymentAddress = action.payload.paymentAddress;
      state.paymentPublicKey = action.payload.paymentPublicKey;
      state.ordinalsAddress = action.payload.ordinalsAddress;
      state.ordinalsPublicKey = action.payload.ordinalsPublicKey;
    });
    builder.addCase(connectRejected, (state, action) => {
      state.connectionStatus = AsyncStatus.REJECTED;
      state.errorMessage = action.payload.errorMessage;
      state.paymentAddress = undefined;
      state.paymentPublicKey = undefined;
      state.ordinalsAddress = undefined;
      state.ordinalsPublicKey = undefined;
    });
  }
);

export const actionCreators = {
  connectInit,
  connectFulfilled,
  connectRejected,
};
