import { constants } from "zlib";

export enum EMediaTypes {
  "UNKNOWN",
  "CODE",
  "PDF",
  "TEXT",
  "AUDIO",
  "IMAGE",
  "IFRAME",
  "MODEL",
  "MARKDOWN",
  "VIDEO",
}

type TEncodeMode =
  | typeof constants.BROTLI_MODE_GENERIC
  | typeof constants.BROTLI_MODE_TEXT;

export interface IMedia {
  encoderMode: TEncodeMode;
  mediaType: EMediaTypes;
}

// reference https://github.com/ordinals/ord/pull/1713/files
export const mimetypeInfo: Record<string, IMedia> = {
  "application/cbor": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.UNKNOWN,
  },
  "application/json": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.CODE,
  },
  "application/pdf": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.PDF,
  },
  "application/pgp-signature": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.TEXT,
  },
  "application/protobuf": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.UNKNOWN,
  },
  "application/yaml": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.CODE,
  },
  "audio/flac": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.AUDIO,
  },
  "audio/mpeg": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.AUDIO,
  },
  "audio/wav": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.AUDIO,
  },
  "font/otf": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.UNKNOWN,
  },
  "font/ttf": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.UNKNOWN,
  },
  "font/woff": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.UNKNOWN,
  },
  "font/woff2": {
    encoderMode: constants.BROTLI_MODE_FONT,
    mediaType: EMediaTypes.UNKNOWN,
  },
  "image/apng": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.IMAGE,
  },
  "image/avif": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.IMAGE,
  },
  "image/gif": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.IMAGE,
  },
  "image/jpeg": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.IMAGE,
  },
  "image/png": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.IMAGE,
  },
  "image/svg+xml": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.IFRAME,
  },
  "image/webp": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.IMAGE,
  },
  "model/gltf+json": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.MODEL,
  },
  "model/gltf-binary": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.MODEL,
  },
  "model/stl": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.UNKNOWN,
  },
  "text/css": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.CODE,
  },
  "text/html": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.IFRAME,
  },
  "text/html;charset=utf-8": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.IFRAME,
  },
  "text/javascript": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.CODE,
  },
  "text/markdown": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.MARKDOWN,
  },
  "text/markdown;charset=utf-8": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.MARKDOWN,
  },
  "text/plain": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.TEXT,
  },
  "text/plain;charset=utf-8": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.TEXT,
  },
  "text/x-python": {
    encoderMode: constants.BROTLI_MODE_TEXT,
    mediaType: EMediaTypes.CODE,
  },
  "video/mp4": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.VIDEO,
  },
  "video/webm": {
    encoderMode: constants.BROTLI_MODE_GENERIC,
    mediaType: EMediaTypes.VIDEO,
  },
};
