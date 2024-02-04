import satori from "satori";
import React, { FC } from "react";

enum FontSize {
  Small = 32,
  Medium = 48,
  Large = 64,
}

const Info: FC<{
  title: string;
  seed: string;
  description: {
    text: string;
    fontSize: FontSize;
  }[];
}> = ({ title, description, seed }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img
          style={{
            width: "200",
            height: "200",
            padding: "20",
          }}
          src={`https://frame.bitflick.xyz/frame-og/axolotl/${seed}`}
        />
      }
      <div
        style={{
          display: "flex",
          width: "50%",
          alignItems: "center",
          justifyContent: "center",
          color: "black",
          fontFamily: "Roboto",
          fontWeight: 400,
          fontStyle: "normal",
        }}
      >
        <p
          style={{
            fontSize: FontSize.Large,
          }}
        >
          {title}
        </p>
        {description.map(({ text, fontSize }, index) => (
          <p
            key={`${text}-${index}`}
            style={{
              fontSize,
            }}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};

export async function createSvgAxolotl({
  seed,
  roboto,
}: {
  roboto: Buffer | ArrayBuffer;
  seed: string;
}) {
  return await satori(
    <Info
      title="Axolotl Valley"
      seed={seed}
      description={[
        {
          fontSize: FontSize.Medium,
          text: "Bitcoin Ordinal Mint",
        },
        {
          fontSize: FontSize.Medium,
          text: "A new way to mint and inscribe Bitcoin",
        },
      ]}
    />,
    {
      width: 800,
      height: 420,

      fonts: [
        {
          name: "Roboto",
          data: roboto,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
