import type { Condition } from '@rocicorp/zero';
import type { TableName, Where } from './types';
export declare function where<Table extends TableName, Builder extends Where<Table>>(tableName: Table, builder: Builder, isServerOnly?: boolean): Where<Table, Condition>;
export declare function where<Table extends TableName, Builder extends Where = Where<Table>>(builder: Builder): Where<Table, Condition>;
export declare function getWhereTableName(where: Where): string | undefined;
//# sourceMappingURL=where.d.ts.map