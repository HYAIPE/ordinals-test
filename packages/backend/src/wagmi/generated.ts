import {
  getContract,
  GetContractArgs,
  readContract,
  ReadContractConfig,
  writeContract,
  WriteContractArgs,
  WriteContractPreparedArgs,
  WriteContractUnpreparedArgs,
  prepareWriteContract,
  PrepareWriteContractConfig,
  watchContractEvent,
  WatchContractEventConfig,
  WatchContractEventCallback,
} from 'wagmi/actions'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAllowance
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAllowanceABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_address',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: '_claims',
        internalType: 'string[]',
        type: 'string[]',
        indexed: false,
      },
      {
        name: '_startIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Claimed',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_address', internalType: 'address', type: 'address' }],
    name: 'allClaimable',
    outputs: [{ name: '', internalType: 'string[]', type: 'string[]' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'claims', internalType: 'string[]', type: 'string[]' }],
    name: 'claim',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_address', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimable',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TestAllowance
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const testAllowanceABI = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: '_address',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: '_claims',
        internalType: 'string[]',
        type: 'string[]',
        indexed: false,
      },
      {
        name: '_startIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Claimed',
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '_address', internalType: 'address', type: 'address' }],
    name: 'allClaimable',
    outputs: [
      { name: 'currentClaims', internalType: 'string[]', type: 'string[]' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: '_claims', internalType: 'string[]', type: 'string[]' }],
    name: 'claim',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '_address', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimable',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Core
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link iAllowanceABI}__.
 */
export function getIAllowance(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: iAllowanceABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link iAllowanceABI}__.
 */
export function readIAllowance<
  TAbi extends readonly unknown[] = typeof iAllowanceABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: iAllowanceABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link iAllowanceABI}__.
 */
export function writeIAllowance<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof iAllowanceABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof iAllowanceABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: iAllowanceABI,
    ...config,
  } as unknown as WriteContractArgs<typeof iAllowanceABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link iAllowanceABI}__.
 */
export function prepareWriteIAllowance<
  TAbi extends readonly unknown[] = typeof iAllowanceABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: iAllowanceABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link iAllowanceABI}__.
 */
export function watchIAllowanceEvent<
  TAbi extends readonly unknown[] = typeof iAllowanceABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: iAllowanceABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}

/**
 * Wraps __{@link getContract}__ with `abi` set to __{@link testAllowanceABI}__.
 */
export function getTestAllowance(config: Omit<GetContractArgs, 'abi'>) {
  return getContract({ abi: testAllowanceABI, ...config })
}

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link testAllowanceABI}__.
 */
export function readTestAllowance<
  TAbi extends readonly unknown[] = typeof testAllowanceABI,
  TFunctionName extends string = string,
>(config: Omit<ReadContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return readContract({
    abi: testAllowanceABI,
    ...config,
  } as unknown as ReadContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link testAllowanceABI}__.
 */
export function writeTestAllowance<TFunctionName extends string>(
  config:
    | Omit<
        WriteContractPreparedArgs<typeof testAllowanceABI, TFunctionName>,
        'abi'
      >
    | Omit<
        WriteContractUnpreparedArgs<typeof testAllowanceABI, TFunctionName>,
        'abi'
      >,
) {
  return writeContract({
    abi: testAllowanceABI,
    ...config,
  } as unknown as WriteContractArgs<typeof testAllowanceABI, TFunctionName>)
}

/**
 * Wraps __{@link prepareWriteContract}__ with `abi` set to __{@link testAllowanceABI}__.
 */
export function prepareWriteTestAllowance<
  TAbi extends readonly unknown[] = typeof testAllowanceABI,
  TFunctionName extends string = string,
>(config: Omit<PrepareWriteContractConfig<TAbi, TFunctionName>, 'abi'>) {
  return prepareWriteContract({
    abi: testAllowanceABI,
    ...config,
  } as unknown as PrepareWriteContractConfig<TAbi, TFunctionName>)
}

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link testAllowanceABI}__.
 */
export function watchTestAllowanceEvent<
  TAbi extends readonly unknown[] = typeof testAllowanceABI,
  TEventName extends string = string,
>(
  config: Omit<WatchContractEventConfig<TAbi, TEventName>, 'abi'>,
  callback: WatchContractEventCallback<TAbi, TEventName>,
) {
  return watchContractEvent(
    { abi: testAllowanceABI, ...config } as WatchContractEventConfig<
      TAbi,
      TEventName
    >,
    callback,
  )
}
