
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Employee
 * 
 */
export type Employee = $Result.DefaultSelection<Prisma.$EmployeePayload>
/**
 * Model Shift
 * 
 */
export type Shift = $Result.DefaultSelection<Prisma.$ShiftPayload>
/**
 * Model KpiRecord
 * 
 */
export type KpiRecord = $Result.DefaultSelection<Prisma.$KpiRecordPayload>
/**
 * Model MonthlyNorm
 * 
 */
export type MonthlyNorm = $Result.DefaultSelection<Prisma.$MonthlyNormPayload>
/**
 * Model PromotionSale
 * 
 */
export type PromotionSale = $Result.DefaultSelection<Prisma.$PromotionSalePayload>
/**
 * Model RegistrationKpi
 * 
 */
export type RegistrationKpi = $Result.DefaultSelection<Prisma.$RegistrationKpiPayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Employees
 * const employees = await prisma.employee.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Employees
   * const employees = await prisma.employee.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<T, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<'extends', Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.employee`: Exposes CRUD operations for the **Employee** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Employees
    * const employees = await prisma.employee.findMany()
    * ```
    */
  get employee(): Prisma.EmployeeDelegate<ExtArgs>;

  /**
   * `prisma.shift`: Exposes CRUD operations for the **Shift** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Shifts
    * const shifts = await prisma.shift.findMany()
    * ```
    */
  get shift(): Prisma.ShiftDelegate<ExtArgs>;

  /**
   * `prisma.kpiRecord`: Exposes CRUD operations for the **KpiRecord** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more KpiRecords
    * const kpiRecords = await prisma.kpiRecord.findMany()
    * ```
    */
  get kpiRecord(): Prisma.KpiRecordDelegate<ExtArgs>;

  /**
   * `prisma.monthlyNorm`: Exposes CRUD operations for the **MonthlyNorm** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MonthlyNorms
    * const monthlyNorms = await prisma.monthlyNorm.findMany()
    * ```
    */
  get monthlyNorm(): Prisma.MonthlyNormDelegate<ExtArgs>;

  /**
   * `prisma.promotionSale`: Exposes CRUD operations for the **PromotionSale** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PromotionSales
    * const promotionSales = await prisma.promotionSale.findMany()
    * ```
    */
  get promotionSale(): Prisma.PromotionSaleDelegate<ExtArgs>;

  /**
   * `prisma.registrationKpi`: Exposes CRUD operations for the **RegistrationKpi** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RegistrationKpis
    * const registrationKpis = await prisma.registrationKpi.findMany()
    * ```
    */
  get registrationKpi(): Prisma.RegistrationKpiDelegate<ExtArgs>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.10.2
   * Query Engine version: 5a9203d0590c951969e85a7d07215503f4672eb9
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray | { toJSON(): unknown }

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Employee: 'Employee',
    Shift: 'Shift',
    KpiRecord: 'KpiRecord',
    MonthlyNorm: 'MonthlyNorm',
    PromotionSale: 'PromotionSale',
    RegistrationKpi: 'RegistrationKpi',
    AuditLog: 'AuditLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }


  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs}, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meta: {
      modelProps: 'employee' | 'shift' | 'kpiRecord' | 'monthlyNorm' | 'promotionSale' | 'registrationKpi' | 'auditLog'
      txIsolationLevel: Prisma.TransactionIsolationLevel
    },
    model: {
      Employee: {
        payload: Prisma.$EmployeePayload<ExtArgs>
        fields: Prisma.EmployeeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmployeeFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmployeeFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          findFirst: {
            args: Prisma.EmployeeFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmployeeFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          findMany: {
            args: Prisma.EmployeeFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>[]
          }
          create: {
            args: Prisma.EmployeeCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          delete: {
            args: Prisma.EmployeeDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          update: {
            args: Prisma.EmployeeUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          deleteMany: {
            args: Prisma.EmployeeDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.EmployeeUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.EmployeeUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          aggregate: {
            args: Prisma.EmployeeAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateEmployee>
          }
          groupBy: {
            args: Prisma.EmployeeGroupByArgs<ExtArgs>,
            result: $Utils.Optional<EmployeeGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmployeeCountArgs<ExtArgs>,
            result: $Utils.Optional<EmployeeCountAggregateOutputType> | number
          }
        }
      }
      Shift: {
        payload: Prisma.$ShiftPayload<ExtArgs>
        fields: Prisma.ShiftFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShiftFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShiftFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          findFirst: {
            args: Prisma.ShiftFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShiftFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          findMany: {
            args: Prisma.ShiftFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>[]
          }
          create: {
            args: Prisma.ShiftCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          delete: {
            args: Prisma.ShiftDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          update: {
            args: Prisma.ShiftUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          deleteMany: {
            args: Prisma.ShiftDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.ShiftUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.ShiftUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ShiftPayload>
          }
          aggregate: {
            args: Prisma.ShiftAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateShift>
          }
          groupBy: {
            args: Prisma.ShiftGroupByArgs<ExtArgs>,
            result: $Utils.Optional<ShiftGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShiftCountArgs<ExtArgs>,
            result: $Utils.Optional<ShiftCountAggregateOutputType> | number
          }
        }
      }
      KpiRecord: {
        payload: Prisma.$KpiRecordPayload<ExtArgs>
        fields: Prisma.KpiRecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KpiRecordFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$KpiRecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KpiRecordFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$KpiRecordPayload>
          }
          findFirst: {
            args: Prisma.KpiRecordFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$KpiRecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KpiRecordFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$KpiRecordPayload>
          }
          findMany: {
            args: Prisma.KpiRecordFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$KpiRecordPayload>[]
          }
          create: {
            args: Prisma.KpiRecordCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$KpiRecordPayload>
          }
          delete: {
            args: Prisma.KpiRecordDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$KpiRecordPayload>
          }
          update: {
            args: Prisma.KpiRecordUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$KpiRecordPayload>
          }
          deleteMany: {
            args: Prisma.KpiRecordDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.KpiRecordUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.KpiRecordUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$KpiRecordPayload>
          }
          aggregate: {
            args: Prisma.KpiRecordAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateKpiRecord>
          }
          groupBy: {
            args: Prisma.KpiRecordGroupByArgs<ExtArgs>,
            result: $Utils.Optional<KpiRecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.KpiRecordCountArgs<ExtArgs>,
            result: $Utils.Optional<KpiRecordCountAggregateOutputType> | number
          }
        }
      }
      MonthlyNorm: {
        payload: Prisma.$MonthlyNormPayload<ExtArgs>
        fields: Prisma.MonthlyNormFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MonthlyNormFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$MonthlyNormPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MonthlyNormFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$MonthlyNormPayload>
          }
          findFirst: {
            args: Prisma.MonthlyNormFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$MonthlyNormPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MonthlyNormFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$MonthlyNormPayload>
          }
          findMany: {
            args: Prisma.MonthlyNormFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$MonthlyNormPayload>[]
          }
          create: {
            args: Prisma.MonthlyNormCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$MonthlyNormPayload>
          }
          delete: {
            args: Prisma.MonthlyNormDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$MonthlyNormPayload>
          }
          update: {
            args: Prisma.MonthlyNormUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$MonthlyNormPayload>
          }
          deleteMany: {
            args: Prisma.MonthlyNormDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.MonthlyNormUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.MonthlyNormUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$MonthlyNormPayload>
          }
          aggregate: {
            args: Prisma.MonthlyNormAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateMonthlyNorm>
          }
          groupBy: {
            args: Prisma.MonthlyNormGroupByArgs<ExtArgs>,
            result: $Utils.Optional<MonthlyNormGroupByOutputType>[]
          }
          count: {
            args: Prisma.MonthlyNormCountArgs<ExtArgs>,
            result: $Utils.Optional<MonthlyNormCountAggregateOutputType> | number
          }
        }
      }
      PromotionSale: {
        payload: Prisma.$PromotionSalePayload<ExtArgs>
        fields: Prisma.PromotionSaleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PromotionSaleFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$PromotionSalePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PromotionSaleFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$PromotionSalePayload>
          }
          findFirst: {
            args: Prisma.PromotionSaleFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$PromotionSalePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PromotionSaleFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$PromotionSalePayload>
          }
          findMany: {
            args: Prisma.PromotionSaleFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$PromotionSalePayload>[]
          }
          create: {
            args: Prisma.PromotionSaleCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$PromotionSalePayload>
          }
          delete: {
            args: Prisma.PromotionSaleDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$PromotionSalePayload>
          }
          update: {
            args: Prisma.PromotionSaleUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$PromotionSalePayload>
          }
          deleteMany: {
            args: Prisma.PromotionSaleDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.PromotionSaleUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.PromotionSaleUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$PromotionSalePayload>
          }
          aggregate: {
            args: Prisma.PromotionSaleAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregatePromotionSale>
          }
          groupBy: {
            args: Prisma.PromotionSaleGroupByArgs<ExtArgs>,
            result: $Utils.Optional<PromotionSaleGroupByOutputType>[]
          }
          count: {
            args: Prisma.PromotionSaleCountArgs<ExtArgs>,
            result: $Utils.Optional<PromotionSaleCountAggregateOutputType> | number
          }
        }
      }
      RegistrationKpi: {
        payload: Prisma.$RegistrationKpiPayload<ExtArgs>
        fields: Prisma.RegistrationKpiFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RegistrationKpiFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$RegistrationKpiPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RegistrationKpiFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$RegistrationKpiPayload>
          }
          findFirst: {
            args: Prisma.RegistrationKpiFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$RegistrationKpiPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RegistrationKpiFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$RegistrationKpiPayload>
          }
          findMany: {
            args: Prisma.RegistrationKpiFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$RegistrationKpiPayload>[]
          }
          create: {
            args: Prisma.RegistrationKpiCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$RegistrationKpiPayload>
          }
          delete: {
            args: Prisma.RegistrationKpiDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$RegistrationKpiPayload>
          }
          update: {
            args: Prisma.RegistrationKpiUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$RegistrationKpiPayload>
          }
          deleteMany: {
            args: Prisma.RegistrationKpiDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.RegistrationKpiUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.RegistrationKpiUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$RegistrationKpiPayload>
          }
          aggregate: {
            args: Prisma.RegistrationKpiAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateRegistrationKpi>
          }
          groupBy: {
            args: Prisma.RegistrationKpiGroupByArgs<ExtArgs>,
            result: $Utils.Optional<RegistrationKpiGroupByOutputType>[]
          }
          count: {
            args: Prisma.RegistrationKpiCountArgs<ExtArgs>,
            result: $Utils.Optional<RegistrationKpiCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>,
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>,
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<'define', Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type EmployeeCountOutputType
   */

  export type EmployeeCountOutputType = {
    kpiRecords: number
    promotionSales: number
    registrationKpis: number
    shifts: number
  }

  export type EmployeeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    kpiRecords?: boolean | EmployeeCountOutputTypeCountKpiRecordsArgs
    promotionSales?: boolean | EmployeeCountOutputTypeCountPromotionSalesArgs
    registrationKpis?: boolean | EmployeeCountOutputTypeCountRegistrationKpisArgs
    shifts?: boolean | EmployeeCountOutputTypeCountShiftsArgs
  }

  // Custom InputTypes

  /**
   * EmployeeCountOutputType without action
   */
  export type EmployeeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeCountOutputType
     */
    select?: EmployeeCountOutputTypeSelect<ExtArgs> | null
  }


  /**
   * EmployeeCountOutputType without action
   */
  export type EmployeeCountOutputTypeCountKpiRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KpiRecordWhereInput
  }


  /**
   * EmployeeCountOutputType without action
   */
  export type EmployeeCountOutputTypeCountPromotionSalesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PromotionSaleWhereInput
  }


  /**
   * EmployeeCountOutputType without action
   */
  export type EmployeeCountOutputTypeCountRegistrationKpisArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistrationKpiWhereInput
  }


  /**
   * EmployeeCountOutputType without action
   */
  export type EmployeeCountOutputTypeCountShiftsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShiftWhereInput
  }



  /**
   * Models
   */

  /**
   * Model Employee
   */

  export type AggregateEmployee = {
    _count: EmployeeCountAggregateOutputType | null
    _avg: EmployeeAvgAggregateOutputType | null
    _sum: EmployeeSumAggregateOutputType | null
    _min: EmployeeMinAggregateOutputType | null
    _max: EmployeeMaxAggregateOutputType | null
  }

  export type EmployeeAvgAggregateOutputType = {
    baseSalary: number | null
    hourlyRate: number | null
    sortOrder: number | null
  }

  export type EmployeeSumAggregateOutputType = {
    baseSalary: number | null
    hourlyRate: number | null
    sortOrder: number | null
  }

  export type EmployeeMinAggregateOutputType = {
    id: string | null
    name: string | null
    role: string | null
    password: string | null
    baseSalary: number | null
    hourlyRate: number | null
    branch: string | null
    sortOrder: number | null
    createdAt: string | null
  }

  export type EmployeeMaxAggregateOutputType = {
    id: string | null
    name: string | null
    role: string | null
    password: string | null
    baseSalary: number | null
    hourlyRate: number | null
    branch: string | null
    sortOrder: number | null
    createdAt: string | null
  }

  export type EmployeeCountAggregateOutputType = {
    id: number
    name: number
    role: number
    password: number
    baseSalary: number
    hourlyRate: number
    branch: number
    sortOrder: number
    createdAt: number
    _all: number
  }


  export type EmployeeAvgAggregateInputType = {
    baseSalary?: true
    hourlyRate?: true
    sortOrder?: true
  }

  export type EmployeeSumAggregateInputType = {
    baseSalary?: true
    hourlyRate?: true
    sortOrder?: true
  }

  export type EmployeeMinAggregateInputType = {
    id?: true
    name?: true
    role?: true
    password?: true
    baseSalary?: true
    hourlyRate?: true
    branch?: true
    sortOrder?: true
    createdAt?: true
  }

  export type EmployeeMaxAggregateInputType = {
    id?: true
    name?: true
    role?: true
    password?: true
    baseSalary?: true
    hourlyRate?: true
    branch?: true
    sortOrder?: true
    createdAt?: true
  }

  export type EmployeeCountAggregateInputType = {
    id?: true
    name?: true
    role?: true
    password?: true
    baseSalary?: true
    hourlyRate?: true
    branch?: true
    sortOrder?: true
    createdAt?: true
    _all?: true
  }

  export type EmployeeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Employee to aggregate.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Employees
    **/
    _count?: true | EmployeeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmployeeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmployeeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmployeeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmployeeMaxAggregateInputType
  }

  export type GetEmployeeAggregateType<T extends EmployeeAggregateArgs> = {
        [P in keyof T & keyof AggregateEmployee]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmployee[P]>
      : GetScalarType<T[P], AggregateEmployee[P]>
  }




  export type EmployeeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmployeeWhereInput
    orderBy?: EmployeeOrderByWithAggregationInput | EmployeeOrderByWithAggregationInput[]
    by: EmployeeScalarFieldEnum[] | EmployeeScalarFieldEnum
    having?: EmployeeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmployeeCountAggregateInputType | true
    _avg?: EmployeeAvgAggregateInputType
    _sum?: EmployeeSumAggregateInputType
    _min?: EmployeeMinAggregateInputType
    _max?: EmployeeMaxAggregateInputType
  }

  export type EmployeeGroupByOutputType = {
    id: string
    name: string
    role: string
    password: string
    baseSalary: number
    hourlyRate: number
    branch: string | null
    sortOrder: number
    createdAt: string
    _count: EmployeeCountAggregateOutputType | null
    _avg: EmployeeAvgAggregateOutputType | null
    _sum: EmployeeSumAggregateOutputType | null
    _min: EmployeeMinAggregateOutputType | null
    _max: EmployeeMaxAggregateOutputType | null
  }

  type GetEmployeeGroupByPayload<T extends EmployeeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmployeeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmployeeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmployeeGroupByOutputType[P]>
            : GetScalarType<T[P], EmployeeGroupByOutputType[P]>
        }
      >
    >


  export type EmployeeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    role?: boolean
    password?: boolean
    baseSalary?: boolean
    hourlyRate?: boolean
    branch?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    kpiRecords?: boolean | Employee$kpiRecordsArgs<ExtArgs>
    promotionSales?: boolean | Employee$promotionSalesArgs<ExtArgs>
    registrationKpis?: boolean | Employee$registrationKpisArgs<ExtArgs>
    shifts?: boolean | Employee$shiftsArgs<ExtArgs>
    _count?: boolean | EmployeeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["employee"]>

  export type EmployeeSelectScalar = {
    id?: boolean
    name?: boolean
    role?: boolean
    password?: boolean
    baseSalary?: boolean
    hourlyRate?: boolean
    branch?: boolean
    sortOrder?: boolean
    createdAt?: boolean
  }

  export type EmployeeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    kpiRecords?: boolean | Employee$kpiRecordsArgs<ExtArgs>
    promotionSales?: boolean | Employee$promotionSalesArgs<ExtArgs>
    registrationKpis?: boolean | Employee$registrationKpisArgs<ExtArgs>
    shifts?: boolean | Employee$shiftsArgs<ExtArgs>
    _count?: boolean | EmployeeCountOutputTypeDefaultArgs<ExtArgs>
  }


  export type $EmployeePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Employee"
    objects: {
      kpiRecords: Prisma.$KpiRecordPayload<ExtArgs>[]
      promotionSales: Prisma.$PromotionSalePayload<ExtArgs>[]
      registrationKpis: Prisma.$RegistrationKpiPayload<ExtArgs>[]
      shifts: Prisma.$ShiftPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      role: string
      password: string
      baseSalary: number
      hourlyRate: number
      branch: string | null
      sortOrder: number
      createdAt: string
    }, ExtArgs["result"]["employee"]>
    composites: {}
  }


  type EmployeeGetPayload<S extends boolean | null | undefined | EmployeeDefaultArgs> = $Result.GetResult<Prisma.$EmployeePayload, S>

  type EmployeeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EmployeeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EmployeeCountAggregateInputType | true
    }

  export interface EmployeeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Employee'], meta: { name: 'Employee' } }
    /**
     * Find zero or one Employee that matches the filter.
     * @param {EmployeeFindUniqueArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends EmployeeFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, EmployeeFindUniqueArgs<ExtArgs>>
    ): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one Employee that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {EmployeeFindUniqueOrThrowArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends EmployeeFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, EmployeeFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first Employee that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeFindFirstArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends EmployeeFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, EmployeeFindFirstArgs<ExtArgs>>
    ): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first Employee that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeFindFirstOrThrowArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends EmployeeFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, EmployeeFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more Employees that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Employees
     * const employees = await prisma.employee.findMany()
     * 
     * // Get first 10 Employees
     * const employees = await prisma.employee.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const employeeWithIdOnly = await prisma.employee.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends EmployeeFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, EmployeeFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a Employee.
     * @param {EmployeeCreateArgs} args - Arguments to create a Employee.
     * @example
     * // Create one Employee
     * const Employee = await prisma.employee.create({
     *   data: {
     *     // ... data to create a Employee
     *   }
     * })
     * 
    **/
    create<T extends EmployeeCreateArgs<ExtArgs>>(
      args: SelectSubset<T, EmployeeCreateArgs<ExtArgs>>
    ): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Delete a Employee.
     * @param {EmployeeDeleteArgs} args - Arguments to delete one Employee.
     * @example
     * // Delete one Employee
     * const Employee = await prisma.employee.delete({
     *   where: {
     *     // ... filter to delete one Employee
     *   }
     * })
     * 
    **/
    delete<T extends EmployeeDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, EmployeeDeleteArgs<ExtArgs>>
    ): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one Employee.
     * @param {EmployeeUpdateArgs} args - Arguments to update one Employee.
     * @example
     * // Update one Employee
     * const employee = await prisma.employee.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends EmployeeUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, EmployeeUpdateArgs<ExtArgs>>
    ): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more Employees.
     * @param {EmployeeDeleteManyArgs} args - Arguments to filter Employees to delete.
     * @example
     * // Delete a few Employees
     * const { count } = await prisma.employee.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends EmployeeDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, EmployeeDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Employees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Employees
     * const employee = await prisma.employee.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends EmployeeUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, EmployeeUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Employee.
     * @param {EmployeeUpsertArgs} args - Arguments to update or create a Employee.
     * @example
     * // Update or create a Employee
     * const employee = await prisma.employee.upsert({
     *   create: {
     *     // ... data to create a Employee
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Employee we want to update
     *   }
     * })
    **/
    upsert<T extends EmployeeUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, EmployeeUpsertArgs<ExtArgs>>
    ): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of Employees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeCountArgs} args - Arguments to filter Employees to count.
     * @example
     * // Count the number of Employees
     * const count = await prisma.employee.count({
     *   where: {
     *     // ... the filter for the Employees we want to count
     *   }
     * })
    **/
    count<T extends EmployeeCountArgs>(
      args?: Subset<T, EmployeeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmployeeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Employee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmployeeAggregateArgs>(args: Subset<T, EmployeeAggregateArgs>): Prisma.PrismaPromise<GetEmployeeAggregateType<T>>

    /**
     * Group by Employee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmployeeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmployeeGroupByArgs['orderBy'] }
        : { orderBy?: EmployeeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmployeeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmployeeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Employee model
   */
  readonly fields: EmployeeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Employee.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmployeeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    kpiRecords<T extends Employee$kpiRecordsArgs<ExtArgs> = {}>(args?: Subset<T, Employee$kpiRecordsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KpiRecordPayload<ExtArgs>, T, 'findMany'> | Null>;

    promotionSales<T extends Employee$promotionSalesArgs<ExtArgs> = {}>(args?: Subset<T, Employee$promotionSalesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PromotionSalePayload<ExtArgs>, T, 'findMany'> | Null>;

    registrationKpis<T extends Employee$registrationKpisArgs<ExtArgs> = {}>(args?: Subset<T, Employee$registrationKpisArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistrationKpiPayload<ExtArgs>, T, 'findMany'> | Null>;

    shifts<T extends Employee$shiftsArgs<ExtArgs> = {}>(args?: Subset<T, Employee$shiftsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, 'findMany'> | Null>;

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the Employee model
   */ 
  interface EmployeeFieldRefs {
    readonly id: FieldRef<"Employee", 'String'>
    readonly name: FieldRef<"Employee", 'String'>
    readonly role: FieldRef<"Employee", 'String'>
    readonly password: FieldRef<"Employee", 'String'>
    readonly baseSalary: FieldRef<"Employee", 'Float'>
    readonly hourlyRate: FieldRef<"Employee", 'Float'>
    readonly branch: FieldRef<"Employee", 'String'>
    readonly sortOrder: FieldRef<"Employee", 'Int'>
    readonly createdAt: FieldRef<"Employee", 'String'>
  }
    

  // Custom InputTypes

  /**
   * Employee findUnique
   */
  export type EmployeeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where: EmployeeWhereUniqueInput
  }


  /**
   * Employee findUniqueOrThrow
   */
  export type EmployeeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where: EmployeeWhereUniqueInput
  }


  /**
   * Employee findFirst
   */
  export type EmployeeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Employees.
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Employees.
     */
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }


  /**
   * Employee findFirstOrThrow
   */
  export type EmployeeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Employees.
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Employees.
     */
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }


  /**
   * Employee findMany
   */
  export type EmployeeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employees to fetch.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Employees.
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }


  /**
   * Employee create
   */
  export type EmployeeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * The data needed to create a Employee.
     */
    data: XOR<EmployeeCreateInput, EmployeeUncheckedCreateInput>
  }


  /**
   * Employee update
   */
  export type EmployeeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * The data needed to update a Employee.
     */
    data: XOR<EmployeeUpdateInput, EmployeeUncheckedUpdateInput>
    /**
     * Choose, which Employee to update.
     */
    where: EmployeeWhereUniqueInput
  }


  /**
   * Employee updateMany
   */
  export type EmployeeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Employees.
     */
    data: XOR<EmployeeUpdateManyMutationInput, EmployeeUncheckedUpdateManyInput>
    /**
     * Filter which Employees to update
     */
    where?: EmployeeWhereInput
  }


  /**
   * Employee upsert
   */
  export type EmployeeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * The filter to search for the Employee to update in case it exists.
     */
    where: EmployeeWhereUniqueInput
    /**
     * In case the Employee found by the `where` argument doesn't exist, create a new Employee with this data.
     */
    create: XOR<EmployeeCreateInput, EmployeeUncheckedCreateInput>
    /**
     * In case the Employee was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmployeeUpdateInput, EmployeeUncheckedUpdateInput>
  }


  /**
   * Employee delete
   */
  export type EmployeeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter which Employee to delete.
     */
    where: EmployeeWhereUniqueInput
  }


  /**
   * Employee deleteMany
   */
  export type EmployeeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Employees to delete
     */
    where?: EmployeeWhereInput
  }


  /**
   * Employee.kpiRecords
   */
  export type Employee$kpiRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KpiRecord
     */
    select?: KpiRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: KpiRecordInclude<ExtArgs> | null
    where?: KpiRecordWhereInput
    orderBy?: KpiRecordOrderByWithRelationInput | KpiRecordOrderByWithRelationInput[]
    cursor?: KpiRecordWhereUniqueInput
    take?: number
    skip?: number
    distinct?: KpiRecordScalarFieldEnum | KpiRecordScalarFieldEnum[]
  }


  /**
   * Employee.promotionSales
   */
  export type Employee$promotionSalesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionSale
     */
    select?: PromotionSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: PromotionSaleInclude<ExtArgs> | null
    where?: PromotionSaleWhereInput
    orderBy?: PromotionSaleOrderByWithRelationInput | PromotionSaleOrderByWithRelationInput[]
    cursor?: PromotionSaleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PromotionSaleScalarFieldEnum | PromotionSaleScalarFieldEnum[]
  }


  /**
   * Employee.registrationKpis
   */
  export type Employee$registrationKpisArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistrationKpi
     */
    select?: RegistrationKpiSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegistrationKpiInclude<ExtArgs> | null
    where?: RegistrationKpiWhereInput
    orderBy?: RegistrationKpiOrderByWithRelationInput | RegistrationKpiOrderByWithRelationInput[]
    cursor?: RegistrationKpiWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RegistrationKpiScalarFieldEnum | RegistrationKpiScalarFieldEnum[]
  }


  /**
   * Employee.shifts
   */
  export type Employee$shiftsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ShiftInclude<ExtArgs> | null
    where?: ShiftWhereInput
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    cursor?: ShiftWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }


  /**
   * Employee without action
   */
  export type EmployeeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: EmployeeInclude<ExtArgs> | null
  }



  /**
   * Model Shift
   */

  export type AggregateShift = {
    _count: ShiftCountAggregateOutputType | null
    _avg: ShiftAvgAggregateOutputType | null
    _sum: ShiftSumAggregateOutputType | null
    _min: ShiftMinAggregateOutputType | null
    _max: ShiftMaxAggregateOutputType | null
  }

  export type ShiftAvgAggregateOutputType = {
    hours: number | null
    coefficient: number | null
  }

  export type ShiftSumAggregateOutputType = {
    hours: number | null
    coefficient: number | null
  }

  export type ShiftMinAggregateOutputType = {
    id: string | null
    date: string | null
    employeeId: string | null
    type: string | null
    hours: number | null
    cabinetClosed: boolean | null
    centerClosed: boolean | null
    coefficient: number | null
    comment: string | null
    createdAt: string | null
    createdBy: string | null
    isDeleted: boolean | null
  }

  export type ShiftMaxAggregateOutputType = {
    id: string | null
    date: string | null
    employeeId: string | null
    type: string | null
    hours: number | null
    cabinetClosed: boolean | null
    centerClosed: boolean | null
    coefficient: number | null
    comment: string | null
    createdAt: string | null
    createdBy: string | null
    isDeleted: boolean | null
  }

  export type ShiftCountAggregateOutputType = {
    id: number
    date: number
    employeeId: number
    type: number
    hours: number
    cabinetClosed: number
    centerClosed: number
    coefficient: number
    comment: number
    createdAt: number
    createdBy: number
    isDeleted: number
    _all: number
  }


  export type ShiftAvgAggregateInputType = {
    hours?: true
    coefficient?: true
  }

  export type ShiftSumAggregateInputType = {
    hours?: true
    coefficient?: true
  }

  export type ShiftMinAggregateInputType = {
    id?: true
    date?: true
    employeeId?: true
    type?: true
    hours?: true
    cabinetClosed?: true
    centerClosed?: true
    coefficient?: true
    comment?: true
    createdAt?: true
    createdBy?: true
    isDeleted?: true
  }

  export type ShiftMaxAggregateInputType = {
    id?: true
    date?: true
    employeeId?: true
    type?: true
    hours?: true
    cabinetClosed?: true
    centerClosed?: true
    coefficient?: true
    comment?: true
    createdAt?: true
    createdBy?: true
    isDeleted?: true
  }

  export type ShiftCountAggregateInputType = {
    id?: true
    date?: true
    employeeId?: true
    type?: true
    hours?: true
    cabinetClosed?: true
    centerClosed?: true
    coefficient?: true
    comment?: true
    createdAt?: true
    createdBy?: true
    isDeleted?: true
    _all?: true
  }

  export type ShiftAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Shift to aggregate.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Shifts
    **/
    _count?: true | ShiftCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ShiftAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ShiftSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShiftMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShiftMaxAggregateInputType
  }

  export type GetShiftAggregateType<T extends ShiftAggregateArgs> = {
        [P in keyof T & keyof AggregateShift]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShift[P]>
      : GetScalarType<T[P], AggregateShift[P]>
  }




  export type ShiftGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShiftWhereInput
    orderBy?: ShiftOrderByWithAggregationInput | ShiftOrderByWithAggregationInput[]
    by: ShiftScalarFieldEnum[] | ShiftScalarFieldEnum
    having?: ShiftScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShiftCountAggregateInputType | true
    _avg?: ShiftAvgAggregateInputType
    _sum?: ShiftSumAggregateInputType
    _min?: ShiftMinAggregateInputType
    _max?: ShiftMaxAggregateInputType
  }

  export type ShiftGroupByOutputType = {
    id: string
    date: string
    employeeId: string
    type: string
    hours: number
    cabinetClosed: boolean
    centerClosed: boolean
    coefficient: number
    comment: string | null
    createdAt: string
    createdBy: string | null
    isDeleted: boolean
    _count: ShiftCountAggregateOutputType | null
    _avg: ShiftAvgAggregateOutputType | null
    _sum: ShiftSumAggregateOutputType | null
    _min: ShiftMinAggregateOutputType | null
    _max: ShiftMaxAggregateOutputType | null
  }

  type GetShiftGroupByPayload<T extends ShiftGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShiftGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShiftGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShiftGroupByOutputType[P]>
            : GetScalarType<T[P], ShiftGroupByOutputType[P]>
        }
      >
    >


  export type ShiftSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    employeeId?: boolean
    type?: boolean
    hours?: boolean
    cabinetClosed?: boolean
    centerClosed?: boolean
    coefficient?: boolean
    comment?: boolean
    createdAt?: boolean
    createdBy?: boolean
    isDeleted?: boolean
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shift"]>

  export type ShiftSelectScalar = {
    id?: boolean
    date?: boolean
    employeeId?: boolean
    type?: boolean
    hours?: boolean
    cabinetClosed?: boolean
    centerClosed?: boolean
    coefficient?: boolean
    comment?: boolean
    createdAt?: boolean
    createdBy?: boolean
    isDeleted?: boolean
  }

  export type ShiftInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }


  export type $ShiftPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Shift"
    objects: {
      employee: Prisma.$EmployeePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: string
      employeeId: string
      type: string
      hours: number
      cabinetClosed: boolean
      centerClosed: boolean
      coefficient: number
      comment: string | null
      createdAt: string
      createdBy: string | null
      isDeleted: boolean
    }, ExtArgs["result"]["shift"]>
    composites: {}
  }


  type ShiftGetPayload<S extends boolean | null | undefined | ShiftDefaultArgs> = $Result.GetResult<Prisma.$ShiftPayload, S>

  type ShiftCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ShiftFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ShiftCountAggregateInputType | true
    }

  export interface ShiftDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Shift'], meta: { name: 'Shift' } }
    /**
     * Find zero or one Shift that matches the filter.
     * @param {ShiftFindUniqueArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends ShiftFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, ShiftFindUniqueArgs<ExtArgs>>
    ): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one Shift that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {ShiftFindUniqueOrThrowArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends ShiftFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, ShiftFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first Shift that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftFindFirstArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends ShiftFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, ShiftFindFirstArgs<ExtArgs>>
    ): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first Shift that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftFindFirstOrThrowArgs} args - Arguments to find a Shift
     * @example
     * // Get one Shift
     * const shift = await prisma.shift.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends ShiftFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, ShiftFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more Shifts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Shifts
     * const shifts = await prisma.shift.findMany()
     * 
     * // Get first 10 Shifts
     * const shifts = await prisma.shift.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shiftWithIdOnly = await prisma.shift.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends ShiftFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, ShiftFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a Shift.
     * @param {ShiftCreateArgs} args - Arguments to create a Shift.
     * @example
     * // Create one Shift
     * const Shift = await prisma.shift.create({
     *   data: {
     *     // ... data to create a Shift
     *   }
     * })
     * 
    **/
    create<T extends ShiftCreateArgs<ExtArgs>>(
      args: SelectSubset<T, ShiftCreateArgs<ExtArgs>>
    ): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Delete a Shift.
     * @param {ShiftDeleteArgs} args - Arguments to delete one Shift.
     * @example
     * // Delete one Shift
     * const Shift = await prisma.shift.delete({
     *   where: {
     *     // ... filter to delete one Shift
     *   }
     * })
     * 
    **/
    delete<T extends ShiftDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, ShiftDeleteArgs<ExtArgs>>
    ): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one Shift.
     * @param {ShiftUpdateArgs} args - Arguments to update one Shift.
     * @example
     * // Update one Shift
     * const shift = await prisma.shift.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends ShiftUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, ShiftUpdateArgs<ExtArgs>>
    ): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more Shifts.
     * @param {ShiftDeleteManyArgs} args - Arguments to filter Shifts to delete.
     * @example
     * // Delete a few Shifts
     * const { count } = await prisma.shift.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends ShiftDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, ShiftDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Shifts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Shifts
     * const shift = await prisma.shift.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends ShiftUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, ShiftUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Shift.
     * @param {ShiftUpsertArgs} args - Arguments to update or create a Shift.
     * @example
     * // Update or create a Shift
     * const shift = await prisma.shift.upsert({
     *   create: {
     *     // ... data to create a Shift
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Shift we want to update
     *   }
     * })
    **/
    upsert<T extends ShiftUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, ShiftUpsertArgs<ExtArgs>>
    ): Prisma__ShiftClient<$Result.GetResult<Prisma.$ShiftPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of Shifts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftCountArgs} args - Arguments to filter Shifts to count.
     * @example
     * // Count the number of Shifts
     * const count = await prisma.shift.count({
     *   where: {
     *     // ... the filter for the Shifts we want to count
     *   }
     * })
    **/
    count<T extends ShiftCountArgs>(
      args?: Subset<T, ShiftCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShiftCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Shift.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShiftAggregateArgs>(args: Subset<T, ShiftAggregateArgs>): Prisma.PrismaPromise<GetShiftAggregateType<T>>

    /**
     * Group by Shift.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShiftGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShiftGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShiftGroupByArgs['orderBy'] }
        : { orderBy?: ShiftGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShiftGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShiftGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Shift model
   */
  readonly fields: ShiftFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Shift.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShiftClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    employee<T extends EmployeeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeDefaultArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null, Null, ExtArgs>;

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the Shift model
   */ 
  interface ShiftFieldRefs {
    readonly id: FieldRef<"Shift", 'String'>
    readonly date: FieldRef<"Shift", 'String'>
    readonly employeeId: FieldRef<"Shift", 'String'>
    readonly type: FieldRef<"Shift", 'String'>
    readonly hours: FieldRef<"Shift", 'Float'>
    readonly cabinetClosed: FieldRef<"Shift", 'Boolean'>
    readonly centerClosed: FieldRef<"Shift", 'Boolean'>
    readonly coefficient: FieldRef<"Shift", 'Float'>
    readonly comment: FieldRef<"Shift", 'String'>
    readonly createdAt: FieldRef<"Shift", 'String'>
    readonly createdBy: FieldRef<"Shift", 'String'>
    readonly isDeleted: FieldRef<"Shift", 'Boolean'>
  }
    

  // Custom InputTypes

  /**
   * Shift findUnique
   */
  export type ShiftFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where: ShiftWhereUniqueInput
  }


  /**
   * Shift findUniqueOrThrow
   */
  export type ShiftFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where: ShiftWhereUniqueInput
  }


  /**
   * Shift findFirst
   */
  export type ShiftFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Shifts.
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Shifts.
     */
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }


  /**
   * Shift findFirstOrThrow
   */
  export type ShiftFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shift to fetch.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Shifts.
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Shifts.
     */
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }


  /**
   * Shift findMany
   */
  export type ShiftFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter, which Shifts to fetch.
     */
    where?: ShiftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shifts to fetch.
     */
    orderBy?: ShiftOrderByWithRelationInput | ShiftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Shifts.
     */
    cursor?: ShiftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shifts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shifts.
     */
    skip?: number
    distinct?: ShiftScalarFieldEnum | ShiftScalarFieldEnum[]
  }


  /**
   * Shift create
   */
  export type ShiftCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * The data needed to create a Shift.
     */
    data: XOR<ShiftCreateInput, ShiftUncheckedCreateInput>
  }


  /**
   * Shift update
   */
  export type ShiftUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * The data needed to update a Shift.
     */
    data: XOR<ShiftUpdateInput, ShiftUncheckedUpdateInput>
    /**
     * Choose, which Shift to update.
     */
    where: ShiftWhereUniqueInput
  }


  /**
   * Shift updateMany
   */
  export type ShiftUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Shifts.
     */
    data: XOR<ShiftUpdateManyMutationInput, ShiftUncheckedUpdateManyInput>
    /**
     * Filter which Shifts to update
     */
    where?: ShiftWhereInput
  }


  /**
   * Shift upsert
   */
  export type ShiftUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * The filter to search for the Shift to update in case it exists.
     */
    where: ShiftWhereUniqueInput
    /**
     * In case the Shift found by the `where` argument doesn't exist, create a new Shift with this data.
     */
    create: XOR<ShiftCreateInput, ShiftUncheckedCreateInput>
    /**
     * In case the Shift was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShiftUpdateInput, ShiftUncheckedUpdateInput>
  }


  /**
   * Shift delete
   */
  export type ShiftDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ShiftInclude<ExtArgs> | null
    /**
     * Filter which Shift to delete.
     */
    where: ShiftWhereUniqueInput
  }


  /**
   * Shift deleteMany
   */
  export type ShiftDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Shifts to delete
     */
    where?: ShiftWhereInput
  }


  /**
   * Shift without action
   */
  export type ShiftDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shift
     */
    select?: ShiftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ShiftInclude<ExtArgs> | null
  }



  /**
   * Model KpiRecord
   */

  export type AggregateKpiRecord = {
    _count: KpiRecordCountAggregateOutputType | null
    _avg: KpiRecordAvgAggregateOutputType | null
    _sum: KpiRecordSumAggregateOutputType | null
    _min: KpiRecordMinAggregateOutputType | null
    _max: KpiRecordMaxAggregateOutputType | null
  }

  export type KpiRecordAvgAggregateOutputType = {
    qualityScore: number | null
    errorsCount: number | null
    salesBonus: number | null
  }

  export type KpiRecordSumAggregateOutputType = {
    qualityScore: number | null
    errorsCount: number | null
    salesBonus: number | null
  }

  export type KpiRecordMinAggregateOutputType = {
    id: string | null
    date: string | null
    employeeId: string | null
    qualityScore: number | null
    errorsCount: number | null
    salesBonus: number | null
    checkList: boolean | null
    createdAt: string | null
    createdBy: string | null
  }

  export type KpiRecordMaxAggregateOutputType = {
    id: string | null
    date: string | null
    employeeId: string | null
    qualityScore: number | null
    errorsCount: number | null
    salesBonus: number | null
    checkList: boolean | null
    createdAt: string | null
    createdBy: string | null
  }

  export type KpiRecordCountAggregateOutputType = {
    id: number
    date: number
    employeeId: number
    qualityScore: number
    errorsCount: number
    salesBonus: number
    checkList: number
    createdAt: number
    createdBy: number
    _all: number
  }


  export type KpiRecordAvgAggregateInputType = {
    qualityScore?: true
    errorsCount?: true
    salesBonus?: true
  }

  export type KpiRecordSumAggregateInputType = {
    qualityScore?: true
    errorsCount?: true
    salesBonus?: true
  }

  export type KpiRecordMinAggregateInputType = {
    id?: true
    date?: true
    employeeId?: true
    qualityScore?: true
    errorsCount?: true
    salesBonus?: true
    checkList?: true
    createdAt?: true
    createdBy?: true
  }

  export type KpiRecordMaxAggregateInputType = {
    id?: true
    date?: true
    employeeId?: true
    qualityScore?: true
    errorsCount?: true
    salesBonus?: true
    checkList?: true
    createdAt?: true
    createdBy?: true
  }

  export type KpiRecordCountAggregateInputType = {
    id?: true
    date?: true
    employeeId?: true
    qualityScore?: true
    errorsCount?: true
    salesBonus?: true
    checkList?: true
    createdAt?: true
    createdBy?: true
    _all?: true
  }

  export type KpiRecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KpiRecord to aggregate.
     */
    where?: KpiRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KpiRecords to fetch.
     */
    orderBy?: KpiRecordOrderByWithRelationInput | KpiRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KpiRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KpiRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KpiRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned KpiRecords
    **/
    _count?: true | KpiRecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: KpiRecordAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: KpiRecordSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KpiRecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KpiRecordMaxAggregateInputType
  }

  export type GetKpiRecordAggregateType<T extends KpiRecordAggregateArgs> = {
        [P in keyof T & keyof AggregateKpiRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKpiRecord[P]>
      : GetScalarType<T[P], AggregateKpiRecord[P]>
  }




  export type KpiRecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KpiRecordWhereInput
    orderBy?: KpiRecordOrderByWithAggregationInput | KpiRecordOrderByWithAggregationInput[]
    by: KpiRecordScalarFieldEnum[] | KpiRecordScalarFieldEnum
    having?: KpiRecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KpiRecordCountAggregateInputType | true
    _avg?: KpiRecordAvgAggregateInputType
    _sum?: KpiRecordSumAggregateInputType
    _min?: KpiRecordMinAggregateInputType
    _max?: KpiRecordMaxAggregateInputType
  }

  export type KpiRecordGroupByOutputType = {
    id: string
    date: string
    employeeId: string
    qualityScore: number
    errorsCount: number
    salesBonus: number
    checkList: boolean
    createdAt: string
    createdBy: string | null
    _count: KpiRecordCountAggregateOutputType | null
    _avg: KpiRecordAvgAggregateOutputType | null
    _sum: KpiRecordSumAggregateOutputType | null
    _min: KpiRecordMinAggregateOutputType | null
    _max: KpiRecordMaxAggregateOutputType | null
  }

  type GetKpiRecordGroupByPayload<T extends KpiRecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KpiRecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KpiRecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KpiRecordGroupByOutputType[P]>
            : GetScalarType<T[P], KpiRecordGroupByOutputType[P]>
        }
      >
    >


  export type KpiRecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    employeeId?: boolean
    qualityScore?: boolean
    errorsCount?: boolean
    salesBonus?: boolean
    checkList?: boolean
    createdAt?: boolean
    createdBy?: boolean
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["kpiRecord"]>

  export type KpiRecordSelectScalar = {
    id?: boolean
    date?: boolean
    employeeId?: boolean
    qualityScore?: boolean
    errorsCount?: boolean
    salesBonus?: boolean
    checkList?: boolean
    createdAt?: boolean
    createdBy?: boolean
  }

  export type KpiRecordInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }


  export type $KpiRecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "KpiRecord"
    objects: {
      employee: Prisma.$EmployeePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: string
      employeeId: string
      qualityScore: number
      errorsCount: number
      salesBonus: number
      checkList: boolean
      createdAt: string
      createdBy: string | null
    }, ExtArgs["result"]["kpiRecord"]>
    composites: {}
  }


  type KpiRecordGetPayload<S extends boolean | null | undefined | KpiRecordDefaultArgs> = $Result.GetResult<Prisma.$KpiRecordPayload, S>

  type KpiRecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<KpiRecordFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: KpiRecordCountAggregateInputType | true
    }

  export interface KpiRecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['KpiRecord'], meta: { name: 'KpiRecord' } }
    /**
     * Find zero or one KpiRecord that matches the filter.
     * @param {KpiRecordFindUniqueArgs} args - Arguments to find a KpiRecord
     * @example
     * // Get one KpiRecord
     * const kpiRecord = await prisma.kpiRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends KpiRecordFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, KpiRecordFindUniqueArgs<ExtArgs>>
    ): Prisma__KpiRecordClient<$Result.GetResult<Prisma.$KpiRecordPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one KpiRecord that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {KpiRecordFindUniqueOrThrowArgs} args - Arguments to find a KpiRecord
     * @example
     * // Get one KpiRecord
     * const kpiRecord = await prisma.kpiRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends KpiRecordFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, KpiRecordFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__KpiRecordClient<$Result.GetResult<Prisma.$KpiRecordPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first KpiRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KpiRecordFindFirstArgs} args - Arguments to find a KpiRecord
     * @example
     * // Get one KpiRecord
     * const kpiRecord = await prisma.kpiRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends KpiRecordFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, KpiRecordFindFirstArgs<ExtArgs>>
    ): Prisma__KpiRecordClient<$Result.GetResult<Prisma.$KpiRecordPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first KpiRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KpiRecordFindFirstOrThrowArgs} args - Arguments to find a KpiRecord
     * @example
     * // Get one KpiRecord
     * const kpiRecord = await prisma.kpiRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends KpiRecordFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, KpiRecordFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__KpiRecordClient<$Result.GetResult<Prisma.$KpiRecordPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more KpiRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KpiRecordFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all KpiRecords
     * const kpiRecords = await prisma.kpiRecord.findMany()
     * 
     * // Get first 10 KpiRecords
     * const kpiRecords = await prisma.kpiRecord.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const kpiRecordWithIdOnly = await prisma.kpiRecord.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends KpiRecordFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, KpiRecordFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KpiRecordPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a KpiRecord.
     * @param {KpiRecordCreateArgs} args - Arguments to create a KpiRecord.
     * @example
     * // Create one KpiRecord
     * const KpiRecord = await prisma.kpiRecord.create({
     *   data: {
     *     // ... data to create a KpiRecord
     *   }
     * })
     * 
    **/
    create<T extends KpiRecordCreateArgs<ExtArgs>>(
      args: SelectSubset<T, KpiRecordCreateArgs<ExtArgs>>
    ): Prisma__KpiRecordClient<$Result.GetResult<Prisma.$KpiRecordPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Delete a KpiRecord.
     * @param {KpiRecordDeleteArgs} args - Arguments to delete one KpiRecord.
     * @example
     * // Delete one KpiRecord
     * const KpiRecord = await prisma.kpiRecord.delete({
     *   where: {
     *     // ... filter to delete one KpiRecord
     *   }
     * })
     * 
    **/
    delete<T extends KpiRecordDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, KpiRecordDeleteArgs<ExtArgs>>
    ): Prisma__KpiRecordClient<$Result.GetResult<Prisma.$KpiRecordPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one KpiRecord.
     * @param {KpiRecordUpdateArgs} args - Arguments to update one KpiRecord.
     * @example
     * // Update one KpiRecord
     * const kpiRecord = await prisma.kpiRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends KpiRecordUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, KpiRecordUpdateArgs<ExtArgs>>
    ): Prisma__KpiRecordClient<$Result.GetResult<Prisma.$KpiRecordPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more KpiRecords.
     * @param {KpiRecordDeleteManyArgs} args - Arguments to filter KpiRecords to delete.
     * @example
     * // Delete a few KpiRecords
     * const { count } = await prisma.kpiRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends KpiRecordDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, KpiRecordDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KpiRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KpiRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many KpiRecords
     * const kpiRecord = await prisma.kpiRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends KpiRecordUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, KpiRecordUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one KpiRecord.
     * @param {KpiRecordUpsertArgs} args - Arguments to update or create a KpiRecord.
     * @example
     * // Update or create a KpiRecord
     * const kpiRecord = await prisma.kpiRecord.upsert({
     *   create: {
     *     // ... data to create a KpiRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the KpiRecord we want to update
     *   }
     * })
    **/
    upsert<T extends KpiRecordUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, KpiRecordUpsertArgs<ExtArgs>>
    ): Prisma__KpiRecordClient<$Result.GetResult<Prisma.$KpiRecordPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of KpiRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KpiRecordCountArgs} args - Arguments to filter KpiRecords to count.
     * @example
     * // Count the number of KpiRecords
     * const count = await prisma.kpiRecord.count({
     *   where: {
     *     // ... the filter for the KpiRecords we want to count
     *   }
     * })
    **/
    count<T extends KpiRecordCountArgs>(
      args?: Subset<T, KpiRecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KpiRecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a KpiRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KpiRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends KpiRecordAggregateArgs>(args: Subset<T, KpiRecordAggregateArgs>): Prisma.PrismaPromise<GetKpiRecordAggregateType<T>>

    /**
     * Group by KpiRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KpiRecordGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends KpiRecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KpiRecordGroupByArgs['orderBy'] }
        : { orderBy?: KpiRecordGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, KpiRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKpiRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the KpiRecord model
   */
  readonly fields: KpiRecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for KpiRecord.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KpiRecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    employee<T extends EmployeeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeDefaultArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null, Null, ExtArgs>;

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the KpiRecord model
   */ 
  interface KpiRecordFieldRefs {
    readonly id: FieldRef<"KpiRecord", 'String'>
    readonly date: FieldRef<"KpiRecord", 'String'>
    readonly employeeId: FieldRef<"KpiRecord", 'String'>
    readonly qualityScore: FieldRef<"KpiRecord", 'Float'>
    readonly errorsCount: FieldRef<"KpiRecord", 'Int'>
    readonly salesBonus: FieldRef<"KpiRecord", 'Float'>
    readonly checkList: FieldRef<"KpiRecord", 'Boolean'>
    readonly createdAt: FieldRef<"KpiRecord", 'String'>
    readonly createdBy: FieldRef<"KpiRecord", 'String'>
  }
    

  // Custom InputTypes

  /**
   * KpiRecord findUnique
   */
  export type KpiRecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KpiRecord
     */
    select?: KpiRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: KpiRecordInclude<ExtArgs> | null
    /**
     * Filter, which KpiRecord to fetch.
     */
    where: KpiRecordWhereUniqueInput
  }


  /**
   * KpiRecord findUniqueOrThrow
   */
  export type KpiRecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KpiRecord
     */
    select?: KpiRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: KpiRecordInclude<ExtArgs> | null
    /**
     * Filter, which KpiRecord to fetch.
     */
    where: KpiRecordWhereUniqueInput
  }


  /**
   * KpiRecord findFirst
   */
  export type KpiRecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KpiRecord
     */
    select?: KpiRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: KpiRecordInclude<ExtArgs> | null
    /**
     * Filter, which KpiRecord to fetch.
     */
    where?: KpiRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KpiRecords to fetch.
     */
    orderBy?: KpiRecordOrderByWithRelationInput | KpiRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KpiRecords.
     */
    cursor?: KpiRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KpiRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KpiRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KpiRecords.
     */
    distinct?: KpiRecordScalarFieldEnum | KpiRecordScalarFieldEnum[]
  }


  /**
   * KpiRecord findFirstOrThrow
   */
  export type KpiRecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KpiRecord
     */
    select?: KpiRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: KpiRecordInclude<ExtArgs> | null
    /**
     * Filter, which KpiRecord to fetch.
     */
    where?: KpiRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KpiRecords to fetch.
     */
    orderBy?: KpiRecordOrderByWithRelationInput | KpiRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KpiRecords.
     */
    cursor?: KpiRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KpiRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KpiRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KpiRecords.
     */
    distinct?: KpiRecordScalarFieldEnum | KpiRecordScalarFieldEnum[]
  }


  /**
   * KpiRecord findMany
   */
  export type KpiRecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KpiRecord
     */
    select?: KpiRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: KpiRecordInclude<ExtArgs> | null
    /**
     * Filter, which KpiRecords to fetch.
     */
    where?: KpiRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KpiRecords to fetch.
     */
    orderBy?: KpiRecordOrderByWithRelationInput | KpiRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing KpiRecords.
     */
    cursor?: KpiRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KpiRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KpiRecords.
     */
    skip?: number
    distinct?: KpiRecordScalarFieldEnum | KpiRecordScalarFieldEnum[]
  }


  /**
   * KpiRecord create
   */
  export type KpiRecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KpiRecord
     */
    select?: KpiRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: KpiRecordInclude<ExtArgs> | null
    /**
     * The data needed to create a KpiRecord.
     */
    data: XOR<KpiRecordCreateInput, KpiRecordUncheckedCreateInput>
  }


  /**
   * KpiRecord update
   */
  export type KpiRecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KpiRecord
     */
    select?: KpiRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: KpiRecordInclude<ExtArgs> | null
    /**
     * The data needed to update a KpiRecord.
     */
    data: XOR<KpiRecordUpdateInput, KpiRecordUncheckedUpdateInput>
    /**
     * Choose, which KpiRecord to update.
     */
    where: KpiRecordWhereUniqueInput
  }


  /**
   * KpiRecord updateMany
   */
  export type KpiRecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update KpiRecords.
     */
    data: XOR<KpiRecordUpdateManyMutationInput, KpiRecordUncheckedUpdateManyInput>
    /**
     * Filter which KpiRecords to update
     */
    where?: KpiRecordWhereInput
  }


  /**
   * KpiRecord upsert
   */
  export type KpiRecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KpiRecord
     */
    select?: KpiRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: KpiRecordInclude<ExtArgs> | null
    /**
     * The filter to search for the KpiRecord to update in case it exists.
     */
    where: KpiRecordWhereUniqueInput
    /**
     * In case the KpiRecord found by the `where` argument doesn't exist, create a new KpiRecord with this data.
     */
    create: XOR<KpiRecordCreateInput, KpiRecordUncheckedCreateInput>
    /**
     * In case the KpiRecord was found with the provided `where` argument, update it with this data.
     */
    update: XOR<KpiRecordUpdateInput, KpiRecordUncheckedUpdateInput>
  }


  /**
   * KpiRecord delete
   */
  export type KpiRecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KpiRecord
     */
    select?: KpiRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: KpiRecordInclude<ExtArgs> | null
    /**
     * Filter which KpiRecord to delete.
     */
    where: KpiRecordWhereUniqueInput
  }


  /**
   * KpiRecord deleteMany
   */
  export type KpiRecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KpiRecords to delete
     */
    where?: KpiRecordWhereInput
  }


  /**
   * KpiRecord without action
   */
  export type KpiRecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KpiRecord
     */
    select?: KpiRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: KpiRecordInclude<ExtArgs> | null
  }



  /**
   * Model MonthlyNorm
   */

  export type AggregateMonthlyNorm = {
    _count: MonthlyNormCountAggregateOutputType | null
    _avg: MonthlyNormAvgAggregateOutputType | null
    _sum: MonthlyNormSumAggregateOutputType | null
    _min: MonthlyNormMinAggregateOutputType | null
    _max: MonthlyNormMaxAggregateOutputType | null
  }

  export type MonthlyNormAvgAggregateOutputType = {
    hours: number | null
  }

  export type MonthlyNormSumAggregateOutputType = {
    hours: number | null
  }

  export type MonthlyNormMinAggregateOutputType = {
    month: string | null
    hours: number | null
    createdAt: string | null
  }

  export type MonthlyNormMaxAggregateOutputType = {
    month: string | null
    hours: number | null
    createdAt: string | null
  }

  export type MonthlyNormCountAggregateOutputType = {
    month: number
    hours: number
    createdAt: number
    _all: number
  }


  export type MonthlyNormAvgAggregateInputType = {
    hours?: true
  }

  export type MonthlyNormSumAggregateInputType = {
    hours?: true
  }

  export type MonthlyNormMinAggregateInputType = {
    month?: true
    hours?: true
    createdAt?: true
  }

  export type MonthlyNormMaxAggregateInputType = {
    month?: true
    hours?: true
    createdAt?: true
  }

  export type MonthlyNormCountAggregateInputType = {
    month?: true
    hours?: true
    createdAt?: true
    _all?: true
  }

  export type MonthlyNormAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MonthlyNorm to aggregate.
     */
    where?: MonthlyNormWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MonthlyNorms to fetch.
     */
    orderBy?: MonthlyNormOrderByWithRelationInput | MonthlyNormOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MonthlyNormWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MonthlyNorms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MonthlyNorms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MonthlyNorms
    **/
    _count?: true | MonthlyNormCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MonthlyNormAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MonthlyNormSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MonthlyNormMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MonthlyNormMaxAggregateInputType
  }

  export type GetMonthlyNormAggregateType<T extends MonthlyNormAggregateArgs> = {
        [P in keyof T & keyof AggregateMonthlyNorm]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMonthlyNorm[P]>
      : GetScalarType<T[P], AggregateMonthlyNorm[P]>
  }




  export type MonthlyNormGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MonthlyNormWhereInput
    orderBy?: MonthlyNormOrderByWithAggregationInput | MonthlyNormOrderByWithAggregationInput[]
    by: MonthlyNormScalarFieldEnum[] | MonthlyNormScalarFieldEnum
    having?: MonthlyNormScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MonthlyNormCountAggregateInputType | true
    _avg?: MonthlyNormAvgAggregateInputType
    _sum?: MonthlyNormSumAggregateInputType
    _min?: MonthlyNormMinAggregateInputType
    _max?: MonthlyNormMaxAggregateInputType
  }

  export type MonthlyNormGroupByOutputType = {
    month: string
    hours: number
    createdAt: string
    _count: MonthlyNormCountAggregateOutputType | null
    _avg: MonthlyNormAvgAggregateOutputType | null
    _sum: MonthlyNormSumAggregateOutputType | null
    _min: MonthlyNormMinAggregateOutputType | null
    _max: MonthlyNormMaxAggregateOutputType | null
  }

  type GetMonthlyNormGroupByPayload<T extends MonthlyNormGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MonthlyNormGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MonthlyNormGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MonthlyNormGroupByOutputType[P]>
            : GetScalarType<T[P], MonthlyNormGroupByOutputType[P]>
        }
      >
    >


  export type MonthlyNormSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    month?: boolean
    hours?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["monthlyNorm"]>

  export type MonthlyNormSelectScalar = {
    month?: boolean
    hours?: boolean
    createdAt?: boolean
  }


  export type $MonthlyNormPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MonthlyNorm"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      month: string
      hours: number
      createdAt: string
    }, ExtArgs["result"]["monthlyNorm"]>
    composites: {}
  }


  type MonthlyNormGetPayload<S extends boolean | null | undefined | MonthlyNormDefaultArgs> = $Result.GetResult<Prisma.$MonthlyNormPayload, S>

  type MonthlyNormCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MonthlyNormFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MonthlyNormCountAggregateInputType | true
    }

  export interface MonthlyNormDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MonthlyNorm'], meta: { name: 'MonthlyNorm' } }
    /**
     * Find zero or one MonthlyNorm that matches the filter.
     * @param {MonthlyNormFindUniqueArgs} args - Arguments to find a MonthlyNorm
     * @example
     * // Get one MonthlyNorm
     * const monthlyNorm = await prisma.monthlyNorm.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends MonthlyNormFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, MonthlyNormFindUniqueArgs<ExtArgs>>
    ): Prisma__MonthlyNormClient<$Result.GetResult<Prisma.$MonthlyNormPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one MonthlyNorm that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {MonthlyNormFindUniqueOrThrowArgs} args - Arguments to find a MonthlyNorm
     * @example
     * // Get one MonthlyNorm
     * const monthlyNorm = await prisma.monthlyNorm.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends MonthlyNormFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, MonthlyNormFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__MonthlyNormClient<$Result.GetResult<Prisma.$MonthlyNormPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first MonthlyNorm that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyNormFindFirstArgs} args - Arguments to find a MonthlyNorm
     * @example
     * // Get one MonthlyNorm
     * const monthlyNorm = await prisma.monthlyNorm.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends MonthlyNormFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, MonthlyNormFindFirstArgs<ExtArgs>>
    ): Prisma__MonthlyNormClient<$Result.GetResult<Prisma.$MonthlyNormPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first MonthlyNorm that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyNormFindFirstOrThrowArgs} args - Arguments to find a MonthlyNorm
     * @example
     * // Get one MonthlyNorm
     * const monthlyNorm = await prisma.monthlyNorm.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends MonthlyNormFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, MonthlyNormFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__MonthlyNormClient<$Result.GetResult<Prisma.$MonthlyNormPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more MonthlyNorms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyNormFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MonthlyNorms
     * const monthlyNorms = await prisma.monthlyNorm.findMany()
     * 
     * // Get first 10 MonthlyNorms
     * const monthlyNorms = await prisma.monthlyNorm.findMany({ take: 10 })
     * 
     * // Only select the `month`
     * const monthlyNormWithMonthOnly = await prisma.monthlyNorm.findMany({ select: { month: true } })
     * 
    **/
    findMany<T extends MonthlyNormFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, MonthlyNormFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MonthlyNormPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a MonthlyNorm.
     * @param {MonthlyNormCreateArgs} args - Arguments to create a MonthlyNorm.
     * @example
     * // Create one MonthlyNorm
     * const MonthlyNorm = await prisma.monthlyNorm.create({
     *   data: {
     *     // ... data to create a MonthlyNorm
     *   }
     * })
     * 
    **/
    create<T extends MonthlyNormCreateArgs<ExtArgs>>(
      args: SelectSubset<T, MonthlyNormCreateArgs<ExtArgs>>
    ): Prisma__MonthlyNormClient<$Result.GetResult<Prisma.$MonthlyNormPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Delete a MonthlyNorm.
     * @param {MonthlyNormDeleteArgs} args - Arguments to delete one MonthlyNorm.
     * @example
     * // Delete one MonthlyNorm
     * const MonthlyNorm = await prisma.monthlyNorm.delete({
     *   where: {
     *     // ... filter to delete one MonthlyNorm
     *   }
     * })
     * 
    **/
    delete<T extends MonthlyNormDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, MonthlyNormDeleteArgs<ExtArgs>>
    ): Prisma__MonthlyNormClient<$Result.GetResult<Prisma.$MonthlyNormPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one MonthlyNorm.
     * @param {MonthlyNormUpdateArgs} args - Arguments to update one MonthlyNorm.
     * @example
     * // Update one MonthlyNorm
     * const monthlyNorm = await prisma.monthlyNorm.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends MonthlyNormUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, MonthlyNormUpdateArgs<ExtArgs>>
    ): Prisma__MonthlyNormClient<$Result.GetResult<Prisma.$MonthlyNormPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more MonthlyNorms.
     * @param {MonthlyNormDeleteManyArgs} args - Arguments to filter MonthlyNorms to delete.
     * @example
     * // Delete a few MonthlyNorms
     * const { count } = await prisma.monthlyNorm.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends MonthlyNormDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, MonthlyNormDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MonthlyNorms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyNormUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MonthlyNorms
     * const monthlyNorm = await prisma.monthlyNorm.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends MonthlyNormUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, MonthlyNormUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MonthlyNorm.
     * @param {MonthlyNormUpsertArgs} args - Arguments to update or create a MonthlyNorm.
     * @example
     * // Update or create a MonthlyNorm
     * const monthlyNorm = await prisma.monthlyNorm.upsert({
     *   create: {
     *     // ... data to create a MonthlyNorm
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MonthlyNorm we want to update
     *   }
     * })
    **/
    upsert<T extends MonthlyNormUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, MonthlyNormUpsertArgs<ExtArgs>>
    ): Prisma__MonthlyNormClient<$Result.GetResult<Prisma.$MonthlyNormPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of MonthlyNorms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyNormCountArgs} args - Arguments to filter MonthlyNorms to count.
     * @example
     * // Count the number of MonthlyNorms
     * const count = await prisma.monthlyNorm.count({
     *   where: {
     *     // ... the filter for the MonthlyNorms we want to count
     *   }
     * })
    **/
    count<T extends MonthlyNormCountArgs>(
      args?: Subset<T, MonthlyNormCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MonthlyNormCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MonthlyNorm.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyNormAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MonthlyNormAggregateArgs>(args: Subset<T, MonthlyNormAggregateArgs>): Prisma.PrismaPromise<GetMonthlyNormAggregateType<T>>

    /**
     * Group by MonthlyNorm.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MonthlyNormGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MonthlyNormGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MonthlyNormGroupByArgs['orderBy'] }
        : { orderBy?: MonthlyNormGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MonthlyNormGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMonthlyNormGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MonthlyNorm model
   */
  readonly fields: MonthlyNormFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MonthlyNorm.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MonthlyNormClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the MonthlyNorm model
   */ 
  interface MonthlyNormFieldRefs {
    readonly month: FieldRef<"MonthlyNorm", 'String'>
    readonly hours: FieldRef<"MonthlyNorm", 'Float'>
    readonly createdAt: FieldRef<"MonthlyNorm", 'String'>
  }
    

  // Custom InputTypes

  /**
   * MonthlyNorm findUnique
   */
  export type MonthlyNormFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlyNorm
     */
    select?: MonthlyNormSelect<ExtArgs> | null
    /**
     * Filter, which MonthlyNorm to fetch.
     */
    where: MonthlyNormWhereUniqueInput
  }


  /**
   * MonthlyNorm findUniqueOrThrow
   */
  export type MonthlyNormFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlyNorm
     */
    select?: MonthlyNormSelect<ExtArgs> | null
    /**
     * Filter, which MonthlyNorm to fetch.
     */
    where: MonthlyNormWhereUniqueInput
  }


  /**
   * MonthlyNorm findFirst
   */
  export type MonthlyNormFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlyNorm
     */
    select?: MonthlyNormSelect<ExtArgs> | null
    /**
     * Filter, which MonthlyNorm to fetch.
     */
    where?: MonthlyNormWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MonthlyNorms to fetch.
     */
    orderBy?: MonthlyNormOrderByWithRelationInput | MonthlyNormOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MonthlyNorms.
     */
    cursor?: MonthlyNormWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MonthlyNorms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MonthlyNorms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MonthlyNorms.
     */
    distinct?: MonthlyNormScalarFieldEnum | MonthlyNormScalarFieldEnum[]
  }


  /**
   * MonthlyNorm findFirstOrThrow
   */
  export type MonthlyNormFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlyNorm
     */
    select?: MonthlyNormSelect<ExtArgs> | null
    /**
     * Filter, which MonthlyNorm to fetch.
     */
    where?: MonthlyNormWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MonthlyNorms to fetch.
     */
    orderBy?: MonthlyNormOrderByWithRelationInput | MonthlyNormOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MonthlyNorms.
     */
    cursor?: MonthlyNormWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MonthlyNorms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MonthlyNorms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MonthlyNorms.
     */
    distinct?: MonthlyNormScalarFieldEnum | MonthlyNormScalarFieldEnum[]
  }


  /**
   * MonthlyNorm findMany
   */
  export type MonthlyNormFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlyNorm
     */
    select?: MonthlyNormSelect<ExtArgs> | null
    /**
     * Filter, which MonthlyNorms to fetch.
     */
    where?: MonthlyNormWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MonthlyNorms to fetch.
     */
    orderBy?: MonthlyNormOrderByWithRelationInput | MonthlyNormOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MonthlyNorms.
     */
    cursor?: MonthlyNormWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MonthlyNorms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MonthlyNorms.
     */
    skip?: number
    distinct?: MonthlyNormScalarFieldEnum | MonthlyNormScalarFieldEnum[]
  }


  /**
   * MonthlyNorm create
   */
  export type MonthlyNormCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlyNorm
     */
    select?: MonthlyNormSelect<ExtArgs> | null
    /**
     * The data needed to create a MonthlyNorm.
     */
    data: XOR<MonthlyNormCreateInput, MonthlyNormUncheckedCreateInput>
  }


  /**
   * MonthlyNorm update
   */
  export type MonthlyNormUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlyNorm
     */
    select?: MonthlyNormSelect<ExtArgs> | null
    /**
     * The data needed to update a MonthlyNorm.
     */
    data: XOR<MonthlyNormUpdateInput, MonthlyNormUncheckedUpdateInput>
    /**
     * Choose, which MonthlyNorm to update.
     */
    where: MonthlyNormWhereUniqueInput
  }


  /**
   * MonthlyNorm updateMany
   */
  export type MonthlyNormUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MonthlyNorms.
     */
    data: XOR<MonthlyNormUpdateManyMutationInput, MonthlyNormUncheckedUpdateManyInput>
    /**
     * Filter which MonthlyNorms to update
     */
    where?: MonthlyNormWhereInput
  }


  /**
   * MonthlyNorm upsert
   */
  export type MonthlyNormUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlyNorm
     */
    select?: MonthlyNormSelect<ExtArgs> | null
    /**
     * The filter to search for the MonthlyNorm to update in case it exists.
     */
    where: MonthlyNormWhereUniqueInput
    /**
     * In case the MonthlyNorm found by the `where` argument doesn't exist, create a new MonthlyNorm with this data.
     */
    create: XOR<MonthlyNormCreateInput, MonthlyNormUncheckedCreateInput>
    /**
     * In case the MonthlyNorm was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MonthlyNormUpdateInput, MonthlyNormUncheckedUpdateInput>
  }


  /**
   * MonthlyNorm delete
   */
  export type MonthlyNormDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlyNorm
     */
    select?: MonthlyNormSelect<ExtArgs> | null
    /**
     * Filter which MonthlyNorm to delete.
     */
    where: MonthlyNormWhereUniqueInput
  }


  /**
   * MonthlyNorm deleteMany
   */
  export type MonthlyNormDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MonthlyNorms to delete
     */
    where?: MonthlyNormWhereInput
  }


  /**
   * MonthlyNorm without action
   */
  export type MonthlyNormDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MonthlyNorm
     */
    select?: MonthlyNormSelect<ExtArgs> | null
  }



  /**
   * Model PromotionSale
   */

  export type AggregatePromotionSale = {
    _count: PromotionSaleCountAggregateOutputType | null
    _avg: PromotionSaleAvgAggregateOutputType | null
    _sum: PromotionSaleSumAggregateOutputType | null
    _min: PromotionSaleMinAggregateOutputType | null
    _max: PromotionSaleMaxAggregateOutputType | null
  }

  export type PromotionSaleAvgAggregateOutputType = {
    price: number | null
    bonus: number | null
  }

  export type PromotionSaleSumAggregateOutputType = {
    price: number | null
    bonus: number | null
  }

  export type PromotionSaleMinAggregateOutputType = {
    id: string | null
    date: string | null
    patientId: string | null
    employeeId: string | null
    productName: string | null
    price: number | null
    bonus: number | null
    createdAt: string | null
    createdBy: string | null
  }

  export type PromotionSaleMaxAggregateOutputType = {
    id: string | null
    date: string | null
    patientId: string | null
    employeeId: string | null
    productName: string | null
    price: number | null
    bonus: number | null
    createdAt: string | null
    createdBy: string | null
  }

  export type PromotionSaleCountAggregateOutputType = {
    id: number
    date: number
    patientId: number
    employeeId: number
    productName: number
    price: number
    bonus: number
    createdAt: number
    createdBy: number
    _all: number
  }


  export type PromotionSaleAvgAggregateInputType = {
    price?: true
    bonus?: true
  }

  export type PromotionSaleSumAggregateInputType = {
    price?: true
    bonus?: true
  }

  export type PromotionSaleMinAggregateInputType = {
    id?: true
    date?: true
    patientId?: true
    employeeId?: true
    productName?: true
    price?: true
    bonus?: true
    createdAt?: true
    createdBy?: true
  }

  export type PromotionSaleMaxAggregateInputType = {
    id?: true
    date?: true
    patientId?: true
    employeeId?: true
    productName?: true
    price?: true
    bonus?: true
    createdAt?: true
    createdBy?: true
  }

  export type PromotionSaleCountAggregateInputType = {
    id?: true
    date?: true
    patientId?: true
    employeeId?: true
    productName?: true
    price?: true
    bonus?: true
    createdAt?: true
    createdBy?: true
    _all?: true
  }

  export type PromotionSaleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PromotionSale to aggregate.
     */
    where?: PromotionSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromotionSales to fetch.
     */
    orderBy?: PromotionSaleOrderByWithRelationInput | PromotionSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PromotionSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromotionSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromotionSales.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PromotionSales
    **/
    _count?: true | PromotionSaleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PromotionSaleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PromotionSaleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PromotionSaleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PromotionSaleMaxAggregateInputType
  }

  export type GetPromotionSaleAggregateType<T extends PromotionSaleAggregateArgs> = {
        [P in keyof T & keyof AggregatePromotionSale]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePromotionSale[P]>
      : GetScalarType<T[P], AggregatePromotionSale[P]>
  }




  export type PromotionSaleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PromotionSaleWhereInput
    orderBy?: PromotionSaleOrderByWithAggregationInput | PromotionSaleOrderByWithAggregationInput[]
    by: PromotionSaleScalarFieldEnum[] | PromotionSaleScalarFieldEnum
    having?: PromotionSaleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PromotionSaleCountAggregateInputType | true
    _avg?: PromotionSaleAvgAggregateInputType
    _sum?: PromotionSaleSumAggregateInputType
    _min?: PromotionSaleMinAggregateInputType
    _max?: PromotionSaleMaxAggregateInputType
  }

  export type PromotionSaleGroupByOutputType = {
    id: string
    date: string
    patientId: string | null
    employeeId: string
    productName: string
    price: number
    bonus: number
    createdAt: string
    createdBy: string | null
    _count: PromotionSaleCountAggregateOutputType | null
    _avg: PromotionSaleAvgAggregateOutputType | null
    _sum: PromotionSaleSumAggregateOutputType | null
    _min: PromotionSaleMinAggregateOutputType | null
    _max: PromotionSaleMaxAggregateOutputType | null
  }

  type GetPromotionSaleGroupByPayload<T extends PromotionSaleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PromotionSaleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PromotionSaleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PromotionSaleGroupByOutputType[P]>
            : GetScalarType<T[P], PromotionSaleGroupByOutputType[P]>
        }
      >
    >


  export type PromotionSaleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    patientId?: boolean
    employeeId?: boolean
    productName?: boolean
    price?: boolean
    bonus?: boolean
    createdAt?: boolean
    createdBy?: boolean
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["promotionSale"]>

  export type PromotionSaleSelectScalar = {
    id?: boolean
    date?: boolean
    patientId?: boolean
    employeeId?: boolean
    productName?: boolean
    price?: boolean
    bonus?: boolean
    createdAt?: boolean
    createdBy?: boolean
  }

  export type PromotionSaleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }


  export type $PromotionSalePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PromotionSale"
    objects: {
      employee: Prisma.$EmployeePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: string
      patientId: string | null
      employeeId: string
      productName: string
      price: number
      bonus: number
      createdAt: string
      createdBy: string | null
    }, ExtArgs["result"]["promotionSale"]>
    composites: {}
  }


  type PromotionSaleGetPayload<S extends boolean | null | undefined | PromotionSaleDefaultArgs> = $Result.GetResult<Prisma.$PromotionSalePayload, S>

  type PromotionSaleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PromotionSaleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PromotionSaleCountAggregateInputType | true
    }

  export interface PromotionSaleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PromotionSale'], meta: { name: 'PromotionSale' } }
    /**
     * Find zero or one PromotionSale that matches the filter.
     * @param {PromotionSaleFindUniqueArgs} args - Arguments to find a PromotionSale
     * @example
     * // Get one PromotionSale
     * const promotionSale = await prisma.promotionSale.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends PromotionSaleFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, PromotionSaleFindUniqueArgs<ExtArgs>>
    ): Prisma__PromotionSaleClient<$Result.GetResult<Prisma.$PromotionSalePayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one PromotionSale that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {PromotionSaleFindUniqueOrThrowArgs} args - Arguments to find a PromotionSale
     * @example
     * // Get one PromotionSale
     * const promotionSale = await prisma.promotionSale.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends PromotionSaleFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, PromotionSaleFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__PromotionSaleClient<$Result.GetResult<Prisma.$PromotionSalePayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first PromotionSale that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionSaleFindFirstArgs} args - Arguments to find a PromotionSale
     * @example
     * // Get one PromotionSale
     * const promotionSale = await prisma.promotionSale.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends PromotionSaleFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, PromotionSaleFindFirstArgs<ExtArgs>>
    ): Prisma__PromotionSaleClient<$Result.GetResult<Prisma.$PromotionSalePayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first PromotionSale that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionSaleFindFirstOrThrowArgs} args - Arguments to find a PromotionSale
     * @example
     * // Get one PromotionSale
     * const promotionSale = await prisma.promotionSale.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends PromotionSaleFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, PromotionSaleFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__PromotionSaleClient<$Result.GetResult<Prisma.$PromotionSalePayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more PromotionSales that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionSaleFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PromotionSales
     * const promotionSales = await prisma.promotionSale.findMany()
     * 
     * // Get first 10 PromotionSales
     * const promotionSales = await prisma.promotionSale.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const promotionSaleWithIdOnly = await prisma.promotionSale.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends PromotionSaleFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, PromotionSaleFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PromotionSalePayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a PromotionSale.
     * @param {PromotionSaleCreateArgs} args - Arguments to create a PromotionSale.
     * @example
     * // Create one PromotionSale
     * const PromotionSale = await prisma.promotionSale.create({
     *   data: {
     *     // ... data to create a PromotionSale
     *   }
     * })
     * 
    **/
    create<T extends PromotionSaleCreateArgs<ExtArgs>>(
      args: SelectSubset<T, PromotionSaleCreateArgs<ExtArgs>>
    ): Prisma__PromotionSaleClient<$Result.GetResult<Prisma.$PromotionSalePayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Delete a PromotionSale.
     * @param {PromotionSaleDeleteArgs} args - Arguments to delete one PromotionSale.
     * @example
     * // Delete one PromotionSale
     * const PromotionSale = await prisma.promotionSale.delete({
     *   where: {
     *     // ... filter to delete one PromotionSale
     *   }
     * })
     * 
    **/
    delete<T extends PromotionSaleDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, PromotionSaleDeleteArgs<ExtArgs>>
    ): Prisma__PromotionSaleClient<$Result.GetResult<Prisma.$PromotionSalePayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one PromotionSale.
     * @param {PromotionSaleUpdateArgs} args - Arguments to update one PromotionSale.
     * @example
     * // Update one PromotionSale
     * const promotionSale = await prisma.promotionSale.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends PromotionSaleUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, PromotionSaleUpdateArgs<ExtArgs>>
    ): Prisma__PromotionSaleClient<$Result.GetResult<Prisma.$PromotionSalePayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more PromotionSales.
     * @param {PromotionSaleDeleteManyArgs} args - Arguments to filter PromotionSales to delete.
     * @example
     * // Delete a few PromotionSales
     * const { count } = await prisma.promotionSale.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends PromotionSaleDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, PromotionSaleDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PromotionSales.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionSaleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PromotionSales
     * const promotionSale = await prisma.promotionSale.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends PromotionSaleUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, PromotionSaleUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PromotionSale.
     * @param {PromotionSaleUpsertArgs} args - Arguments to update or create a PromotionSale.
     * @example
     * // Update or create a PromotionSale
     * const promotionSale = await prisma.promotionSale.upsert({
     *   create: {
     *     // ... data to create a PromotionSale
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PromotionSale we want to update
     *   }
     * })
    **/
    upsert<T extends PromotionSaleUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, PromotionSaleUpsertArgs<ExtArgs>>
    ): Prisma__PromotionSaleClient<$Result.GetResult<Prisma.$PromotionSalePayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of PromotionSales.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionSaleCountArgs} args - Arguments to filter PromotionSales to count.
     * @example
     * // Count the number of PromotionSales
     * const count = await prisma.promotionSale.count({
     *   where: {
     *     // ... the filter for the PromotionSales we want to count
     *   }
     * })
    **/
    count<T extends PromotionSaleCountArgs>(
      args?: Subset<T, PromotionSaleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PromotionSaleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PromotionSale.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionSaleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PromotionSaleAggregateArgs>(args: Subset<T, PromotionSaleAggregateArgs>): Prisma.PrismaPromise<GetPromotionSaleAggregateType<T>>

    /**
     * Group by PromotionSale.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PromotionSaleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PromotionSaleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PromotionSaleGroupByArgs['orderBy'] }
        : { orderBy?: PromotionSaleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PromotionSaleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPromotionSaleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PromotionSale model
   */
  readonly fields: PromotionSaleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PromotionSale.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PromotionSaleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    employee<T extends EmployeeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeDefaultArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null, Null, ExtArgs>;

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the PromotionSale model
   */ 
  interface PromotionSaleFieldRefs {
    readonly id: FieldRef<"PromotionSale", 'String'>
    readonly date: FieldRef<"PromotionSale", 'String'>
    readonly patientId: FieldRef<"PromotionSale", 'String'>
    readonly employeeId: FieldRef<"PromotionSale", 'String'>
    readonly productName: FieldRef<"PromotionSale", 'String'>
    readonly price: FieldRef<"PromotionSale", 'Float'>
    readonly bonus: FieldRef<"PromotionSale", 'Float'>
    readonly createdAt: FieldRef<"PromotionSale", 'String'>
    readonly createdBy: FieldRef<"PromotionSale", 'String'>
  }
    

  // Custom InputTypes

  /**
   * PromotionSale findUnique
   */
  export type PromotionSaleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionSale
     */
    select?: PromotionSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: PromotionSaleInclude<ExtArgs> | null
    /**
     * Filter, which PromotionSale to fetch.
     */
    where: PromotionSaleWhereUniqueInput
  }


  /**
   * PromotionSale findUniqueOrThrow
   */
  export type PromotionSaleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionSale
     */
    select?: PromotionSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: PromotionSaleInclude<ExtArgs> | null
    /**
     * Filter, which PromotionSale to fetch.
     */
    where: PromotionSaleWhereUniqueInput
  }


  /**
   * PromotionSale findFirst
   */
  export type PromotionSaleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionSale
     */
    select?: PromotionSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: PromotionSaleInclude<ExtArgs> | null
    /**
     * Filter, which PromotionSale to fetch.
     */
    where?: PromotionSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromotionSales to fetch.
     */
    orderBy?: PromotionSaleOrderByWithRelationInput | PromotionSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PromotionSales.
     */
    cursor?: PromotionSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromotionSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromotionSales.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PromotionSales.
     */
    distinct?: PromotionSaleScalarFieldEnum | PromotionSaleScalarFieldEnum[]
  }


  /**
   * PromotionSale findFirstOrThrow
   */
  export type PromotionSaleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionSale
     */
    select?: PromotionSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: PromotionSaleInclude<ExtArgs> | null
    /**
     * Filter, which PromotionSale to fetch.
     */
    where?: PromotionSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromotionSales to fetch.
     */
    orderBy?: PromotionSaleOrderByWithRelationInput | PromotionSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PromotionSales.
     */
    cursor?: PromotionSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromotionSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromotionSales.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PromotionSales.
     */
    distinct?: PromotionSaleScalarFieldEnum | PromotionSaleScalarFieldEnum[]
  }


  /**
   * PromotionSale findMany
   */
  export type PromotionSaleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionSale
     */
    select?: PromotionSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: PromotionSaleInclude<ExtArgs> | null
    /**
     * Filter, which PromotionSales to fetch.
     */
    where?: PromotionSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PromotionSales to fetch.
     */
    orderBy?: PromotionSaleOrderByWithRelationInput | PromotionSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PromotionSales.
     */
    cursor?: PromotionSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PromotionSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PromotionSales.
     */
    skip?: number
    distinct?: PromotionSaleScalarFieldEnum | PromotionSaleScalarFieldEnum[]
  }


  /**
   * PromotionSale create
   */
  export type PromotionSaleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionSale
     */
    select?: PromotionSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: PromotionSaleInclude<ExtArgs> | null
    /**
     * The data needed to create a PromotionSale.
     */
    data: XOR<PromotionSaleCreateInput, PromotionSaleUncheckedCreateInput>
  }


  /**
   * PromotionSale update
   */
  export type PromotionSaleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionSale
     */
    select?: PromotionSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: PromotionSaleInclude<ExtArgs> | null
    /**
     * The data needed to update a PromotionSale.
     */
    data: XOR<PromotionSaleUpdateInput, PromotionSaleUncheckedUpdateInput>
    /**
     * Choose, which PromotionSale to update.
     */
    where: PromotionSaleWhereUniqueInput
  }


  /**
   * PromotionSale updateMany
   */
  export type PromotionSaleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PromotionSales.
     */
    data: XOR<PromotionSaleUpdateManyMutationInput, PromotionSaleUncheckedUpdateManyInput>
    /**
     * Filter which PromotionSales to update
     */
    where?: PromotionSaleWhereInput
  }


  /**
   * PromotionSale upsert
   */
  export type PromotionSaleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionSale
     */
    select?: PromotionSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: PromotionSaleInclude<ExtArgs> | null
    /**
     * The filter to search for the PromotionSale to update in case it exists.
     */
    where: PromotionSaleWhereUniqueInput
    /**
     * In case the PromotionSale found by the `where` argument doesn't exist, create a new PromotionSale with this data.
     */
    create: XOR<PromotionSaleCreateInput, PromotionSaleUncheckedCreateInput>
    /**
     * In case the PromotionSale was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PromotionSaleUpdateInput, PromotionSaleUncheckedUpdateInput>
  }


  /**
   * PromotionSale delete
   */
  export type PromotionSaleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionSale
     */
    select?: PromotionSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: PromotionSaleInclude<ExtArgs> | null
    /**
     * Filter which PromotionSale to delete.
     */
    where: PromotionSaleWhereUniqueInput
  }


  /**
   * PromotionSale deleteMany
   */
  export type PromotionSaleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PromotionSales to delete
     */
    where?: PromotionSaleWhereInput
  }


  /**
   * PromotionSale without action
   */
  export type PromotionSaleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PromotionSale
     */
    select?: PromotionSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: PromotionSaleInclude<ExtArgs> | null
  }



  /**
   * Model RegistrationKpi
   */

  export type AggregateRegistrationKpi = {
    _count: RegistrationKpiCountAggregateOutputType | null
    _avg: RegistrationKpiAvgAggregateOutputType | null
    _sum: RegistrationKpiSumAggregateOutputType | null
    _min: RegistrationKpiMinAggregateOutputType | null
    _max: RegistrationKpiMaxAggregateOutputType | null
  }

  export type RegistrationKpiAvgAggregateOutputType = {
    criterion1: number | null
    criterion2: number | null
    criterion3: number | null
    totalScore: number | null
    maxScore: number | null
    count: number | null
  }

  export type RegistrationKpiSumAggregateOutputType = {
    criterion1: number | null
    criterion2: number | null
    criterion3: number | null
    totalScore: number | null
    maxScore: number | null
    count: number | null
  }

  export type RegistrationKpiMinAggregateOutputType = {
    id: string | null
    date: string | null
    patientId: string | null
    employeeId: string | null
    criterion1: number | null
    criterion2: number | null
    criterion3: number | null
    totalScore: number | null
    maxScore: number | null
    count: number | null
    createdAt: string | null
    createdBy: string | null
  }

  export type RegistrationKpiMaxAggregateOutputType = {
    id: string | null
    date: string | null
    patientId: string | null
    employeeId: string | null
    criterion1: number | null
    criterion2: number | null
    criterion3: number | null
    totalScore: number | null
    maxScore: number | null
    count: number | null
    createdAt: string | null
    createdBy: string | null
  }

  export type RegistrationKpiCountAggregateOutputType = {
    id: number
    date: number
    patientId: number
    employeeId: number
    criterion1: number
    criterion2: number
    criterion3: number
    totalScore: number
    maxScore: number
    count: number
    createdAt: number
    createdBy: number
    _all: number
  }


  export type RegistrationKpiAvgAggregateInputType = {
    criterion1?: true
    criterion2?: true
    criterion3?: true
    totalScore?: true
    maxScore?: true
    count?: true
  }

  export type RegistrationKpiSumAggregateInputType = {
    criterion1?: true
    criterion2?: true
    criterion3?: true
    totalScore?: true
    maxScore?: true
    count?: true
  }

  export type RegistrationKpiMinAggregateInputType = {
    id?: true
    date?: true
    patientId?: true
    employeeId?: true
    criterion1?: true
    criterion2?: true
    criterion3?: true
    totalScore?: true
    maxScore?: true
    count?: true
    createdAt?: true
    createdBy?: true
  }

  export type RegistrationKpiMaxAggregateInputType = {
    id?: true
    date?: true
    patientId?: true
    employeeId?: true
    criterion1?: true
    criterion2?: true
    criterion3?: true
    totalScore?: true
    maxScore?: true
    count?: true
    createdAt?: true
    createdBy?: true
  }

  export type RegistrationKpiCountAggregateInputType = {
    id?: true
    date?: true
    patientId?: true
    employeeId?: true
    criterion1?: true
    criterion2?: true
    criterion3?: true
    totalScore?: true
    maxScore?: true
    count?: true
    createdAt?: true
    createdBy?: true
    _all?: true
  }

  export type RegistrationKpiAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistrationKpi to aggregate.
     */
    where?: RegistrationKpiWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistrationKpis to fetch.
     */
    orderBy?: RegistrationKpiOrderByWithRelationInput | RegistrationKpiOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RegistrationKpiWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistrationKpis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistrationKpis.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RegistrationKpis
    **/
    _count?: true | RegistrationKpiCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RegistrationKpiAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RegistrationKpiSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RegistrationKpiMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RegistrationKpiMaxAggregateInputType
  }

  export type GetRegistrationKpiAggregateType<T extends RegistrationKpiAggregateArgs> = {
        [P in keyof T & keyof AggregateRegistrationKpi]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRegistrationKpi[P]>
      : GetScalarType<T[P], AggregateRegistrationKpi[P]>
  }




  export type RegistrationKpiGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RegistrationKpiWhereInput
    orderBy?: RegistrationKpiOrderByWithAggregationInput | RegistrationKpiOrderByWithAggregationInput[]
    by: RegistrationKpiScalarFieldEnum[] | RegistrationKpiScalarFieldEnum
    having?: RegistrationKpiScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RegistrationKpiCountAggregateInputType | true
    _avg?: RegistrationKpiAvgAggregateInputType
    _sum?: RegistrationKpiSumAggregateInputType
    _min?: RegistrationKpiMinAggregateInputType
    _max?: RegistrationKpiMaxAggregateInputType
  }

  export type RegistrationKpiGroupByOutputType = {
    id: string
    date: string
    patientId: string | null
    employeeId: string
    criterion1: number
    criterion2: number
    criterion3: number
    totalScore: number
    maxScore: number
    count: number
    createdAt: string
    createdBy: string | null
    _count: RegistrationKpiCountAggregateOutputType | null
    _avg: RegistrationKpiAvgAggregateOutputType | null
    _sum: RegistrationKpiSumAggregateOutputType | null
    _min: RegistrationKpiMinAggregateOutputType | null
    _max: RegistrationKpiMaxAggregateOutputType | null
  }

  type GetRegistrationKpiGroupByPayload<T extends RegistrationKpiGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RegistrationKpiGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RegistrationKpiGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RegistrationKpiGroupByOutputType[P]>
            : GetScalarType<T[P], RegistrationKpiGroupByOutputType[P]>
        }
      >
    >


  export type RegistrationKpiSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    patientId?: boolean
    employeeId?: boolean
    criterion1?: boolean
    criterion2?: boolean
    criterion3?: boolean
    totalScore?: boolean
    maxScore?: boolean
    count?: boolean
    createdAt?: boolean
    createdBy?: boolean
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["registrationKpi"]>

  export type RegistrationKpiSelectScalar = {
    id?: boolean
    date?: boolean
    patientId?: boolean
    employeeId?: boolean
    criterion1?: boolean
    criterion2?: boolean
    criterion3?: boolean
    totalScore?: boolean
    maxScore?: boolean
    count?: boolean
    createdAt?: boolean
    createdBy?: boolean
  }

  export type RegistrationKpiInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }


  export type $RegistrationKpiPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RegistrationKpi"
    objects: {
      employee: Prisma.$EmployeePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: string
      patientId: string | null
      employeeId: string
      criterion1: number
      criterion2: number
      criterion3: number
      totalScore: number
      maxScore: number
      count: number
      createdAt: string
      createdBy: string | null
    }, ExtArgs["result"]["registrationKpi"]>
    composites: {}
  }


  type RegistrationKpiGetPayload<S extends boolean | null | undefined | RegistrationKpiDefaultArgs> = $Result.GetResult<Prisma.$RegistrationKpiPayload, S>

  type RegistrationKpiCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RegistrationKpiFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RegistrationKpiCountAggregateInputType | true
    }

  export interface RegistrationKpiDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RegistrationKpi'], meta: { name: 'RegistrationKpi' } }
    /**
     * Find zero or one RegistrationKpi that matches the filter.
     * @param {RegistrationKpiFindUniqueArgs} args - Arguments to find a RegistrationKpi
     * @example
     * // Get one RegistrationKpi
     * const registrationKpi = await prisma.registrationKpi.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends RegistrationKpiFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, RegistrationKpiFindUniqueArgs<ExtArgs>>
    ): Prisma__RegistrationKpiClient<$Result.GetResult<Prisma.$RegistrationKpiPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one RegistrationKpi that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {RegistrationKpiFindUniqueOrThrowArgs} args - Arguments to find a RegistrationKpi
     * @example
     * // Get one RegistrationKpi
     * const registrationKpi = await prisma.registrationKpi.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends RegistrationKpiFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, RegistrationKpiFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__RegistrationKpiClient<$Result.GetResult<Prisma.$RegistrationKpiPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first RegistrationKpi that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistrationKpiFindFirstArgs} args - Arguments to find a RegistrationKpi
     * @example
     * // Get one RegistrationKpi
     * const registrationKpi = await prisma.registrationKpi.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends RegistrationKpiFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, RegistrationKpiFindFirstArgs<ExtArgs>>
    ): Prisma__RegistrationKpiClient<$Result.GetResult<Prisma.$RegistrationKpiPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first RegistrationKpi that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistrationKpiFindFirstOrThrowArgs} args - Arguments to find a RegistrationKpi
     * @example
     * // Get one RegistrationKpi
     * const registrationKpi = await prisma.registrationKpi.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends RegistrationKpiFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, RegistrationKpiFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__RegistrationKpiClient<$Result.GetResult<Prisma.$RegistrationKpiPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more RegistrationKpis that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistrationKpiFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RegistrationKpis
     * const registrationKpis = await prisma.registrationKpi.findMany()
     * 
     * // Get first 10 RegistrationKpis
     * const registrationKpis = await prisma.registrationKpi.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const registrationKpiWithIdOnly = await prisma.registrationKpi.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends RegistrationKpiFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, RegistrationKpiFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RegistrationKpiPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a RegistrationKpi.
     * @param {RegistrationKpiCreateArgs} args - Arguments to create a RegistrationKpi.
     * @example
     * // Create one RegistrationKpi
     * const RegistrationKpi = await prisma.registrationKpi.create({
     *   data: {
     *     // ... data to create a RegistrationKpi
     *   }
     * })
     * 
    **/
    create<T extends RegistrationKpiCreateArgs<ExtArgs>>(
      args: SelectSubset<T, RegistrationKpiCreateArgs<ExtArgs>>
    ): Prisma__RegistrationKpiClient<$Result.GetResult<Prisma.$RegistrationKpiPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Delete a RegistrationKpi.
     * @param {RegistrationKpiDeleteArgs} args - Arguments to delete one RegistrationKpi.
     * @example
     * // Delete one RegistrationKpi
     * const RegistrationKpi = await prisma.registrationKpi.delete({
     *   where: {
     *     // ... filter to delete one RegistrationKpi
     *   }
     * })
     * 
    **/
    delete<T extends RegistrationKpiDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, RegistrationKpiDeleteArgs<ExtArgs>>
    ): Prisma__RegistrationKpiClient<$Result.GetResult<Prisma.$RegistrationKpiPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one RegistrationKpi.
     * @param {RegistrationKpiUpdateArgs} args - Arguments to update one RegistrationKpi.
     * @example
     * // Update one RegistrationKpi
     * const registrationKpi = await prisma.registrationKpi.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends RegistrationKpiUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, RegistrationKpiUpdateArgs<ExtArgs>>
    ): Prisma__RegistrationKpiClient<$Result.GetResult<Prisma.$RegistrationKpiPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more RegistrationKpis.
     * @param {RegistrationKpiDeleteManyArgs} args - Arguments to filter RegistrationKpis to delete.
     * @example
     * // Delete a few RegistrationKpis
     * const { count } = await prisma.registrationKpi.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends RegistrationKpiDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, RegistrationKpiDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RegistrationKpis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistrationKpiUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RegistrationKpis
     * const registrationKpi = await prisma.registrationKpi.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends RegistrationKpiUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, RegistrationKpiUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RegistrationKpi.
     * @param {RegistrationKpiUpsertArgs} args - Arguments to update or create a RegistrationKpi.
     * @example
     * // Update or create a RegistrationKpi
     * const registrationKpi = await prisma.registrationKpi.upsert({
     *   create: {
     *     // ... data to create a RegistrationKpi
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RegistrationKpi we want to update
     *   }
     * })
    **/
    upsert<T extends RegistrationKpiUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, RegistrationKpiUpsertArgs<ExtArgs>>
    ): Prisma__RegistrationKpiClient<$Result.GetResult<Prisma.$RegistrationKpiPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of RegistrationKpis.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistrationKpiCountArgs} args - Arguments to filter RegistrationKpis to count.
     * @example
     * // Count the number of RegistrationKpis
     * const count = await prisma.registrationKpi.count({
     *   where: {
     *     // ... the filter for the RegistrationKpis we want to count
     *   }
     * })
    **/
    count<T extends RegistrationKpiCountArgs>(
      args?: Subset<T, RegistrationKpiCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RegistrationKpiCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RegistrationKpi.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistrationKpiAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RegistrationKpiAggregateArgs>(args: Subset<T, RegistrationKpiAggregateArgs>): Prisma.PrismaPromise<GetRegistrationKpiAggregateType<T>>

    /**
     * Group by RegistrationKpi.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RegistrationKpiGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RegistrationKpiGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RegistrationKpiGroupByArgs['orderBy'] }
        : { orderBy?: RegistrationKpiGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RegistrationKpiGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRegistrationKpiGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RegistrationKpi model
   */
  readonly fields: RegistrationKpiFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RegistrationKpi.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RegistrationKpiClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    employee<T extends EmployeeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeDefaultArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null, Null, ExtArgs>;

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the RegistrationKpi model
   */ 
  interface RegistrationKpiFieldRefs {
    readonly id: FieldRef<"RegistrationKpi", 'String'>
    readonly date: FieldRef<"RegistrationKpi", 'String'>
    readonly patientId: FieldRef<"RegistrationKpi", 'String'>
    readonly employeeId: FieldRef<"RegistrationKpi", 'String'>
    readonly criterion1: FieldRef<"RegistrationKpi", 'Float'>
    readonly criterion2: FieldRef<"RegistrationKpi", 'Float'>
    readonly criterion3: FieldRef<"RegistrationKpi", 'Float'>
    readonly totalScore: FieldRef<"RegistrationKpi", 'Float'>
    readonly maxScore: FieldRef<"RegistrationKpi", 'Float'>
    readonly count: FieldRef<"RegistrationKpi", 'Int'>
    readonly createdAt: FieldRef<"RegistrationKpi", 'String'>
    readonly createdBy: FieldRef<"RegistrationKpi", 'String'>
  }
    

  // Custom InputTypes

  /**
   * RegistrationKpi findUnique
   */
  export type RegistrationKpiFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistrationKpi
     */
    select?: RegistrationKpiSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegistrationKpiInclude<ExtArgs> | null
    /**
     * Filter, which RegistrationKpi to fetch.
     */
    where: RegistrationKpiWhereUniqueInput
  }


  /**
   * RegistrationKpi findUniqueOrThrow
   */
  export type RegistrationKpiFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistrationKpi
     */
    select?: RegistrationKpiSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegistrationKpiInclude<ExtArgs> | null
    /**
     * Filter, which RegistrationKpi to fetch.
     */
    where: RegistrationKpiWhereUniqueInput
  }


  /**
   * RegistrationKpi findFirst
   */
  export type RegistrationKpiFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistrationKpi
     */
    select?: RegistrationKpiSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegistrationKpiInclude<ExtArgs> | null
    /**
     * Filter, which RegistrationKpi to fetch.
     */
    where?: RegistrationKpiWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistrationKpis to fetch.
     */
    orderBy?: RegistrationKpiOrderByWithRelationInput | RegistrationKpiOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistrationKpis.
     */
    cursor?: RegistrationKpiWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistrationKpis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistrationKpis.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistrationKpis.
     */
    distinct?: RegistrationKpiScalarFieldEnum | RegistrationKpiScalarFieldEnum[]
  }


  /**
   * RegistrationKpi findFirstOrThrow
   */
  export type RegistrationKpiFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistrationKpi
     */
    select?: RegistrationKpiSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegistrationKpiInclude<ExtArgs> | null
    /**
     * Filter, which RegistrationKpi to fetch.
     */
    where?: RegistrationKpiWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistrationKpis to fetch.
     */
    orderBy?: RegistrationKpiOrderByWithRelationInput | RegistrationKpiOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RegistrationKpis.
     */
    cursor?: RegistrationKpiWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistrationKpis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistrationKpis.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RegistrationKpis.
     */
    distinct?: RegistrationKpiScalarFieldEnum | RegistrationKpiScalarFieldEnum[]
  }


  /**
   * RegistrationKpi findMany
   */
  export type RegistrationKpiFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistrationKpi
     */
    select?: RegistrationKpiSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegistrationKpiInclude<ExtArgs> | null
    /**
     * Filter, which RegistrationKpis to fetch.
     */
    where?: RegistrationKpiWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RegistrationKpis to fetch.
     */
    orderBy?: RegistrationKpiOrderByWithRelationInput | RegistrationKpiOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RegistrationKpis.
     */
    cursor?: RegistrationKpiWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RegistrationKpis from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RegistrationKpis.
     */
    skip?: number
    distinct?: RegistrationKpiScalarFieldEnum | RegistrationKpiScalarFieldEnum[]
  }


  /**
   * RegistrationKpi create
   */
  export type RegistrationKpiCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistrationKpi
     */
    select?: RegistrationKpiSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegistrationKpiInclude<ExtArgs> | null
    /**
     * The data needed to create a RegistrationKpi.
     */
    data: XOR<RegistrationKpiCreateInput, RegistrationKpiUncheckedCreateInput>
  }


  /**
   * RegistrationKpi update
   */
  export type RegistrationKpiUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistrationKpi
     */
    select?: RegistrationKpiSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegistrationKpiInclude<ExtArgs> | null
    /**
     * The data needed to update a RegistrationKpi.
     */
    data: XOR<RegistrationKpiUpdateInput, RegistrationKpiUncheckedUpdateInput>
    /**
     * Choose, which RegistrationKpi to update.
     */
    where: RegistrationKpiWhereUniqueInput
  }


  /**
   * RegistrationKpi updateMany
   */
  export type RegistrationKpiUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RegistrationKpis.
     */
    data: XOR<RegistrationKpiUpdateManyMutationInput, RegistrationKpiUncheckedUpdateManyInput>
    /**
     * Filter which RegistrationKpis to update
     */
    where?: RegistrationKpiWhereInput
  }


  /**
   * RegistrationKpi upsert
   */
  export type RegistrationKpiUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistrationKpi
     */
    select?: RegistrationKpiSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegistrationKpiInclude<ExtArgs> | null
    /**
     * The filter to search for the RegistrationKpi to update in case it exists.
     */
    where: RegistrationKpiWhereUniqueInput
    /**
     * In case the RegistrationKpi found by the `where` argument doesn't exist, create a new RegistrationKpi with this data.
     */
    create: XOR<RegistrationKpiCreateInput, RegistrationKpiUncheckedCreateInput>
    /**
     * In case the RegistrationKpi was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RegistrationKpiUpdateInput, RegistrationKpiUncheckedUpdateInput>
  }


  /**
   * RegistrationKpi delete
   */
  export type RegistrationKpiDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistrationKpi
     */
    select?: RegistrationKpiSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegistrationKpiInclude<ExtArgs> | null
    /**
     * Filter which RegistrationKpi to delete.
     */
    where: RegistrationKpiWhereUniqueInput
  }


  /**
   * RegistrationKpi deleteMany
   */
  export type RegistrationKpiDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RegistrationKpis to delete
     */
    where?: RegistrationKpiWhereInput
  }


  /**
   * RegistrationKpi without action
   */
  export type RegistrationKpiDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RegistrationKpi
     */
    select?: RegistrationKpiSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: RegistrationKpiInclude<ExtArgs> | null
  }



  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    entityType: string | null
    entityId: string | null
    action: string | null
    changedBy: string | null
    changedByRole: string | null
    timestamp: string | null
    details: string | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    entityType: string | null
    entityId: string | null
    action: string | null
    changedBy: string | null
    changedByRole: string | null
    timestamp: string | null
    details: string | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    entityType: number
    entityId: number
    action: number
    changedBy: number
    changedByRole: number
    timestamp: number
    details: number
    _all: number
  }


  export type AuditLogMinAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    action?: true
    changedBy?: true
    changedByRole?: true
    timestamp?: true
    details?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    action?: true
    changedBy?: true
    changedByRole?: true
    timestamp?: true
    details?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    entityType?: true
    entityId?: true
    action?: true
    changedBy?: true
    changedByRole?: true
    timestamp?: true
    details?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    entityType: string
    entityId: string
    action: string
    changedBy: string
    changedByRole: string
    timestamp: string
    details: string | null
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    action?: boolean
    changedBy?: boolean
    changedByRole?: boolean
    timestamp?: boolean
    details?: boolean
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    entityType?: boolean
    entityId?: boolean
    action?: boolean
    changedBy?: boolean
    changedByRole?: boolean
    timestamp?: boolean
    details?: boolean
  }


  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      entityType: string
      entityId: string
      action: string
      changedBy: string
      changedByRole: string
      timestamp: string
      details: string | null
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }


  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AuditLogFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one AuditLog that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AuditLogFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AuditLogFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
    **/
    create<T extends AuditLogCreateArgs<ExtArgs>>(
      args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
    **/
    delete<T extends AuditLogDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AuditLogUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AuditLogDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AuditLogUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
    **/
    upsert<T extends AuditLogUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>
    ): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';


    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the AuditLog model
   */ 
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly entityType: FieldRef<"AuditLog", 'String'>
    readonly entityId: FieldRef<"AuditLog", 'String'>
    readonly action: FieldRef<"AuditLog", 'String'>
    readonly changedBy: FieldRef<"AuditLog", 'String'>
    readonly changedByRole: FieldRef<"AuditLog", 'String'>
    readonly timestamp: FieldRef<"AuditLog", 'String'>
    readonly details: FieldRef<"AuditLog", 'String'>
  }
    

  // Custom InputTypes

  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }


  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }


  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }


  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }


  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }


  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }


  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }


  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
  }


  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }


  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }


  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
  }


  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
  }



  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const EmployeeScalarFieldEnum: {
    id: 'id',
    name: 'name',
    role: 'role',
    password: 'password',
    baseSalary: 'baseSalary',
    hourlyRate: 'hourlyRate',
    branch: 'branch',
    sortOrder: 'sortOrder',
    createdAt: 'createdAt'
  };

  export type EmployeeScalarFieldEnum = (typeof EmployeeScalarFieldEnum)[keyof typeof EmployeeScalarFieldEnum]


  export const ShiftScalarFieldEnum: {
    id: 'id',
    date: 'date',
    employeeId: 'employeeId',
    type: 'type',
    hours: 'hours',
    cabinetClosed: 'cabinetClosed',
    centerClosed: 'centerClosed',
    coefficient: 'coefficient',
    comment: 'comment',
    createdAt: 'createdAt',
    createdBy: 'createdBy',
    isDeleted: 'isDeleted'
  };

  export type ShiftScalarFieldEnum = (typeof ShiftScalarFieldEnum)[keyof typeof ShiftScalarFieldEnum]


  export const KpiRecordScalarFieldEnum: {
    id: 'id',
    date: 'date',
    employeeId: 'employeeId',
    qualityScore: 'qualityScore',
    errorsCount: 'errorsCount',
    salesBonus: 'salesBonus',
    checkList: 'checkList',
    createdAt: 'createdAt',
    createdBy: 'createdBy'
  };

  export type KpiRecordScalarFieldEnum = (typeof KpiRecordScalarFieldEnum)[keyof typeof KpiRecordScalarFieldEnum]


  export const MonthlyNormScalarFieldEnum: {
    month: 'month',
    hours: 'hours',
    createdAt: 'createdAt'
  };

  export type MonthlyNormScalarFieldEnum = (typeof MonthlyNormScalarFieldEnum)[keyof typeof MonthlyNormScalarFieldEnum]


  export const PromotionSaleScalarFieldEnum: {
    id: 'id',
    date: 'date',
    patientId: 'patientId',
    employeeId: 'employeeId',
    productName: 'productName',
    price: 'price',
    bonus: 'bonus',
    createdAt: 'createdAt',
    createdBy: 'createdBy'
  };

  export type PromotionSaleScalarFieldEnum = (typeof PromotionSaleScalarFieldEnum)[keyof typeof PromotionSaleScalarFieldEnum]


  export const RegistrationKpiScalarFieldEnum: {
    id: 'id',
    date: 'date',
    patientId: 'patientId',
    employeeId: 'employeeId',
    criterion1: 'criterion1',
    criterion2: 'criterion2',
    criterion3: 'criterion3',
    totalScore: 'totalScore',
    maxScore: 'maxScore',
    count: 'count',
    createdAt: 'createdAt',
    createdBy: 'createdBy'
  };

  export type RegistrationKpiScalarFieldEnum = (typeof RegistrationKpiScalarFieldEnum)[keyof typeof RegistrationKpiScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    entityType: 'entityType',
    entityId: 'entityId',
    action: 'action',
    changedBy: 'changedBy',
    changedByRole: 'changedByRole',
    timestamp: 'timestamp',
    details: 'details'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type EmployeeWhereInput = {
    AND?: EmployeeWhereInput | EmployeeWhereInput[]
    OR?: EmployeeWhereInput[]
    NOT?: EmployeeWhereInput | EmployeeWhereInput[]
    id?: StringFilter<"Employee"> | string
    name?: StringFilter<"Employee"> | string
    role?: StringFilter<"Employee"> | string
    password?: StringFilter<"Employee"> | string
    baseSalary?: FloatFilter<"Employee"> | number
    hourlyRate?: FloatFilter<"Employee"> | number
    branch?: StringNullableFilter<"Employee"> | string | null
    sortOrder?: IntFilter<"Employee"> | number
    createdAt?: StringFilter<"Employee"> | string
    kpiRecords?: KpiRecordListRelationFilter
    promotionSales?: PromotionSaleListRelationFilter
    registrationKpis?: RegistrationKpiListRelationFilter
    shifts?: ShiftListRelationFilter
  }

  export type EmployeeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    baseSalary?: SortOrder
    hourlyRate?: SortOrder
    branch?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    kpiRecords?: KpiRecordOrderByRelationAggregateInput
    promotionSales?: PromotionSaleOrderByRelationAggregateInput
    registrationKpis?: RegistrationKpiOrderByRelationAggregateInput
    shifts?: ShiftOrderByRelationAggregateInput
  }

  export type EmployeeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EmployeeWhereInput | EmployeeWhereInput[]
    OR?: EmployeeWhereInput[]
    NOT?: EmployeeWhereInput | EmployeeWhereInput[]
    name?: StringFilter<"Employee"> | string
    role?: StringFilter<"Employee"> | string
    password?: StringFilter<"Employee"> | string
    baseSalary?: FloatFilter<"Employee"> | number
    hourlyRate?: FloatFilter<"Employee"> | number
    branch?: StringNullableFilter<"Employee"> | string | null
    sortOrder?: IntFilter<"Employee"> | number
    createdAt?: StringFilter<"Employee"> | string
    kpiRecords?: KpiRecordListRelationFilter
    promotionSales?: PromotionSaleListRelationFilter
    registrationKpis?: RegistrationKpiListRelationFilter
    shifts?: ShiftListRelationFilter
  }, "id">

  export type EmployeeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    baseSalary?: SortOrder
    hourlyRate?: SortOrder
    branch?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    _count?: EmployeeCountOrderByAggregateInput
    _avg?: EmployeeAvgOrderByAggregateInput
    _max?: EmployeeMaxOrderByAggregateInput
    _min?: EmployeeMinOrderByAggregateInput
    _sum?: EmployeeSumOrderByAggregateInput
  }

  export type EmployeeScalarWhereWithAggregatesInput = {
    AND?: EmployeeScalarWhereWithAggregatesInput | EmployeeScalarWhereWithAggregatesInput[]
    OR?: EmployeeScalarWhereWithAggregatesInput[]
    NOT?: EmployeeScalarWhereWithAggregatesInput | EmployeeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Employee"> | string
    name?: StringWithAggregatesFilter<"Employee"> | string
    role?: StringWithAggregatesFilter<"Employee"> | string
    password?: StringWithAggregatesFilter<"Employee"> | string
    baseSalary?: FloatWithAggregatesFilter<"Employee"> | number
    hourlyRate?: FloatWithAggregatesFilter<"Employee"> | number
    branch?: StringNullableWithAggregatesFilter<"Employee"> | string | null
    sortOrder?: IntWithAggregatesFilter<"Employee"> | number
    createdAt?: StringWithAggregatesFilter<"Employee"> | string
  }

  export type ShiftWhereInput = {
    AND?: ShiftWhereInput | ShiftWhereInput[]
    OR?: ShiftWhereInput[]
    NOT?: ShiftWhereInput | ShiftWhereInput[]
    id?: StringFilter<"Shift"> | string
    date?: StringFilter<"Shift"> | string
    employeeId?: StringFilter<"Shift"> | string
    type?: StringFilter<"Shift"> | string
    hours?: FloatFilter<"Shift"> | number
    cabinetClosed?: BoolFilter<"Shift"> | boolean
    centerClosed?: BoolFilter<"Shift"> | boolean
    coefficient?: FloatFilter<"Shift"> | number
    comment?: StringNullableFilter<"Shift"> | string | null
    createdAt?: StringFilter<"Shift"> | string
    createdBy?: StringNullableFilter<"Shift"> | string | null
    isDeleted?: BoolFilter<"Shift"> | boolean
    employee?: XOR<EmployeeRelationFilter, EmployeeWhereInput>
  }

  export type ShiftOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    employeeId?: SortOrder
    type?: SortOrder
    hours?: SortOrder
    cabinetClosed?: SortOrder
    centerClosed?: SortOrder
    coefficient?: SortOrder
    comment?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    employee?: EmployeeOrderByWithRelationInput
  }

  export type ShiftWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ShiftWhereInput | ShiftWhereInput[]
    OR?: ShiftWhereInput[]
    NOT?: ShiftWhereInput | ShiftWhereInput[]
    date?: StringFilter<"Shift"> | string
    employeeId?: StringFilter<"Shift"> | string
    type?: StringFilter<"Shift"> | string
    hours?: FloatFilter<"Shift"> | number
    cabinetClosed?: BoolFilter<"Shift"> | boolean
    centerClosed?: BoolFilter<"Shift"> | boolean
    coefficient?: FloatFilter<"Shift"> | number
    comment?: StringNullableFilter<"Shift"> | string | null
    createdAt?: StringFilter<"Shift"> | string
    createdBy?: StringNullableFilter<"Shift"> | string | null
    isDeleted?: BoolFilter<"Shift"> | boolean
    employee?: XOR<EmployeeRelationFilter, EmployeeWhereInput>
  }, "id">

  export type ShiftOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    employeeId?: SortOrder
    type?: SortOrder
    hours?: SortOrder
    cabinetClosed?: SortOrder
    centerClosed?: SortOrder
    coefficient?: SortOrder
    comment?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    _count?: ShiftCountOrderByAggregateInput
    _avg?: ShiftAvgOrderByAggregateInput
    _max?: ShiftMaxOrderByAggregateInput
    _min?: ShiftMinOrderByAggregateInput
    _sum?: ShiftSumOrderByAggregateInput
  }

  export type ShiftScalarWhereWithAggregatesInput = {
    AND?: ShiftScalarWhereWithAggregatesInput | ShiftScalarWhereWithAggregatesInput[]
    OR?: ShiftScalarWhereWithAggregatesInput[]
    NOT?: ShiftScalarWhereWithAggregatesInput | ShiftScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Shift"> | string
    date?: StringWithAggregatesFilter<"Shift"> | string
    employeeId?: StringWithAggregatesFilter<"Shift"> | string
    type?: StringWithAggregatesFilter<"Shift"> | string
    hours?: FloatWithAggregatesFilter<"Shift"> | number
    cabinetClosed?: BoolWithAggregatesFilter<"Shift"> | boolean
    centerClosed?: BoolWithAggregatesFilter<"Shift"> | boolean
    coefficient?: FloatWithAggregatesFilter<"Shift"> | number
    comment?: StringNullableWithAggregatesFilter<"Shift"> | string | null
    createdAt?: StringWithAggregatesFilter<"Shift"> | string
    createdBy?: StringNullableWithAggregatesFilter<"Shift"> | string | null
    isDeleted?: BoolWithAggregatesFilter<"Shift"> | boolean
  }

  export type KpiRecordWhereInput = {
    AND?: KpiRecordWhereInput | KpiRecordWhereInput[]
    OR?: KpiRecordWhereInput[]
    NOT?: KpiRecordWhereInput | KpiRecordWhereInput[]
    id?: StringFilter<"KpiRecord"> | string
    date?: StringFilter<"KpiRecord"> | string
    employeeId?: StringFilter<"KpiRecord"> | string
    qualityScore?: FloatFilter<"KpiRecord"> | number
    errorsCount?: IntFilter<"KpiRecord"> | number
    salesBonus?: FloatFilter<"KpiRecord"> | number
    checkList?: BoolFilter<"KpiRecord"> | boolean
    createdAt?: StringFilter<"KpiRecord"> | string
    createdBy?: StringNullableFilter<"KpiRecord"> | string | null
    employee?: XOR<EmployeeRelationFilter, EmployeeWhereInput>
  }

  export type KpiRecordOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    employeeId?: SortOrder
    qualityScore?: SortOrder
    errorsCount?: SortOrder
    salesBonus?: SortOrder
    checkList?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    employee?: EmployeeOrderByWithRelationInput
  }

  export type KpiRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: KpiRecordWhereInput | KpiRecordWhereInput[]
    OR?: KpiRecordWhereInput[]
    NOT?: KpiRecordWhereInput | KpiRecordWhereInput[]
    date?: StringFilter<"KpiRecord"> | string
    employeeId?: StringFilter<"KpiRecord"> | string
    qualityScore?: FloatFilter<"KpiRecord"> | number
    errorsCount?: IntFilter<"KpiRecord"> | number
    salesBonus?: FloatFilter<"KpiRecord"> | number
    checkList?: BoolFilter<"KpiRecord"> | boolean
    createdAt?: StringFilter<"KpiRecord"> | string
    createdBy?: StringNullableFilter<"KpiRecord"> | string | null
    employee?: XOR<EmployeeRelationFilter, EmployeeWhereInput>
  }, "id">

  export type KpiRecordOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    employeeId?: SortOrder
    qualityScore?: SortOrder
    errorsCount?: SortOrder
    salesBonus?: SortOrder
    checkList?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    _count?: KpiRecordCountOrderByAggregateInput
    _avg?: KpiRecordAvgOrderByAggregateInput
    _max?: KpiRecordMaxOrderByAggregateInput
    _min?: KpiRecordMinOrderByAggregateInput
    _sum?: KpiRecordSumOrderByAggregateInput
  }

  export type KpiRecordScalarWhereWithAggregatesInput = {
    AND?: KpiRecordScalarWhereWithAggregatesInput | KpiRecordScalarWhereWithAggregatesInput[]
    OR?: KpiRecordScalarWhereWithAggregatesInput[]
    NOT?: KpiRecordScalarWhereWithAggregatesInput | KpiRecordScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"KpiRecord"> | string
    date?: StringWithAggregatesFilter<"KpiRecord"> | string
    employeeId?: StringWithAggregatesFilter<"KpiRecord"> | string
    qualityScore?: FloatWithAggregatesFilter<"KpiRecord"> | number
    errorsCount?: IntWithAggregatesFilter<"KpiRecord"> | number
    salesBonus?: FloatWithAggregatesFilter<"KpiRecord"> | number
    checkList?: BoolWithAggregatesFilter<"KpiRecord"> | boolean
    createdAt?: StringWithAggregatesFilter<"KpiRecord"> | string
    createdBy?: StringNullableWithAggregatesFilter<"KpiRecord"> | string | null
  }

  export type MonthlyNormWhereInput = {
    AND?: MonthlyNormWhereInput | MonthlyNormWhereInput[]
    OR?: MonthlyNormWhereInput[]
    NOT?: MonthlyNormWhereInput | MonthlyNormWhereInput[]
    month?: StringFilter<"MonthlyNorm"> | string
    hours?: FloatFilter<"MonthlyNorm"> | number
    createdAt?: StringFilter<"MonthlyNorm"> | string
  }

  export type MonthlyNormOrderByWithRelationInput = {
    month?: SortOrder
    hours?: SortOrder
    createdAt?: SortOrder
  }

  export type MonthlyNormWhereUniqueInput = Prisma.AtLeast<{
    month?: string
    AND?: MonthlyNormWhereInput | MonthlyNormWhereInput[]
    OR?: MonthlyNormWhereInput[]
    NOT?: MonthlyNormWhereInput | MonthlyNormWhereInput[]
    hours?: FloatFilter<"MonthlyNorm"> | number
    createdAt?: StringFilter<"MonthlyNorm"> | string
  }, "month">

  export type MonthlyNormOrderByWithAggregationInput = {
    month?: SortOrder
    hours?: SortOrder
    createdAt?: SortOrder
    _count?: MonthlyNormCountOrderByAggregateInput
    _avg?: MonthlyNormAvgOrderByAggregateInput
    _max?: MonthlyNormMaxOrderByAggregateInput
    _min?: MonthlyNormMinOrderByAggregateInput
    _sum?: MonthlyNormSumOrderByAggregateInput
  }

  export type MonthlyNormScalarWhereWithAggregatesInput = {
    AND?: MonthlyNormScalarWhereWithAggregatesInput | MonthlyNormScalarWhereWithAggregatesInput[]
    OR?: MonthlyNormScalarWhereWithAggregatesInput[]
    NOT?: MonthlyNormScalarWhereWithAggregatesInput | MonthlyNormScalarWhereWithAggregatesInput[]
    month?: StringWithAggregatesFilter<"MonthlyNorm"> | string
    hours?: FloatWithAggregatesFilter<"MonthlyNorm"> | number
    createdAt?: StringWithAggregatesFilter<"MonthlyNorm"> | string
  }

  export type PromotionSaleWhereInput = {
    AND?: PromotionSaleWhereInput | PromotionSaleWhereInput[]
    OR?: PromotionSaleWhereInput[]
    NOT?: PromotionSaleWhereInput | PromotionSaleWhereInput[]
    id?: StringFilter<"PromotionSale"> | string
    date?: StringFilter<"PromotionSale"> | string
    patientId?: StringNullableFilter<"PromotionSale"> | string | null
    employeeId?: StringFilter<"PromotionSale"> | string
    productName?: StringFilter<"PromotionSale"> | string
    price?: FloatFilter<"PromotionSale"> | number
    bonus?: FloatFilter<"PromotionSale"> | number
    createdAt?: StringFilter<"PromotionSale"> | string
    createdBy?: StringNullableFilter<"PromotionSale"> | string | null
    employee?: XOR<EmployeeRelationFilter, EmployeeWhereInput>
  }

  export type PromotionSaleOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    patientId?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    productName?: SortOrder
    price?: SortOrder
    bonus?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    employee?: EmployeeOrderByWithRelationInput
  }

  export type PromotionSaleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PromotionSaleWhereInput | PromotionSaleWhereInput[]
    OR?: PromotionSaleWhereInput[]
    NOT?: PromotionSaleWhereInput | PromotionSaleWhereInput[]
    date?: StringFilter<"PromotionSale"> | string
    patientId?: StringNullableFilter<"PromotionSale"> | string | null
    employeeId?: StringFilter<"PromotionSale"> | string
    productName?: StringFilter<"PromotionSale"> | string
    price?: FloatFilter<"PromotionSale"> | number
    bonus?: FloatFilter<"PromotionSale"> | number
    createdAt?: StringFilter<"PromotionSale"> | string
    createdBy?: StringNullableFilter<"PromotionSale"> | string | null
    employee?: XOR<EmployeeRelationFilter, EmployeeWhereInput>
  }, "id">

  export type PromotionSaleOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    patientId?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    productName?: SortOrder
    price?: SortOrder
    bonus?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    _count?: PromotionSaleCountOrderByAggregateInput
    _avg?: PromotionSaleAvgOrderByAggregateInput
    _max?: PromotionSaleMaxOrderByAggregateInput
    _min?: PromotionSaleMinOrderByAggregateInput
    _sum?: PromotionSaleSumOrderByAggregateInput
  }

  export type PromotionSaleScalarWhereWithAggregatesInput = {
    AND?: PromotionSaleScalarWhereWithAggregatesInput | PromotionSaleScalarWhereWithAggregatesInput[]
    OR?: PromotionSaleScalarWhereWithAggregatesInput[]
    NOT?: PromotionSaleScalarWhereWithAggregatesInput | PromotionSaleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PromotionSale"> | string
    date?: StringWithAggregatesFilter<"PromotionSale"> | string
    patientId?: StringNullableWithAggregatesFilter<"PromotionSale"> | string | null
    employeeId?: StringWithAggregatesFilter<"PromotionSale"> | string
    productName?: StringWithAggregatesFilter<"PromotionSale"> | string
    price?: FloatWithAggregatesFilter<"PromotionSale"> | number
    bonus?: FloatWithAggregatesFilter<"PromotionSale"> | number
    createdAt?: StringWithAggregatesFilter<"PromotionSale"> | string
    createdBy?: StringNullableWithAggregatesFilter<"PromotionSale"> | string | null
  }

  export type RegistrationKpiWhereInput = {
    AND?: RegistrationKpiWhereInput | RegistrationKpiWhereInput[]
    OR?: RegistrationKpiWhereInput[]
    NOT?: RegistrationKpiWhereInput | RegistrationKpiWhereInput[]
    id?: StringFilter<"RegistrationKpi"> | string
    date?: StringFilter<"RegistrationKpi"> | string
    patientId?: StringNullableFilter<"RegistrationKpi"> | string | null
    employeeId?: StringFilter<"RegistrationKpi"> | string
    criterion1?: FloatFilter<"RegistrationKpi"> | number
    criterion2?: FloatFilter<"RegistrationKpi"> | number
    criterion3?: FloatFilter<"RegistrationKpi"> | number
    totalScore?: FloatFilter<"RegistrationKpi"> | number
    maxScore?: FloatFilter<"RegistrationKpi"> | number
    count?: IntFilter<"RegistrationKpi"> | number
    createdAt?: StringFilter<"RegistrationKpi"> | string
    createdBy?: StringNullableFilter<"RegistrationKpi"> | string | null
    employee?: XOR<EmployeeRelationFilter, EmployeeWhereInput>
  }

  export type RegistrationKpiOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    patientId?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    criterion1?: SortOrder
    criterion2?: SortOrder
    criterion3?: SortOrder
    totalScore?: SortOrder
    maxScore?: SortOrder
    count?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    employee?: EmployeeOrderByWithRelationInput
  }

  export type RegistrationKpiWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RegistrationKpiWhereInput | RegistrationKpiWhereInput[]
    OR?: RegistrationKpiWhereInput[]
    NOT?: RegistrationKpiWhereInput | RegistrationKpiWhereInput[]
    date?: StringFilter<"RegistrationKpi"> | string
    patientId?: StringNullableFilter<"RegistrationKpi"> | string | null
    employeeId?: StringFilter<"RegistrationKpi"> | string
    criterion1?: FloatFilter<"RegistrationKpi"> | number
    criterion2?: FloatFilter<"RegistrationKpi"> | number
    criterion3?: FloatFilter<"RegistrationKpi"> | number
    totalScore?: FloatFilter<"RegistrationKpi"> | number
    maxScore?: FloatFilter<"RegistrationKpi"> | number
    count?: IntFilter<"RegistrationKpi"> | number
    createdAt?: StringFilter<"RegistrationKpi"> | string
    createdBy?: StringNullableFilter<"RegistrationKpi"> | string | null
    employee?: XOR<EmployeeRelationFilter, EmployeeWhereInput>
  }, "id">

  export type RegistrationKpiOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    patientId?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    criterion1?: SortOrder
    criterion2?: SortOrder
    criterion3?: SortOrder
    totalScore?: SortOrder
    maxScore?: SortOrder
    count?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrderInput | SortOrder
    _count?: RegistrationKpiCountOrderByAggregateInput
    _avg?: RegistrationKpiAvgOrderByAggregateInput
    _max?: RegistrationKpiMaxOrderByAggregateInput
    _min?: RegistrationKpiMinOrderByAggregateInput
    _sum?: RegistrationKpiSumOrderByAggregateInput
  }

  export type RegistrationKpiScalarWhereWithAggregatesInput = {
    AND?: RegistrationKpiScalarWhereWithAggregatesInput | RegistrationKpiScalarWhereWithAggregatesInput[]
    OR?: RegistrationKpiScalarWhereWithAggregatesInput[]
    NOT?: RegistrationKpiScalarWhereWithAggregatesInput | RegistrationKpiScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RegistrationKpi"> | string
    date?: StringWithAggregatesFilter<"RegistrationKpi"> | string
    patientId?: StringNullableWithAggregatesFilter<"RegistrationKpi"> | string | null
    employeeId?: StringWithAggregatesFilter<"RegistrationKpi"> | string
    criterion1?: FloatWithAggregatesFilter<"RegistrationKpi"> | number
    criterion2?: FloatWithAggregatesFilter<"RegistrationKpi"> | number
    criterion3?: FloatWithAggregatesFilter<"RegistrationKpi"> | number
    totalScore?: FloatWithAggregatesFilter<"RegistrationKpi"> | number
    maxScore?: FloatWithAggregatesFilter<"RegistrationKpi"> | number
    count?: IntWithAggregatesFilter<"RegistrationKpi"> | number
    createdAt?: StringWithAggregatesFilter<"RegistrationKpi"> | string
    createdBy?: StringNullableWithAggregatesFilter<"RegistrationKpi"> | string | null
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    entityType?: StringFilter<"AuditLog"> | string
    entityId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    changedBy?: StringFilter<"AuditLog"> | string
    changedByRole?: StringFilter<"AuditLog"> | string
    timestamp?: StringFilter<"AuditLog"> | string
    details?: StringNullableFilter<"AuditLog"> | string | null
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    changedBy?: SortOrder
    changedByRole?: SortOrder
    timestamp?: SortOrder
    details?: SortOrderInput | SortOrder
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    entityType?: StringFilter<"AuditLog"> | string
    entityId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    changedBy?: StringFilter<"AuditLog"> | string
    changedByRole?: StringFilter<"AuditLog"> | string
    timestamp?: StringFilter<"AuditLog"> | string
    details?: StringNullableFilter<"AuditLog"> | string | null
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    changedBy?: SortOrder
    changedByRole?: SortOrder
    timestamp?: SortOrder
    details?: SortOrderInput | SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditLog"> | string
    entityType?: StringWithAggregatesFilter<"AuditLog"> | string
    entityId?: StringWithAggregatesFilter<"AuditLog"> | string
    action?: StringWithAggregatesFilter<"AuditLog"> | string
    changedBy?: StringWithAggregatesFilter<"AuditLog"> | string
    changedByRole?: StringWithAggregatesFilter<"AuditLog"> | string
    timestamp?: StringWithAggregatesFilter<"AuditLog"> | string
    details?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
  }

  export type EmployeeCreateInput = {
    id?: string
    name: string
    role?: string
    password?: string
    baseSalary?: number
    hourlyRate?: number
    branch?: string | null
    sortOrder?: number
    createdAt?: string
    kpiRecords?: KpiRecordCreateNestedManyWithoutEmployeeInput
    promotionSales?: PromotionSaleCreateNestedManyWithoutEmployeeInput
    registrationKpis?: RegistrationKpiCreateNestedManyWithoutEmployeeInput
    shifts?: ShiftCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateInput = {
    id?: string
    name: string
    role?: string
    password?: string
    baseSalary?: number
    hourlyRate?: number
    branch?: string | null
    sortOrder?: number
    createdAt?: string
    kpiRecords?: KpiRecordUncheckedCreateNestedManyWithoutEmployeeInput
    promotionSales?: PromotionSaleUncheckedCreateNestedManyWithoutEmployeeInput
    registrationKpis?: RegistrationKpiUncheckedCreateNestedManyWithoutEmployeeInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    kpiRecords?: KpiRecordUpdateManyWithoutEmployeeNestedInput
    promotionSales?: PromotionSaleUpdateManyWithoutEmployeeNestedInput
    registrationKpis?: RegistrationKpiUpdateManyWithoutEmployeeNestedInput
    shifts?: ShiftUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    kpiRecords?: KpiRecordUncheckedUpdateManyWithoutEmployeeNestedInput
    promotionSales?: PromotionSaleUncheckedUpdateManyWithoutEmployeeNestedInput
    registrationKpis?: RegistrationKpiUncheckedUpdateManyWithoutEmployeeNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
  }

  export type EmployeeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
  }

  export type ShiftCreateInput = {
    id?: string
    date: string
    type?: string
    hours?: number
    cabinetClosed?: boolean
    centerClosed?: boolean
    coefficient?: number
    comment?: string | null
    createdAt?: string
    createdBy?: string | null
    isDeleted?: boolean
    employee: EmployeeCreateNestedOneWithoutShiftsInput
  }

  export type ShiftUncheckedCreateInput = {
    id?: string
    date: string
    employeeId: string
    type?: string
    hours?: number
    cabinetClosed?: boolean
    centerClosed?: boolean
    coefficient?: number
    comment?: string | null
    createdAt?: string
    createdBy?: string | null
    isDeleted?: boolean
  }

  export type ShiftUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    cabinetClosed?: BoolFieldUpdateOperationsInput | boolean
    centerClosed?: BoolFieldUpdateOperationsInput | boolean
    coefficient?: FloatFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    employee?: EmployeeUpdateOneRequiredWithoutShiftsNestedInput
  }

  export type ShiftUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    cabinetClosed?: BoolFieldUpdateOperationsInput | boolean
    centerClosed?: BoolFieldUpdateOperationsInput | boolean
    coefficient?: FloatFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ShiftUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    cabinetClosed?: BoolFieldUpdateOperationsInput | boolean
    centerClosed?: BoolFieldUpdateOperationsInput | boolean
    coefficient?: FloatFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ShiftUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    cabinetClosed?: BoolFieldUpdateOperationsInput | boolean
    centerClosed?: BoolFieldUpdateOperationsInput | boolean
    coefficient?: FloatFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type KpiRecordCreateInput = {
    id?: string
    date: string
    qualityScore?: number
    errorsCount?: number
    salesBonus?: number
    checkList?: boolean
    createdAt?: string
    createdBy?: string | null
    employee: EmployeeCreateNestedOneWithoutKpiRecordsInput
  }

  export type KpiRecordUncheckedCreateInput = {
    id?: string
    date: string
    employeeId: string
    qualityScore?: number
    errorsCount?: number
    salesBonus?: number
    checkList?: boolean
    createdAt?: string
    createdBy?: string | null
  }

  export type KpiRecordUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    qualityScore?: FloatFieldUpdateOperationsInput | number
    errorsCount?: IntFieldUpdateOperationsInput | number
    salesBonus?: FloatFieldUpdateOperationsInput | number
    checkList?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    employee?: EmployeeUpdateOneRequiredWithoutKpiRecordsNestedInput
  }

  export type KpiRecordUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    qualityScore?: FloatFieldUpdateOperationsInput | number
    errorsCount?: IntFieldUpdateOperationsInput | number
    salesBonus?: FloatFieldUpdateOperationsInput | number
    checkList?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type KpiRecordUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    qualityScore?: FloatFieldUpdateOperationsInput | number
    errorsCount?: IntFieldUpdateOperationsInput | number
    salesBonus?: FloatFieldUpdateOperationsInput | number
    checkList?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type KpiRecordUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    qualityScore?: FloatFieldUpdateOperationsInput | number
    errorsCount?: IntFieldUpdateOperationsInput | number
    salesBonus?: FloatFieldUpdateOperationsInput | number
    checkList?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MonthlyNormCreateInput = {
    month: string
    hours?: number
    createdAt?: string
  }

  export type MonthlyNormUncheckedCreateInput = {
    month: string
    hours?: number
    createdAt?: string
  }

  export type MonthlyNormUpdateInput = {
    month?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
  }

  export type MonthlyNormUncheckedUpdateInput = {
    month?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
  }

  export type MonthlyNormUpdateManyMutationInput = {
    month?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
  }

  export type MonthlyNormUncheckedUpdateManyInput = {
    month?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
  }

  export type PromotionSaleCreateInput = {
    id?: string
    date: string
    patientId?: string | null
    productName: string
    price?: number
    bonus?: number
    createdAt?: string
    createdBy?: string | null
    employee: EmployeeCreateNestedOneWithoutPromotionSalesInput
  }

  export type PromotionSaleUncheckedCreateInput = {
    id?: string
    date: string
    patientId?: string | null
    employeeId: string
    productName: string
    price?: number
    bonus?: number
    createdAt?: string
    createdBy?: string | null
  }

  export type PromotionSaleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    bonus?: FloatFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    employee?: EmployeeUpdateOneRequiredWithoutPromotionSalesNestedInput
  }

  export type PromotionSaleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    bonus?: FloatFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PromotionSaleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    bonus?: FloatFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PromotionSaleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    bonus?: FloatFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistrationKpiCreateInput = {
    id?: string
    date: string
    patientId?: string | null
    criterion1?: number
    criterion2?: number
    criterion3?: number
    totalScore?: number
    maxScore?: number
    count?: number
    createdAt?: string
    createdBy?: string | null
    employee: EmployeeCreateNestedOneWithoutRegistrationKpisInput
  }

  export type RegistrationKpiUncheckedCreateInput = {
    id?: string
    date: string
    patientId?: string | null
    employeeId: string
    criterion1?: number
    criterion2?: number
    criterion3?: number
    totalScore?: number
    maxScore?: number
    count?: number
    createdAt?: string
    createdBy?: string | null
  }

  export type RegistrationKpiUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    criterion1?: FloatFieldUpdateOperationsInput | number
    criterion2?: FloatFieldUpdateOperationsInput | number
    criterion3?: FloatFieldUpdateOperationsInput | number
    totalScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    count?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    employee?: EmployeeUpdateOneRequiredWithoutRegistrationKpisNestedInput
  }

  export type RegistrationKpiUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeId?: StringFieldUpdateOperationsInput | string
    criterion1?: FloatFieldUpdateOperationsInput | number
    criterion2?: FloatFieldUpdateOperationsInput | number
    criterion3?: FloatFieldUpdateOperationsInput | number
    totalScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    count?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistrationKpiUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    criterion1?: FloatFieldUpdateOperationsInput | number
    criterion2?: FloatFieldUpdateOperationsInput | number
    criterion3?: FloatFieldUpdateOperationsInput | number
    totalScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    count?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistrationKpiUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeId?: StringFieldUpdateOperationsInput | string
    criterion1?: FloatFieldUpdateOperationsInput | number
    criterion2?: FloatFieldUpdateOperationsInput | number
    criterion3?: FloatFieldUpdateOperationsInput | number
    totalScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    count?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuditLogCreateInput = {
    id?: string
    entityType: string
    entityId: string
    action: string
    changedBy: string
    changedByRole: string
    timestamp: string
    details?: string | null
  }

  export type AuditLogUncheckedCreateInput = {
    id?: string
    entityType: string
    entityId: string
    action: string
    changedBy: string
    changedByRole: string
    timestamp: string
    details?: string | null
  }

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    changedBy?: StringFieldUpdateOperationsInput | string
    changedByRole?: StringFieldUpdateOperationsInput | string
    timestamp?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    changedBy?: StringFieldUpdateOperationsInput | string
    changedByRole?: StringFieldUpdateOperationsInput | string
    timestamp?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    changedBy?: StringFieldUpdateOperationsInput | string
    changedByRole?: StringFieldUpdateOperationsInput | string
    timestamp?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    entityType?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    changedBy?: StringFieldUpdateOperationsInput | string
    changedByRole?: StringFieldUpdateOperationsInput | string
    timestamp?: StringFieldUpdateOperationsInput | string
    details?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type KpiRecordListRelationFilter = {
    every?: KpiRecordWhereInput
    some?: KpiRecordWhereInput
    none?: KpiRecordWhereInput
  }

  export type PromotionSaleListRelationFilter = {
    every?: PromotionSaleWhereInput
    some?: PromotionSaleWhereInput
    none?: PromotionSaleWhereInput
  }

  export type RegistrationKpiListRelationFilter = {
    every?: RegistrationKpiWhereInput
    some?: RegistrationKpiWhereInput
    none?: RegistrationKpiWhereInput
  }

  export type ShiftListRelationFilter = {
    every?: ShiftWhereInput
    some?: ShiftWhereInput
    none?: ShiftWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type KpiRecordOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PromotionSaleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RegistrationKpiOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ShiftOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmployeeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    baseSalary?: SortOrder
    hourlyRate?: SortOrder
    branch?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
  }

  export type EmployeeAvgOrderByAggregateInput = {
    baseSalary?: SortOrder
    hourlyRate?: SortOrder
    sortOrder?: SortOrder
  }

  export type EmployeeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    baseSalary?: SortOrder
    hourlyRate?: SortOrder
    branch?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
  }

  export type EmployeeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    baseSalary?: SortOrder
    hourlyRate?: SortOrder
    branch?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
  }

  export type EmployeeSumOrderByAggregateInput = {
    baseSalary?: SortOrder
    hourlyRate?: SortOrder
    sortOrder?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EmployeeRelationFilter = {
    is?: EmployeeWhereInput
    isNot?: EmployeeWhereInput
  }

  export type ShiftCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    employeeId?: SortOrder
    type?: SortOrder
    hours?: SortOrder
    cabinetClosed?: SortOrder
    centerClosed?: SortOrder
    coefficient?: SortOrder
    comment?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    isDeleted?: SortOrder
  }

  export type ShiftAvgOrderByAggregateInput = {
    hours?: SortOrder
    coefficient?: SortOrder
  }

  export type ShiftMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    employeeId?: SortOrder
    type?: SortOrder
    hours?: SortOrder
    cabinetClosed?: SortOrder
    centerClosed?: SortOrder
    coefficient?: SortOrder
    comment?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    isDeleted?: SortOrder
  }

  export type ShiftMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    employeeId?: SortOrder
    type?: SortOrder
    hours?: SortOrder
    cabinetClosed?: SortOrder
    centerClosed?: SortOrder
    coefficient?: SortOrder
    comment?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
    isDeleted?: SortOrder
  }

  export type ShiftSumOrderByAggregateInput = {
    hours?: SortOrder
    coefficient?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type KpiRecordCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    employeeId?: SortOrder
    qualityScore?: SortOrder
    errorsCount?: SortOrder
    salesBonus?: SortOrder
    checkList?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type KpiRecordAvgOrderByAggregateInput = {
    qualityScore?: SortOrder
    errorsCount?: SortOrder
    salesBonus?: SortOrder
  }

  export type KpiRecordMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    employeeId?: SortOrder
    qualityScore?: SortOrder
    errorsCount?: SortOrder
    salesBonus?: SortOrder
    checkList?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type KpiRecordMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    employeeId?: SortOrder
    qualityScore?: SortOrder
    errorsCount?: SortOrder
    salesBonus?: SortOrder
    checkList?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type KpiRecordSumOrderByAggregateInput = {
    qualityScore?: SortOrder
    errorsCount?: SortOrder
    salesBonus?: SortOrder
  }

  export type MonthlyNormCountOrderByAggregateInput = {
    month?: SortOrder
    hours?: SortOrder
    createdAt?: SortOrder
  }

  export type MonthlyNormAvgOrderByAggregateInput = {
    hours?: SortOrder
  }

  export type MonthlyNormMaxOrderByAggregateInput = {
    month?: SortOrder
    hours?: SortOrder
    createdAt?: SortOrder
  }

  export type MonthlyNormMinOrderByAggregateInput = {
    month?: SortOrder
    hours?: SortOrder
    createdAt?: SortOrder
  }

  export type MonthlyNormSumOrderByAggregateInput = {
    hours?: SortOrder
  }

  export type PromotionSaleCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    patientId?: SortOrder
    employeeId?: SortOrder
    productName?: SortOrder
    price?: SortOrder
    bonus?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type PromotionSaleAvgOrderByAggregateInput = {
    price?: SortOrder
    bonus?: SortOrder
  }

  export type PromotionSaleMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    patientId?: SortOrder
    employeeId?: SortOrder
    productName?: SortOrder
    price?: SortOrder
    bonus?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type PromotionSaleMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    patientId?: SortOrder
    employeeId?: SortOrder
    productName?: SortOrder
    price?: SortOrder
    bonus?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type PromotionSaleSumOrderByAggregateInput = {
    price?: SortOrder
    bonus?: SortOrder
  }

  export type RegistrationKpiCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    patientId?: SortOrder
    employeeId?: SortOrder
    criterion1?: SortOrder
    criterion2?: SortOrder
    criterion3?: SortOrder
    totalScore?: SortOrder
    maxScore?: SortOrder
    count?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type RegistrationKpiAvgOrderByAggregateInput = {
    criterion1?: SortOrder
    criterion2?: SortOrder
    criterion3?: SortOrder
    totalScore?: SortOrder
    maxScore?: SortOrder
    count?: SortOrder
  }

  export type RegistrationKpiMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    patientId?: SortOrder
    employeeId?: SortOrder
    criterion1?: SortOrder
    criterion2?: SortOrder
    criterion3?: SortOrder
    totalScore?: SortOrder
    maxScore?: SortOrder
    count?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type RegistrationKpiMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    patientId?: SortOrder
    employeeId?: SortOrder
    criterion1?: SortOrder
    criterion2?: SortOrder
    criterion3?: SortOrder
    totalScore?: SortOrder
    maxScore?: SortOrder
    count?: SortOrder
    createdAt?: SortOrder
    createdBy?: SortOrder
  }

  export type RegistrationKpiSumOrderByAggregateInput = {
    criterion1?: SortOrder
    criterion2?: SortOrder
    criterion3?: SortOrder
    totalScore?: SortOrder
    maxScore?: SortOrder
    count?: SortOrder
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    changedBy?: SortOrder
    changedByRole?: SortOrder
    timestamp?: SortOrder
    details?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    changedBy?: SortOrder
    changedByRole?: SortOrder
    timestamp?: SortOrder
    details?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    action?: SortOrder
    changedBy?: SortOrder
    changedByRole?: SortOrder
    timestamp?: SortOrder
    details?: SortOrder
  }

  export type KpiRecordCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<KpiRecordCreateWithoutEmployeeInput, KpiRecordUncheckedCreateWithoutEmployeeInput> | KpiRecordCreateWithoutEmployeeInput[] | KpiRecordUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: KpiRecordCreateOrConnectWithoutEmployeeInput | KpiRecordCreateOrConnectWithoutEmployeeInput[]
    connect?: KpiRecordWhereUniqueInput | KpiRecordWhereUniqueInput[]
  }

  export type PromotionSaleCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<PromotionSaleCreateWithoutEmployeeInput, PromotionSaleUncheckedCreateWithoutEmployeeInput> | PromotionSaleCreateWithoutEmployeeInput[] | PromotionSaleUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: PromotionSaleCreateOrConnectWithoutEmployeeInput | PromotionSaleCreateOrConnectWithoutEmployeeInput[]
    connect?: PromotionSaleWhereUniqueInput | PromotionSaleWhereUniqueInput[]
  }

  export type RegistrationKpiCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<RegistrationKpiCreateWithoutEmployeeInput, RegistrationKpiUncheckedCreateWithoutEmployeeInput> | RegistrationKpiCreateWithoutEmployeeInput[] | RegistrationKpiUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: RegistrationKpiCreateOrConnectWithoutEmployeeInput | RegistrationKpiCreateOrConnectWithoutEmployeeInput[]
    connect?: RegistrationKpiWhereUniqueInput | RegistrationKpiWhereUniqueInput[]
  }

  export type ShiftCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<ShiftCreateWithoutEmployeeInput, ShiftUncheckedCreateWithoutEmployeeInput> | ShiftCreateWithoutEmployeeInput[] | ShiftUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutEmployeeInput | ShiftCreateOrConnectWithoutEmployeeInput[]
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
  }

  export type KpiRecordUncheckedCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<KpiRecordCreateWithoutEmployeeInput, KpiRecordUncheckedCreateWithoutEmployeeInput> | KpiRecordCreateWithoutEmployeeInput[] | KpiRecordUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: KpiRecordCreateOrConnectWithoutEmployeeInput | KpiRecordCreateOrConnectWithoutEmployeeInput[]
    connect?: KpiRecordWhereUniqueInput | KpiRecordWhereUniqueInput[]
  }

  export type PromotionSaleUncheckedCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<PromotionSaleCreateWithoutEmployeeInput, PromotionSaleUncheckedCreateWithoutEmployeeInput> | PromotionSaleCreateWithoutEmployeeInput[] | PromotionSaleUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: PromotionSaleCreateOrConnectWithoutEmployeeInput | PromotionSaleCreateOrConnectWithoutEmployeeInput[]
    connect?: PromotionSaleWhereUniqueInput | PromotionSaleWhereUniqueInput[]
  }

  export type RegistrationKpiUncheckedCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<RegistrationKpiCreateWithoutEmployeeInput, RegistrationKpiUncheckedCreateWithoutEmployeeInput> | RegistrationKpiCreateWithoutEmployeeInput[] | RegistrationKpiUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: RegistrationKpiCreateOrConnectWithoutEmployeeInput | RegistrationKpiCreateOrConnectWithoutEmployeeInput[]
    connect?: RegistrationKpiWhereUniqueInput | RegistrationKpiWhereUniqueInput[]
  }

  export type ShiftUncheckedCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<ShiftCreateWithoutEmployeeInput, ShiftUncheckedCreateWithoutEmployeeInput> | ShiftCreateWithoutEmployeeInput[] | ShiftUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutEmployeeInput | ShiftCreateOrConnectWithoutEmployeeInput[]
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type KpiRecordUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<KpiRecordCreateWithoutEmployeeInput, KpiRecordUncheckedCreateWithoutEmployeeInput> | KpiRecordCreateWithoutEmployeeInput[] | KpiRecordUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: KpiRecordCreateOrConnectWithoutEmployeeInput | KpiRecordCreateOrConnectWithoutEmployeeInput[]
    upsert?: KpiRecordUpsertWithWhereUniqueWithoutEmployeeInput | KpiRecordUpsertWithWhereUniqueWithoutEmployeeInput[]
    set?: KpiRecordWhereUniqueInput | KpiRecordWhereUniqueInput[]
    disconnect?: KpiRecordWhereUniqueInput | KpiRecordWhereUniqueInput[]
    delete?: KpiRecordWhereUniqueInput | KpiRecordWhereUniqueInput[]
    connect?: KpiRecordWhereUniqueInput | KpiRecordWhereUniqueInput[]
    update?: KpiRecordUpdateWithWhereUniqueWithoutEmployeeInput | KpiRecordUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: KpiRecordUpdateManyWithWhereWithoutEmployeeInput | KpiRecordUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: KpiRecordScalarWhereInput | KpiRecordScalarWhereInput[]
  }

  export type PromotionSaleUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<PromotionSaleCreateWithoutEmployeeInput, PromotionSaleUncheckedCreateWithoutEmployeeInput> | PromotionSaleCreateWithoutEmployeeInput[] | PromotionSaleUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: PromotionSaleCreateOrConnectWithoutEmployeeInput | PromotionSaleCreateOrConnectWithoutEmployeeInput[]
    upsert?: PromotionSaleUpsertWithWhereUniqueWithoutEmployeeInput | PromotionSaleUpsertWithWhereUniqueWithoutEmployeeInput[]
    set?: PromotionSaleWhereUniqueInput | PromotionSaleWhereUniqueInput[]
    disconnect?: PromotionSaleWhereUniqueInput | PromotionSaleWhereUniqueInput[]
    delete?: PromotionSaleWhereUniqueInput | PromotionSaleWhereUniqueInput[]
    connect?: PromotionSaleWhereUniqueInput | PromotionSaleWhereUniqueInput[]
    update?: PromotionSaleUpdateWithWhereUniqueWithoutEmployeeInput | PromotionSaleUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: PromotionSaleUpdateManyWithWhereWithoutEmployeeInput | PromotionSaleUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: PromotionSaleScalarWhereInput | PromotionSaleScalarWhereInput[]
  }

  export type RegistrationKpiUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<RegistrationKpiCreateWithoutEmployeeInput, RegistrationKpiUncheckedCreateWithoutEmployeeInput> | RegistrationKpiCreateWithoutEmployeeInput[] | RegistrationKpiUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: RegistrationKpiCreateOrConnectWithoutEmployeeInput | RegistrationKpiCreateOrConnectWithoutEmployeeInput[]
    upsert?: RegistrationKpiUpsertWithWhereUniqueWithoutEmployeeInput | RegistrationKpiUpsertWithWhereUniqueWithoutEmployeeInput[]
    set?: RegistrationKpiWhereUniqueInput | RegistrationKpiWhereUniqueInput[]
    disconnect?: RegistrationKpiWhereUniqueInput | RegistrationKpiWhereUniqueInput[]
    delete?: RegistrationKpiWhereUniqueInput | RegistrationKpiWhereUniqueInput[]
    connect?: RegistrationKpiWhereUniqueInput | RegistrationKpiWhereUniqueInput[]
    update?: RegistrationKpiUpdateWithWhereUniqueWithoutEmployeeInput | RegistrationKpiUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: RegistrationKpiUpdateManyWithWhereWithoutEmployeeInput | RegistrationKpiUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: RegistrationKpiScalarWhereInput | RegistrationKpiScalarWhereInput[]
  }

  export type ShiftUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<ShiftCreateWithoutEmployeeInput, ShiftUncheckedCreateWithoutEmployeeInput> | ShiftCreateWithoutEmployeeInput[] | ShiftUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutEmployeeInput | ShiftCreateOrConnectWithoutEmployeeInput[]
    upsert?: ShiftUpsertWithWhereUniqueWithoutEmployeeInput | ShiftUpsertWithWhereUniqueWithoutEmployeeInput[]
    set?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    disconnect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    delete?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    update?: ShiftUpdateWithWhereUniqueWithoutEmployeeInput | ShiftUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: ShiftUpdateManyWithWhereWithoutEmployeeInput | ShiftUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
  }

  export type KpiRecordUncheckedUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<KpiRecordCreateWithoutEmployeeInput, KpiRecordUncheckedCreateWithoutEmployeeInput> | KpiRecordCreateWithoutEmployeeInput[] | KpiRecordUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: KpiRecordCreateOrConnectWithoutEmployeeInput | KpiRecordCreateOrConnectWithoutEmployeeInput[]
    upsert?: KpiRecordUpsertWithWhereUniqueWithoutEmployeeInput | KpiRecordUpsertWithWhereUniqueWithoutEmployeeInput[]
    set?: KpiRecordWhereUniqueInput | KpiRecordWhereUniqueInput[]
    disconnect?: KpiRecordWhereUniqueInput | KpiRecordWhereUniqueInput[]
    delete?: KpiRecordWhereUniqueInput | KpiRecordWhereUniqueInput[]
    connect?: KpiRecordWhereUniqueInput | KpiRecordWhereUniqueInput[]
    update?: KpiRecordUpdateWithWhereUniqueWithoutEmployeeInput | KpiRecordUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: KpiRecordUpdateManyWithWhereWithoutEmployeeInput | KpiRecordUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: KpiRecordScalarWhereInput | KpiRecordScalarWhereInput[]
  }

  export type PromotionSaleUncheckedUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<PromotionSaleCreateWithoutEmployeeInput, PromotionSaleUncheckedCreateWithoutEmployeeInput> | PromotionSaleCreateWithoutEmployeeInput[] | PromotionSaleUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: PromotionSaleCreateOrConnectWithoutEmployeeInput | PromotionSaleCreateOrConnectWithoutEmployeeInput[]
    upsert?: PromotionSaleUpsertWithWhereUniqueWithoutEmployeeInput | PromotionSaleUpsertWithWhereUniqueWithoutEmployeeInput[]
    set?: PromotionSaleWhereUniqueInput | PromotionSaleWhereUniqueInput[]
    disconnect?: PromotionSaleWhereUniqueInput | PromotionSaleWhereUniqueInput[]
    delete?: PromotionSaleWhereUniqueInput | PromotionSaleWhereUniqueInput[]
    connect?: PromotionSaleWhereUniqueInput | PromotionSaleWhereUniqueInput[]
    update?: PromotionSaleUpdateWithWhereUniqueWithoutEmployeeInput | PromotionSaleUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: PromotionSaleUpdateManyWithWhereWithoutEmployeeInput | PromotionSaleUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: PromotionSaleScalarWhereInput | PromotionSaleScalarWhereInput[]
  }

  export type RegistrationKpiUncheckedUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<RegistrationKpiCreateWithoutEmployeeInput, RegistrationKpiUncheckedCreateWithoutEmployeeInput> | RegistrationKpiCreateWithoutEmployeeInput[] | RegistrationKpiUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: RegistrationKpiCreateOrConnectWithoutEmployeeInput | RegistrationKpiCreateOrConnectWithoutEmployeeInput[]
    upsert?: RegistrationKpiUpsertWithWhereUniqueWithoutEmployeeInput | RegistrationKpiUpsertWithWhereUniqueWithoutEmployeeInput[]
    set?: RegistrationKpiWhereUniqueInput | RegistrationKpiWhereUniqueInput[]
    disconnect?: RegistrationKpiWhereUniqueInput | RegistrationKpiWhereUniqueInput[]
    delete?: RegistrationKpiWhereUniqueInput | RegistrationKpiWhereUniqueInput[]
    connect?: RegistrationKpiWhereUniqueInput | RegistrationKpiWhereUniqueInput[]
    update?: RegistrationKpiUpdateWithWhereUniqueWithoutEmployeeInput | RegistrationKpiUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: RegistrationKpiUpdateManyWithWhereWithoutEmployeeInput | RegistrationKpiUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: RegistrationKpiScalarWhereInput | RegistrationKpiScalarWhereInput[]
  }

  export type ShiftUncheckedUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<ShiftCreateWithoutEmployeeInput, ShiftUncheckedCreateWithoutEmployeeInput> | ShiftCreateWithoutEmployeeInput[] | ShiftUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: ShiftCreateOrConnectWithoutEmployeeInput | ShiftCreateOrConnectWithoutEmployeeInput[]
    upsert?: ShiftUpsertWithWhereUniqueWithoutEmployeeInput | ShiftUpsertWithWhereUniqueWithoutEmployeeInput[]
    set?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    disconnect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    delete?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    connect?: ShiftWhereUniqueInput | ShiftWhereUniqueInput[]
    update?: ShiftUpdateWithWhereUniqueWithoutEmployeeInput | ShiftUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: ShiftUpdateManyWithWhereWithoutEmployeeInput | ShiftUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
  }

  export type EmployeeCreateNestedOneWithoutShiftsInput = {
    create?: XOR<EmployeeCreateWithoutShiftsInput, EmployeeUncheckedCreateWithoutShiftsInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutShiftsInput
    connect?: EmployeeWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EmployeeUpdateOneRequiredWithoutShiftsNestedInput = {
    create?: XOR<EmployeeCreateWithoutShiftsInput, EmployeeUncheckedCreateWithoutShiftsInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutShiftsInput
    upsert?: EmployeeUpsertWithoutShiftsInput
    connect?: EmployeeWhereUniqueInput
    update?: XOR<XOR<EmployeeUpdateToOneWithWhereWithoutShiftsInput, EmployeeUpdateWithoutShiftsInput>, EmployeeUncheckedUpdateWithoutShiftsInput>
  }

  export type EmployeeCreateNestedOneWithoutKpiRecordsInput = {
    create?: XOR<EmployeeCreateWithoutKpiRecordsInput, EmployeeUncheckedCreateWithoutKpiRecordsInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutKpiRecordsInput
    connect?: EmployeeWhereUniqueInput
  }

  export type EmployeeUpdateOneRequiredWithoutKpiRecordsNestedInput = {
    create?: XOR<EmployeeCreateWithoutKpiRecordsInput, EmployeeUncheckedCreateWithoutKpiRecordsInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutKpiRecordsInput
    upsert?: EmployeeUpsertWithoutKpiRecordsInput
    connect?: EmployeeWhereUniqueInput
    update?: XOR<XOR<EmployeeUpdateToOneWithWhereWithoutKpiRecordsInput, EmployeeUpdateWithoutKpiRecordsInput>, EmployeeUncheckedUpdateWithoutKpiRecordsInput>
  }

  export type EmployeeCreateNestedOneWithoutPromotionSalesInput = {
    create?: XOR<EmployeeCreateWithoutPromotionSalesInput, EmployeeUncheckedCreateWithoutPromotionSalesInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutPromotionSalesInput
    connect?: EmployeeWhereUniqueInput
  }

  export type EmployeeUpdateOneRequiredWithoutPromotionSalesNestedInput = {
    create?: XOR<EmployeeCreateWithoutPromotionSalesInput, EmployeeUncheckedCreateWithoutPromotionSalesInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutPromotionSalesInput
    upsert?: EmployeeUpsertWithoutPromotionSalesInput
    connect?: EmployeeWhereUniqueInput
    update?: XOR<XOR<EmployeeUpdateToOneWithWhereWithoutPromotionSalesInput, EmployeeUpdateWithoutPromotionSalesInput>, EmployeeUncheckedUpdateWithoutPromotionSalesInput>
  }

  export type EmployeeCreateNestedOneWithoutRegistrationKpisInput = {
    create?: XOR<EmployeeCreateWithoutRegistrationKpisInput, EmployeeUncheckedCreateWithoutRegistrationKpisInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutRegistrationKpisInput
    connect?: EmployeeWhereUniqueInput
  }

  export type EmployeeUpdateOneRequiredWithoutRegistrationKpisNestedInput = {
    create?: XOR<EmployeeCreateWithoutRegistrationKpisInput, EmployeeUncheckedCreateWithoutRegistrationKpisInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutRegistrationKpisInput
    upsert?: EmployeeUpsertWithoutRegistrationKpisInput
    connect?: EmployeeWhereUniqueInput
    update?: XOR<XOR<EmployeeUpdateToOneWithWhereWithoutRegistrationKpisInput, EmployeeUpdateWithoutRegistrationKpisInput>, EmployeeUncheckedUpdateWithoutRegistrationKpisInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type KpiRecordCreateWithoutEmployeeInput = {
    id?: string
    date: string
    qualityScore?: number
    errorsCount?: number
    salesBonus?: number
    checkList?: boolean
    createdAt?: string
    createdBy?: string | null
  }

  export type KpiRecordUncheckedCreateWithoutEmployeeInput = {
    id?: string
    date: string
    qualityScore?: number
    errorsCount?: number
    salesBonus?: number
    checkList?: boolean
    createdAt?: string
    createdBy?: string | null
  }

  export type KpiRecordCreateOrConnectWithoutEmployeeInput = {
    where: KpiRecordWhereUniqueInput
    create: XOR<KpiRecordCreateWithoutEmployeeInput, KpiRecordUncheckedCreateWithoutEmployeeInput>
  }

  export type PromotionSaleCreateWithoutEmployeeInput = {
    id?: string
    date: string
    patientId?: string | null
    productName: string
    price?: number
    bonus?: number
    createdAt?: string
    createdBy?: string | null
  }

  export type PromotionSaleUncheckedCreateWithoutEmployeeInput = {
    id?: string
    date: string
    patientId?: string | null
    productName: string
    price?: number
    bonus?: number
    createdAt?: string
    createdBy?: string | null
  }

  export type PromotionSaleCreateOrConnectWithoutEmployeeInput = {
    where: PromotionSaleWhereUniqueInput
    create: XOR<PromotionSaleCreateWithoutEmployeeInput, PromotionSaleUncheckedCreateWithoutEmployeeInput>
  }

  export type RegistrationKpiCreateWithoutEmployeeInput = {
    id?: string
    date: string
    patientId?: string | null
    criterion1?: number
    criterion2?: number
    criterion3?: number
    totalScore?: number
    maxScore?: number
    count?: number
    createdAt?: string
    createdBy?: string | null
  }

  export type RegistrationKpiUncheckedCreateWithoutEmployeeInput = {
    id?: string
    date: string
    patientId?: string | null
    criterion1?: number
    criterion2?: number
    criterion3?: number
    totalScore?: number
    maxScore?: number
    count?: number
    createdAt?: string
    createdBy?: string | null
  }

  export type RegistrationKpiCreateOrConnectWithoutEmployeeInput = {
    where: RegistrationKpiWhereUniqueInput
    create: XOR<RegistrationKpiCreateWithoutEmployeeInput, RegistrationKpiUncheckedCreateWithoutEmployeeInput>
  }

  export type ShiftCreateWithoutEmployeeInput = {
    id?: string
    date: string
    type?: string
    hours?: number
    cabinetClosed?: boolean
    centerClosed?: boolean
    coefficient?: number
    comment?: string | null
    createdAt?: string
    createdBy?: string | null
    isDeleted?: boolean
  }

  export type ShiftUncheckedCreateWithoutEmployeeInput = {
    id?: string
    date: string
    type?: string
    hours?: number
    cabinetClosed?: boolean
    centerClosed?: boolean
    coefficient?: number
    comment?: string | null
    createdAt?: string
    createdBy?: string | null
    isDeleted?: boolean
  }

  export type ShiftCreateOrConnectWithoutEmployeeInput = {
    where: ShiftWhereUniqueInput
    create: XOR<ShiftCreateWithoutEmployeeInput, ShiftUncheckedCreateWithoutEmployeeInput>
  }

  export type KpiRecordUpsertWithWhereUniqueWithoutEmployeeInput = {
    where: KpiRecordWhereUniqueInput
    update: XOR<KpiRecordUpdateWithoutEmployeeInput, KpiRecordUncheckedUpdateWithoutEmployeeInput>
    create: XOR<KpiRecordCreateWithoutEmployeeInput, KpiRecordUncheckedCreateWithoutEmployeeInput>
  }

  export type KpiRecordUpdateWithWhereUniqueWithoutEmployeeInput = {
    where: KpiRecordWhereUniqueInput
    data: XOR<KpiRecordUpdateWithoutEmployeeInput, KpiRecordUncheckedUpdateWithoutEmployeeInput>
  }

  export type KpiRecordUpdateManyWithWhereWithoutEmployeeInput = {
    where: KpiRecordScalarWhereInput
    data: XOR<KpiRecordUpdateManyMutationInput, KpiRecordUncheckedUpdateManyWithoutEmployeeInput>
  }

  export type KpiRecordScalarWhereInput = {
    AND?: KpiRecordScalarWhereInput | KpiRecordScalarWhereInput[]
    OR?: KpiRecordScalarWhereInput[]
    NOT?: KpiRecordScalarWhereInput | KpiRecordScalarWhereInput[]
    id?: StringFilter<"KpiRecord"> | string
    date?: StringFilter<"KpiRecord"> | string
    employeeId?: StringFilter<"KpiRecord"> | string
    qualityScore?: FloatFilter<"KpiRecord"> | number
    errorsCount?: IntFilter<"KpiRecord"> | number
    salesBonus?: FloatFilter<"KpiRecord"> | number
    checkList?: BoolFilter<"KpiRecord"> | boolean
    createdAt?: StringFilter<"KpiRecord"> | string
    createdBy?: StringNullableFilter<"KpiRecord"> | string | null
  }

  export type PromotionSaleUpsertWithWhereUniqueWithoutEmployeeInput = {
    where: PromotionSaleWhereUniqueInput
    update: XOR<PromotionSaleUpdateWithoutEmployeeInput, PromotionSaleUncheckedUpdateWithoutEmployeeInput>
    create: XOR<PromotionSaleCreateWithoutEmployeeInput, PromotionSaleUncheckedCreateWithoutEmployeeInput>
  }

  export type PromotionSaleUpdateWithWhereUniqueWithoutEmployeeInput = {
    where: PromotionSaleWhereUniqueInput
    data: XOR<PromotionSaleUpdateWithoutEmployeeInput, PromotionSaleUncheckedUpdateWithoutEmployeeInput>
  }

  export type PromotionSaleUpdateManyWithWhereWithoutEmployeeInput = {
    where: PromotionSaleScalarWhereInput
    data: XOR<PromotionSaleUpdateManyMutationInput, PromotionSaleUncheckedUpdateManyWithoutEmployeeInput>
  }

  export type PromotionSaleScalarWhereInput = {
    AND?: PromotionSaleScalarWhereInput | PromotionSaleScalarWhereInput[]
    OR?: PromotionSaleScalarWhereInput[]
    NOT?: PromotionSaleScalarWhereInput | PromotionSaleScalarWhereInput[]
    id?: StringFilter<"PromotionSale"> | string
    date?: StringFilter<"PromotionSale"> | string
    patientId?: StringNullableFilter<"PromotionSale"> | string | null
    employeeId?: StringFilter<"PromotionSale"> | string
    productName?: StringFilter<"PromotionSale"> | string
    price?: FloatFilter<"PromotionSale"> | number
    bonus?: FloatFilter<"PromotionSale"> | number
    createdAt?: StringFilter<"PromotionSale"> | string
    createdBy?: StringNullableFilter<"PromotionSale"> | string | null
  }

  export type RegistrationKpiUpsertWithWhereUniqueWithoutEmployeeInput = {
    where: RegistrationKpiWhereUniqueInput
    update: XOR<RegistrationKpiUpdateWithoutEmployeeInput, RegistrationKpiUncheckedUpdateWithoutEmployeeInput>
    create: XOR<RegistrationKpiCreateWithoutEmployeeInput, RegistrationKpiUncheckedCreateWithoutEmployeeInput>
  }

  export type RegistrationKpiUpdateWithWhereUniqueWithoutEmployeeInput = {
    where: RegistrationKpiWhereUniqueInput
    data: XOR<RegistrationKpiUpdateWithoutEmployeeInput, RegistrationKpiUncheckedUpdateWithoutEmployeeInput>
  }

  export type RegistrationKpiUpdateManyWithWhereWithoutEmployeeInput = {
    where: RegistrationKpiScalarWhereInput
    data: XOR<RegistrationKpiUpdateManyMutationInput, RegistrationKpiUncheckedUpdateManyWithoutEmployeeInput>
  }

  export type RegistrationKpiScalarWhereInput = {
    AND?: RegistrationKpiScalarWhereInput | RegistrationKpiScalarWhereInput[]
    OR?: RegistrationKpiScalarWhereInput[]
    NOT?: RegistrationKpiScalarWhereInput | RegistrationKpiScalarWhereInput[]
    id?: StringFilter<"RegistrationKpi"> | string
    date?: StringFilter<"RegistrationKpi"> | string
    patientId?: StringNullableFilter<"RegistrationKpi"> | string | null
    employeeId?: StringFilter<"RegistrationKpi"> | string
    criterion1?: FloatFilter<"RegistrationKpi"> | number
    criterion2?: FloatFilter<"RegistrationKpi"> | number
    criterion3?: FloatFilter<"RegistrationKpi"> | number
    totalScore?: FloatFilter<"RegistrationKpi"> | number
    maxScore?: FloatFilter<"RegistrationKpi"> | number
    count?: IntFilter<"RegistrationKpi"> | number
    createdAt?: StringFilter<"RegistrationKpi"> | string
    createdBy?: StringNullableFilter<"RegistrationKpi"> | string | null
  }

  export type ShiftUpsertWithWhereUniqueWithoutEmployeeInput = {
    where: ShiftWhereUniqueInput
    update: XOR<ShiftUpdateWithoutEmployeeInput, ShiftUncheckedUpdateWithoutEmployeeInput>
    create: XOR<ShiftCreateWithoutEmployeeInput, ShiftUncheckedCreateWithoutEmployeeInput>
  }

  export type ShiftUpdateWithWhereUniqueWithoutEmployeeInput = {
    where: ShiftWhereUniqueInput
    data: XOR<ShiftUpdateWithoutEmployeeInput, ShiftUncheckedUpdateWithoutEmployeeInput>
  }

  export type ShiftUpdateManyWithWhereWithoutEmployeeInput = {
    where: ShiftScalarWhereInput
    data: XOR<ShiftUpdateManyMutationInput, ShiftUncheckedUpdateManyWithoutEmployeeInput>
  }

  export type ShiftScalarWhereInput = {
    AND?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
    OR?: ShiftScalarWhereInput[]
    NOT?: ShiftScalarWhereInput | ShiftScalarWhereInput[]
    id?: StringFilter<"Shift"> | string
    date?: StringFilter<"Shift"> | string
    employeeId?: StringFilter<"Shift"> | string
    type?: StringFilter<"Shift"> | string
    hours?: FloatFilter<"Shift"> | number
    cabinetClosed?: BoolFilter<"Shift"> | boolean
    centerClosed?: BoolFilter<"Shift"> | boolean
    coefficient?: FloatFilter<"Shift"> | number
    comment?: StringNullableFilter<"Shift"> | string | null
    createdAt?: StringFilter<"Shift"> | string
    createdBy?: StringNullableFilter<"Shift"> | string | null
    isDeleted?: BoolFilter<"Shift"> | boolean
  }

  export type EmployeeCreateWithoutShiftsInput = {
    id?: string
    name: string
    role?: string
    password?: string
    baseSalary?: number
    hourlyRate?: number
    branch?: string | null
    sortOrder?: number
    createdAt?: string
    kpiRecords?: KpiRecordCreateNestedManyWithoutEmployeeInput
    promotionSales?: PromotionSaleCreateNestedManyWithoutEmployeeInput
    registrationKpis?: RegistrationKpiCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateWithoutShiftsInput = {
    id?: string
    name: string
    role?: string
    password?: string
    baseSalary?: number
    hourlyRate?: number
    branch?: string | null
    sortOrder?: number
    createdAt?: string
    kpiRecords?: KpiRecordUncheckedCreateNestedManyWithoutEmployeeInput
    promotionSales?: PromotionSaleUncheckedCreateNestedManyWithoutEmployeeInput
    registrationKpis?: RegistrationKpiUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeCreateOrConnectWithoutShiftsInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutShiftsInput, EmployeeUncheckedCreateWithoutShiftsInput>
  }

  export type EmployeeUpsertWithoutShiftsInput = {
    update: XOR<EmployeeUpdateWithoutShiftsInput, EmployeeUncheckedUpdateWithoutShiftsInput>
    create: XOR<EmployeeCreateWithoutShiftsInput, EmployeeUncheckedCreateWithoutShiftsInput>
    where?: EmployeeWhereInput
  }

  export type EmployeeUpdateToOneWithWhereWithoutShiftsInput = {
    where?: EmployeeWhereInput
    data: XOR<EmployeeUpdateWithoutShiftsInput, EmployeeUncheckedUpdateWithoutShiftsInput>
  }

  export type EmployeeUpdateWithoutShiftsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    kpiRecords?: KpiRecordUpdateManyWithoutEmployeeNestedInput
    promotionSales?: PromotionSaleUpdateManyWithoutEmployeeNestedInput
    registrationKpis?: RegistrationKpiUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutShiftsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    kpiRecords?: KpiRecordUncheckedUpdateManyWithoutEmployeeNestedInput
    promotionSales?: PromotionSaleUncheckedUpdateManyWithoutEmployeeNestedInput
    registrationKpis?: RegistrationKpiUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeCreateWithoutKpiRecordsInput = {
    id?: string
    name: string
    role?: string
    password?: string
    baseSalary?: number
    hourlyRate?: number
    branch?: string | null
    sortOrder?: number
    createdAt?: string
    promotionSales?: PromotionSaleCreateNestedManyWithoutEmployeeInput
    registrationKpis?: RegistrationKpiCreateNestedManyWithoutEmployeeInput
    shifts?: ShiftCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateWithoutKpiRecordsInput = {
    id?: string
    name: string
    role?: string
    password?: string
    baseSalary?: number
    hourlyRate?: number
    branch?: string | null
    sortOrder?: number
    createdAt?: string
    promotionSales?: PromotionSaleUncheckedCreateNestedManyWithoutEmployeeInput
    registrationKpis?: RegistrationKpiUncheckedCreateNestedManyWithoutEmployeeInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeCreateOrConnectWithoutKpiRecordsInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutKpiRecordsInput, EmployeeUncheckedCreateWithoutKpiRecordsInput>
  }

  export type EmployeeUpsertWithoutKpiRecordsInput = {
    update: XOR<EmployeeUpdateWithoutKpiRecordsInput, EmployeeUncheckedUpdateWithoutKpiRecordsInput>
    create: XOR<EmployeeCreateWithoutKpiRecordsInput, EmployeeUncheckedCreateWithoutKpiRecordsInput>
    where?: EmployeeWhereInput
  }

  export type EmployeeUpdateToOneWithWhereWithoutKpiRecordsInput = {
    where?: EmployeeWhereInput
    data: XOR<EmployeeUpdateWithoutKpiRecordsInput, EmployeeUncheckedUpdateWithoutKpiRecordsInput>
  }

  export type EmployeeUpdateWithoutKpiRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    promotionSales?: PromotionSaleUpdateManyWithoutEmployeeNestedInput
    registrationKpis?: RegistrationKpiUpdateManyWithoutEmployeeNestedInput
    shifts?: ShiftUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutKpiRecordsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    promotionSales?: PromotionSaleUncheckedUpdateManyWithoutEmployeeNestedInput
    registrationKpis?: RegistrationKpiUncheckedUpdateManyWithoutEmployeeNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeCreateWithoutPromotionSalesInput = {
    id?: string
    name: string
    role?: string
    password?: string
    baseSalary?: number
    hourlyRate?: number
    branch?: string | null
    sortOrder?: number
    createdAt?: string
    kpiRecords?: KpiRecordCreateNestedManyWithoutEmployeeInput
    registrationKpis?: RegistrationKpiCreateNestedManyWithoutEmployeeInput
    shifts?: ShiftCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateWithoutPromotionSalesInput = {
    id?: string
    name: string
    role?: string
    password?: string
    baseSalary?: number
    hourlyRate?: number
    branch?: string | null
    sortOrder?: number
    createdAt?: string
    kpiRecords?: KpiRecordUncheckedCreateNestedManyWithoutEmployeeInput
    registrationKpis?: RegistrationKpiUncheckedCreateNestedManyWithoutEmployeeInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeCreateOrConnectWithoutPromotionSalesInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutPromotionSalesInput, EmployeeUncheckedCreateWithoutPromotionSalesInput>
  }

  export type EmployeeUpsertWithoutPromotionSalesInput = {
    update: XOR<EmployeeUpdateWithoutPromotionSalesInput, EmployeeUncheckedUpdateWithoutPromotionSalesInput>
    create: XOR<EmployeeCreateWithoutPromotionSalesInput, EmployeeUncheckedCreateWithoutPromotionSalesInput>
    where?: EmployeeWhereInput
  }

  export type EmployeeUpdateToOneWithWhereWithoutPromotionSalesInput = {
    where?: EmployeeWhereInput
    data: XOR<EmployeeUpdateWithoutPromotionSalesInput, EmployeeUncheckedUpdateWithoutPromotionSalesInput>
  }

  export type EmployeeUpdateWithoutPromotionSalesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    kpiRecords?: KpiRecordUpdateManyWithoutEmployeeNestedInput
    registrationKpis?: RegistrationKpiUpdateManyWithoutEmployeeNestedInput
    shifts?: ShiftUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutPromotionSalesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    kpiRecords?: KpiRecordUncheckedUpdateManyWithoutEmployeeNestedInput
    registrationKpis?: RegistrationKpiUncheckedUpdateManyWithoutEmployeeNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeCreateWithoutRegistrationKpisInput = {
    id?: string
    name: string
    role?: string
    password?: string
    baseSalary?: number
    hourlyRate?: number
    branch?: string | null
    sortOrder?: number
    createdAt?: string
    kpiRecords?: KpiRecordCreateNestedManyWithoutEmployeeInput
    promotionSales?: PromotionSaleCreateNestedManyWithoutEmployeeInput
    shifts?: ShiftCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateWithoutRegistrationKpisInput = {
    id?: string
    name: string
    role?: string
    password?: string
    baseSalary?: number
    hourlyRate?: number
    branch?: string | null
    sortOrder?: number
    createdAt?: string
    kpiRecords?: KpiRecordUncheckedCreateNestedManyWithoutEmployeeInput
    promotionSales?: PromotionSaleUncheckedCreateNestedManyWithoutEmployeeInput
    shifts?: ShiftUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeCreateOrConnectWithoutRegistrationKpisInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutRegistrationKpisInput, EmployeeUncheckedCreateWithoutRegistrationKpisInput>
  }

  export type EmployeeUpsertWithoutRegistrationKpisInput = {
    update: XOR<EmployeeUpdateWithoutRegistrationKpisInput, EmployeeUncheckedUpdateWithoutRegistrationKpisInput>
    create: XOR<EmployeeCreateWithoutRegistrationKpisInput, EmployeeUncheckedCreateWithoutRegistrationKpisInput>
    where?: EmployeeWhereInput
  }

  export type EmployeeUpdateToOneWithWhereWithoutRegistrationKpisInput = {
    where?: EmployeeWhereInput
    data: XOR<EmployeeUpdateWithoutRegistrationKpisInput, EmployeeUncheckedUpdateWithoutRegistrationKpisInput>
  }

  export type EmployeeUpdateWithoutRegistrationKpisInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    kpiRecords?: KpiRecordUpdateManyWithoutEmployeeNestedInput
    promotionSales?: PromotionSaleUpdateManyWithoutEmployeeNestedInput
    shifts?: ShiftUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutRegistrationKpisInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    baseSalary?: FloatFieldUpdateOperationsInput | number
    hourlyRate?: FloatFieldUpdateOperationsInput | number
    branch?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    kpiRecords?: KpiRecordUncheckedUpdateManyWithoutEmployeeNestedInput
    promotionSales?: PromotionSaleUncheckedUpdateManyWithoutEmployeeNestedInput
    shifts?: ShiftUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type KpiRecordUpdateWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    qualityScore?: FloatFieldUpdateOperationsInput | number
    errorsCount?: IntFieldUpdateOperationsInput | number
    salesBonus?: FloatFieldUpdateOperationsInput | number
    checkList?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type KpiRecordUncheckedUpdateWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    qualityScore?: FloatFieldUpdateOperationsInput | number
    errorsCount?: IntFieldUpdateOperationsInput | number
    salesBonus?: FloatFieldUpdateOperationsInput | number
    checkList?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type KpiRecordUncheckedUpdateManyWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    qualityScore?: FloatFieldUpdateOperationsInput | number
    errorsCount?: IntFieldUpdateOperationsInput | number
    salesBonus?: FloatFieldUpdateOperationsInput | number
    checkList?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PromotionSaleUpdateWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    bonus?: FloatFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PromotionSaleUncheckedUpdateWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    bonus?: FloatFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PromotionSaleUncheckedUpdateManyWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    productName?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    bonus?: FloatFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistrationKpiUpdateWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    criterion1?: FloatFieldUpdateOperationsInput | number
    criterion2?: FloatFieldUpdateOperationsInput | number
    criterion3?: FloatFieldUpdateOperationsInput | number
    totalScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    count?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistrationKpiUncheckedUpdateWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    criterion1?: FloatFieldUpdateOperationsInput | number
    criterion2?: FloatFieldUpdateOperationsInput | number
    criterion3?: FloatFieldUpdateOperationsInput | number
    totalScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    count?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RegistrationKpiUncheckedUpdateManyWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    patientId?: NullableStringFieldUpdateOperationsInput | string | null
    criterion1?: FloatFieldUpdateOperationsInput | number
    criterion2?: FloatFieldUpdateOperationsInput | number
    criterion3?: FloatFieldUpdateOperationsInput | number
    totalScore?: FloatFieldUpdateOperationsInput | number
    maxScore?: FloatFieldUpdateOperationsInput | number
    count?: IntFieldUpdateOperationsInput | number
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ShiftUpdateWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    cabinetClosed?: BoolFieldUpdateOperationsInput | boolean
    centerClosed?: BoolFieldUpdateOperationsInput | boolean
    coefficient?: FloatFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ShiftUncheckedUpdateWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    cabinetClosed?: BoolFieldUpdateOperationsInput | boolean
    centerClosed?: BoolFieldUpdateOperationsInput | boolean
    coefficient?: FloatFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ShiftUncheckedUpdateManyWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    hours?: FloatFieldUpdateOperationsInput | number
    cabinetClosed?: BoolFieldUpdateOperationsInput | boolean
    centerClosed?: BoolFieldUpdateOperationsInput | boolean
    coefficient?: FloatFieldUpdateOperationsInput | number
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: StringFieldUpdateOperationsInput | string
    createdBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use EmployeeCountOutputTypeDefaultArgs instead
     */
    export type EmployeeCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EmployeeCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EmployeeDefaultArgs instead
     */
    export type EmployeeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EmployeeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ShiftDefaultArgs instead
     */
    export type ShiftArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ShiftDefaultArgs<ExtArgs>
    /**
     * @deprecated Use KpiRecordDefaultArgs instead
     */
    export type KpiRecordArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = KpiRecordDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MonthlyNormDefaultArgs instead
     */
    export type MonthlyNormArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MonthlyNormDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PromotionSaleDefaultArgs instead
     */
    export type PromotionSaleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PromotionSaleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RegistrationKpiDefaultArgs instead
     */
    export type RegistrationKpiArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RegistrationKpiDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AuditLogDefaultArgs instead
     */
    export type AuditLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AuditLogDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}