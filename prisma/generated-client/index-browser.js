
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  detectRuntime,
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.10.2
 * Query Engine version: 5a9203d0590c951969e85a7d07215503f4672eb9
 */
Prisma.prismaVersion = {
  client: "5.10.2",
  engine: "5a9203d0590c951969e85a7d07215503f4672eb9"
}

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  throw new Error(`Extensions.getExtensionContext is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  throw new Error(`Extensions.defineExtension is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.EmployeeScalarFieldEnum = {
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

exports.Prisma.ShiftScalarFieldEnum = {
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

exports.Prisma.KpiRecordScalarFieldEnum = {
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

exports.Prisma.MonthlyNormScalarFieldEnum = {
  month: 'month',
  hours: 'hours',
  createdAt: 'createdAt'
};

exports.Prisma.PromotionSaleScalarFieldEnum = {
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

exports.Prisma.RegistrationKpiScalarFieldEnum = {
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

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  action: 'action',
  changedBy: 'changedBy',
  changedByRole: 'changedByRole',
  timestamp: 'timestamp',
  details: 'details'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Employee: 'Employee',
  Shift: 'Shift',
  KpiRecord: 'KpiRecord',
  MonthlyNorm: 'MonthlyNorm',
  PromotionSale: 'PromotionSale',
  RegistrationKpi: 'RegistrationKpi',
  AuditLog: 'AuditLog'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        const runtime = detectRuntime()
        const edgeRuntimeName = {
          'workerd': 'Cloudflare Workers',
          'deno': 'Deno and Deno Deploy',
          'netlify': 'Netlify Edge Functions',
          'edge-light': 'Vercel Edge Functions or Edge Middleware',
        }[runtime]

        let message = 'PrismaClient is unable to run in '
        if (edgeRuntimeName !== undefined) {
          message += edgeRuntimeName + '. As an alternative, try Accelerate: https://pris.ly/d/accelerate.'
        } else {
          message += 'this browser environment, or has been bundled for the browser (running in `' + runtime + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
