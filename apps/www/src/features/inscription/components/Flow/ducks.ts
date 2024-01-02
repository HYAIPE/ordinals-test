import { Reducer } from "react";

// Action types
export const START = "START";
export const AGREEMENT_CANCEL = "AGREEMENT_CANCEL";
export const AGREEMENT_ACCEPT = "AGREEMENT_ACCEPT";
export const CLAIM = "CLAIM";
export const PAY = "PAY";

// State
export type State = {
  readonly start: boolean;
  readonly agreement: boolean;
  readonly claim: boolean;
  readonly pay: boolean;
  readonly done: boolean;
};

export const initialState: State = {
  start: false,
  agreement: false,
  claim: false,
  pay: false,
  done: false,
};

// Action creators
export const start = () => ({
  type: START,
});
export const agreementCancel = () => ({
  type: AGREEMENT_CANCEL,
});
export const agreementAccept = () => ({
  type: AGREEMENT_ACCEPT,
});
export const claim = () => ({
  type: CLAIM,
});
export const pay = () => ({
  type: PAY,
});

// Reducer
export const reducer: Reducer<
  State,
  ReturnType<
    | typeof start
    | typeof agreementCancel
    | typeof agreementAccept
    | typeof claim
    | typeof pay
  >
> = (state = initialState, action) => {
  switch (action.type) {
    case START:
      return {
        start: false,
        agreement: true,
        claim: false,
        pay: false,
        done: false,
      };
    case AGREEMENT_CANCEL:
      return {
        agreement: false,
        claim: false,
        pay: false,
        start: true,
        done: false,
      };
    case AGREEMENT_ACCEPT:
      return {
        agreement: false,
        claim: true,
        pay: false,
        start: false,
        done: false,
      };
    case CLAIM:
      return {
        agreement: false,
        claim: false,
        pay: true,
        start: false,
        done: false,
      };
    case PAY:
      return {
        agreement: false,
        claim: false,
        pay: false,
        start: false,
        done: true,
      };
    default:
      return state;
  }
};

export const actionCreators = {
  start,
  agreementCancel,
  agreementAccept,
  claim,
  pay,
};
