import { Buffer } from "buffer";

export const convertToBase64Url = (address: string): string => {
  const [wc, hex] = address.split(":");

  // Convert wc and hex parts to a Buffer
  const wcBuffer = Buffer.from([parseInt(wc, 10)]); // Workchain as single byte
  const hexBuffer = Buffer.from(hex, "hex"); // Hex string to Buffer

  // Concatenate buffers
  const fullBuffer = Buffer.concat([wcBuffer, hexBuffer]);

  // Convert to base64 and replace to make it base64url
  return fullBuffer
    .toString("base64")
    .replace(/\+/g, "-") // Replace '+' with '-'
    .replace(/\//g, "_") // Replace '/' with '_'
    .replace(/=+$/, ""); // Remove padding
};
