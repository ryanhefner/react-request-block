// TypeScript Version: 3.4

import { Component, Context, ReactNode } from 'react';

/**
 * RequestBlockCache
 */

export interface RequestBlockCacheProps {
  [key: string]: any;
}

export class RequestBlockCache {
  constructor(cache: RequestBlockCacheProps);

  clear(): RequestBlockCache;
  extract(): RequestBlockCache;
  has(key: string): boolean;
  read(key: string): any;
  restore(cache: RequestBlockCache | string | null): RequestBlockCache;
  write(key: string, value: any): RequestBlockCache;
}

/**
 * RequestBlockContext
 */

export interface ContextProps<T = any> {
  cache: T;
}

export interface AnyContextProps extends ContextProps {
  [extraProps: string]: any;
}

export interface RequestBlockContext<A extends ContextProps = AnyContextProps> {
  cache?: RequestBlockCache;
  origin?: string;
  renderPromises?: boolean;
}

export class RequestBlockContext {}

/**
 * RequestBlockProvider
 */

export interface ProviderProps {
  cache?: RequestBlockCache;
  children?: ReactNode;
  context?: RequestBlockContext;
  renderPromises?: RenderPromises;
}

export class RequestBlockProvider extends Component<ProviderProps> {}

/**
 * getDataFromTree
 */

export interface defaultInfo {
  seen: boolean;
  observerable: null;
}

export function makeDefaultInfo(): defaultInfo;

export function getDataFromTree(tree: any, context: any): any;

export function getMarkupFromTree(tree: any, context: any, renderFunction: () => void): Promise<any>;

/**
 * hoc-utils
 */

export function getDisplayName(WrappedComponent: Component): string;

/**
 * RequestBlock
 */

export type ParserHandler = (data: any, props: any) => any;

export interface RequestBlockState {
  fetched: boolean;
  loading: boolean;
  data?: any;
  error?: any;
}

export interface RequestBlockProps {
  url: string;
  options?: any;
  parser?: ParserHandler;
  skip?: boolean;
  onError?: (state: RequestBlockState) => void;
  onLoad?: (state: RequestBlockState) => void;
  onRequest?: (state: RequestBlockState) => void;
}

export class RequestBlock extends Component<RequestBlockProps> {}

/**
 * RenderPromises
 */

export interface RequestBlockInfo {
  seen: boolean;
  observable: Promise<any> | null;
}

export interface RequestBlockMap {
  [key: string]: any;
}

export class RenderPromises {
  renderPromises: RequestBlockMap;
  infoTrie: RequestBlockMap;
  registerSSRObservable(instance: Component, observable: Promise<any>): void;
  getSSRObservable(instance: Component): Promise<any>;
  addPromise(instance: Component, finish: () => void): any;
  hasPromises(): boolean;
  consumeAndAwait(): Promise<any>;
  lookupInfo(instance: Component): RequestBlockInfo;
}

/**
 * withRequestBlock
 */

export function withRequestBlock(component: Component): Component;
