import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import {
  getAddress,
  signTransaction,
  signMessage,
  BitcoinNetwork,
  GetAddressPayload,
} from "sats-connect";
import {
  actionCreators,
  initialState,
  xverseReducer,
  XverseState,
} from "./ducks";

function useXverseContext({ network }: { network: BitcoinNetwork }) {
  const [state, dispatch] = useReducer(xverseReducer, initialState);
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

  const connect = useCallback(
    async (request: Omit<GetAddressPayload, "network">) => {
      actions.connectInit();
      try {
        await getAddress({
          payload: {
            network,
            ...request,
          },
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
  return { state, connect };
}

type TContext = ReturnType<typeof useXverseContext>;
const XverseProvider = createContext<TContext | null>(null);

export const Provider: FC<
  PropsWithChildren<{
    network: BitcoinNetwork;
  }>
> = ({ children, network }) => {
  const context = useXverseContext({
    network,
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
