import { ReactNode } from "react";
import "../src/index.css";

export function Wrapper({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}