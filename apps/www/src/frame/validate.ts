export type ValidateResponse = {
  valid: boolean;
  message: {
    data: {
      type: string;
      fid: number;
      timestamp: number;
      network: string;
      frameActionBody: {
        url: string;
        buttonIndex: number;
        inputText?: string;
        castId: {
          fid: number;
          hash: string;
        };
      };
    };
    hash: string;
    hashScheme: string;
    signature: string;
    signer: string;
  };
};

export async function validateFrameMessage(payload: string) {
  // Convert the hex string to a binary buffer
  const hexToBinary = (hex: string) => {
    const typedArray = new Uint8Array(
      hex.match(/[\da-f]{2}/gi)!.map((byte) => parseInt(byte, 16))
    );
    return typedArray;
  };

  const binaryData = hexToBinary(payload);
  const response = await fetch(
    "https://nemes.farcaster.xyz:2281/v1/validateMessage",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: binaryData,
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ValidateResponse = await response.json();
  return data; // or process the data as needed
}
