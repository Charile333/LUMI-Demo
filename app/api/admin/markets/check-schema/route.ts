// 🔍 检查数据库 markets 表结构
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // 查询表结构
    const result = await db.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'markets'
      ORDER BY ordinal_position
    `);

    const columns = result.rows.map(row => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
      default: row.column_default
    }));

    // 检查必需字段
    const requiredFields = [
      'id',
      'question_id',
      'title',
      'description',
      'main_category',
      'status',
      'blockchain_status'
    ];

    const missingFields = requiredFields.filter(
      field => !columns.find(col => col.name === field)
    );

    const optionalFields = [
      'image_url',
      'outcome_type',
      'outcome_options',
      'numeric_min',
      'numeric_max',
      'sub_category',
      'tags',
      'start_time',
      'end_time',
      'resolution_time',
      'priority_level',
      'reward_amount'
    ];

    const availableOptionalFields = optionalFields.filter(
      field => columns.find(col => col.name === field)
    );

    const missingOptionalFields = optionalFields.filter(
      field => !columns.find(col => col.name === field)
    );

    return NextResponse.json({
      success: true,
      data: {
        allColumns: columns,
        summary: {
          totalColumns: columns.length,
          requiredFieldsPresent: requiredFields.length - missingFields.length,
          requiredFieldsMissing: missingFields.length,
          optionalFieldsPresent: availableOptionalFields.length,
          optionalFieldsMissing: missingOptionalFields.length
        },
        missingFields: {
          required: missingFields,
          optional: missingOptionalFields
        },
        availableFields: {
          required: requiredFields.filter(f => !missingFields.includes(f)),
          optional: availableOptionalFields
        }
      }
    });

  } catch (error: any) {
    console.error('检查表结构失败:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: '请确保数据库连接正常，且 markets 表已创建'
    }, { status: 500 });
  }
}

