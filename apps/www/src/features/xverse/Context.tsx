import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  getAddress,
  signMessage,
  BitcoinNetwork,
  GetAddressPayload,
  AddressPurpose,
  SignMessagePayload,
  sendBtcTransaction,
} from "sats-connect";
import {
  actionCreators,
  AsyncStatus,
  initialState,
  xverseReducer,
} from "./ducks";

function useXverseContext(opts: {
  network: BitcoinNetwork["type"];
  purpose: AddressPurpose;
}) {
  const [state, dispatch] = useReducer(xverseReducer, {
    ...initialState,
    currentTarget: {
      network: opts.network,
      purpose: opts.purpose,
    },
  });
  const actions = useMemo(
    () => ({
      connectInit: () => dispatch(actionCreators.connectInit()),
      connectFulfilled: ({
        paymentAddress,
        paymentPublicKey,
        ordinalsAddress,
        ordinalsPublicKey,
      }: {
        paymentAddress: string;
        paymentPublicKey: string;
        ordinalsAddress: string;
        ordinalsPublicKey: string;
      }) =>
        dispatch(
          actionCreators.connectFulfilled({
            paymentAddress,
            paymentPublicKey,
            ordinalsAddress,
            ordinalsPublicKey,
          })
        ),
      connectRejected: (errorMessage: string) =>
        dispatch(actionCreators.connectRejected(errorMessage)),
    }),
    []
  );
  const isConnected = state.connectionStatus === AsyncStatus.FULFILLED;
  const isConnecting = state.connectionStatus === AsyncStatus.PENDING;
  const network = state.currentTarget?.network;
  const purpose = state.currentTarget?.purpose;
  const address =
    purpose === AddressPurpose.Ordinals
      ? state.ordinalsAddress
      : state.paymentAddress;

  const connect = useCallback(
    (opts: Omit<GetAddressPayload, "network" | "purposes">) => {
      actions.connectInit();
      try {
        const getAddressPayload: GetAddressPayload = {
          network: {
            type: network,
          },
          purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
          ...opts,
        };
        return new Promise<{
          paymentAddress: string;
          paymentPublicKey: string;
          ordinalsAddress: string;
          ordinalsPublicKey: string;
        }>((resolve, reject) =>
          getAddress({
            payload: getAddressPayload,
            onFinish(response) {
              let paymentAddress = "";
              let paymentPublicKey = "";
              let ordinalsAddress = "";
              let ordinalsPublicKey = "";
              for (const address of response.addresses) {
                if (address.purpose === "payment") {
                  paymentAddress = address.address;
                  paymentPublicKey = address.publicKey;
                } else if (address.purpose === "ordinals") {
                  ordinalsAddress = address.address;
                  ordinalsPublicKey = address.publicKey;
                }
              }
              const r = {
                paymentAddress,
                paymentPublicKey,
                ordinalsAddress,
                ordinalsPublicKey,
              };
              actions.connectFulfilled(r);
              resolve(r);
            },
            onCancel() {
              actions.connectRejected("User canceled");
              reject(new Error("User canceled"));
            },
          })
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          actions.connectRejected(error.message);
        }
        throw error;
      }
    },
    [actions, network]
  );

  const sign = useCallback(
    async ({
      messageToSign,
      network,
      address: addressToSign,
    }: {
      messageToSign: string;
      network?: BitcoinNetwork;
      address?: string;
    }) => {
      const initialNetwork = state.currentTarget?.network;
      const initialPurpose = state.currentTarget?.purpose;
      try {
        if (!initialNetwork && !network) {
          throw new Error("Network is required");
        }
        if (!initialPurpose && !address) {
          throw new Error("Address is required");
        }
        const signMessagePayload = {
          address: addressToSign ?? address,
          message: messageToSign,
          ...(initialNetwork ? { network: initialNetwork } : {}),
          ...(network ? { network } : {}),
          ...(initialPurpose
            ? {
                address:
                  initialPurpose === AddressPurpose.Ordinals
                    ? state.ordinalsAddress
                    : state.paymentAddress,
              }
            : {}),
          ...(address ? { address } : {}),
        } as SignMessagePayload;
        dispatch(actionCreators.signatureRequestInit());
        const response = await new Promise((resolve, reject) =>
          signMessage({
            payload: signMessagePayload,
            onFinish(response) {
              dispatch(
                actionCreators.signatureRequestFulfilled({
                  signature: response,
                })
              );
              resolve(response);
            },
            onCancel() {
              dispatch(
                actionCreators.signatureRequestRejected("User canceled")
              );
              reject(new Error("User canceled"));
            },
          })
        );
        return response;
      } catch (error: unknown) {
        if (error instanceof Error) {
          dispatch(actionCreators.signatureRequestRejected(error.message));
        }
      }
    },
    [
      address,
      state.currentTarget?.network,
      state.currentTarget?.purpose,
      state.ordinalsAddress,
      state.paymentAddress,
    ]
  );

  const networkSelect = useCallback(
    ({
      network,
      purpose,
    }: {
      network: BitcoinNetwork["type"];
      purpose: AddressPurpose;
    }) => {
      dispatch(actionCreators.switchTarget({ network, purpose }));
    },
    []
  );

  const sendBtc = useCallback(
    ({
      paymentAddress,
      paymentAmountSats,
    }: {
      paymentAddress: string;
      paymentAmountSats: bigint | number;
    }) => {
      if (!address) {
        throw new Error("Address is required");
      }
      return new Promise((resolve, reject) =>
        sendBtcTransaction({
          payload: {
            network: {
              type: network,
            },
            recipients: [
              {
                address: paymentAddress,
                amountSats: BigInt(paymentAmountSats),
              },
            ],
            senderAddress: address,
          },
          onCancel() {
            reject(new Error("User canceled"));
          },
          onFinish(response) {
            resolve(response);
          },
        })
      );
    },
    [address, network]
  );

  return {
    state,
    connect,
    sign,
    network,
    purpose,
    networkSelect,
    isConnected,
    isConnecting,
    address,
    sendBtc,
  };
}

type TContext = ReturnType<typeof useXverseContext>;
const XverseProvider = createContext<TContext | null>(null);

export const Provider: FC<
  PropsWithChildren<{
    network: BitcoinNetwork["type"];
    purpose: AddressPurpose;
  }>
> = ({ children, network, purpose }) => {
  const context = useXverseContext({
    network,
    purpose,
  });
  return (
    <XverseProvider.Provider value={context}>
      {children}
    </XverseProvider.Provider>
  );
};

export function useXverse() {
  const context = useContext(XverseProvider);
  if (!context) {
    throw new Error("useXverse must be used within a XverseProvider");
  }
  return context;
}
