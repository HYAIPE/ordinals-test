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
  AddressPurposes,
  SignMessagePayload,
} from "sats-connect";
import {
  actionCreators,
  AsyncStatus,
  initialState,
  xverseReducer,
} from "./ducks";

function useXverseContext(opts: {
  network: BitcoinNetwork["type"];
  purpose: AddressPurposes;
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
    purpose === AddressPurposes.ORDINALS
      ? state.ordinalsAddress
      : state.paymentAddress;

  const connect = useCallback(
    async (opts: Omit<GetAddressPayload, "network" | "purposes">) => {
      actions.connectInit();
      try {
        const getAddressPayload: GetAddressPayload = {
          network: {
            type: network,
          },
          purposes: [AddressPurposes.ORDINALS, AddressPurposes.PAYMENT],
          ...opts,
        };
        console.log("getAddressPayload", getAddressPayload);
        await getAddress({
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
            actions.connectFulfilled({
              paymentAddress,
              paymentPublicKey,
              ordinalsAddress,
              ordinalsPublicKey,
            });
          },
          onCancel() {
            actions.connectRejected("User canceled");
          },
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          actions.connectRejected(error.message);
        }
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
                  initialPurpose === AddressPurposes.ORDINALS
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
      purpose: AddressPurposes;
    }) => {
      dispatch(actionCreators.switchTarget({ network, purpose }));
    },
    []
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
  };
}

type TContext = ReturnType<typeof useXverseContext>;
const XverseProvider = createContext<TContext | null>(null);

export const Provider: FC<
  PropsWithChildren<{
    network: BitcoinNetwork["type"];
    purpose: AddressPurposes;
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
