declare module "@mempool/electrum-client" {
  import { Socket } from "net";
  import { EventEmitter } from "events";
  import { TlsSocketWrapper } from "./TlsSocketWrapper.js";
  import {
    MessageParser,
    makeRequest,
    createPromiseResult,
    createPromiseResultBatch,
  } from "./util";

  class Client {
    constructor(
      port: number,
      host: string,
      protocol: string,
      options: unknown,
      callbacks: Callbacks
    );

    id: number;
    port: number;
    host: string;
    callback_message_queue: { [id: number]: Function };
    subscribe: EventEmitter;
    mp: MessageParser;
    _protocol: string;
    _options: Options;
    onErrorCallback: (e: Error) => void | null;
    conn: Socket | TlsSocketWrapper;
    status: number;

    initSocket(protocol: string, options: Options): void;
    connect(): Promise<void>;
    connectSocket(
      conn: Socket | TlsSocketWrapper,
      port: number,
      host: string
    ): Promise<void>;
    close(): void;
    request(method: string, params: any[]): Promise<any>;
    requestBatch(
      method: string,
      params: any[],
      secondParam?: any
    ): Promise<any>;
    response(msg: any): void;
    onMessage(body: any, n: number): void;
    onConnect(): void;
    onClose(e: Error): void;
    onRecv(chunk: any): void;
    onError(e: Error): void;
  }

  class TlsSocketWrapper {
    constructor(tls: any);

    _timeout: number;
    _encoding: string;
    _keepAliveEneblad: boolean;
    _keepAliveinitialDelay: number;
    _noDelay: boolean;
    _listeners: { [event: string]: Function[] };
    _socket: any;
    _tls: any;

    setTimeout(timeout: number): void;
    setEncoding(encoding: string): void;
    setKeepAlive(enabled: boolean, initialDelay: number): void;
    setNoDelay(noDelay: boolean): void;
    on(event: string, listener: Function): void;
    removeListener(event: string, listener: Function): void;
    connect(port: number, host: string, callback: Function): void;
    _passOnEvent(event: string, data: any): void;
    emit(event: string, data: any): void;
    end(): void;
    destroy(): void;
    write(data: any): void;
  }

  type ElectrumConfig = {
    client: string;
    version: string;
  };
  type PersistencePolicy = {
    retryPeriod: number;
    maxRetry: number;
    pingPeriod: number;
    callback: () => void;
  };

  type Callbacks = {
    onConnect?: (client: ElectrumClient, versionInfo: any) => void;
    onClose?: (client: ElectrumClient) => void;
    onLog?: (str: string) => void;
  };

  class ElectrumClient extends Client {
    constructor(
      port: number,
      host: string,
      protocol: string,
      options: unknown,
      callbacks: Callbacks
    );

    public initElectrum(
      electrumConfig: ElectrumConfig,
      persistencePolicy?: PersistencePolicy
    ): Promise<this>;

    versionInfo: any;

    public request(method: string, params: any[]): Promise<any>;

    public requestBatch(
      method: string,
      params: any[],
      secondParam: any
    ): Promise<any>;

    public onClose(): void;

    public keepAlive(): void;

    public close(): void;

    public reconnect(): Promise<any>;

    public log(str: string): void;

    server_version(
      client_name,
      protocol_version
    ): Promise<{ id: string; result: string }>;
    // server_banner() {
    //   return this.request('server.banner', []);
    // }
    // server_features() {
    //   return this.request('server.features', []);
    // }
    server_ping(): Promise<any>;
    // server_addPeer(features) {
    //   return this.request('server.add_peer', [features]);
    // }
    // serverDonation_address() {
    //   return this.request('server.donation_address', []);
    // }
    // serverPeers_subscribe() {
    //   return this.request('server.peers.subscribe', []);
    // }
    // blockchainAddress_getProof(address) {
    //   return this.request('blockchain.address.get_proof', [address]);
    // }
    public blockchainScripthash_getBalance(scripthash: string): Promise<{
      confirmed: number;
      unconfirmed: number;
    }>;
    // blockchainScripthash_getBalanceBatch(scripthash) {
    //   return this.requestBatch('blockchain.scripthash.get_balance', scripthash);
    // }
    // blockchainScripthash_listunspentBatch(scripthash) {
    //   return this.requestBatch('blockchain.scripthash.listunspent', scripthash);
    // }
    // blockchainScripthash_getHistory(scripthash) {
    //   return this.request('blockchain.scripthash.get_history', [scripthash]);
    // }
    // blockchainScripthash_getHistoryBatch(scripthash) {
    //   return this.requestBatch('blockchain.scripthash.get_history', scripthash);
    // }
    blockchainScripthash_getMempool(scripthash): Promise<any>;
    blockchainScripthash_listunspent(scripthash): Promise<any>;
    blockchainScripthash_subscribe(scripthash): Promise<any>;
    // blockchainBlock_getHeader(height) {
    //   return this.request('blockchain.block.get_header', [height]);
    // }
    // blockchainBlock_headers(start_height, count) {
    //   return this.request('blockchain.block.headeres', [start_height, count]);
    // }
    // blockchainEstimatefee(number) {
    //   return this.request('blockchain.estimatefee', [number]);
    // }
    // blockchainHeaders_subscribe(raw) {
    //   return this.request('blockchain.headers.subscribe', [raw || false]);
    // }
    // blockchain_relayfee() {
    //   return this.request('blockchain.relayfee', []);
    // }
    // blockchainTransaction_broadcast(rawtx) {
    //   return this.request('blockchain.transaction.broadcast', [rawtx]);
    // }
    blockchainTransaction_get(
      tx_hash,
      verbose
    ): Promise<{
      id: string;
      result: sting;
    }> {}
    blockchainTransaction_getBatch(
      tx_hash,
      verbose
    ): Promise<{
      id: string;
      result: string[];
    }> {}
    blockchainTransaction_getMerkle(
      tx_hash,
      height
    ): Promise<{
      id: string;
      result: {
        block_height: number;
        merkle: string[];
        pos: number;
      };
    }> {}
    mempool_getFeeHistogram(): Promise<{
      id: string;
      result: number[];
    }>;
    // // ---------------------------------
    // // protocol 1.1 deprecated method
    // // ---------------------------------
    blockchainUtxo_getAddress(
      tx_hash,
      index
    ): Promise<{
      id: string;
      result: {
        height: number;
        value: number;
      };
    }> {}
    blockchainNumblocks_subscribe(): Promise<{
      id: string;
      result: number;
    }> {}
    // // ---------------------------------
    // // protocol 1.2 deprecated method
    // // ---------------------------------
    public blockchainBlock_getChunk(index): Promise<{
      id: string;
      result: string;
    }> {}
    public blockchainAddress_getBalance(address): Promise<{
      id: string;
      result: {
        confirmed: number;
        unconfirmed: number;
      };
    }> {}
    public blockchainAddress_getHistory(address): Promise<{
      id: string;
      result: {
        tx_hash: string;
        height: number;
        fee: number;
        value: number;
      }[];
    }> {}
    public blockchainAddress_getMempool(address): Promise<{
      id: string;
      result: {
        tx_hash: string;
        height: number;
        fee: number;
        value: number;
      }[];
    }> {}
    public blockchainAddress_listunspent(address: string): Promise<{
      id: string;
      result: {
        tx_hash: string;
        tx_pos: number;
        value: number;
        height: number;
      }[];
    }>;
    public blockchainAddress_subscribe(address: string): Promise<{
      id: string;
      response: string;
    }> {}
  }

  export default ElectrumClient;
}
