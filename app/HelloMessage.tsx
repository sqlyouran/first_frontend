"use client";

interface HelloMessageProps {
  message: string;
}

export default function HelloMessage({ message }: HelloMessageProps) {
  return <h1>{message}</h1>;
}
