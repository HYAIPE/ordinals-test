import Button from "@mui/material/Button";
import { AddressPurpose } from "sats-connect";
import { useXverse } from "./Context";
import { AsyncStatus } from "./ducks";
import { useCallback, useEffect } from "react";
import { CompactEncrypt, importSPKI } from "jose";
import { useNonceBitcoin } from "./graphql/nonce";
import { useSIWB } from "./graphql/swib";

export async function createJweRequest({
  signature,
  nonce,
  pubKeyStr,
}: {
  signature: string;
  nonce: string;
  pubKeyStr: string;
}) {
  const ge = new CompactEncrypt(new TextEncoder().encode(signature));
  const pubKey = await importSPKI(pubKeyStr, "ECDH-ES+A128KW", {
    extractable: true,
  });
  const jwe = await ge
    .setProtectedHeader({
      kid: nonce,
      alg: "ECDH-ES+A128KW",
      enc: "A128GCM",
      crv: "P-521",
    })
    .encrypt(pubKey);
  return jwe;
}

export const Connect = () => {
  const {
    connect,
    sign,
    address,
    state: {
      connectionStatus,
      errorMessage,
      signatureStatus,
      signature,
      ordinalsAddress,
    },
  } = useXverse();
  const { fetch: fetchNonce, nonce, pubKey, messageToSign } = useNonceBitcoin();
  const { fetch: fetchToken, token } = useSIWB();
  useEffect(() => {
    if (connectionStatus === AsyncStatus.FULFILLED && ordinalsAddress) {
      fetchNonce({
        variables: {
          address: ordinalsAddress,
        },
      });
    }
  }, [connectionStatus, fetchNonce, ordinalsAddress]);

  // useEffect(() => {
  //   if (messageToSign) {
  //     sign({ messageToSign });
  //   }
  // }, [messageToSign, sign]);

  // useEffect(() => {
  //   if (
  //     signatureStatus === AsyncStatus.FULFILLED &&
  //     signature &&
  //     nonce &&
  //     pubKey &&
  //     ordinalsAddress
  //   ) {
  //     Promise.resolve().then(async () => {
  //       const jweRequest = await createJweRequest({
  //         nonce,
  //         signature,
  //         pubKeyStr: pubKey,
  //       });
  //       fetchToken({
  //         variables: {
  //           address: ordinalsAddress,
  //           jwe: jweRequest,
  //         },
  //       });
  //     });
  //   }
  // }, [fetchToken, nonce, ordinalsAddress, pubKey, signature, signatureStatus]);

  const onClick = useCallback(async () => {
    connect({
      message: "Connect to Xverse",
    });
  }, [connect]);
  return (
    <Button variant="contained" color="primary" onClick={onClick}>
      {connectionStatus === AsyncStatus.FULFILLED ? "Connected" : "Connect"}
    </Button>
  );
};
