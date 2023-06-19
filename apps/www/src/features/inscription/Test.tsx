import { FC, useMemo, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import {
  generatePrivKey,
  generateFundingAddress,
  FundingAddressResponse,
} from "@0xflick/inscriptions";

function useFundingAddress({
  address,
  inscriptions,
  network,
  padding,
  tip,
}: Partial<Parameters<typeof generateFundingAddress>[0]>) {
  const [fundingAddress, setFundingAddress] =
    useState<FundingAddressResponse | null>(null);
  const privKey = useMemo(() => {
    return generatePrivKey();
  }, []);
  useEffect(() => {
    if (
      !(
        address &&
        inscriptions &&
        network &&
        typeof tip !== "undefined" &&
        privKey
      )
    ) {
      return;
    }
    let cancelled = false;
    (async () => {
      const fundingAddress = await generateFundingAddress({
        address,
        inscriptions,
        network,
        padding,
        tip,
        privKey,
      });
      if (!cancelled) {
        setFundingAddress(fundingAddress);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address, inscriptions, network, padding, privKey, tip, tippingAddress]);

  return fundingAddress;
}

function str2ab(text: string) {
  return new TextEncoder().encode(text);
}

const testNet = {
  type: "Mainnet",
} as const;
const testInscriptions = [
  {
    content: str2ab("Hello World!"),
    mimeType: "text/plain",
  },
];

export const Test: FC<{
  address?: string;
  onFundingAddress: (fundingAddress: FundingAddressResponse) => void;
}> = ({ address, onFundingAddress }) => {
  const fundingAddress = useFundingAddress({
    address,
    inscriptions: testInscriptions,
    network: testNet,
    tip: 0,
    padding: 0,
    tippingAddress: "bcrt1q0t8z6z5zqgq4w9j6g7qyj7m4y9j8v4y8q2j7p0",
  });

  useEffect(() => {
    if (fundingAddress) {
      onFundingAddress(fundingAddress);
    }
  }, [fundingAddress, onFundingAddress]);

  return (
    <Button
      onClick={() => {
        if (fundingAddress) {
          onFundingAddress(fundingAddress);
        }
      }}
    >
      Generate Funding Address
    </Button>
  );
};
