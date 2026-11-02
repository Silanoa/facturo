"use client";
import { createContext, useContext } from "react";
export const S = createContext(null);
export const useSession = () => useContext(S);
